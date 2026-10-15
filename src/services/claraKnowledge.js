const APPROVED_VERIFICATION = new Set(["VERIFIED", "SOURCE_ALIGNED"])
const FAQ_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const timestamp = (value) => typeof value === "string" ? Date.parse(value) : NaN
const optionalTimestamp = (value) => value === null || value === undefined || Number.isFinite(timestamp(value))

/** Case/spacing/punctuation/diacritic normalization for deterministic English,
 * Filipino, and Taglish matching. This is not semantic or fuzzy retrieval. */
export const normalizeClaraQuery = (value) => (
  typeof value === "string"
    ? value.normalize("NFKD").replace(/[\u0300-\u036f]/gu, "").toLowerCase()
      .replace(/[^a-z0-9]+/gu, " ").trim().replace(/\s+/gu, " ")
    : ""
)

const words = (value) => normalizeClaraQuery(value).split(" ").filter(Boolean)
const publicAt = (faq, now) => (
  faq.lifecycle === "PUBLISHED"
  && faq.public === true
  && Number.isFinite(timestamp(faq.publishedAt))
  && optionalTimestamp(faq.effectiveAt)
  && optionalTimestamp(faq.expiresAt)
  && timestamp(faq.publishedAt) <= now
  && timestamp(faq.effectiveAt || faq.publishedAt) <= now
  && (faq.expiresAt == null || timestamp(faq.expiresAt) > now)
)

export const isEligibleClaraFaq = (faq, evaluatedAt = new Date().toISOString()) => {
  const now = timestamp(evaluatedAt)
  return Boolean(
    faq && typeof faq === "object"
    && FAQ_ID_PATTERN.test(faq.id || "")
    && typeof faq.question === "string" && faq.question.trim()
    && typeof faq.answer === "string" && faq.answer.trim()
    && typeof faq.category === "string" && faq.category.trim()
    && Array.isArray(faq.keywords) && faq.keywords.every((term) => typeof term === "string" && term.trim())
    && Array.isArray(faq.alternativePhrases) && faq.alternativePhrases.every((term) => typeof term === "string" && term.trim())
    && faq.approvalStatus === "APPROVED"
    && APPROVED_VERIFICATION.has(faq.verificationStatus)
    && faq.dataStatus === "ACTIVE"
    && faq.demo !== true
    && faq.source && typeof faq.source.id === "string" && faq.source.id.trim()
    && typeof faq.source.label === "string" && faq.source.label.trim()
    && optionalTimestamp(faq.lastVerifiedAt)
    && Number.isFinite(now) && publicAt(faq, now)
  )
}

const safeFaq = (faq) => Object.freeze({
  id: faq.id,
  question: faq.question.trim(),
  answer: faq.answer.trim(),
  category: faq.category.trim(),
  source: Object.freeze({ id: faq.source.id.trim(), label: faq.source.label.trim() }),
  verificationStatus: faq.verificationStatus,
  lastVerifiedAt: faq.lastVerifiedAt || null,
})

/** Build once for an approved snapshot. Rejected records remain unavailable. */
export const createClaraFaqIndex = (faqs = [], evaluatedAt = new Date().toISOString()) => {
  if (!Array.isArray(faqs)) throw new TypeError("CLARA FAQs must be an array.")
  return Object.freeze(faqs.filter((faq) => isEligibleClaraFaq(faq, evaluatedAt)).map((faq) => {
    const record = safeFaq(faq)
    const phrases = [faq.question, ...faq.alternativePhrases].map(normalizeClaraQuery).filter(Boolean)
    const keywords = [...new Set(faq.keywords.flatMap(words).filter((term) => term.length >= 2))]
    return Object.freeze({ record, phrases: Object.freeze(phrases), keywords: Object.freeze(keywords) })
  }))
}

const scoreEntry = (entry, query, queryWords) => {
  if (!query) return 0
  if (entry.phrases.includes(query)) return 1000
  if (entry.phrases.some((phrase) => query.includes(phrase) || phrase.includes(query))) return 700
  const matches = entry.keywords.filter((keyword) => queryWords.has(keyword))
  if (!matches.length) return 0
  const distinctive = matches.filter((keyword) => keyword.length >= 4)
  if (!distinctive.length && matches.length < 2) return 0
  return matches.length * 50 + distinctive.length * 15
}

/** Bounded deterministic retrieval. Scores are internal ordering values and
 * must never be shown to users as confidence percentages. */
export const retrieveClaraFaqs = (index, query, { limit = 3 } = {}) => {
  const normalized = normalizeClaraQuery(query)
  const queryWords = new Set(words(normalized))
  const boundedLimit = Number.isInteger(limit) ? Math.min(5, Math.max(1, limit)) : 3
  const matches = (Array.isArray(index) ? index : [])
    .map((entry) => ({ entry, score: scoreEntry(entry, normalized, queryWords) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.entry.record.id.localeCompare(right.entry.record.id))
    .slice(0, boundedLimit)
  return {
    query: normalized,
    matches: matches.map(({ entry }) => entry.record),
    exact: matches[0]?.score === 1000,
    ambiguous: matches.length > 1 && matches[0].score < 700 && matches[0].score - matches[1].score < 30,
  }
}
