export const CAMPUS_TIME_ZONE = "Asia/Manila"

const campusDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CAMPUS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const campusClockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: CAMPUS_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

const campusWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  weekday: "short",
})

const weekdayNumbers = Object.freeze({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 })

const getPart = (parts, type) => parts.find((part) => part.type === type)?.value || ""

export const getCampusDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  const parts = campusDateFormatter.formatToParts(date)
  return `${getPart(parts, "year")}-${getPart(parts, "month")}-${getPart(parts, "day")}`
}

export const getCampusDayOfWeek = (value = new Date()) => weekdayNumbers[campusWeekdayFormatter.format(value instanceof Date ? value : new Date(value))]

export const getCampusClockParts = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  const parts = campusClockFormatter.formatToParts(date)
  return {
    hour: Number(getPart(parts, "hour")),
    minute: Number(getPart(parts, "minute")),
    second: Number(getPart(parts, "second")),
  }
}

export const getCampusMinutesOfDay = (value = new Date()) => {
  const { hour, minute, second } = getCampusClockParts(value)
  return hour * 60 + minute + second / 60
}

export const timeToMinutes = (time) => {
  const match = String(time || "").match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/)
  if (!match) return Number.NaN
  const hour = Number(match[1])
  const minute = Number(match[2])
  const second = Number(match[3] || 0)
  if (hour > 23 || minute > 59 || second > 59) return Number.NaN
  return hour * 60 + minute + second / 60
}

export const normalizeCampusTime = (time) => {
  const minutes = timeToMinutes(time)
  if (!Number.isFinite(minutes)) throw new Error(`Invalid campus time: ${time}`)
  const wholeMinutes = Math.floor(minutes)
  const hour = String(Math.floor(wholeMinutes / 60)).padStart(2, "0")
  const minute = String(wholeMinutes % 60).padStart(2, "0")
  const second = String(Math.round((minutes - wholeMinutes) * 60)).padStart(2, "0")
  return `${hour}:${minute}:${second}`
}

export const formatCampusDate = (value = new Date()) => new Intl.DateTimeFormat("en-PH", {
  timeZone: CAMPUS_TIME_ZONE,
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(value instanceof Date ? value : new Date(value))

export const formatCampusTime = (value = new Date()) => new Intl.DateTimeFormat("en-PH", {
  timeZone: CAMPUS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}).format(value instanceof Date ? value : new Date(value))

export const formatCampusShortTime = (value) => {
  if (!value) return "Pending verification"
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: CAMPUS_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value instanceof Date ? value : new Date(value))
}

export const formatCampusDateTime = (value) => {
  if (!value) return "Not specified"
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: CAMPUS_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value instanceof Date ? value : new Date(value))
}

export const addCampusDays = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00+08:00`)
  date.setUTCDate(date.getUTCDate() + days)
  return getCampusDateKey(date)
}

export const campusDateTimeToIso = (dateKey, time) => new Date(`${dateKey}T${normalizeCampusTime(time)}+08:00`).toISOString()

export const isCampusDateInRange = (dateKey, startDate, endDate = null) => (
  (!startDate || dateKey >= startDate) && (!endDate || dateKey <= endDate)
)

export const getCampusDateKeysInRange = (startDate, endDate, maxDays = 370) => {
  if (!startDate || !endDate || endDate < startDate) return []
  const dates = []
  let cursor = startDate
  while (cursor <= endDate && dates.length < maxDays) {
    dates.push(cursor)
    cursor = addCampusDays(cursor, 1)
  }
  return dates
}

export const getCampusInterval = (dateKey, startTime, endTime) => ({
  startAt: campusDateTimeToIso(dateKey, startTime),
  endAt: campusDateTimeToIso(dateKey, endTime),
})

export const isCurrentlyEffective = (record, now = new Date()) => {
  const timestamp = now instanceof Date ? now.getTime() : new Date(now).getTime()
  const effectiveAt = record.effectiveAt ? new Date(record.effectiveAt).getTime() : Number.NEGATIVE_INFINITY
  const expiresAt = record.expiresAt ? new Date(record.expiresAt).getTime() : Number.POSITIVE_INFINITY
  return effectiveAt <= timestamp && timestamp < expiresAt
}
