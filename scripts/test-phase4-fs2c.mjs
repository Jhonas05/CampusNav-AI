import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { spawnSync } from "node:child_process"

import {
  FACILITY_OPERATIONAL_STATUS,
} from "../src/data/facilityContracts.js"
import { facilities } from "../src/data/facilities.js"
import { mapEdges } from "../src/data/mapEdges.js"
import { mapNodes } from "../src/data/mapNodes.js"
import { emergencyApprovedEdges } from "../src/data/emergencyRoutes.js"
import { getEligibleEmergencyEdges } from "../src/lib/emergencyNavigation.js"
import { getFacilityHours } from "../src/services/facilityService.js"
import {
  evaluateFacilityStatus,
  FACILITY_STATUS_SOURCE_KIND,
  normalizeFacilityStatusTimestamp,
} from "../src/services/facilityStatusEvaluator.js"

const originalFacilities = structuredClone(facilities)
const originalNodes = structuredClone(mapNodes)
const originalEdges = structuredClone(mapEdges)
const originalEmergencyEdges = structuredClone(emergencyApprovedEdges)
const originalEligibleEmergencyEdgeIds = getEligibleEmergencyEdges().map(({ id }) => id)

const provenance = ({
  verificationStatus = "VERIFIED",
  dataStatus = "ACTIVE",
  lifecycle = "PUBLISHED",
  publishedAt = "2026-01-01T00:00:00.000Z",
  effectiveAt = null,
  expiresAt = null,
  sourceType = "DEVELOPMENT_TEST",
  sourceId = "FS-2C1-SOURCE",
  sourceLabel = "DEMO / DEVELOPMENT / NOT OFFICIAL",
  lastVerifiedAt = "2026-01-01T00:00:00.000Z",
  updatedAt = "2026-01-01T00:00:00.000Z",
} = {}) => ({
  lifecycle,
  publishedAt,
  effectiveAt,
  expiresAt,
  verificationStatus,
  dataStatus,
  sourceType,
  sourceId,
  sourceLabel,
  lastVerifiedAt,
  updatedAt,
  demo: dataStatus === "DEMO" || verificationStatus === "DEMO_ONLY",
})

const weeklyHour = (dayOfWeek, startTime, endTime, options = {}) => ({
  facilityId: "library",
  dayOfWeek,
  closedAllDay: options.closedAllDay === true,
  startTime: options.closedAllDay ? null : startTime,
  endTime: options.closedAllDay ? null : endTime,
  provenance: provenance({ sourceId: options.sourceId || `W-${dayOfWeek}-${startTime || "CLOSED"}`, ...options.provenance }),
})

const exception = (exceptionDate, startTime, endTime, options = {}) => ({
  facilityId: "library",
  exceptionDate,
  closedAllDay: options.closedAllDay === true,
  startTime: options.closedAllDay ? null : startTime,
  endTime: options.closedAllDay ? null : endTime,
  provenance: provenance({ sourceId: options.sourceId || `E-${exceptionDate}-${startTime || "CLOSED"}`, ...options.provenance }),
})

const advisory = (effectiveAt, expiresAt, options = {}) => ({
  facilityId: "library",
  advisoryType: options.advisoryType || "TEMPORARY_CLOSURE",
  provenance: provenance({
    sourceId: options.sourceId || `A-${effectiveAt}`,
    effectiveAt,
    expiresAt,
    ...options.provenance,
  }),
})

const evaluate = (evaluatedAt, sources = {}) => evaluateFacilityStatus({
  evaluatedAt,
  weeklyHours: sources.weeklyHours || [],
  exceptions: sources.exceptions || [],
  statusAdvisories: sources.statusAdvisories || [],
})

const atManila = (date, time) => `${date}T${time}+08:00`
let assertionCount = 0
const check = async (description, test) => {
  await test()
  assertionCount += 1
  console.log(`ok ${assertionCount} - ${description}`)
}

await check("inside verified interval returns OPEN_NOW", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
  assert.equal(value.nextTransitionAt, "2026-10-05T09:00:00.000Z")
})

