# CampusNav AI — CLARA RAG and Provider Readiness

## Status

**Foundation:** `IMPLEMENTED_VERIFIED` locally on 16 October 2026.
**External generative provider:** `DISABLED`.
**Gemini public activation:** `BLOCKED` for the intended CampusNav audience under the currently published Gemini API Additional Terms.

This document records a time-sensitive provider audit. Recheck every linked official source before any later provider decision.

## Implemented provider-neutral foundation

```text
validated question
  → deterministic intent/entity rules
  → approved FAQ retrieval and/or accepted CampusNav tool
  → evidence/provenance validation
  → verified direct answer or honest unavailable state
  → canonical source IDs and actions
```

- The production FAQ collection is intentionally empty because no institutionally approved FAQ corpus was supplied.
- Test fixtures prove exact, alternative-phrase, Filipino, English, Taglish, ambiguous, unpublished, expired, and DEMO behavior without creating official policy.
- Facility lookup, facility status, and configured service mapping reuse accepted CampusNav services and canonical facility IDs.
- Navigation responses select only a canonical destination; CLARA never calculates a route or infers the current position.
- Emergency, personnel, announcement, suspension, and current operational boundaries retain their controlling safety/privacy contracts.
- The provider interface has structured request/response validation, explicit model selection, timeouts, at most one configured retry, request/token/character/history ceilings, rate/quota errors, aggregate memory-only usage counters, and no paid-tier fallback.
- Production policy disables provider execution before any adapter method can run. There is no provider SDK, model endpoint, API key, or Gemini request.

## Gemini eligibility audit — official sources checked 16 October 2026

- Terms: <https://ai.google.dev/gemini-api/terms>
- Pricing: <https://ai.google.dev/gemini-api/docs/pricing>
- Rate limits: <https://ai.google.dev/gemini-api/docs/rate-limits>
- API-key security: <https://ai.google.dev/gemini-api/docs/api-key>
- Current model catalog: <https://ai.google.dev/gemini-api/docs/models>

### Terms and audience assessment

The Additional Terms are effective 23 March 2026. They require an API user to be at least 18 and prohibit making an API client directed toward or likely to be accessed by people under 18. CampusNav may be accessed by under-18 students. Therefore possession of a key, availability of unpaid quota, or technical filtering cannot make the current public CampusNav use eligible. Public activation is `BLOCKED` unless later official terms and an independently approved institutional/legal assessment establish eligibility.

The terms classify Gemini API use as professional/business developer use rather than consumer use. Unpaid-service prompts and responses may be used to improve Google products and may be reviewed by humans; Google directs users not to submit sensitive, confidential, or personal information to unpaid services. A paid project changes the stated model-improvement treatment but introduces billing and does not cure the under-18 audience restriction.

### Current Gemini 3.1 model matrix

| Official identifier | Catalog state / purpose | Free-tier pricing shown | CampusNav assessment |
|---|---|---|---|
| `gemini-3.1-flash-lite` | Stable text/multimodal Flash-Lite | Input/output shown free of charge; context caching unavailable on Free; unpaid content used to improve products | `BLOCKED_PUBLIC_AUDIENCE`; technically relevant only after a future terms/eligibility decision |
| `gemini-3.1-pro-preview` | Preview Pro text/multimodal | Free tier not available; paid token pricing only | `BLOCKED_AGE_AND_ZERO_PAID_POLICY` |
| `gemini-3.1-pro-preview-customtools` | Preview custom-tools endpoint | Free tier not available; same paid pricing as Pro Preview | `BLOCKED_AGE_AND_ZERO_PAID_POLICY` |
| `gemini-3.1-flash-live-preview` | Legacy Live audio preview; current catalog recommends 3.8 Live | Free input/output shown for Standard; unpaid content used to improve products | `BLOCKED_PUBLIC_AUDIENCE`; not appropriate for this text FAQ foundation |
| `gemini-3.1-flash-tts-preview` | Legacy TTS preview; current catalog recommends newer TTS models | Free input/output shown for Standard; unpaid content used to improve products | `BLOCKED_PUBLIC_AUDIENCE`; not required by CLARA FAQ scope |
| `gemini-3.1-flash-image` | Stable image generation/editing | Free tier not available | `BLOCKED_AGE_AND_ZERO_PAID_POLICY`; outside CLARA text scope |
| `gemini-3.1-flash-lite-image` | Stable lower-cost image generation/editing | Free tier not available | `BLOCKED_AGE_AND_ZERO_PAID_POLICY`; outside CLARA text scope |

There is no current general text endpoint named `gemini-3.1-flash` in the audited model catalog. Never substitute an assumed model ID.

### Quota and billing findings

- Free does not mean unlimited. Limits are evaluated across requests per minute, input tokens per minute, and requests per day, per project rather than per key.
- The official rate-limit page says limits vary by model, tier, and account status, are visible in AI Studio, can update automatically, and are not guaranteed. It does not publish a stable universal free-tier RPM/TPM/RPD value suitable for a release guarantee.
- Free tier requires an active project or free trial. Tier 1 requires linking an active billing account. Under the terms, Gemini API access through a project with active billing is a Paid Service.
- Provider-side quotas, billing state, model access, and current rate limits must be inspected immediately before any future release. Application-side limits and billing alerts do not guarantee zero charges when billing is active.
- Google warns that exposed keys can consume quota and incur unexpected charges, and requires production web/mobile clients to call through a backend proxy. No key may enter React, `VITE_*`, public assets, storage, logs, caches, or Git.

## Zero-paid and privacy boundary

The current release makes zero external AI requests. It allows no paid tier, paid fallback, automatic upgrade, context/history persistence, or raw-conversation telemetry. Conversations remain in React memory and are discarded on reset/close/reload. Aggregate provider telemetry, if a future eligible server adapter is authorized, may record only counts, timestamps, and stable result codes.

Retrieved FAQ/tool text is treated as untrusted data, never as instructions. A future AI-assisted explanation may receive only bounded sanitized questions, explicitly selected verified context, stable source IDs, fixed response constraints, and an approved limited history. Candidate source IDs must be a subset of the supplied evidence or the response is rejected.

## Requirements before any live provider

1. Re-audit current official provider terms, regions, model IDs, pricing, quotas, data handling, and age/audience restrictions.
2. Obtain documented institutional/privacy/legal approval for the actual audience and submitted data.
3. Keep provider calls at a controlled server/edge boundary with a secure secret store; add no browser key.
4. Establish provider-side billing/quota controls and explicit owner acceptance of residual financial risk; do not rely on app limits as a billing guarantee.
5. Select an explicit eligible model and unpaid/paid policy without automatic fallback.
6. Add authenticated/authorized tool access, abuse protection, audit-safe aggregate monitoring, redaction, deletion/retention rules, and incident response.
7. Pass adversarial grounding, privacy, provider-failure, quota, rate-limit, timeout, browser, accessibility, and production-equivalence gates.
8. Obtain a separate owner-authorized release; this foundation is not that authorization.

## Remaining limitations and next slice

- No approved production FAQ records exist.
- AI-assisted explanation is structurally represented but not connected.
- Personnel, events, announcements, and suspension answers remain unavailable unless an accepted authorized public tool supplies current records.
- Offline CLARA remains unavailable under the accepted PWA boundary; conversations/provider responses are not cached.
- Recommended next slice: define and approve the institutional FAQ ownership/publication workflow and load a small reviewed public FAQ corpus through the existing deterministic index. Do not start external generation until the audience blocker is resolved.
