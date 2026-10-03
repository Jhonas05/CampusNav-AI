import {
  FACILITY_OPERATIONAL_STATUS,
  normalizeFacilityHourException,
  normalizeFacilityStatusAdvisory,
  normalizeFacilityWeeklyHour,
} from "../data/facilityContracts.js"
import {
  addCampusDays,
  CAMPUS_TIME_ZONE,
  campusDateTimeToIso,
  getCampusDateKey,
  getCampusDayOfWeek,
  timeToMinutes,
} from "../lib/campusTime.js"

export const FACILITY_STATUS_SOURCE_KIND = Object.freeze({
  WEEKLY_HOUR: "WEEKLY_HOUR",
  HOUR_EXCEPTION: "HOUR_EXCEPTION",
  TEMPORARY_CLOSURE: "TEMPORARY_CLOSURE",
})

const ABSOLUTE_TIMESTAMP_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/
const CLOSING_SOON_MS = 30 * 60 * 1000

const isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)

const daysInMonth = (year, month) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export const normalizeFacilityStatusTimestamp = (value) => {
  if (typeof value !== "string") return null
  const match = value.match(ABSOLUTE_TIMESTAMP_PATTERN)
  if (!match) return null

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , offset] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const second = Number(secondText)
  const offsetHour = offset === "Z" ? 0 : Number(offset.slice(1, 3))
  const offsetMinute = offset === "Z" ? 0 : Number(offset.slice(4, 6))

  if (
    year === 0
    || month < 1
    || month > 12
    || day < 1
    || day > daysInMonth(year, month)
    || hour > 23
    || minute > 59
    || second > 59
    || offsetHour > 23
    || offsetMinute > 59
  ) return null

  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

const provenanceClassification = (record) => {
  const provenance = record?.provenance || {}
  if (
    provenance.dataStatus === "ACTIVE"
    && ["VERIFIED", "SOURCE_ALIGNED"].includes(provenance.verificationStatus)
  ) return "TRUSTED"
  if (
    provenance.dataStatus === "DEMO"
    && provenance.verificationStatus === "DEMO_ONLY"
  ) return "DEMO"
  return "PENDING"
}

