import { normalizeClaraQuery } from "./claraKnowledge.js"

export const CLARA_INTENTS = Object.freeze({
  FACILITY_SEARCH: "FACILITY_SEARCH",
  NAVIGATION_REQUEST: "NAVIGATION_REQUEST",
  FACILITY_STATUS: "FACILITY_STATUS",
  OFFICE_SERVICE_INQUIRY: "OFFICE_SERVICE_INQUIRY",
  CAMPUS_INFORMATION: "CAMPUS_INFORMATION",
  FAQ_INQUIRY: "FAQ_INQUIRY",
  PERSONNEL_SCHEDULE: "PERSONNEL_SCHEDULE",
  EVENT_INQUIRY: "EVENT_INQUIRY",
  ANNOUNCEMENT_INQUIRY: "ANNOUNCEMENT_INQUIRY",
  SUSPENSION_INQUIRY: "SUSPENSION_INQUIRY",
  EMERGENCY_INFORMATION: "EMERGENCY_INFORMATION",
})

/** @type {Array<[(typeof CLARA_INTENTS)[keyof typeof CLARA_INTENTS], RegExp]>} */
const patterns = [
  [CLARA_INTENTS.EMERGENCY_INFORMATION, /\b(emergency|evacuat\w*|sunog|lindol|fire|earthquake|sakuna|medical emergency)\b/u],
  [CLARA_INTENTS.SUSPENSION_INQUIRY, /\b(suspension|suspendido|walang pasok|class cancelled)\b/u],
  [CLARA_INTENTS.PERSONNEL_SCHEDULE, /\b(professor|prof|teacher|instructor|faculty|personnel|schedule ni|available si|nasaan si)\b/u],
  [CLARA_INTENTS.EVENT_INQUIRY, /\b(event|events|activity|activities|calendar|ganap)\b/u],
  [CLARA_INTENTS.ANNOUNCEMENT_INQUIRY, /\b(announcement|announcements|abiso|notice)\b/u],
  [CLARA_INTENTS.FACILITY_STATUS, /\b(open|closed|closing|hours|oras|bukas|sarado|status)\b/u],
  [CLARA_INTENTS.NAVIGATION_REQUEST, /\b(navigate|route|directions|take me|paano pumunta|papunta|dalhin mo)\b/u],
  [CLARA_INTENTS.OFFICE_SERVICE_INQUIRY, /\b(service|services|where can i|get my|kumuha|mag request|request ng|process)\b/u],
  [CLARA_INTENTS.FACILITY_SEARCH, /\b(where|find|locate|saan|nasaan|hanapin)\b/u],
  [CLARA_INTENTS.FAQ_INQUIRY, /\b(faq|frequently asked|tanong)\b/u],
]

const filler = new Set([
  "a", "about", "ako", "alamin", "ang", "can", "do", "find", "for", "get", "hanapin", "how", "i", "is", "ko", "me", "mo", "my", "ng", "now", "please", "po", "saan", "show", "take", "the", "to", "today", "where", "you",
  "navigate", "route", "directions", "paano", "pumunta", "papunta", "dalhin", "open", "closed", "closing", "hours", "oras", "bukas", "sarado", "status", "locate", "nasaan",
])

export const extractClaraEntityQuery = (question) => normalizeClaraQuery(question)
  .split(" ").filter((token) => token && !filler.has(token)).join(" ")

/** @returns {{ intent: (typeof CLARA_INTENTS)[keyof typeof CLARA_INTENTS], normalized: string, entityQuery: string }} */
export const recognizeClaraIntent = (question) => {
  const normalized = normalizeClaraQuery(question)
  const intent = patterns.find(([, pattern]) => pattern.test(normalized))?.[0] || CLARA_INTENTS.CAMPUS_INFORMATION
  return { intent, normalized, entityQuery: extractClaraEntityQuery(normalized) }
}
