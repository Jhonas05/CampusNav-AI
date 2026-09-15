import { CLASS_STATUSES, DASHBOARD_DATA_STATUS, NOTIFICATION_CATEGORIES, NOTIFICATION_LIFECYCLES, NOTIFICATION_PRIORITIES, OFFICE_STATUSES, PERSONNEL_STATUSES } from "./dashboardContracts.js"
import { addCampusDays, campusDateTimeToIso, getCampusDateKey } from "../lib/campusTime.js"

export const createDashboardDemoData = (now = new Date()) => {
  const today = getCampusDateKey(now)
  const tomorrow = addCampusDays(today, 1)
  const publishedAt = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
  const effectiveAt = new Date(now.getTime() - 30 * 60 * 1000).toISOString()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  const common = {
    audience: ["DEMO_USERS"],
    lifecycle: NOTIFICATION_LIFECYCLES.PUBLISHED,
    publishedAt,
    effectiveAt,
    expiresAt,
    sourceType: "DEMO_PROVIDER",
    verificationStatus: "DEMO_ONLY",
    dataStatus: DASHBOARD_DATA_STATUS.DEMO,
    demo: true,
  }

  return {
    notifications: [
      {
        ...common,
        id: "demo-emergency-notice",
        sourceId: "DEMO-EMERGENCY-001",
        title: "Sample emergency notice",
        message: "Demonstration of an urgent dashboard item and its Emergency Mode action.",
        category: NOTIFICATION_CATEGORIES.EMERGENCY,
        priority: NOTIFICATION_PRIORITIES.URGENT,
      },
      {
        ...common,
        id: "demo-schedule-notice",
        sourceId: "DEMO-SCHEDULE-001",
        title: "Sample schedule notice",
        message: "Demonstration of a time-sensitive academic schedule update.",
        category: NOTIFICATION_CATEGORIES.SCHEDULE,
        priority: NOTIFICATION_PRIORITIES.IMPORTANT,
      },
      {
        ...common,
        id: "demo-general-notice",
        sourceId: "DEMO-GENERAL-001",
        title: "Sample general notice",
        message: "Demonstration of a general informational notification.",
        category: NOTIFICATION_CATEGORIES.GENERAL,
        priority: NOTIFICATION_PRIORITIES.INFORMATIONAL,
      },
    ],
    classes: [
      {
        id: "demo-class-001",
        subject: "Sample Class",
        courseCode: "SAMPLE 101",
        section: "DEMO-A",
        professor: "Sample Faculty",
        room: "Library",
        relatedFacilityId: "library",
        startAt: campusDateTimeToIso(today, "09:00"),
        endAt: campusDateTimeToIso(today, "10:30"),
        scheduleStatus: CLASS_STATUSES.PENDING_VERIFICATION,
        verificationStatus: "DEMO_ONLY",
        sourceType: "DEMO_PROVIDER",
        sourceId: "DEMO-CLASS-001",
        dataStatus: DASHBOARD_DATA_STATUS.DEMO,
        demo: true,
      },
    ],
    offices: [
      {
        id: "demo-office-001",
        facilityName: "Sample Office",
        floorId: "3F",
        openingTime: "09:00",
        closingTime: "16:00",
        operatingStatus: OFFICE_STATUSES.OPEN_NOW,
        verificationStatus: "DEMO_ONLY",
        sourceType: "DEMO_PROVIDER",
        sourceId: "DEMO-OFFICE-001",
        dataStatus: DASHBOARD_DATA_STATUS.DEMO,
        demo: true,
      },
    ],
    personnel: [
      {
        id: "demo-personnel-001",
        name: "Sample Faculty",
        role: "Sample role",
        facilityName: "Sample Consultation Room",
        status: PERSONNEL_STATUSES.SCHEDULED,
        scheduledStartAt: campusDateTimeToIso(today, "13:00"),
        scheduledEndAt: campusDateTimeToIso(today, "15:00"),
        verificationStatus: "DEMO_ONLY",
        sourceType: "DEMO_PROVIDER",
        sourceId: "DEMO-PERSONNEL-001",
        dataStatus: DASHBOARD_DATA_STATUS.DEMO,
        demo: true,
      },
    ],
    advisories: [
      {
        ...common,
        id: "demo-facility-advisory-001",
        sourceId: "DEMO-ADVISORY-001",
        title: "Sample facility advisory",
        message: "Demonstration of a temporary facility notice.",
        category: NOTIFICATION_CATEGORIES.FACILITY,
        priority: NOTIFICATION_PRIORITIES.IMPORTANT,
        relatedFacilityId: "library",
      },
    ],
    events: [
      {
        id: "demo-event-today",
        title: "Sample Event",
        date: today,
        startAt: campusDateTimeToIso(today, "14:00"),
        endAt: campusDateTimeToIso(today, "15:30"),
        location: "Library",
        relatedFacilityId: "library",
        organizer: "Sample Organizer",
        audience: ["DEMO_USERS"],
        status: "SCHEDULED",
        verificationStatus: "DEMO_ONLY",
        sourceType: "DEMO_PROVIDER",
        sourceId: "DEMO-EVENT-001",
        dataStatus: DASHBOARD_DATA_STATUS.DEMO,
        demo: true,
      },
      {
        id: "demo-event-upcoming",
        title: "Sample Upcoming Event",
        date: tomorrow,
        startAt: campusDateTimeToIso(tomorrow, "10:00"),
        endAt: campusDateTimeToIso(tomorrow, "11:00"),
        location: "Sample Venue",
        organizer: "Sample Organizer",
        audience: ["DEMO_USERS"],
        status: "SCHEDULED",
        verificationStatus: "DEMO_ONLY",
        sourceType: "DEMO_PROVIDER",
        sourceId: "DEMO-EVENT-002",
        dataStatus: DASHBOARD_DATA_STATUS.DEMO,
        demo: true,
      },
    ],
    announcements: [
      {
        ...common,
        id: "demo-announcement-001",
        sourceId: "DEMO-ANNOUNCEMENT-001",
        title: "Sample Announcement",
        message: "Demonstration of a published general announcement.",
        category: NOTIFICATION_CATEGORIES.GENERAL,
        priority: NOTIFICATION_PRIORITIES.NORMAL,
      },
    ],
    navigationNotices: [
      {
        ...common,
        id: "demo-navigation-notice-001",
        sourceId: "DEMO-NAVIGATION-001",
        title: "Sample QR checkpoint notice",
        message: "Demonstration of a temporarily unavailable checkpoint notice.",
        category: NOTIFICATION_CATEGORIES.NAVIGATION,
        priority: NOTIFICATION_PRIORITIES.NORMAL,
      },
    ],
  }
}