await check("opening boundary is inclusive", () => {
  assert.equal(evaluate(atManila("2026-10-05", "08:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  }).status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
})

await check("exactly 30 minutes remaining returns CLOSING_SOON", () => {
  assert.equal(evaluate(atManila("2026-10-05", "16:30:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  }).status, FACILITY_OPERATIONAL_STATUS.CLOSING_SOON)
})

await check("less than 30 minutes remaining returns CLOSING_SOON", () => {
  assert.equal(evaluate(atManila("2026-10-05", "16:45:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  }).status, FACILITY_OPERATIONAL_STATUS.CLOSING_SOON)
})

await check("closing boundary is exclusive", () => {
  assert.equal(evaluate(atManila("2026-10-05", "17:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  }).status, FACILITY_OPERATIONAL_STATUS.CLOSED)
})

await check("before first interval returns SCHEDULED_TO_OPEN", () => {
  const value = evaluate(atManila("2026-10-05", "07:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.SCHEDULED_TO_OPEN)
  assert.equal(value.nextTransitionAt, "2026-10-05T00:00:00.000Z")
})

await check("gap between split intervals returns SCHEDULED_TO_OPEN", () => {
  const value = evaluate(atManila("2026-10-05", "12:30:00"), {
    weeklyHours: [
      weeklyHour(1, "08:00:00", "12:00:00", { sourceId: "MORNING" }),
      weeklyHour(1, "13:00:00", "17:00:00", { sourceId: "AFTERNOON" }),
    ],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.SCHEDULED_TO_OPEN)
  assert.equal(value.nextTransitionAt, "2026-10-05T05:00:00.000Z")
})

await check("after final interval returns CLOSED", () => {
  assert.equal(evaluate(atManila("2026-10-05", "18:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  }).status, FACILITY_OPERATIONAL_STATUS.CLOSED)
})

await check("trusted closed-all-day marker returns CLOSED", () => {
  assert.equal(evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, null, null, { closedAllDay: true })],
  }).status, FACILITY_OPERATIONAL_STATUS.CLOSED)
})

await check("absent weekday returns UNKNOWN", () => {
  assert.equal(evaluate(atManila("2026-10-06", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  }).status, FACILITY_OPERATIONAL_STATUS.UNKNOWN)
})

await check("overnight interval is open before midnight", () => {
  assert.equal(evaluate(atManila("2026-10-06", "23:00:00"), {
    weeklyHours: [weeklyHour(2, "22:00:00", "02:00:00")],
  }).status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
})

await check("overnight interval remains open in its after-midnight tail", () => {
  const value = evaluate(atManila("2026-10-07", "01:40:00"), {
    weeklyHours: [weeklyHour(2, "22:00:00", "02:00:00")],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.CLOSING_SOON)
  assert.equal(value.nextTransitionAt, "2026-10-06T18:00:00.000Z")
})

await check("previous-date exception owns its overnight tail", () => {
  const value = evaluate(atManila("2026-10-07", "01:00:00"), {
    weeklyHours: [weeklyHour(2, "08:00:00", "17:00:00")],
    exceptions: [exception("2026-10-06", "22:00:00", "02:00:00", { sourceId: "PREVIOUS-EXCEPTION" })],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
  assert.equal(value.controllingRecords[0].sourceKind, FACILITY_STATUS_SOURCE_KIND.HOUR_EXCEPTION)
})

await check("replacement exception replaces the weekly schedule", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
    exceptions: [exception("2026-10-05", "10:00:00", "12:00:00")],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.SCHEDULED_TO_OPEN)
  assert.equal(value.nextTransitionAt, "2026-10-05T02:00:00.000Z")
})

await check("closed-all-day exception replaces weekly hours", () => {
  assert.equal(evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
    exceptions: [exception("2026-10-05", null, null, { closedAllDay: true })],
  }).status, FACILITY_OPERATIONAL_STATUS.CLOSED)
})

await check("multiple exception intervals retain same-day scheduled opening", () => {
  const value = evaluate(atManila("2026-10-05", "11:30:00"), {
    exceptions: [
      exception("2026-10-05", "09:00:00", "11:00:00", { sourceId: "E-AM" }),
      exception("2026-10-05", "13:00:00", "15:00:00", { sourceId: "E-PM" }),
    ],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.SCHEDULED_TO_OPEN)
  assert.equal(value.nextTransitionAt, "2026-10-05T05:00:00.000Z")
})

await check("expired exceptions fall back to weekly hours", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
    exceptions: [exception("2026-10-05", null, null, {
      closedAllDay: true,
      provenance: { expiresAt: "2026-10-01T00:00:00.000Z" },
    })],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
  assert.equal(value.controllingRecords[0].sourceKind, FACILITY_STATUS_SOURCE_KIND.WEEKLY_HOUR)
})

await check("active temporary closure has highest precedence", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
    statusAdvisories: [advisory("2026-10-05T00:00:00.000Z", "2026-10-05T02:00:00.000Z")],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.TEMPORARILY_UNAVAILABLE)
})

await check("SERVICE_INTERRUPTION never closes a facility", () => {
  assert.equal(evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
    statusAdvisories: [advisory("2026-10-05T00:00:00.000Z", "2026-10-05T02:00:00.000Z", {
      advisoryType: "SERVICE_INTERRUPTION",
    })],
  }).status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
})

await check("pending weekly source returns PENDING_VERIFICATION", () => {
  assert.equal(evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00", {
      provenance: { verificationStatus: "PENDING_VERIFICATION", dataStatus: "PENDING_VERIFICATION" },
    })],
  }).status, FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION)
})

await check("pending replacement exception controls instead of weekly hours", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
    exceptions: [exception("2026-10-05", "10:00:00", "12:00:00", {
      provenance: { verificationStatus: "PENDING_VERIFICATION", dataStatus: "PENDING_VERIFICATION" },
    })],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION)
  assert.equal(value.controllingRecords[0].sourceKind, FACILITY_STATUS_SOURCE_KIND.HOUR_EXCEPTION)
})

await check("demo weekly data may compute status and remains demo-labeled", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00", {
      provenance: { verificationStatus: "DEMO_ONLY", dataStatus: "DEMO" },
    })],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
  assert.equal(value.demo, true)
})

