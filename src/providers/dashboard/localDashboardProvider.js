import { createDashboardDemoData } from "../../data/dashboardDemoData.js"
import { DASHBOARD_DATA_STATUS, NOTIFICATION_CATEGORIES, NOTIFICATION_LIFECYCLES, NOTIFICATION_PRIORITIES, OFFICE_STATUSES } from "../../data/dashboardContracts.js"
import { facilities } from "../../data/facilities.js"

const createPrototypeData = () => ({
  notifications: [],
  classes: [],
  offices: facilities.filter((facility) => facility.kind === "Office").map((facility) => ({
    id: `office-${facility.id}`,
    facilityName: facility.name,
    floorId: facility.floorId,
    relatedFacilityId: facility.id,
    openingTime: null,
    closingTime: null,
    operatingStatus: OFFICE_STATUSES.UNKNOWN,
    verificationStatus: facility.verification.operatingHours,
    sourceType: "FACILITY_REGISTRY",
    sourceId: facility.id,
    dataStatus: DASHBOARD_DATA_STATUS.PENDING_VERIFICATION,
    demo: false,
  })),
  personnel: [],
  advisories: [],
  events: [],
  announcements: [],
  navigationNotices: facilities.filter((facility) => ["UNDER_CONSTRUCTION", "BLOCKED", "RESTRICTED", "NON_NAVIGABLE"].includes(facility.status)).map((facility) => ({
    id: `navigation-restriction-${facility.id}`,
    title: facility.status === "UNDER_CONSTRUCTION" ? "Mapped construction area" : "Mapped access restriction",
    message: `${facility.name} — ${facility.floorId} is excluded from CampusNav routes. Follow posted site restrictions and authorized instructions.`,
    category: NOTIFICATION_CATEGORIES.NAVIGATION,
    priority: NOTIFICATION_PRIORITIES.IMPORTANT,
    audience: ["ALL"],
    lifecycle: NOTIFICATION_LIFECYCLES.PUBLISHED,
    publishedAt: null,
    effectiveAt: null,
    expiresAt: null,
    sourceType: "MAP_RESTRICTION",
    sourceId: facility.id,
    relatedFacilityId: facility.id,
    verificationStatus: facility.verification.exactLocation,
    dataStatus: DASHBOARD_DATA_STATUS.SOURCE_ALIGNED,
    demo: false,
  })),
})

export const createLocalDashboardProvider = ({ demo = false, now = new Date() } = {}) => {
  const data = demo ? createDashboardDemoData(now) : createPrototypeData()
  return {
    mode: demo ? "DEMO" : "LOCAL_PROTOTYPE",
    getDashboardSummary: () => ({
      priorityAlerts: data.notifications.length || null,
      todaysClasses: data.classes.length || null,
      availableOffices: data.offices.filter((office) => [String(OFFICE_STATUSES.OPEN_NOW), String(OFFICE_STATUSES.CLOSING_SOON)].includes(String(office.operatingStatus))).length || null,
      upcomingEvents: data.events.length || null,
    }),
    getPriorityAlerts: () => data.notifications,
    getTodaysClasses: () => data.classes,
    getOfficeAvailability: () => data.offices,
    getPersonnelAvailability: () => data.personnel,
    getFacilityAdvisories: () => data.advisories,
    getUpcomingEvents: () => data.events,
    getGeneralAnnouncements: () => data.announcements,
    getNavigationNotices: () => data.navigationNotices,
  }
}
