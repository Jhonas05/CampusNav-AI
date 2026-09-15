import { CLASS_STATUSES, DASHBOARD_DATA_STATUS, NOTIFICATION_CATEGORIES, NOTIFICATION_LIFECYCLES, NOTIFICATION_PRIORITIES, OFFICE_STATUSES, SAMPLE_DATA_NOTICE } from "../data/dashboardContracts.js"
import { getFacilityById } from "../data/facilities.js"
import { getFacilityEntranceNodes } from "../data/mapNodes.js"
import { getCampusDateKey, isCurrentlyEffective } from "../lib/campusTime.js"
import { getBackendAvailability, getSupabaseClient } from "../lib/supabaseClient.js"
import { createLocalDashboardProvider } from "../providers/dashboard/localDashboardProvider.js"
import { createSupabaseDashboardProvider } from "../providers/dashboard/supabaseDashboardProvider.js"
import { subscribeToDashboardUpdates } from "./realtimeService.js"

const priorityRank = new Map([
  [NOTIFICATION_PRIORITIES.URGENT, 0],
  [NOTIFICATION_PRIORITIES.IMPORTANT, 1],
  [NOTIFICATION_PRIORITIES.NORMAL, 2],
  [NOTIFICATION_PRIORITIES.INFORMATIONAL, 3],
])

const recordTimestamp = (record) => new Date(record.effectiveAt || record.publishedAt || 0).getTime()
const stableRecordKey = (record) => record.sourceType && record.sourceId ? `${record.sourceType}:${record.sourceId}` : record.id

