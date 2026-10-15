export const CLARA_PROVIDER_ERROR_CODES = Object.freeze({
  DISABLED: "CLARA_PROVIDER_DISABLED",
  INVALID_REQUEST: "CLARA_PROVIDER_INVALID_REQUEST",
  RATE_LIMITED: "CLARA_PROVIDER_RATE_LIMITED",
  QUOTA_EXHAUSTED: "CLARA_PROVIDER_QUOTA_EXHAUSTED",
  TIMEOUT: "CLARA_PROVIDER_TIMEOUT",
  INVALID_RESPONSE: "CLARA_PROVIDER_INVALID_RESPONSE",
  UNAVAILABLE: "CLARA_PROVIDER_UNAVAILABLE",
})

export const CLARA_ZERO_PAID_POLICY = Object.freeze({
  enabled: false,
  releaseAuthorized: false,
  publicAudienceEligible: false,
  allowPaidTier: false,
  allowPaidFallback: false,
  maxRequestsPerMinute: 0,
  maxInputCharacters: 500,
  maxInputTokens: 256,
  maxContextCharacters: 6000,
  maxContextTokens: 1500,
  maxOutputCharacters: 1600,
  maxOutputTokens: 400,
  timeoutMs: 6000,
  maxRetries: 0,
  maxHistoryMessages: 0,
})

const failure = (code, message, retryable = false) => ({
  ok: false,
  data: null,
  error: { code, message, retryable },
})

const estimateTokens = (value) => Math.ceil(String(value || "").length / 4)

/** In-memory aggregate telemetry only. It stores timestamps and result codes,
 * never questions, context, answers, user IDs, or IP addresses. */
export const createClaraUsageMonitor = ({ clock = () => Date.now() } = {}) => {
  let requestTimes = []
  const resultCounts = new Map()
  return Object.freeze({
    begin(limit) {
      const now = clock()
      requestTimes = requestTimes.filter((value) => value > now - 60_000)
      if (requestTimes.length >= limit) return false
      requestTimes.push(now)
      return true
    },
    record(code = "OK") {
      resultCounts.set(code, (resultCounts.get(code) || 0) + 1)
    },
    snapshot() {
      return { requestsLastMinute: requestTimes.length, results: Object.fromEntries(resultCounts) }
    },
  })
}

const defaultUsageMonitor = createClaraUsageMonitor()

export const createDisabledClaraProvider = () => Object.freeze({
  id: "disabled",
  model: null,
  enabled: false,
  capabilities: Object.freeze({ generation: false, structuredOutput: false, externalRequests: false }),
})

/** @param {any} provider */
export const getClaraProviderCapability = (provider = createDisabledClaraProvider()) => ({
  providerId: provider.id || "unknown",
  model: provider.model || null,
  enabled: provider.enabled === true,
  generation: provider.capabilities?.generation === true,
  externalRequests: provider.capabilities?.externalRequests === true,
})

const validateProviderRequest = (request, policy) => {
  if (!request || typeof request !== "object") return false
  if (typeof request.question !== "string" || !request.question.trim() || request.question.length > policy.maxInputCharacters || estimateTokens(request.question) > policy.maxInputTokens) return false
  if (!Array.isArray(request.context) || !request.context.length) return false
  if (request.context.some((item) => !item || typeof item.id !== "string" || typeof item.text !== "string")) return false
  const serializedContext = JSON.stringify(request.context)
  if (serializedContext.length > policy.maxContextCharacters || estimateTokens(serializedContext) > policy.maxContextTokens) return false
  if (!Array.isArray(request.history) || request.history.length > policy.maxHistoryMessages) return false
  return Array.isArray(request.sourceIds) && request.sourceIds.every((id) => typeof id === "string" && id)
}

