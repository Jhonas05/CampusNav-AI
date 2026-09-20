import { useEffect, useRef } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import { useClara } from "@/contexts/ClaraContext"
import { findFacilityByName } from "@/lib/claraEngine"

/**
 * CLARA deep-link entry point.
 *
 * CLARA is no longer a full page — it is the floating assistant available on
 * every screen. This route is kept so existing `/clara`, `/clara?q=...`, and
 * `/clara?about=...` links across CampusNav keep working: it hands the
 * question to the shared assistant, opens the panel, and returns the user to
 * the Dashboard underneath.
 */
export default function Clara() {
  const [searchParams] = useSearchParams()
  const { openClara, ask, askAbout } = useClara()
  const handled = useRef(false)

  const question = searchParams.get("q")
  const subject = searchParams.get("about")

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const facility = findFacilityByName(subject)
    if (facility) askAbout(facility)
    else if (question) ask(question)

    openClara()
  }, [ask, askAbout, openClara, question, subject])

  return <Navigate to="/dashboard" replace />
}
