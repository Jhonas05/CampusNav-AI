import { useEffect, useRef } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import { useClara } from "./ClaraContext"
import { findClaraFacilityIdByName } from "@/services/claraService"

/**
 * Keeps the legacy `/clara` URL working. CLARA is no longer a page: this route
 * opens the global floating assistant (honoring `?q=` and `?about=`) and
 * returns the visitor to Home, so old links and bookmarks do not 404.
 */
export default function ClaraRoute() {
  const [searchParams] = useSearchParams()
  const { openClara } = useClara()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    const facilityId = findClaraFacilityIdByName(searchParams.get("about"))
    openClara({ question: facilityId ? null : searchParams.get("q"), facilityId })
  }, [openClara, searchParams])

  return <Navigate to="/" replace />
}
