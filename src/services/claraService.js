import { CLARA_APPROVED_FAQS } from "../data/claraFaqs.js"
import { getFloorById } from "../data/floors.js"
import { FACILITY_OPERATIONAL_STATUS } from "../data/facilityContracts.js"
import { CLARA_INTENTS, recognizeClaraIntent } from "./claraIntents.js"
import { createClaraFaqIndex, retrieveClaraFaqs } from "./claraKnowledge.js"
import { createDisabledClaraProvider, getClaraProviderCapability } from "./claraProvider.js"
import { createClaraToolService } from "./claraToolService.js"

export const CLARA_SUGGESTED_PROMPTS = [
  "Where is the Registrar?",
  "Take me to the Library",
  "Is the Virtual Laboratory open?",
  "Find the Guidance Office",
  "What events are happening today?",
]

export const CLARA_WELCOME_MESSAGE =
  "Hi! I'm CLARA. I answer with verified CampusNav records and approved FAQs. External generative AI is currently disabled."

export const CLARA_SCOPE_NOTICE =
  "Verified CampusNav sources only. External AI is disabled; unavailable information is never guessed."

export const CLARA_RESPONSE_MODES = Object.freeze({
  VERIFIED_DIRECT: "VERIFIED_DIRECT",
  UNAVAILABLE: "UNAVAILABLE",
  AI_ASSISTED: "AI_ASSISTED",
})

const MAX_QUESTION_LENGTH = 500
const unavailableText = "I couldn't find verified information for that request. Please contact the appropriate school office."

const source = (id, label, verificationStatus = "VERIFIED") => ({ id, label, verificationStatus })
const unavailable = (intent, overrides = {}) => ({
  text: unavailableText,
  facility: null,
  link: { href: "/facilities", label: "Browse Facilities" },
  verified: false,
  mode: CLARA_RESPONSE_MODES.UNAVAILABLE,
  intent,
  sources: [],
  ...overrides,
})

const safeQuestion = (message) => {
  const text = typeof message === "string" ? message.trim() : ""
  if (!text || text.length > MAX_QUESTION_LENGTH || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(text)) {
    throw new Error("Invalid CLARA request.")
  }
  return text
}

const facilitySource = (facility) => source(`FACILITY:${facility.id}`, `Canonical facility registry — ${facility.name}`)
const floorSource = (floor) => source(`FLOOR:${floor.id}`, `Canonical floor registry — ${floor.name}`)

export const getClaraFacilityReply = (facility) => {
  const floor = getFloorById(facility.floorId)
  const caveat = facility.mapRoomId
    ? "Its map position is estimated, and operating hours require a separately verified status source."
    : "Its exact room position and operating hours are pending verification."
  return `${facility.name} is on the ${floor?.name || facility.floorId}. ${caveat}`
}

const facilityReply = (intent, result) => {
  const { facility, floor } = result.data
  return {
    text: getClaraFacilityReply(facility),
    facility,
    link: null,
    verified: true,
    mode: CLARA_RESPONSE_MODES.VERIFIED_DIRECT,
    intent,
    sources: [facilitySource(facility), ...(floor ? [floorSource(floor)] : [])],
  }
}

const faqReply = (intent, retrieval) => {
  if (!retrieval.matches.length) return null
  if (retrieval.ambiguous) {
    const topics = retrieval.matches.map((faq) => faq.question).join("; ")
    return unavailable(intent, {
      text: `I found several verified FAQ topics: ${topics}. Please ask about one topic more specifically.`,
      link: null,
      sources: retrieval.matches.map((faq) => source(`FAQ:${faq.id}`, faq.source.label, faq.verificationStatus)),
    })
  }
  const faq = retrieval.matches[0]
  return {
    text: faq.answer,
    facility: null,
    link: null,
    verified: true,
    mode: CLARA_RESPONSE_MODES.VERIFIED_DIRECT,
    intent,
    sources: [source(`FAQ:${faq.id}`, faq.source.label, faq.verificationStatus)],
  }
}