const validateCandidate = (candidate, policy, sourceIds) => (
  candidate && typeof candidate === "object"
  && typeof candidate.text === "string" && candidate.text.trim()
  && candidate.text.length <= policy.maxOutputCharacters && estimateTokens(candidate.text) <= policy.maxOutputTokens
  && Array.isArray(candidate.sourceIds) && candidate.sourceIds.length > 0
  && candidate.sourceIds.every((id) => sourceIds.includes(id))
)

/**
 * Provider-neutral server/edge execution contract. Production CampusNav never
 * calls this while the zero-paid policy is disabled. Future adapters must be
 * injected server-side; this module contains no provider SDK, URL, or secret.
 */
/** @param {{ provider: any, request: any, policy?: any, usageMonitor?: any }} options */
export const executeClaraProviderRequest = async ({ provider, request, policy = CLARA_ZERO_PAID_POLICY, usageMonitor = defaultUsageMonitor }) => {
  if (!policy.enabled || !policy.releaseAuthorized || !policy.publicAudienceEligible || provider?.enabled !== true) {
    return failure(CLARA_PROVIDER_ERROR_CODES.DISABLED, "External AI assistance is not enabled for CampusNav.")
  }
  if (policy.allowPaidTier || policy.allowPaidFallback || policy.maxRequestsPerMinute < 1) {
    return failure(CLARA_PROVIDER_ERROR_CODES.INVALID_REQUEST, "Provider policy is not eligible for zero-paid operation.")
  }
  if (!provider.model || typeof provider.generate !== "function" || !validateProviderRequest(request, policy)) {
    return failure(CLARA_PROVIDER_ERROR_CODES.INVALID_REQUEST, "The provider request is invalid.")
  }

  const attempts = Math.min(2, Math.max(1, Number(policy.maxRetries) + 1 || 1))
  let result
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (!usageMonitor.begin(policy.maxRequestsPerMinute)) {
      result = failure(CLARA_PROVIDER_ERROR_CODES.RATE_LIMITED, "The configured CLARA request limit has been reached.", true)
      break
    }
    const controller = new AbortController()
    let timer
    try {
      const timeout = new Promise((resolve) => {
        timer = setTimeout(() => {
          controller.abort()
          resolve(failure(CLARA_PROVIDER_ERROR_CODES.TIMEOUT, "The provider request timed out.", true))
        }, policy.timeoutMs)
      })
      const generated = Promise.resolve(provider.generate({ ...request, signal: controller.signal })).then((candidate) => {
        if (!validateCandidate(candidate, policy, request.sourceIds)) {
          return failure(CLARA_PROVIDER_ERROR_CODES.INVALID_RESPONSE, "The provider returned an invalid grounded response.")
        }
        return { ok: true, data: { text: candidate.text.trim(), sourceIds: [...candidate.sourceIds] }, error: null }
      }).catch((error) => {
        const code = error?.code === "RATE_LIMITED"
          ? CLARA_PROVIDER_ERROR_CODES.RATE_LIMITED
          : error?.code === "QUOTA_EXHAUSTED"
            ? CLARA_PROVIDER_ERROR_CODES.QUOTA_EXHAUSTED
            : CLARA_PROVIDER_ERROR_CODES.UNAVAILABLE
        return failure(code, code === CLARA_PROVIDER_ERROR_CODES.QUOTA_EXHAUSTED
          ? "The provider quota is exhausted; CLARA will continue with verified direct answers."
          : "The provider is temporarily unavailable; CLARA will continue with verified direct answers.", true)
      })
      result = await Promise.race([generated, timeout])
    } finally {
      clearTimeout(timer)
    }
    if (result.ok || result.error.code === CLARA_PROVIDER_ERROR_CODES.QUOTA_EXHAUSTED || attempt === attempts - 1) break
  }
  usageMonitor.record(result?.ok ? "OK" : result?.error?.code || CLARA_PROVIDER_ERROR_CODES.UNAVAILABLE)
  return result || failure(CLARA_PROVIDER_ERROR_CODES.UNAVAILABLE, "The provider is unavailable.", true)
}