await check("demo exception may compute status and remains demo-labeled", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    exceptions: [exception("2026-10-05", "08:00:00", "17:00:00", {
      provenance: { verificationStatus: "DEMO_ONLY", dataStatus: "DEMO" },
    })],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
  assert.equal(value.demo, true)
})

await check("no applicable source data returns UNKNOWN", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"))
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.UNKNOWN)
  assert.equal(value.nextTransitionAt, null)
  assert.deepEqual(value.controllingRecords, [])
})

await check("strict absolute timestamps normalize to UTC ISO", () => {
  assert.equal(normalizeFacilityStatusTimestamp("2026-10-01T00:30:00Z"), "2026-10-01T00:30:00.000Z")
  assert.equal(normalizeFacilityStatusTimestamp("2026-10-01T08:30:00+08:00"), "2026-10-01T00:30:00.000Z")
})

await check("date-only timestamps are rejected", () => {
  assert.equal(normalizeFacilityStatusTimestamp("2026-10-01"), null)
})

await check("offsetless timestamps are rejected", () => {
  assert.equal(normalizeFacilityStatusTimestamp("2026-10-01T08:30:00"), null)
})

await check("Date objects and numbers are rejected", () => {
  assert.equal(normalizeFacilityStatusTimestamp(new Date("2026-10-01T00:30:00Z")), null)
  assert.equal(normalizeFacilityStatusTimestamp(1790814600000), null)
  assert.equal(normalizeFacilityStatusTimestamp(null), null)
})

await check("malformed and invalid Gregorian timestamps are rejected", () => {
  assert.equal(normalizeFacilityStatusTimestamp("2026-02-29T08:30:00+08:00"), null)
  assert.equal(normalizeFacilityStatusTimestamp("2026-10-01T08:30:00+24:00"), null)
  assert.equal(normalizeFacilityStatusTimestamp(" 2026-10-01T00:30:00Z"), null)
  assert.throws(() => evaluateFacilityStatus({ evaluatedAt: "invalid" }), TypeError)
})