const statusLabels = Object.freeze({
  [FACILITY_OPERATIONAL_STATUS.OPEN_NOW]: "open now",
  [FACILITY_OPERATIONAL_STATUS.CLOSING_SOON]: "closing soon",
  [FACILITY_OPERATIONAL_STATUS.SCHEDULED_TO_OPEN]: "scheduled to open",
  [FACILITY_OPERATIONAL_STATUS.CLOSED]: "closed",
  [FACILITY_OPERATIONAL_STATUS.TEMPORARILY_UNAVAILABLE]: "temporarily unavailable",
})

const statusSources = (facility, result) => {
  const records = result.data?.controllingRecords || []
  const dynamic = records.map((record, index) => {
    const provenance = record.provenance || record
    return source(
      provenance.sourceId ? `FACILITY_STATUS:${provenance.sourceId}` : `FACILITY_STATUS:${facility.id}:${index + 1}`,
      provenance.sourceLabel || provenance.sourceType || "Approved facility status record",
      provenance.verificationStatus || "VERIFIED",
    )
  })
  return [facilitySource(facility), ...dynamic]
}

const statusReply = async (tools, intent, facilityResult) => {
  const facility = facilityResult.data.facility
  const result = await tools.getFacilityStatus(facility.id)
  const status = result?.data?.status
  if (!result?.ok || !statusLabels[status]) {
    return unavailable(intent, {
      text: `Verified current operating information is unavailable for ${facility.name}.`,
      facility,
      link: null,
      sources: [facilitySource(facility)],
    })
  }
  return {
    text: `${facility.name} is ${statusLabels[status]} based on the current approved CampusNav status records.`,
    facility,
    link: null,
    verified: true,
    mode: CLARA_RESPONSE_MODES.VERIFIED_DIRECT,
    intent,
    sources: statusSources(facility, result),
  }
}

const serviceReply = async (tools, intent, entityQuery) => {
  if (!entityQuery) return unavailable(intent)
  const result = await tools.findService(entityQuery)
  if (!result?.ok || !result.data?.facilities?.length) {
    const named = result?.data?.unmappedServices?.length
      ? ` I found the service, but no verified facility mapping is published for ${result.data.unmappedServices.join(", ")}.`
      : ""
    return unavailable(intent, { text: `${unavailableText}${named}` })
  }
  if (result.data.facilities.length > 1) {
    const names = result.data.facilities.map(({ facility }) => facility.name).join(", ")
    return {
      text: `Verified configured locations for that service are: ${names}. Choose a canonical facility in the Facilities directory before navigating.`,
      facility: null,
      link: { href: "/facilities", label: "Choose a Facility" },
      verified: true,
      mode: CLARA_RESPONSE_MODES.VERIFIED_DIRECT,
      intent,
      sources: result.data.facilities.flatMap(({ facility, matches }) => [
        facilitySource(facility),
        ...matches.map((match) => source(
          `SERVICE_MAPPING:${match.serviceCode}:${facility.id}`,
          match.mappingProvenance?.sourceLabel || match.serviceName,
          match.mappingProvenance?.verificationStatus || "VERIFIED",
        )),
      ]),
    }
  }
  const [{ facility, matches }] = result.data.facilities
  return {
    text: `${facility.name} is a verified configured location for ${matches.map(({ serviceName }) => serviceName).join(", ")}. Select Navigate only after confirming this canonical destination.`,
    facility,
    link: null,
    verified: true,
    mode: CLARA_RESPONSE_MODES.VERIFIED_DIRECT,
    intent,
    sources: [facilitySource(facility), ...matches.map((match) => source(
      `SERVICE_MAPPING:${match.serviceCode}:${facility.id}`,
      match.mappingProvenance?.sourceLabel || match.serviceName,
      match.mappingProvenance?.verificationStatus || "VERIFIED",
    ))],
  }
}

