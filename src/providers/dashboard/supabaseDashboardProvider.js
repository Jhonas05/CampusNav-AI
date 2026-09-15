import { DASHBOARD_DATA_STATUS, NOTIFICATION_CATEGORIES } from "../../data/dashboardContracts.js"
import { getCampusDateKey } from "../../lib/campusTime.js"
import { createPersonnelService } from "../../services/personnelService.js"
import { createScheduleService } from "../../services/scheduleService.js"

const baseRecord = (row) => ({
  id: `supabase-${row.id}`,
  sourceId: row.source_id || String(row.id),
  sourceType: row.source_type || "SUPABASE",
  priority: row.priority,
  lifecycle: row.lifecycle,
  publishedAt: row.published_at,
  effectiveAt: row.effective_at,
  expiresAt: row.expires_at,
  relatedFacilityId: row.related_facility_id,
  verificationStatus: row.verification_status,
  dataStatus: row.data_status || DASHBOARD_DATA_STATUS.SOURCE_ALIGNED,
  demo: row.data_status === DASHBOARD_DATA_STATUS.DEMO,
})

const mapNotification = (row) => ({ ...baseRecord(row), title: row.title, message: row.message, category: row.category })
const mapAdvisory = (row) => ({ ...baseRecord(row), title: row.title, message: row.message, category: NOTIFICATION_CATEGORIES.FACILITY, advisoryType: row.advisory_type })
const mapAnnouncement = (row) => ({ ...baseRecord(row), title: row.title, message: row.message, category: row.category })
const mapEvent = (row) => ({
  ...baseRecord(row),
  title: row.title,
  description: row.description,
  date: getCampusDateKey(row.starts_at),
  startAt: row.starts_at,
  endAt: row.ends_at,
  location: row.location || "Location pending verification",
  organizer: row.organizer || "Organizer pending verification",
  status: row.lifecycle,
})

export const createSupabaseDashboardProvider = (client, { now = new Date() } = {}) => {
  const scheduleService = createScheduleService(client, { now: () => now })
  const personnelService = createPersonnelService(client, { now: () => now })
  const readPublished = async (table) => {
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq("lifecycle", "PUBLISHED")
      .eq("is_public", true)
      .order("published_at", { ascending: false })
    if (error) throw error
    return data || []
  }

  const getPriorityAlerts = async () => (await readPublished("notifications"))
    .filter((row) => row.category !== NOTIFICATION_CATEGORIES.NAVIGATION)
    .map(mapNotification)
  const getFacilityAdvisories = async () => (await readPublished("facility_advisories")).map(mapAdvisory)
  const getGeneralAnnouncements = async () => (await readPublished("announcements")).map(mapAnnouncement)
  const getNavigationNotices = async () => {
    const { data, error } = await client
      .from("notifications")
      .select("*")
      .eq("lifecycle", "PUBLISHED")
      .eq("is_public", true)
      .eq("category", NOTIFICATION_CATEGORIES.NAVIGATION)
      .order("published_at", { ascending: false })
    if (error) throw error
    return (data || []).map(mapNotification)
  }
  const getUpcomingEvents = async () => {
    const events = (await readPublished("events")).map(mapEvent)
    const today = getCampusDateKey(now)
    return {
      today: events.filter((event) => event.date === today),
      upcoming: events.filter((event) => event.date > today),
    }
  }

  return {
    mode: "SUPABASE",
    getDashboardSummary: async () => {
      const [alerts, events, classes] = await Promise.all([getPriorityAlerts(), getUpcomingEvents(), scheduleService.getTodaysClasses(now)])
      return { priorityAlerts: alerts.length || null, todaysClasses: classes.length || null, availableOffices: null, upcomingEvents: events.upcoming.length || null }
    },
    getPriorityAlerts,
    getTodaysClasses: () => scheduleService.getTodaysClasses(now),
    getOfficeAvailability: async () => [],
    getPersonnelAvailability: () => personnelService.getPersonnelAvailability(now),
    getFacilityAdvisories,
    getUpcomingEvents,
    getGeneralAnnouncements,
    getNavigationNotices,
  }
}