await check("Manila date is derived correctly near UTC midnight", () => {
  assert.equal(evaluate("2026-10-04T16:30:00Z", {
    weeklyHours: [weeklyHour(1, "00:00:00", "02:00:00")],
  }).status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
})

await check("evaluation is independent of machine timezone", () => {
  const childSource = `
    import { evaluateFacilityStatus } from "./src/services/facilityStatusEvaluator.js";
    const provenance = { lifecycle: "PUBLISHED", publishedAt: "2026-01-01T00:00:00.000Z", effectiveAt: null, expiresAt: null, verificationStatus: "VERIFIED", dataStatus: "ACTIVE", sourceType: "DEVELOPMENT_TEST", sourceId: "TZ", sourceLabel: null, lastVerifiedAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", demo: false };
    const value = evaluateFacilityStatus({ evaluatedAt: "2026-10-04T16:30:00Z", weeklyHours: [{ facilityId: "library", dayOfWeek: 1, closedAllDay: false, startTime: "00:00:00", endTime: "02:00:00", provenance }], exceptions: [], statusAdvisories: [] });
    process.stdout.write(JSON.stringify(value));
  `
  const outputs = ["UTC", "America/New_York"].map((TZ) => spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", childSource],
    { cwd: process.cwd(), env: { ...process.env, TZ }, encoding: "utf8" },
  ))
  assert.ok(outputs.every(({ status }) => status === 0))
  assert.equal(outputs[0].stdout, outputs[1].stdout)
})

await check("overlapping intervals are unioned into continuous coverage", () => {
  const value = evaluate(atManila("2026-10-05", "13:40:00"), {
    weeklyHours: [
      weeklyHour(1, "08:00:00", "12:00:00", { sourceId: "OVERLAP-A" }),
      weeklyHour(1, "11:00:00", "14:00:00", { sourceId: "OVERLAP-B" }),
    ],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.CLOSING_SOON)
  assert.equal(value.nextTransitionAt, "2026-10-05T06:00:00.000Z")
})

await check("touching intervals are unioned into continuous coverage", () => {
  const value = evaluate(atManila("2026-10-05", "11:45:00"), {
    weeklyHours: [
      weeklyHour(1, "08:00:00", "12:00:00", { sourceId: "TOUCH-A" }),
      weeklyHour(1, "12:00:00", "17:00:00", { sourceId: "TOUCH-B" }),
    ],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
  assert.equal(value.nextTransitionAt, "2026-10-05T09:00:00.000Z")
  assert.equal(value.controllingRecords.length, 2)
})

await check("temporary closure can control without operating hours", () => {
  assert.equal(evaluate(atManila("2026-10-05", "09:00:00"), {
    statusAdvisories: [advisory("2026-10-05T00:00:00.000Z", "2026-10-05T02:00:00.000Z")],
  }).status, FACILITY_OPERATIONAL_STATUS.TEMPORARILY_UNAVAILABLE)
})

await check("pending active closure returns PENDING_VERIFICATION", () => {
  assert.equal(evaluate(atManila("2026-10-05", "09:00:00"), {
    statusAdvisories: [advisory("2026-10-05T00:00:00.000Z", "2026-10-05T02:00:00.000Z", {
      provenance: { verificationStatus: "PENDING_VERIFICATION", dataStatus: "PENDING_VERIFICATION" },
    })],
  }).status, FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION)
})

await check("finite closure exposes the end of continuous closure coverage", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    statusAdvisories: [
      advisory("2026-10-05T00:00:00.000Z", "2026-10-05T02:00:00.000Z", { sourceId: "CLOSURE-A" }),
      advisory("2026-10-05T01:30:00.000Z", "2026-10-05T03:00:00.000Z", { sourceId: "CLOSURE-B" }),
    ],
  })
  assert.equal(value.nextTransitionAt, "2026-10-05T03:00:00.000Z")
  assert.equal(value.controllingRecords.length, 2)
})

await check("open-ended closure has null nextTransitionAt", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    statusAdvisories: [advisory("2026-10-05T00:00:00.000Z", null)],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.TEMPORARILY_UNAVAILABLE)
  assert.equal(value.nextTransitionAt, null)
})

await check("controlling records preserve independent safe provenance", () => {
  const source = weeklyHour(1, "08:00:00", "17:00:00", { sourceId: "SAFE-PROVENANCE" })
  source.id = 999
  source.createdBy = "private-actor"
  const value = evaluate(atManila("2026-10-05", "09:00:00"), { weeklyHours: [source] })
  assert.equal(value.controllingRecords[0].record.provenance.sourceId, "SAFE-PROVENANCE")
  assert.equal(Object.hasOwn(value.controllingRecords[0].record, "id"), false)
  assert.equal(Object.hasOwn(value.controllingRecords[0].record, "createdBy"), false)
  assert.equal(Object.hasOwn(value, "verificationStatus"), false)
})