export const createClaraService = (options = {}) => {
  const {
    faqs = CLARA_APPROVED_FAQS,
    tools = createClaraToolService(),
    provider = createDisabledClaraProvider(),
    clock = () => new Date().toISOString(),
  } = options
  let evaluatedAt = options.evaluatedAt || clock()
  let faqIndex = createClaraFaqIndex([...faqs], evaluatedAt)
  const nextBoundaryAfter = (at) => {
    const now = Date.parse(at)
    const values = faqs.flatMap((faq) => [faq.publishedAt, faq.effectiveAt, faq.expiresAt])
      .map((value) => typeof value === "string" ? Date.parse(value) : NaN)
      .filter((value) => Number.isFinite(value) && value > now)
    return values.length ? Math.min(...values) : null
  }
  let nextBoundary = nextBoundaryAfter(evaluatedAt)
  const currentFaqIndex = () => {
    const now = clock()
    if (nextBoundary !== null && Date.parse(now) >= nextBoundary) {
      evaluatedAt = now
      faqIndex = createClaraFaqIndex([...faqs], evaluatedAt)
      nextBoundary = nextBoundaryAfter(evaluatedAt)
    }
    return faqIndex
  }
  const providerCapability = getClaraProviderCapability(provider)

  return Object.freeze({
    capability: Object.freeze({
      directAnswers: true,
      faqCount: faqIndex.length,
      provider: Object.freeze(providerCapability),
    }),
    async ask(message) {
      const question = safeQuestion(message)
      const recognized = recognizeClaraIntent(question)
      const retrieval = retrieveClaraFaqs(currentFaqIndex(), question)
      if (retrieval.exact) return faqReply(recognized.intent, retrieval)

      if (recognized.intent === CLARA_INTENTS.EMERGENCY_INFORMATION) {
        return {
          text: "For emergencies, follow posted evacuation signage and instructions from authorized campus personnel. CampusNav can show only approved emergency information and never generates an evacuation route.",
          facility: null,
          link: { href: "/emergency", label: "Emergency Information" },
          verified: true,
          mode: CLARA_RESPONSE_MODES.VERIFIED_DIRECT,
          intent: recognized.intent,
          sources: [source("CONTRACT:EMERGENCY-SAFETY", "CampusNav Emergency Safety Contract", "SOURCE_ALIGNED")],
        }
      }

      if (
        recognized.intent === CLARA_INTENTS.FACILITY_SEARCH
        || recognized.intent === CLARA_INTENTS.NAVIGATION_REQUEST
        || recognized.intent === CLARA_INTENTS.FACILITY_STATUS
      ) {
        const facility = tools.findFacility(recognized.entityQuery || question)
        if (!facility?.data) return unavailable(recognized.intent)
        if (recognized.intent === CLARA_INTENTS.FACILITY_STATUS) return statusReply(tools, recognized.intent, facility)
        return facilityReply(recognized.intent, facility)
      }

      if (recognized.intent === CLARA_INTENTS.OFFICE_SERVICE_INQUIRY) {
        return serviceReply(tools, recognized.intent, recognized.entityQuery)
      }

      const retrieved = faqReply(recognized.intent, retrieval)
      if (retrieved) return retrieved

      if (recognized.intent === CLARA_INTENTS.EVENT_INQUIRY) {
        return unavailable(recognized.intent, { text: "No verified current event information is available to CLARA.", link: { href: "/events", label: "View Events" } })
      }
      if (recognized.intent === CLARA_INTENTS.ANNOUNCEMENT_INQUIRY || recognized.intent === CLARA_INTENTS.SUSPENSION_INQUIRY) {
        return unavailable(recognized.intent, { text: "No verified current announcement or suspension decision is available to CLARA.", link: { href: "/alerts", label: "View Official Alerts" } })
      }
      if (recognized.intent === CLARA_INTENTS.PERSONNEL_SCHEDULE) {
        return unavailable(recognized.intent, {
          text: "Verified personnel schedule information is unavailable. A schedule would describe an assignment only and would never be presented as proof of physical presence.",
          link: { href: "/dashboard#personnel-availability", label: "Personnel Availability" },
        })
      }

      return unavailable(recognized.intent)
    },
  })
}

const defaultClaraService = createClaraService()

export const getClaraFacilityContextReply = (facilityId) => {
  const tools = createClaraToolService()
  const facility = tools.getFacilityById(facilityId)
  if (!facility) return null
  const floor = getFloorById(facility.floorId)
  return facilityReply(CLARA_INTENTS.FACILITY_SEARCH, { data: { facility, floor } })
}

export const findClaraFacilityIdByName = (name) => {
  const result = createClaraToolService().findFacility(name)
  return result.data?.facility?.name === name ? result.data.facility.id : null
}

export const getClaraCapability = () => defaultClaraService.capability
export const askClara = async (message) => defaultClaraService.ask(message)