const parseTimestamp = (value) => {
  if (typeof value !== "string") return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

const isScheduleRecordApplicable = (record, evaluatedAtMs) => {
  const provenance = record?.provenance || {}
  if (provenance.lifecycle !== "PUBLISHED") return false
  const startsAt = parseTimestamp(provenance.effectiveAt ?? provenance.publishedAt)
  const expiresAt = provenance.expiresAt === null ? Number.POSITIVE_INFINITY : parseTimestamp(provenance.expiresAt)
  return startsAt !== null && expiresAt !== null && startsAt <= evaluatedAtMs && evaluatedAtMs < expiresAt
}

const normalizeSourceRecord = (sourceKind, record) => {
  if (sourceKind === FACILITY_STATUS_SOURCE_KIND.WEEKLY_HOUR) {
    return normalizeFacilityWeeklyHour(record)
  }
  if (sourceKind === FACILITY_STATUS_SOURCE_KIND.HOUR_EXCEPTION) {
    return normalizeFacilityHourException(record)
  }
  return normalizeFacilityStatusAdvisory(record)
}

const controllingRecord = (sourceKind, record) => ({
  sourceKind,
  record: normalizeSourceRecord(sourceKind, record),
})

const uniqueControllingRecords = (records) => {
  const seen = new Set()
  return records.filter((entry) => {
    const key = JSON.stringify(entry)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const createInterval = (dateKey, record, sourceKind) => {
  const startMinutes = timeToMinutes(record.startTime)
  const endMinutes = timeToMinutes(record.endTime)
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return null
  const endDateKey = endMinutes <= startMinutes ? addCampusDays(dateKey, 1) : dateKey
  return {
    startMs: Date.parse(campusDateTimeToIso(dateKey, record.startTime)),
    endMs: Date.parse(campusDateTimeToIso(endDateKey, record.endTime)),
    records: [controllingRecord(sourceKind, record)],
    demo: provenanceClassification(record) === "DEMO",
  }
}

const mergeIntervals = (intervals) => {
  const sorted = intervals
    .filter(Boolean)
    .toSorted((left, right) => left.startMs - right.startMs || left.endMs - right.endMs)
  const merged = []

  for (const interval of sorted) {
    const current = merged.at(-1)
    if (!current || interval.startMs > current.endMs) {
      merged.push({
        ...interval,
        records: [...interval.records],
      })
      continue
    }
    current.endMs = Math.max(current.endMs, interval.endMs)
    current.records = uniqueControllingRecords([...current.records, ...interval.records])
    current.demo ||= interval.demo
  }
  return merged
}

const scheduleForDate = ({ dateKey, evaluatedAtMs, weeklyHours, exceptions }) => {
  // An applicable dated exception owns its start date completely; weekly rows
  // are considered only when that date has no applicable exception records.
  const applicableExceptions = exceptions.filter((record) => (
    record?.exceptionDate === dateKey && isScheduleRecordApplicable(record, evaluatedAtMs)
  ))
  const sourceKind = applicableExceptions.length
    ? FACILITY_STATUS_SOURCE_KIND.HOUR_EXCEPTION
    : FACILITY_STATUS_SOURCE_KIND.WEEKLY_HOUR
  const records = applicableExceptions.length
    ? applicableExceptions
    : weeklyHours.filter((record) => (
      record?.dayOfWeek === getCampusDayOfWeek(new Date(`${dateKey}T12:00:00+08:00`))
      && isScheduleRecordApplicable(record, evaluatedAtMs)
    ))

  const acceptedRecords = []
  const pendingRecords = []
  const acceptedIntervals = []
  const pendingIntervals = []

  for (const record of records) {
    const classification = provenanceClassification(record)
    const targetRecords = classification === "PENDING" ? pendingRecords : acceptedRecords
    targetRecords.push(controllingRecord(sourceKind, record))
    if (record.closedAllDay) continue
    const interval = createInterval(dateKey, record, sourceKind)
    if (!interval) continue
    const targetIntervals = classification === "PENDING" ? pendingIntervals : acceptedIntervals
    targetIntervals.push(interval)
  }

  return {
    acceptedIntervals,
    acceptedRecords: uniqueControllingRecords(acceptedRecords),
    hasExceptionSet: applicableExceptions.length > 0,
    pendingIntervals,
    pendingRecords: uniqueControllingRecords(pendingRecords),
  }
}

const result = ({ status, evaluatedAt, nextTransitionAt = null, controllingRecords = [], demo = false }) => ({
  status,
  evaluatedAt,
  timezone: CAMPUS_TIME_ZONE,
  nextTransitionAt,
  controllingRecords: uniqueControllingRecords(controllingRecords),
  demo,
})

const openIntervalResult = ({ interval, evaluatedAt, evaluatedAtMs }) => {
  const remainingMs = interval.endMs - evaluatedAtMs
  return result({
    status: remainingMs > 0 && remainingMs <= CLOSING_SOON_MS
      ? FACILITY_OPERATIONAL_STATUS.CLOSING_SOON
      : FACILITY_OPERATIONAL_STATUS.OPEN_NOW,
    evaluatedAt,
    nextTransitionAt: new Date(interval.endMs).toISOString(),
    controllingRecords: interval.records,
    demo: interval.demo,
  })
}

const closureIntervals = (statusAdvisories) => statusAdvisories
  .filter((record) => record?.advisoryType === "TEMPORARY_CLOSURE")
  .map((record) => {
    const provenance = record.provenance || {}
    if (provenance.lifecycle !== "PUBLISHED") return null
    const startMs = parseTimestamp(provenance.effectiveAt ?? provenance.publishedAt)
    const endMs = provenance.expiresAt === null ? Number.POSITIVE_INFINITY : parseTimestamp(provenance.expiresAt)
    if (startMs === null || endMs === null || endMs <= startMs) return null
    return {
      startMs,
      endMs,
      records: [controllingRecord(FACILITY_STATUS_SOURCE_KIND.TEMPORARY_CLOSURE, record)],
      demo: provenanceClassification(record) === "DEMO",
      pending: provenanceClassification(record) === "PENDING",
    }
  })
  .filter(Boolean)

export const evaluateFacilityStatus = ({
  evaluatedAt,
  weeklyHours = [],
  exceptions = [],
  statusAdvisories = [],
} = {}) => {
  const normalizedEvaluatedAt = normalizeFacilityStatusTimestamp(evaluatedAt)
  if (!normalizedEvaluatedAt) {
    throw new TypeError("evaluatedAt must be an absolute RFC3339 timestamp with Z or a numeric offset.")
  }
  if (!Array.isArray(weeklyHours) || !Array.isArray(exceptions) || !Array.isArray(statusAdvisories)) {
    throw new TypeError("Facility status source collections must be arrays.")
  }

  const evaluatedAtMs = Date.parse(normalizedEvaluatedAt)
  const closures = closureIntervals(statusAdvisories)
  const activePendingClosures = closures.filter((entry) => (
    entry.pending && entry.startMs <= evaluatedAtMs && evaluatedAtMs < entry.endMs
  ))
  if (activePendingClosures.length) {
    return result({
      status: FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION,
      evaluatedAt: normalizedEvaluatedAt,
      controllingRecords: activePendingClosures.flatMap((entry) => entry.records),
    })
  }

  const acceptedClosure = mergeIntervals(closures.filter((entry) => !entry.pending))
    .find((entry) => entry.startMs <= evaluatedAtMs && evaluatedAtMs < entry.endMs)
  if (acceptedClosure) {
    return result({
      status: FACILITY_OPERATIONAL_STATUS.TEMPORARILY_UNAVAILABLE,
      evaluatedAt: normalizedEvaluatedAt,
      nextTransitionAt: Number.isFinite(acceptedClosure.endMs)
        ? new Date(acceptedClosure.endMs).toISOString()
        : null,
      controllingRecords: acceptedClosure.records,
      demo: acceptedClosure.demo,
    })
  }

  const campusDate = getCampusDateKey(new Date(normalizedEvaluatedAt))
  const previousDate = addCampusDays(campusDate, -1)
  // Previous-date ownership is retained so an overnight tail survives a
  // current-date replacement exception until the tail's own closing boundary.
  const previousSchedule = scheduleForDate({
    dateKey: previousDate,
    evaluatedAtMs,
    weeklyHours,
    exceptions,
  })
  const currentSchedule = scheduleForDate({
    dateKey: campusDate,
    evaluatedAtMs,
    weeklyHours,
    exceptions,
  })

  const previousAcceptedInterval = mergeIntervals(previousSchedule.acceptedIntervals)
    .find((entry) => entry.startMs <= evaluatedAtMs && evaluatedAtMs < entry.endMs)
  const previousActivePendingIntervals = previousSchedule.pendingIntervals.filter((entry) => (
    entry.startMs <= evaluatedAtMs && evaluatedAtMs < entry.endMs
  ))
  if (
    previousActivePendingIntervals.length
    || (previousSchedule.hasExceptionSet && previousSchedule.pendingRecords.length && previousAcceptedInterval)
  ) {
    return result({
      status: FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION,
      evaluatedAt: normalizedEvaluatedAt,
      controllingRecords: previousSchedule.pendingRecords,
    })
  }

  // A current-date exception cannot cancel a trusted overnight tail owned by
  // the previous start date, even when the current replacement set is pending.
  if (previousAcceptedInterval && currentSchedule.hasExceptionSet && currentSchedule.pendingRecords.length) {
    return openIntervalResult({
      interval: previousAcceptedInterval,
      evaluatedAt: normalizedEvaluatedAt,
      evaluatedAtMs,
    })
  }

  // Any pending record makes the current date's replacement exception set
  // conservative as a whole; a trusted sibling interval must not bypass it.
  if (currentSchedule.hasExceptionSet && currentSchedule.pendingRecords.length) {
    return result({
      status: FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION,
      evaluatedAt: normalizedEvaluatedAt,
      controllingRecords: currentSchedule.pendingRecords,
    })
  }

  const activePendingIntervals = [
    ...previousSchedule.pendingIntervals,
    ...currentSchedule.pendingIntervals,
  ].filter((entry) => entry.startMs <= evaluatedAtMs && evaluatedAtMs < entry.endMs)
  if (activePendingIntervals.length) {
    return result({
      status: FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION,
      evaluatedAt: normalizedEvaluatedAt,
      controllingRecords: activePendingIntervals.flatMap((entry) => entry.records),
    })
  }

  const activeOpenInterval = mergeIntervals([
    ...previousSchedule.acceptedIntervals,
    ...currentSchedule.acceptedIntervals,
  ]).find((entry) => entry.startMs <= evaluatedAtMs && evaluatedAtMs < entry.endMs)
  if (activeOpenInterval) {
    return openIntervalResult({
      interval: activeOpenInterval,
      evaluatedAt: normalizedEvaluatedAt,
      evaluatedAtMs,
    })
  }

  if (currentSchedule.pendingRecords.length) {
    return result({
      status: FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION,
      evaluatedAt: normalizedEvaluatedAt,
      controllingRecords: currentSchedule.pendingRecords,
    })
  }

  const nextOpening = mergeIntervals(currentSchedule.acceptedIntervals)
    .find((entry) => entry.startMs > evaluatedAtMs)
  if (nextOpening) {
    return result({
      status: FACILITY_OPERATIONAL_STATUS.SCHEDULED_TO_OPEN,
      evaluatedAt: normalizedEvaluatedAt,
      nextTransitionAt: new Date(nextOpening.startMs).toISOString(),
      controllingRecords: nextOpening.records,
      demo: nextOpening.demo,
    })
  }

  if (currentSchedule.acceptedRecords.length) {
    return result({
      status: FACILITY_OPERATIONAL_STATUS.CLOSED,
      evaluatedAt: normalizedEvaluatedAt,
      controllingRecords: currentSchedule.acceptedRecords,
      demo: currentSchedule.acceptedRecords.some(({ record }) => record.provenance.demo),
    })
  }

  return result({
    status: FACILITY_OPERATIONAL_STATUS.UNKNOWN,
    evaluatedAt: normalizedEvaluatedAt,
  })
}