await check("source records are not mutated", () => {
  const sources = {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
    exceptions: [exception("2026-10-06", "10:00:00", "12:00:00")],
    statusAdvisories: [advisory("2026-10-07T00:00:00.000Z", "2026-10-07T02:00:00.000Z")],
  }
  const before = structuredClone(sources)
  evaluate(atManila("2026-10-05", "09:00:00"), sources)
  assert.deepEqual(sources, before)
})

await check("canonical facility, spatial, and navigation datasets remain unchanged", () => {
  evaluate(atManila("2026-10-05", "18:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  })
  assert.deepEqual(facilities, originalFacilities)
  assert.deepEqual(mapNodes, originalNodes)
  assert.deepEqual(mapEdges, originalEdges)
})

await check("CLOSED does not alter the routing graph", () => {
  const value = evaluate(atManila("2026-10-05", "18:00:00"), {
    weeklyHours: [weeklyHour(1, "08:00:00", "17:00:00")],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.CLOSED)
  assert.deepEqual(mapEdges, originalEdges)
})

await check("Emergency approved-edge behavior remains unchanged", () => {
  evaluate(atManila("2026-10-05", "09:00:00"), {
    statusAdvisories: [advisory("2026-10-05T00:00:00.000Z", null)],
  })
  assert.deepEqual(emergencyApprovedEdges, originalEmergencyEdges)
  assert.deepEqual(getEligibleEmergencyEdges().map(({ id }) => id), originalEligibleEmergencyEdgeIds)
})

await check("FS-2B getFacilityHours remains unchanged", async () => {
  const value = await getFacilityHours("library")
  assert.equal(value.ok, true)
  assert.deepEqual(value.data.weeklyHours, [])
  assert.deepEqual(value.data.exceptions, [])
  assert.deepEqual(value.data.statusAdvisories, [])
  const source = await readFile(new URL("../src/services/facilityService.js", import.meta.url), "utf8")
  assert.doesNotMatch(source, /getFacilityStatus/)
})

await check("current-date exception does not cancel an active previous-date overnight tail", () => {
  const value = evaluate(atManila("2026-10-07", "01:00:00"), {
    weeklyHours: [weeklyHour(2, "22:00:00", "02:00:00")],
    exceptions: [exception("2026-10-07", null, null, { closedAllDay: true })],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
  assert.equal(value.controllingRecords[0].sourceKind, FACILITY_STATUS_SOURCE_KIND.WEEKLY_HOUR)
})

await check("demo temporary closure remains demo-labeled", () => {
  const value = evaluate(atManila("2026-10-05", "09:00:00"), {
    statusAdvisories: [advisory("2026-10-05T00:00:00.000Z", null, {
      provenance: { verificationStatus: "DEMO_ONLY", dataStatus: "DEMO" },
    })],
  })
  assert.equal(value.status, FACILITY_OPERATIONAL_STATUS.TEMPORARILY_UNAVAILABLE)
  assert.equal(value.demo, true)
})

await check("evaluator remains pure and provider-neutral by construction", async () => {
  const source = await readFile(new URL("../src/services/facilityStatusEvaluator.js", import.meta.url), "utf8")
  assert.doesNotMatch(source, /Date\.now\s*\(|new Date\s*\(\s*\)|\bfetch\s*\(|supabase|facilityProvider/i)
  assert.doesNotMatch(source, /\.\.\/lib\/(?:navigation|pathfinding|emergencyNavigation)\.js/)
  assert.doesNotMatch(source, /\.\.\/data\/(?:facilities|mapNodes|mapEdges|emergencyRoutes)\.js/)
})

assert.deepEqual(Object.values(FACILITY_OPERATIONAL_STATUS).toSorted(), [
  "CLOSED",
  "CLOSING_SOON",
  "OPEN_NOW",
  "PENDING_VERIFICATION",
  "SCHEDULED_TO_OPEN",
  "TEMPORARILY_UNAVAILABLE",
  "UNKNOWN",
])

console.log(`Phase 4-FS-2C1 pure Manila-time facility status evaluator (${assertionCount} scenarios): PASS`)
