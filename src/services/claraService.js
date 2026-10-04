import { facilities } from "@/data/facilities"
import { getFloorById } from "@/data/floors"

/**
 * CLARA request service.
 *
 * This is the single entry point the CLARA assistant UI calls. Today it is the
 * conservative local matcher that previously lived in the `/clara` page: it
 * answers only from the verified facility list and never produces schedules,
 * hours, personnel presence, or emergency routes (17-clara-ai-contract).
 *
 * The call is asynchronous so that a future server-side/edge provider can be
 * substituted here without changing the assistant UI. No model, API key, or
 * network request exists in this module.
 */

export const CLARA_SUGGESTED_PROMPTS = [
  "Where is the Registrar?",
  "Take me to the Library",
  "Is the Virtual Laboratory open?",
  "Find the Guidance Office",
  "What events are happening today?",
]

export const CLARA_WELCOME_MESSAGE =
  "Hi! I'm CLARA. I answer from the verified facility-to-floor assignments — ask me where an office, room, or laboratory is and I can open it in Navigate."

/** Short scope statement shown under the composer; mirrors FACILITY_DATA_NOTICE. */
export const CLARA_SCOPE_NOTICE = "CLARA answers from verified floor assignments only. Operating hours, schedules, and exact distances remain unverified."

const STOPWORDS = new Set(["where", "is", "the", "a", "an", "of", "to", "in", "on", "at", "how", "do", "i", "can", "get", "find", "my", "me", "open", "today", "now", "and", "for", "who", "what", "show", "take"])
const GENERIC_TOKENS = new Set(["office", "room", "area", "hall"])

const tokenize = (value) => value.toLowerCase().replace(/[^a-z0-9\s']/g, " ").split(/\s+/).filter(Boolean)

/**
 * Local placeholder matcher — answers only from the verified facility list.
 * Full-name inclusion wins; otherwise facilities need at least one distinctive
 * token overlap so generic words alone ("office") never pick a random match.
 */
const findMatch = (message) => {
  const normalized = message.toLowerCase()
  const messageTokens = tokenize(message).filter((token) => !STOPWORDS.has(token))
  const best = { facility: /** @type {any} */ (null), score: 0 }

  facilities.forEach((facility) => {
    if (facility.kind === "Construction") return
    const name = facility.name.toLowerCase()
    let score = 0
    if (normalized.includes(name)) {
      score = 100 + name.length
    } else {
      const nameTokens = tokenize(facility.name)
      const matched = nameTokens.filter((nameToken) => messageTokens.some((messageToken) =>
        nameToken === messageToken ||
        (messageToken.length >= 4 && nameToken.startsWith(messageToken)) ||
        (nameToken.length >= 4 && messageToken.startsWith(nameToken))
      ))
      const distinctive = matched.filter((token) => !GENERIC_TOKENS.has(token))
      if (distinctive.length > 0) score = distinctive.length * 10 + matched.length
    }
    if (score > best.score) {
      best.facility = facility
      best.score = score
    }
  })

  return best.facility
}

export const getClaraFacilityReply = (facility) => {
  const floor = getFloorById(facility.floorId)
  const position = facility.mapRoomId
    ? `Its relative position on the ${floor?.name || facility.floorId} is aligned to the official emergency plan; exact dimensions and physical distances are not yet verified.`
    : "Its exact room position is pending verification."
  return `${facility.name} has a verified assignment on the ${floor?.name || facility.floorId}. ${position} Operating hours and personnel schedules are pending verification.`
}

/**
 * @returns {{ text: string, facility: any, link: { href: string, label: string } | null, verified: boolean }}
 */
const buildReply = (message) => {
  if (/emergency|evacuat|fire|earthquake|medical/i.test(message)) {
    return {
      text: "For emergencies, follow the posted evacuation plan and instructions from authorized campus personnel. The digital map is not a certified emergency-navigation system. Verified safety information is on the Emergency page.",
      facility: null,
      link: { href: "/emergency", label: "Emergency Information" },
      verified: true,
    }
  }

  const facility = findMatch(message)
  if (facility) return { text: getClaraFacilityReply(facility), facility, link: null, verified: true }

  if (/event|happening|activity|activities|calendar/i.test(message)) {
    return {
      text: "Published campus events appear on the Events page and the Dashboard. No official events source is connected yet, so no events are currently listed.",
      facility: null,
      link: { href: "/events", label: "View Events" },
      verified: false,
    }
  }

  if (/schedule|professor|prof\.?\b|teacher|instructor|faculty|personnel|available/i.test(message)) {
    return {
      text: "Personnel schedules and availability are pending an authorized schedule source. Once connected, CLARA can answer who is scheduled in a room — a schedule will never be presented as proof of physical presence.",
      facility: null,
      link: { href: "/dashboard#personnel-availability", label: "Personnel Availability" },
      verified: false,
    }
  }

  return {
    text: "I couldn't find verified information for that request. Try the exact name of an office, room, laboratory, or facility, or contact the appropriate school office.",
    facility: null,
    link: { href: "/facilities", label: "Browse Facilities" },
    verified: false,
  }
}

/** Reply describing a facility the user opened CLARA from (facility CTA). */
export const getClaraFacilityContextReply = (facilityId) => {
  const facility = facilities.find((item) => item.id === facilityId)
  if (!facility) return null
  return { text: getClaraFacilityReply(facility), facility, link: null, verified: true }
}

/** Resolves the legacy `/clara?about=<facility name>` deep link to a facility id. */
export const findClaraFacilityIdByName = (name) => facilities.find((facility) => facility.name === name)?.id || null

/**
 * Ask CLARA a question.
 * @param {string} message
 * @returns {Promise<{ text: string, facility: any, link: { href: string, label: string } | null, verified: boolean }>}
 */
export const askClara = async (message) => {
  const trimmed = String(message || "").trim()
  if (!trimmed) throw new Error("Empty CLARA request.")
  return buildReply(trimmed)
}
