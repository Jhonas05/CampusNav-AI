import { ArrowRight, ArrowUp, Clock3, MapPin, Sparkles } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { focusRing } from "@/components/campus/ui"
import FacilityStatusBadge from "@/components/facilities/FacilityStatusBadge"
import { FACILITY_DATA_NOTICE, facilities } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { getFacilityNavigationHref } from "@/services/dashboardService"

const SUGGESTED_PROMPTS = [
  "Where is the Registrar?",
  "Is the Library open?",
  "Where is my classroom?",
  "Who is scheduled in the Computer Laboratory?",
  "What events are happening today?",
  "Show emergency information.",
]

const STOPWORDS = new Set(["where", "is", "the", "a", "an", "of", "to", "in", "on", "at", "how", "do", "i", "can", "get", "find", "my", "me", "open", "today", "now", "and", "for", "who", "what", "show"])
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

const facilityReply = (facility) => {
  const floor = getFloorById(facility.floorId)
  const position = facility.mapRoomId
    ? `Its relative position on the ${floor?.name || facility.floorId} is aligned to the official emergency plan; exact dimensions and physical distances are not yet verified.`
    : "Its exact room position is pending verification."
  return `${facility.name} has a verified assignment on the ${floor?.name || facility.floorId}. ${position} Operating hours and personnel schedules are pending verification.`
}

const buildReply = (message) => {
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

function FacilityResultCard({ facility }) {
  const floor = getFloorById(facility.floorId)
  const navigationHref = getFacilityNavigationHref(facility.id)
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#E5E5E7] bg-white">
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">{facility.kind}</p>
        <p className="mt-1 text-base font-semibold tracking-tight text-[#1D1D1F]">{facility.name}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6E6E73]">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {floor?.name || facility.floorId}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FacilityStatusBadge size="sm" />
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#B8B8BD] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#6E6E73]">
            <Clock3 className="h-3 w-3" aria-hidden="true" /> Hours pending
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-[#F0F0F2] bg-[#FAFAFA] p-3">
        {navigationHref && (
          <Link to={navigationHref} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-700 px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-brand-800 ${focusRing}`}>
            Navigate There <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
        <Link to={`/facilities/${facility.id}`} className={`inline-flex min-h-9 items-center rounded-full border border-[#D2D2D7] bg-white px-4 text-xs font-semibold text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] ${focusRing}`}>
          {facility.kind === "Office" ? "View Office" : "View Details"}
        </Link>
      </div>
    </div>
  )
}

export default function Clara() {
  const [searchParams] = useSearchParams()
  const subject = searchParams.get("about")
  const initialQuestion = searchParams.get("q")
  const subjectFacility = useMemo(() => facilities.find((facility) => facility.name === subject), [subject])
  const [input, setInput] = useState("")
  const scrollRef = useRef(null)
  const processedInitialQuestion = useRef(false)
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      text: subjectFacility
        ? facilityReply(subjectFacility)
        : "Hi! I'm CLARA, your campus digital concierge. I answer using the verified facility-to-floor assignments — ask me where an office, room, or laboratory is.",
      facility: subjectFacility || null,
      link: null,
    },
  ])

  const ask = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const response = buildReply(trimmed)
    setMessages((current) => [...current, { role: "user", text: trimmed, facility: null, link: null }, { role: "assistant", ...response }])
  }

  useEffect(() => {
    if (processedInitialQuestion.current || !initialQuestion || subjectFacility) return
    processedInitialQuestion.current = true
    ask(initialQuestion)
  }, [initialQuestion, subjectFacility])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    container.scrollTo({ top: container.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" })
  }, [messages])

  const submit = (event) => {
    event.preventDefault()
    ask(input)
    setInput("")
  }

  const showSuggestions = messages.filter((message) => message.role === "user").length < 2

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F7] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-brand-900 bg-gradient-to-br from-brand-700 to-brand-900 text-gold-100">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#1D1D1F] sm:text-5xl">CLARA</h1>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">Campus Learning Alerts &amp; Response Assistant</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#6E6E73] sm:text-base">
            Ask about campus locations, services, schedules, personnel availability, events, and official campus information.
          </p>
        </header>

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#E5E5E7] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          <div ref={scrollRef} className="h-[46vh] min-h-[340px] space-y-5 overflow-y-auto overscroll-contain px-5 py-7 sm:px-8" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-gold-100" aria-hidden="true">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[82%] sm:max-w-[74%] ${message.role === "user" ? "rounded-2xl rounded-br-md bg-brand-700 px-4 py-3 text-white" : ""}`}>
                  {message.role === "assistant" ? (
                    <>
                      <div className="rounded-2xl rounded-tl-md bg-[#F1F4FB] px-4 py-3">
                        <p className="text-sm leading-relaxed text-[#1D1D1F]">{message.text}</p>
                      </div>
                      {message.facility && <FacilityResultCard facility={message.facility} />}
                      {message.link && (
                        <Link to={message.link.href} className={`mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-4 text-xs font-semibold text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] ${focusRing}`}>
                          {message.link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5E5E7] p-4 sm:p-6">
            {showSuggestions && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Suggested prompts">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => ask(prompt)}
                    className={`shrink-0 rounded-full border border-[#D2D2D7] bg-white px-3.5 py-2 text-xs font-medium text-[#48484A] transition-colors duration-200 hover:border-brand-600 hover:text-brand-700 ${focusRing}`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-[#E5E5E7] bg-[#F5F5F7] p-1.5 pl-5 transition-colors duration-200 focus-within:border-brand-600">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask CLARA..."
                aria-label="Message CLARA"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#1D1D1F] outline-none placeholder:text-[#86868B]"
              />
              <button aria-label="Send message" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-colors duration-200 hover:bg-brand-800 ${focusRing}`}>
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-[#86868B]">{FACILITY_DATA_NOTICE}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