export const deduplicateDashboardRecords = (records) => {
  const seen = new Set()
  return records.filter((record) => {
    const key = stableRecordKey(record)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const deduplicateDashboardSections = (sections) => {
  const seen = new Set()
  return Object.fromEntries(Object.entries(sections).map(([section, records]) => [section, records.filter((record) => {
    const key = stableRecordKey(record)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })]))
}

export const sortNotificationsByPriority = (records) => [...records].sort((a, b) => {
  const priorityDifference = (priorityRank.get(a.priority) ?? 99) - (priorityRank.get(b.priority) ?? 99)
  return priorityDifference || recordTimestamp(b) - recordTimestamp(a) || String(a.id).localeCompare(String(b.id))
})

export const filterActiveNotifications = (records, now = new Date()) => sortNotificationsByPriority(
  deduplicateDashboardRecords(records).filter((record) =>
    record.lifecycle === NOTIFICATION_LIFECYCLES.PUBLISHED && isCurrentlyEffective(record, now)
  )
)

export const getFacilityNavigationHref = (facilityId) => {
  const facility = getFacilityById(facilityId)
  if (!facility || facility.navigable === false || !getFacilityEntranceNodes(facility.id, facility.floorId).length) return null
  return `/map?facility=${encodeURIComponent(facility.id)}`
}

export const getFacilityDetailsHref = (facilityId) => getFacilityById(facilityId) ? `/facilities/${encodeURIComponent(facilityId)}` : null
export const getEmergencyModeHref = () => "/map?mode=emergency"

const withFacilityActions = (record) => ({
  ...record,
  navigationHref: record.relatedFacilityId ? getFacilityNavigationHref(record.relatedFacilityId) : null,
  facilityHref: record.relatedFacilityId ? getFacilityDetailsHref(record.relatedFacilityId) : null,
  emergencyHref: record.category === NOTIFICATION_CATEGORIES.EMERGENCY ? getEmergencyModeHref() : null,
})

const getProviderData = (options = {}) => {
  const provider = createLocalDashboardProvider(options)
  return {
    notifications: provider.getPriorityAlerts(),
    classes: provider.getTodaysClasses(),
    offices: provider.getOfficeAvailability(),
    personnel: provider.getPersonnelAvailability(),
    advisories: provider.getFacilityAdvisories(),
    events: provider.getUpcomingEvents(),
    announcements: provider.getGeneralAnnouncements(),
    navigationNotices: provider.getNavigationNotices(),
  }
}

export const getPriorityAlerts = (options = {}) => filterActiveNotifications(getProviderData(options).notifications, options.now).map(withFacilityActions)

export const getTodaysClasses = (options = {}) => {
  const today = getCampusDateKey(options.now || new Date())
  return deduplicateDashboardRecords(getProviderData(options).classes)
    .filter((record) => getCampusDateKey(record.startAt) === today)
    .map((record) => ({ ...withFacilityActions(record), scheduleStatus: record.scheduleStatus || CLASS_STATUSES.PENDING_VERIFICATION }))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
}

export const getOfficeAvailability = (options = {}) => deduplicateDashboardRecords(getProviderData(options).offices).map(withFacilityActions)
export const getPersonnelAvailability = (options = {}) => deduplicateDashboardRecords(getProviderData(options).personnel).map(withFacilityActions)
export const getFacilityAdvisories = (options = {}) => filterActiveNotifications(getProviderData(options).advisories, options.now).map(withFacilityActions)

export const getUpcomingEvents = (options = {}) => {
  const today = getCampusDateKey(options.now || new Date())
  const activeEvents = deduplicateDashboardRecords(getProviderData(options).events)
    .filter((record) => ![NOTIFICATION_LIFECYCLES.CANCELLED, NOTIFICATION_LIFECYCLES.EXPIRED].includes(record.status))
    .map(withFacilityActions)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  return {
    today: activeEvents.filter((record) => record.date === today),
    upcoming: activeEvents.filter((record) => record.date > today),
  }
}

export const getGeneralAnnouncements = (options = {}) => filterActiveNotifications(getProviderData(options).announcements, options.now).map(withFacilityActions)
export const getNavigationNotices = (options = {}) => filterActiveNotifications(getProviderData(options).navigationNotices, options.now).map(withFacilityActions)

export const getDashboardSummary = (options = {}) => {
  const events = getUpcomingEvents(options)
  const offices = getOfficeAvailability(options)
  return {
    priorityAlerts: getPriorityAlerts(options).length || null,
    todaysClasses: getTodaysClasses(options).length || null,
    availableOffices: offices.filter((office) => [OFFICE_STATUSES.OPEN_NOW, OFFICE_STATUSES.CLOSING_SOON].includes(office.operatingStatus)).length || null,
    upcomingEvents: events.upcoming.length || null,
  }
}

export const getDashboardDataStatus = ({ demo = false } = {}) => ({
  code: demo ? DASHBOARD_DATA_STATUS.DEMO : DASHBOARD_DATA_STATUS.LOCAL_PROTOTYPE,
  label: demo ? "Demo data active" : "Local Prototype Mode",
  demo,
  realtime: false,
  notice: demo ? SAMPLE_DATA_NOTICE : "Live campus data is not configured; verified local navigation remains available.",
})

export const getDashboardSnapshot = (options = {}) => {
  const notificationSections = deduplicateDashboardSections({
    alerts: getPriorityAlerts(options),
    advisories: getFacilityAdvisories(options),
    announcements: getGeneralAnnouncements(options),
    navigationNotices: getNavigationNotices(options),
  })
  return {
    status: getDashboardDataStatus(options),
    summary: getDashboardSummary(options),
    alerts: notificationSections.alerts || [],
    advisories: notificationSections.advisories || [],
    announcements: notificationSections.announcements || [],
    navigationNotices: notificationSections.navigationNotices || [],
    classes: getTodaysClasses(options),
    offices: getOfficeAvailability(options),
    personnel: getPersonnelAvailability(options),
    events: getUpcomingEvents(options),
  }
}

const getSnapshotSummary = (snapshot) => ({
  priorityAlerts: snapshot.alerts.length || null,
  todaysClasses: snapshot.classes.length || null,
  availableOffices: snapshot.offices.filter((office) => [OFFICE_STATUSES.OPEN_NOW, OFFICE_STATUSES.CLOSING_SOON].includes(office.operatingStatus)).length || null,
  upcomingEvents: snapshot.events.upcoming.length || null,
})

export const loadDashboardSnapshot = async (options = {}, dependencies = {}) => {
  const localSnapshot = getDashboardSnapshot(options)
  const availability = dependencies.availability || getBackendAvailability()
  if (options.demo || !availability.configured) return localSnapshot

  try {
    const client = await (dependencies.clientLoader || getSupabaseClient)()
    const provider = (dependencies.providerFactory || createSupabaseDashboardProvider)(client, options)
    const [alerts, advisories, events, announcements, remoteNavigationNotices, classes, personnel] = await Promise.all([
      provider.getPriorityAlerts(),
      provider.getFacilityAdvisories(),
      provider.getUpcomingEvents(),
      provider.getGeneralAnnouncements(),
      provider.getNavigationNotices(),
      provider.getTodaysClasses(),
      provider.getPersonnelAvailability(),
    ])
    const notificationSections = deduplicateDashboardSections({
      alerts: filterActiveNotifications(alerts, options.now).map(withFacilityActions),
      advisories: filterActiveNotifications(advisories, options.now).map(withFacilityActions),
      announcements: filterActiveNotifications(announcements, options.now).map(withFacilityActions),
      navigationNotices: filterActiveNotifications([...remoteNavigationNotices, ...localSnapshot.navigationNotices], options.now).map(withFacilityActions),
    })
    const snapshot = {
      ...localSnapshot,
      status: {
        code: DASHBOARD_DATA_STATUS.SUPABASE_CONNECTED,
        label: "Supabase Connected",
        demo: false,
        realtime: false,
        notice: "Published campus records are connected.",
      },
      alerts: notificationSections.alerts,
      advisories: notificationSections.advisories,
      announcements: notificationSections.announcements,
      navigationNotices: notificationSections.navigationNotices,
      events,
      classes: deduplicateDashboardRecords(classes).map(withFacilityActions),
      personnel: deduplicateDashboardRecords(personnel).map(withFacilityActions),
    }
    return { ...snapshot, summary: getSnapshotSummary(snapshot) }
  } catch (error) {
    console.warn("CampusNav Dashboard is using its local fallback because Supabase is unavailable.", error)
    return {
      ...localSnapshot,
      status: {
        code: DASHBOARD_DATA_STATUS.SUPABASE_OFFLINE,
        label: "Supabase Offline / Fallback",
        demo: false,
        realtime: false,
        notice: "Live campus data is temporarily unavailable. Local navigation remains available.",
      },
    }
  }
}

export const subscribeToDashboard = async (onChange, onStatus) => {
  if (!getBackendAvailability().configured) return () => {}
  try {
    const client = await getSupabaseClient()
    return subscribeToDashboardUpdates(client, onChange, onStatus)
  } catch (error) {
    console.warn("CampusNav Realtime subscription could not start.", error)
    return () => {}
  }
}
