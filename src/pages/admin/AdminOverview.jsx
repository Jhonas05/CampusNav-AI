import { Bell, Building2, CalendarDays, FileText, Megaphone, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AdminShell from "@/components/admin/AdminShell"
import { PageHeader, Skeleton, button, card, focusRing } from "@/components/campus/ui"
import { getAdminService } from "@/services/adminService"

const CARDS = [
  { key: "publishedAnnouncements", label: "Published Announcements", icon: Megaphone, path: "/admin/announcements?status=PUBLISHED" },
  { key: "draftAnnouncements", label: "Draft Announcements", icon: FileText, path: "/admin/announcements?status=DRAFT" },
  { key: "upcomingEvents", label: "Upcoming Events", icon: CalendarDays, path: "/admin/events" },
  { key: "activeFacilityAdvisories", label: "Active Facility Advisories", icon: Building2, path: "/admin/facility-advisories" },
  { key: "activeNotifications", label: "Active Notifications", icon: Bell, path: "/admin/notifications" },
]

export default function AdminOverview() {
  const [counts, setCounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const service = await getAdminService()
      setCounts(await service.getAdminOverview())
    } catch (loadError) {
      setError(loadError?.message || "The Admin Overview could not be loaded.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin CMS"
        title="Overview"
        lead="Operational counts from the live CampusNav content tables. No inferred analytics or sample records are included."
        actions={<button type="button" onClick={load} disabled={loading} className={button.secondary}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh</button>}
      />

      {error && <div role="alert" className="mt-7 rounded-2xl border border-[#D2D2D7] bg-white px-5 py-4 text-sm text-[#1D1D1F]">{error}</div>}

      <section aria-label="Content counts" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map(({ key, label, icon: Icon, path }) => (
          <Link key={key} to={path} className={`${card} ${focusRing} p-6 transition-transform hover:-translate-y-0.5`}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-medium text-[#6E6E73]">{label}</p>{loading ? <Skeleton className="mt-3 h-10 w-20" /> : <p className="mt-2 text-4xl font-semibold tracking-tight text-[#1D1D1F]">{counts?.[key] ?? "—"}</p>}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F5F7] text-[#48484A]"><Icon className="h-4 w-4" aria-hidden="true" /></div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-[#E5E5E7] bg-white p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">Content workflow</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6E6E73]">Draft and scheduled records remain private. Publishing makes an effective record eligible for the existing public Dashboard provider and Realtime update flow, subject to database RLS.</p>
      </section>
    </AdminShell>
  )
}
