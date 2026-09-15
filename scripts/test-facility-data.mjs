import assert from "node:assert/strict"
import { facilities, getFacilitiesByFloor } from "../src/data/facilities.js"
import { floors } from "../src/data/floors.js"
import { ALIGNMENT_STATUS, VERIFICATION_STATUS } from "../src/data/mapStandards.js"
import { getFacilityEntranceNodes, mapNodes } from "../src/data/mapNodes.js"

const expectedAssignments = {
  GF: ["Theater", "C.R. Men", "C.R. Women", "Faculty Lounge", "Bookstore", "Electrical Control Room", "Room 1", "Room 3", "Room 5", "Guidance Office", "Waiting Area", "Cleaning & Stock Room", "Basic Education Clinic", "Room 12", "Room 13", "Room 14", "Stock Room", "Canteen", "Dining Hall", "Food Stalls", "P.E. Room", "NSTP Room", "ROTC Office", "Covered Gym", "Designated Parking Area", "Driveway Entrance", "Maintenance Barracks", "Health and Dental Clinic", "OSAS", "Main Entrance", "Guard Station"],
  "2F": ["Room 30", "Room 31", "Room 32", "Room 33", "Room 34", "Room 35", "Room 36", "Board Room", "Chairman's Office", "Lecture Room", "Culinary Office", "Culinary Laboratory", "Principal's Office", "Accounting Office", "Office of the President", "Office of the VP for Academic Affairs", "Office of the VP for Finance", "Legal Counsel and Board Secretary's Office", "Kitchen Area"],
  "3F": ["Virtual Laboratory", "Computer Laboratory", "Library", "Education Department Office", "Office of the Assistant Vice President", "Room 43", "Room 48", "Room 49", "Room 50", "Room 51", "Room 52", "Room 53", "Room 54", "Men's CR", "Women's CR"],
  "4F": ["Room 55", "Room 56", "Room 57", "Room 58", "Room 59", "Room 60", "Room 61", "Room 62", "Room 64", "Room 68", "Room 70", "Room 72", "Room 74", "Kitchen Laboratory", "Saint's Café", "Saint's Travel and Tour", "Laundry Area", "Suite Room", "Hotel Lobby", "Twin-Bed Room", "Single-Bed Room"],
  "5F": ["Registrar's Office", "Professional Room 1", "Professional Room 2", "Professional Room 3", "Professional Room 4", "Professional Room 5", "Professional Room 6", "Professional Room 7", "Areas Under Construction"],
}

assert.deepEqual(floors.map((floor) => floor.id), Object.keys(expectedAssignments))

for (const [floorId, expectedNames] of Object.entries(expectedAssignments)) {
  assert.deepEqual(getFacilitiesByFloor(floorId).map((facility) => facility.name), expectedNames)
  const floor = floors.find((candidate) => candidate.id === floorId)
  assert.ok(floor.map, `${floorId} must have a source-aligned map`)
  assert.equal(floor.map.sourceReference.page, floors.findIndex((candidate) => candidate.id === floorId) + 1)
  assert.equal(floor.map.sourceReference.verificationStatus, VERIFICATION_STATUS.VERIFIED)
  assert.equal(floor.map.distanceCalibration.mapUnitsPerMeter, null)
}

for (const facility of facilities) {
  assert.equal(facility.roomNumber, null, `${facility.name} must not have an unverified room number`)
  assert.equal(facility.operatingHours, null, `${facility.name} must not have unverified operating hours`)
  assert.equal(facility.personnelSchedule, null, `${facility.name} must not have an unverified personnel schedule`)
  assert.equal(facility.verification.floor, VERIFICATION_STATUS.VERIFIED)
  assert.equal(facility.verification.exactLocation, VERIFICATION_STATUS.ESTIMATED)
  assert.equal(facility.accessibility, null)

  const floor = floors.find((candidate) => candidate.id === facility.floorId)
  const mappedRooms = floor.map.rooms.filter((room) => room.facilityId === facility.id)
  assert.ok(mappedRooms.length > 0, `${facility.name} must have source-aligned room geometry`)
  if (facility.navigable !== false) {
    assert.ok(getFacilityEntranceNodes(facility.id, facility.floorId).length > 0, `${facility.name} must have a connected entrance`)
  }
}

const thirdFloor = floors.find((floor) => floor.id === "3F")
assert.equal(thirdFloor.map.rooms.length, 15)
assert.equal(mapNodes.filter((node) => node.floorId === "3F").length, 43)
assert.equal(thirdFloor.map.referenceOverlay.imageUrl, "/maps/third-floor-reference.png")
assert.equal(thirdFloor.map.rooms.every((room) => room.alignmentStatus === ALIGNMENT_STATUS.CALIBRATED), true)

for (const floor of floors.filter((candidate) => candidate.id !== "3F")) {
  assert.equal(floor.map.rooms.every((room) => room.alignmentStatus === ALIGNMENT_STATUS.SOURCE_ALIGNED), true)
}

const constructionFacility = facilities.find((facility) => facility.id === "areas-under-construction")
const constructionRooms = floors.find((floor) => floor.id === "5F").map.rooms.filter((room) => room.facilityId === constructionFacility.id)
assert.equal(constructionFacility.navigable, false)
assert.equal(constructionFacility.status, "UNDER_CONSTRUCTION")
assert.equal(constructionRooms.length, 4)
assert.equal(constructionRooms.every((room) => room.navigable === false && room.status === "UNDER_CONSTRUCTION"), true)

console.log(`Verified ${facilities.length} source-supported facility assignments across GF–5F; the calibrated Third Floor remains unchanged.`)

