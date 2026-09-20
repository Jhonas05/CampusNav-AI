import { facilities } from "@/data/facilities"
import { getFloorById } from "@/data/floors"

/**
 * CLARA — Campus Learning Alerts & Response Assistant.
 *
 * The conversational layer over verified CampusNav data. CLARA answers only
 * from the verified facility-to-floor assignments and never invents campus
 * information; routing itself stays with the CampusNav route engine, so
 * replies link into the existing Navigate/Facilities/Emergency surfaces
 * rather than computing paths here.
 *
 * Extracted verbatim from the former `src/pages/Clara.jsx` so the floating
 * assistant and any deep link share one implementation.
 */

export const SUGGESTED_PROMPTS = [
  "Where is the Registrar's Office?",
  "Navigate to the Library",
  "Is the Virtual Laboratory open?",
  "Who is scheduled in the Computer Laboratory?",
  "What events are happening today?",
  "Show emergency information.",
]

const STOPWORDS = new Set(["where", "is", "the", "a", "an", "of", "to", "in", "on", "at", "how", "do", "i", "can", "get", "find", "my", "me", "open", "today", "now", "and", "for", "who", "what", "show", "navigate"])
const GENERIC_TOKENS = new Set(["office", "room", "area", "hall"])

const tokenize = (value) => value.toLowerCase().replace(/[^a-z0-9\s']/g, " ").split(/\s+/).filter(Boolean)

/**
 * Local placeholder matcher — answers only from the verified facility list.
 * Full-name inclusion wins; otherwise facilities need at least one distinctive
 * token overlap so generic words alone ("office") never pick a random match.
 */
export const findMatch = (message) => {
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

export const facilityReply = (facility) => {
  const floor = getFloorById(facility.floorId)
  const position = facility.mapRoomId
    ? `Its relative position on the ${floor?.name || facility.floorId} is aligned to the official emergency plan; exact dimensions and physical distances are not yet verified.`
    : "Its exact room position is pending verification."
  return `${facility.name} has a verified assignment on the ${floor?.name || facility.floorId}. ${position} Operating hours and personnel schedules are pending verification.`
}

export const buildReply = (message) => {
  if (/emergency|evacuat|fire|earthquake|medical/i.test(message)) {
    return {
      text: "For emergencies, follow the posted evacuation plan and instructions from authorized campus personnel. The digital map is not a certified emergency-navigation system. Verified safety information is on the Emergency page.",
      facility: null,
      link: { href: "/emergency", label: "Emergency Information" },
    }
  }

  const facility = findMatch(message)
  if (facility) return { text: facilityReply(facility), facility, link: null }

  if (/event|happening|activity|activities|calendar/i.test(message)) {
    return {
      text: "Published campus events appear on the Events page and the Dashboard. No official events source is connected yet, so no events are currently listed.",
      facility: null,
      link: { href: "/events", label: "View Events" },
    }
  }

  if (/schedule|professor|prof\.?\b|teacher|instructor|faculty|personnel|available/i.test(message)) {
    return {
      text: "Personnel schedules and availability are pending an authorized schedule source. Once connected, CLARA can answer who is scheduled in a room — a schedule will never be presented as proof of physical presence.",
      facility: null,
      link: { href: "/dashboard#personnel-availability", label: "Personnel Availability" },
    }
  }

  return {
    text: "I could not match that request to the verified floor-assignment list. Try the exact name of an office, room, laboratory, or facility.",
    facility: null,
    link: null,
  }
}

export const WELCOME_TEXT =
  "Hi! I'm CLARA, your campus digital concierge. I answer using the verified facility-to-floor assignments — ask me where an office, room, or laboratory is."

export const createWelcomeMessage = () => ({
  role: "assistant",
  text: WELCOME_TEXT,
  facility: null,
  link: null,
})

/** Resolves a facility by its exact verified name (used by `?about=` links). */
export const findFacilityByName = (name) =>
  name ? facilities.find((facility) => facility.name === name) || null : null
