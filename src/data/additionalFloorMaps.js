import { ALIGNMENT_STATUS, DISTANCE_STATUS, VERIFICATION_STATUS } from "./mapStandards.js"

const rectangle = (x, y, width, height) => [
  { x, y },
  { x: x + width, y },
  { x: x + width, y: y + height },
  { x, y: y + height },
]

const pointForSide = ([x, y, width, height], side, offset = 0.5) => {
  if (side === "N") return { x: x + width * offset, y }
  if (side === "S") return { x: x + width * offset, y: y + height }
  if (side === "W") return { x, y: y + height * offset }
  return { x: x + width, y: y + height * offset }
}

const doorSegment = (point, side) => side === "N" || side === "S"
  ? { from: { x: point.x - 12, y: point.y }, to: { x: point.x + 12, y: point.y } }
  : { from: { x: point.x, y: point.y - 12 }, to: { x: point.x, y: point.y + 12 } }

const sourceRoom = ({
  id = null,
  nodeKey = null,
  floorId,
  facilityId,
  name,
  bounds,
  side = "E",
  offset = 0.5,
  hallwayPoint = null,
  corridorId = null,
  navigable = true,
  status = "ACTIVE",
}) => {
  const entrancePoint = pointForSide(bounds, side, offset)
  const resolvedNodeKey = nodeKey || facilityId
  const entranceNodeId = `entrance-${floorId.toLowerCase()}-${resolvedNodeKey}`
  return {
    id: id || `room-${floorId.toLowerCase()}-${facilityId}`,
    floorId,
    facilityId,
    name,
    polygon: rectangle(...bounds),
    labelPoint: { x: bounds[0] + bounds[2] / 2, y: bounds[1] + bounds[3] / 2 },
    entranceNodeId: navigable ? entranceNodeId : null,
    entranceNodeIds: navigable ? [entranceNodeId] : [],
    entranceSegments: navigable ? [doorSegment(entrancePoint, side)] : [],
    entrancePoint: navigable ? entrancePoint : null,
    hallwayPoint,
    hallwayNodeId: navigable ? `hall-${floorId.toLowerCase()}-${resolvedNodeKey}` : null,
    corridorId,
    navigable,
    status,
    alignmentStatus: ALIGNMENT_STATUS.SOURCE_ALIGNED,
    verificationStatus: VERIFICATION_STATUS.ESTIMATED,
  }
}

const hallway = (id, bounds, labelPoint) => ({
  id,
  label: "Hallway",
  polygon: rectangle(...bounds),
  labelPoint,
  alignmentStatus: ALIGNMENT_STATUS.SOURCE_ALIGNED,
  verificationStatus: VERIFICATION_STATUS.ESTIMATED,
})

const stairway = ({ id, nodeId, bounds, labelPoint, corridorId = null }) => ({
  id,
  nodeId,
  label: "Stairs",
  polygon: rectangle(...bounds),
  labelPoint,
  corridorId,
  alignmentStatus: ALIGNMENT_STATUS.SOURCE_ALIGNED,
  verificationStatus: VERIFICATION_STATUS.SOURCE_ALIGNED,
})

const intersection = (id, x, y, corridorIds) => ({ id, x, y, corridorIds, type: "INTERSECTION" })

const makeMap = ({ floorId, page, imageUrl, hallways, stairways, rooms, corridorAxes, intersections, emergencyExits = [], validationRoutes = [], additionalPendingItems = [] }) => ({
  width: 1000,
  height: 850,
  geometryNotice: `Relative layout is aligned with the official ${floorId} emergency plan. Dimensions, exact door offsets, and walking distances remain estimated pending physical calibration.`,
  sourceReference: {
    title: `St. Clare College Emergency Evacuation - ${floorId} Level`,
    sourceFile: "Emergency Evacuation.pdf",
    page,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
  },
  referenceOverlay: {
    imageUrl,
    opacity: 0.48,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
  },
  distanceCalibration: {
    status: DISTANCE_STATUS.SCHEMATIC,
    schematicMapUnitsPerDisplayUnit: 10,
    mapUnitsPerMeter: null,
  },
  hallways,
  stairways,
  emergencyExits,
  rooms,
  navigation: { corridorAxes, intersections },
  pendingItems: [
    { id: `${floorId}-physical-distance-scale`, label: "Measured map-unit-to-meter scale" },
    { id: `${floorId}-door-survey`, label: "Physical survey of exact door and corridor dimensions" },
    { id: `${floorId}-accessibility`, label: "Accessibility information pending verification" },
    ...additionalPendingItems,
  ],
  validationRoutes,
})

const gf = (facilityId, name, bounds, side, hallwayPoint, corridorId, options = {}) => sourceRoom({ floorId: "GF", facilityId, name, bounds, side, hallwayPoint, corridorId, ...options })
const second = (facilityId, name, bounds, side, hallwayPoint, corridorId, options = {}) => sourceRoom({ floorId: "2F", facilityId, name, bounds, side, hallwayPoint, corridorId, ...options })
const fourth = (facilityId, name, bounds, side, hallwayPoint, corridorId, options = {}) => sourceRoom({ floorId: "4F", facilityId, name, bounds, side, hallwayPoint, corridorId, ...options })
const fifth = (facilityId, name, bounds, side, hallwayPoint, corridorId, options = {}) => sourceRoom({ floorId: "5F", facilityId, name, bounds, side, hallwayPoint, corridorId, ...options })

const groundFloorRooms = [
  gf("stock-room", "Stock Room", [0, 0, 180, 55], "E", { x: 230, y: 28 }, "gf-west"),
  gf("cr-men-gf", "C.R. Men", [0, 55, 180, 55], "E", { x: 230, y: 82 }, "gf-west"),
  gf("cr-women-gf", "C.R. Women", [0, 110, 180, 55], "E", { x: 230, y: 138 }, "gf-west"),
  gf("room-14", "Room 14", [0, 165, 180, 70], "E", { x: 230, y: 200 }, "gf-west"),
  gf("room-13", "Room 13", [0, 235, 180, 70], "E", { x: 230, y: 270 }, "gf-west"),
  gf("room-12", "Room 12", [0, 305, 180, 65], "E", { x: 230, y: 338 }, "gf-west"),
  gf("basic-education-clinic", "Basic Education Clinic", [0, 370, 180, 70], "E", { x: 230, y: 405 }, "gf-west"),
  gf("canteen", "Canteen", [280, 0, 220, 140], "S", { x: 390, y: 170 }, "gf-dining-cross"),
  gf("dining-hall", "Dining Hall", [280, 200, 160, 150], "N", { x: 360, y: 170 }, "gf-dining-cross"),
  gf("food-stalls", "Food Stalls", [440, 200, 60, 150], "N", { x: 470, y: 170 }, "gf-dining-cross"),
  gf("electrical-control-room", "Electrical Control Room", [280, 350, 220, 120], "E", { x: 540, y: 410 }, "gf-central"),
  gf("pe-room", "P.E. Room", [580, 0, 135, 140], "S", { x: 648, y: 170 }, "gf-upper-east"),
  gf("nstp-room", "NSTP Room", [715, 0, 135, 140], "S", { x: 783, y: 170 }, "gf-upper-east"),
  gf("rotc-office", "ROTC Office", [850, 0, 150, 140], "S", { x: 925, y: 170 }, "gf-upper-east"),
  gf("covered-gym", "Covered Gym", [580, 200, 420, 200], "N", { x: 790, y: 170 }, "gf-upper-east"),
  gf("designated-parking-area", "Designated Parking Area", [580, 400, 220, 160], "S", { x: 690, y: 610 }, "gf-lower"),
  gf("guidance-office", "Guidance Office", [280, 470, 110, 90], "S", { x: 335, y: 610 }, "gf-lower"),
  gf("room-5", "Room 5", [390, 470, 110, 90], "S", { x: 445, y: 610 }, "gf-lower"),
  gf("room-3", "Room 3", [580, 470, 110, 90], "S", { x: 635, y: 610 }, "gf-lower"),
  gf("room-1", "Room 1", [690, 470, 110, 90], "S", { x: 745, y: 610 }, "gf-lower"),
  gf("theater", "Theater", [0, 660, 180, 100], "N", { x: 90, y: 610 }, "gf-lower"),
  gf("cleaning-stock-room", "Cleaning & Stock Room", [180, 660, 60, 100], "N", { x: 210, y: 610 }, "gf-lower"),
  gf("cr-men-gf", "C.R. Men", [240, 660, 70, 100], "N", { x: 275, y: 610 }, "gf-lower", { id: "room-gf-cr-men-lower", nodeKey: "cr-men-lower" }),
  gf("cr-women-gf", "C.R. Women", [310, 660, 70, 100], "N", { x: 345, y: 610 }, "gf-lower", { id: "room-gf-cr-women-lower", nodeKey: "cr-women-lower" }),
  gf("bookstore", "Bookstore", [380, 660, 120, 100], "N", { x: 440, y: 610 }, "gf-lower"),
  gf("faculty-lounge", "Faculty Lounge", [500, 660, 100, 100], "N", { x: 550, y: 610 }, "gf-lower"),
  gf("health-dental-clinic", "Health and Dental Clinic", [600, 660, 80, 100], "N", { x: 640, y: 610 }, "gf-lower"),
  gf("osas", "OSAS", [680, 660, 120, 100], "N", { x: 740, y: 610 }, "gf-lower"),
  gf("driveway-entrance", "Driveway Entrance", [900, 400, 100, 260], "W", { x: 850, y: 530 }, "gf-entrance"),
  gf("waiting-area", "Waiting Area", [900, 660, 100, 100], "W", { x: 850, y: 710 }, "gf-entrance"),
  gf("main-entrance", "Main Entrance", [800, 760, 80, 90], "N", { x: 840, y: 710 }, "gf-entrance"),
  gf("guard-station", "Guard Station", [920, 760, 80, 90], "W", { x: 900, y: 805 }, "gf-guard"),
  gf("maintenance-barracks", "Maintenance Barracks", [280, 760, 420, 90], "E", null, null, { navigable: false, status: "PENDING_VERIFICATION" }),
]

const groundFloorMap = makeMap({
  floorId: "GF",
  page: 1,
  imageUrl: "/maps/ground-floor-reference.png",
  hallways: [
    hallway("gf-west-hall", [180, 0, 100, 660], { x: 230, y: 320 }),
    hallway("gf-central-hall", [500, 0, 80, 660], { x: 540, y: 320 }),
    hallway("gf-dining-cross-hall", [280, 140, 300, 60], { x: 430, y: 174 }),
    hallway("gf-upper-east-hall", [500, 140, 500, 60], { x: 760, y: 174 }),
    hallway("gf-lower-hall", [0, 560, 900, 100], { x: 450, y: 615 }),
    hallway("gf-entrance-hall", [800, 560, 100, 290], { x: 850, y: 700 }),
    hallway("gf-guard-hall", [880, 760, 40, 90], { x: 900, y: 810 }),
  ],
  stairways: [
    stairway({ id: "stairs-gf-west-middle-area", nodeId: "stairs-gf-west-middle", bounds: [0, 440, 180, 100], labelPoint: { x: 90, y: 490 }, corridorId: "gf-west" }),
    stairway({ id: "stairs-gf-southwest-area", nodeId: "stairs-gf-southwest", bounds: [180, 760, 60, 90], labelPoint: { x: 210, y: 805 } }),
    stairway({ id: "stairs-gf-east-area", nodeId: "stairs-gf-east", bounds: [800, 470, 100, 90], labelPoint: { x: 850, y: 515 }, corridorId: "gf-lower" }),
    stairway({ id: "stairs-gf-main-entrance-area", nodeId: "stairs-gf-main-entrance", bounds: [800, 660, 100, 100], labelPoint: { x: 850, y: 710 } }),
  ],
  rooms: groundFloorRooms,
  corridorAxes: { "gf-west": "y", "gf-central": "y", "gf-dining-cross": "x", "gf-upper-east": "x", "gf-lower": "x", "gf-entrance": "y", "gf-guard": "y" },
  intersections: [
    intersection("intersection-gf-west-lower", 230, 610, ["gf-west", "gf-lower"]),
    intersection("intersection-gf-central-upper", 540, 170, ["gf-central", "gf-dining-cross", "gf-upper-east"]),
    intersection("intersection-gf-central-lower", 540, 610, ["gf-central", "gf-lower"]),
    intersection("intersection-gf-lower-entrance", 850, 610, ["gf-lower", "gf-entrance"]),
    intersection("intersection-gf-entrance-guard", 890, 760, ["gf-entrance", "gf-guard"]),
  ],
  emergencyExits: [
    { id: "exit-gf-west", label: "Emergency exit", point: { x: 180, y: 30 }, verificationStatus: VERIFICATION_STATUS.ESTIMATED },
    { id: "exit-gf-driveway", label: "Emergency exit", point: { x: 900, y: 530 }, verificationStatus: VERIFICATION_STATUS.ESTIMATED },
    { id: "exit-gf-main", label: "Emergency exit", point: { x: 850, y: 750 }, verificationStatus: VERIFICATION_STATUS.ESTIMATED },
  ],
  validationRoutes: [
    { id: "gf-guidance-main", startFacilityId: "guidance-office", destinationFacilityId: "main-entrance" },
  ],
  additionalPendingItems: [{ id: "GF-maintenance-access", label: "Maintenance Barracks usable entrance" }],
})

const secondFloorRooms = [
  second("room-36", "Room 36", [0, 70, 180, 80], "E", { x: 250, y: 110 }, "2f-vertical"),
  second("room-34", "Room 34", [0, 150, 180, 80], "E", { x: 250, y: 190 }, "2f-vertical"),
  second("room-32", "Room 32", [0, 230, 180, 80], "E", { x: 250, y: 270 }, "2f-vertical"),
  second("room-30", "Room 30", [0, 310, 180, 80], "E", { x: 250, y: 350 }, "2f-vertical"),
  second("board-room", "Board Room", [0, 500, 180, 80], "E", { x: 250, y: 540 }, "2f-vertical"),
  second("room-35", "Room 35", [320, 0, 180, 105], "W", { x: 250, y: 52 }, "2f-vertical"),
  second("room-33", "Room 33", [320, 105, 180, 105], "W", { x: 250, y: 158 }, "2f-vertical"),
  second("room-31", "Room 31", [320, 210, 180, 105], "W", { x: 250, y: 262 }, "2f-vertical"),
  second("president-office", "Office of the President", [320, 315, 180, 115], "W", { x: 250, y: 372 }, "2f-vertical"),
  second("principal-office", "Principal's Office", [320, 430, 140, 90], "S", { x: 390, y: 570 }, "2f-horizontal"),
  second("accounting-office", "Accounting Office", [460, 430, 180, 90], "S", { x: 550, y: 570 }, "2f-horizontal"),
  second("vp-academic-affairs", "Office of the VP for Academic Affairs", [640, 430, 100, 90], "S", { x: 690, y: 570 }, "2f-horizontal"),
  second("vp-finance", "Office of the VP for Finance", [740, 430, 100, 90], "S", { x: 790, y: 570 }, "2f-horizontal"),
  second("legal-counsel-board-secretary", "Legal Counsel and Board Secretary's Office", [840, 430, 90, 90], "S", { x: 885, y: 570 }, "2f-horizontal"),
  second("chairman-office", "Chairman's Office", [0, 650, 180, 200], "N", { x: 90, y: 615 }, "2f-horizontal"),
  second("lecture-room", "Lecture Room", [250, 650, 250, 200], "N", { x: 375, y: 570 }, "2f-horizontal"),
  second("culinary-office", "Culinary Office", [500, 650, 120, 200], "N", { x: 560, y: 570 }, "2f-horizontal"),
  second("culinary-laboratory", "Culinary Laboratory", [620, 650, 160, 200], "N", { x: 700, y: 570 }, "2f-horizontal"),
  second("kitchen-area", "Kitchen Area", [780, 650, 150, 200], "N", { x: 855, y: 570 }, "2f-horizontal"),
]

const secondFloorMap = makeMap({
  floorId: "2F",
  page: 2,
  imageUrl: "/maps/second-floor-reference.png",
  hallways: [
    hallway("2f-vertical-hall", [180, 0, 140, 580], { x: 250, y: 280 }),
    hallway("2f-horizontal-hall", [180, 520, 820, 130], { x: 590, y: 580 }),
    hallway("2f-west-foyer", [0, 580, 180, 70], { x: 90, y: 615 }),
    hallway("2f-south-stair-link", [180, 580, 70, 120], { x: 215, y: 630 }),
  ],
  stairways: [
    stairway({ id: "stairs-2f-northwest-area", nodeId: "stairs-2f-northwest", bounds: [0, 0, 180, 70], labelPoint: { x: 90, y: 35 }, corridorId: "2f-vertical" }),
    stairway({ id: "stairs-2f-west-middle-area", nodeId: "stairs-2f-west-middle", bounds: [0, 390, 180, 110], labelPoint: { x: 90, y: 445 }, corridorId: "2f-vertical" }),
    stairway({ id: "stairs-2f-southwest-area", nodeId: "stairs-2f-southwest", bounds: [180, 650, 70, 200], labelPoint: { x: 215, y: 750 } }),
    stairway({ id: "stairs-2f-east-area", nodeId: "stairs-2f-east", bounds: [930, 430, 70, 220], labelPoint: { x: 965, y: 540 }, corridorId: "2f-horizontal" }),
    stairway({ id: "stairs-2f-southeast-area", nodeId: "stairs-2f-southeast", bounds: [780, 800, 150, 50], labelPoint: { x: 855, y: 825 } }),
  ],
  rooms: secondFloorRooms,
  corridorAxes: { "2f-vertical": "y", "2f-horizontal": "x" },
  intersections: [intersection("intersection-2f-main", 250, 570, ["2f-vertical", "2f-horizontal"])],
  emergencyExits: [],
  validationRoutes: [{ id: "2f-room30-culinary", startFacilityId: "room-30", destinationFacilityId: "culinary-laboratory" }],
})

const fourthFloorRooms = [
  fourth("room-74", "Room 74", [0, 70, 180, 90], "E", { x: 250, y: 115 }, "4f-vertical"),
  fourth("room-72", "Room 72", [0, 160, 180, 90], "E", { x: 250, y: 205 }, "4f-vertical"),
  fourth("room-70", "Room 70", [0, 250, 180, 90], "E", { x: 250, y: 295 }, "4f-vertical"),
  fourth("room-68", "Room 68", [0, 340, 180, 90], "E", { x: 250, y: 385 }, "4f-vertical"),
  fourth("laundry-area", "Laundry Area", [320, 0, 180, 100], "W", { x: 250, y: 50 }, "4f-vertical"),
  fourth("kitchen-laboratory", "Kitchen Laboratory", [320, 100, 180, 250], "W", { x: 250, y: 225 }, "4f-vertical"),
  fourth("saints-cafe", "Saint's Café", [320, 350, 180, 170], "W", { x: 250, y: 435 }, "4f-vertical"),
  fourth("suite-room", "Suite Room", [0, 520, 180, 70], "E", { x: 250, y: 555 }, "4f-vertical"),
  fourth("hotel-lobby", "Hotel Lobby", [0, 590, 180, 90], "E", { x: 250, y: 635 }, "4f-vertical"),
  fourth("saints-travel-tour", "Saint's Travel and Tour", [320, 520, 130, 120], "S", { x: 385, y: 695 }, "4f-horizontal"),
  fourth("room-61", "Room 61", [450, 520, 120, 120], "S", { x: 510, y: 695 }, "4f-horizontal"),
  fourth("room-59", "Room 59", [570, 520, 120, 120], "S", { x: 630, y: 695 }, "4f-horizontal"),
  fourth("room-57", "Room 57", [690, 520, 120, 120], "S", { x: 750, y: 695 }, "4f-horizontal"),
  fourth("room-55", "Room 55", [810, 520, 120, 120], "S", { x: 870, y: 695 }, "4f-horizontal"),
  fourth("twin-bed-room", "Twin-Bed Room", [0, 740, 90, 110], "N", { x: 45, y: 695 }, "4f-horizontal"),
  fourth("single-bed-room", "Single-Bed Room", [90, 740, 90, 110], "N", { x: 135, y: 695 }, "4f-horizontal"),
  fourth("room-64", "Room 64", [180, 740, 180, 110], "N", { x: 270, y: 695 }, "4f-horizontal"),
  fourth("room-62", "Room 62", [360, 740, 150, 110], "N", { x: 435, y: 695 }, "4f-horizontal"),
  fourth("room-60", "Room 60", [510, 740, 150, 110], "N", { x: 585, y: 695 }, "4f-horizontal"),
  fourth("room-58", "Room 58", [660, 740, 150, 110], "N", { x: 735, y: 695 }, "4f-horizontal"),
  fourth("room-56", "Room 56", [810, 740, 120, 110], "N", { x: 870, y: 695 }, "4f-horizontal"),
]

const fourthFloorMap = makeMap({
  floorId: "4F",
  page: 4,
  imageUrl: "/maps/fourth-floor-reference.png",
  hallways: [
    hallway("4f-vertical-hall", [180, 0, 140, 740], { x: 250, y: 350 }),
    hallway("4f-horizontal-hall", [0, 640, 1000, 100], { x: 520, y: 700 }),
  ],
  stairways: [
    stairway({ id: "stairs-4f-northwest-area", nodeId: "stairs-4f-northwest", bounds: [0, 0, 180, 70], labelPoint: { x: 90, y: 35 }, corridorId: "4f-vertical" }),
    stairway({ id: "stairs-4f-west-middle-area", nodeId: "stairs-4f-west-middle", bounds: [0, 430, 180, 90], labelPoint: { x: 90, y: 475 }, corridorId: "4f-vertical" }),
    stairway({ id: "stairs-4f-east-area", nodeId: "stairs-4f-east", bounds: [930, 520, 70, 120], labelPoint: { x: 965, y: 580 }, corridorId: "4f-horizontal" }),
    stairway({ id: "stairs-4f-southeast-area", nodeId: "stairs-4f-southeast", bounds: [930, 740, 70, 110], labelPoint: { x: 965, y: 795 } }),
  ],
  rooms: fourthFloorRooms,
  corridorAxes: { "4f-vertical": "y", "4f-horizontal": "x" },
  intersections: [intersection("intersection-4f-main", 250, 695, ["4f-vertical", "4f-horizontal"])],
  emergencyExits: [],
  validationRoutes: [{ id: "4f-room74-room56", startFacilityId: "room-74", destinationFacilityId: "room-56" }],
})

const constructionRoom = (id, bounds) => sourceRoom({
  id,
  floorId: "5F",
  facilityId: "areas-under-construction",
  name: "Area Under Construction",
  bounds,
  navigable: false,
  status: "UNDER_CONSTRUCTION",
})

const fifthFloorRooms = [
  constructionRoom("construction-upper-west", [0, 0, 180, 150]),
  constructionRoom("construction-mid-west-a", [0, 150, 180, 140]),
  constructionRoom("construction-mid-west-b", [0, 290, 180, 140]),
  constructionRoom("construction-lower-west", [0, 520, 180, 330]),
  fifth("registrar-office", "Registrar's Office", [320, 50, 180, 470], "W", { x: 250, y: 285 }, "5f-vertical"),
  fifth("professional-room-6", "Professional Room 6", [320, 520, 170, 120], "S", { x: 405, y: 690 }, "5f-horizontal"),
  fifth("professional-room-4", "Professional Room 4", [490, 520, 170, 120], "S", { x: 575, y: 690 }, "5f-horizontal"),
  fifth("professional-room-2", "Professional Room 2", [660, 520, 170, 120], "S", { x: 745, y: 690 }, "5f-horizontal"),
  fifth("professional-room-7", "Professional Room 7", [180, 740, 180, 110], "N", { x: 270, y: 690 }, "5f-horizontal"),
  fifth("professional-room-5", "Professional Room 5", [360, 740, 160, 110], "N", { x: 440, y: 690 }, "5f-horizontal"),
  fifth("professional-room-3", "Professional Room 3", [520, 740, 160, 110], "N", { x: 600, y: 690 }, "5f-horizontal"),
  fifth("professional-room-1", "Professional Room 1", [680, 740, 150, 110], "N", { x: 755, y: 690 }, "5f-horizontal"),
]

const fifthFloorMap = makeMap({
  floorId: "5F",
  page: 5,
  imageUrl: "/maps/fifth-floor-reference.png",
  hallways: [
    hallway("5f-vertical-hall", [180, 0, 140, 640], { x: 250, y: 300 }),
    hallway("5f-horizontal-hall", [180, 640, 820, 100], { x: 600, y: 695 }),
  ],
  stairways: [
    stairway({ id: "stairs-5f-west-middle-area", nodeId: "stairs-5f-west-middle", bounds: [0, 430, 180, 90], labelPoint: { x: 90, y: 475 }, corridorId: "5f-vertical" }),
    stairway({ id: "stairs-5f-east-area", nodeId: "stairs-5f-east", bounds: [830, 520, 170, 120], labelPoint: { x: 915, y: 580 }, corridorId: "5f-horizontal" }),
  ],
  rooms: fifthFloorRooms,
  corridorAxes: { "5f-vertical": "y", "5f-horizontal": "x" },
  intersections: [intersection("intersection-5f-main", 250, 690, ["5f-vertical", "5f-horizontal"])],
  emergencyExits: [],
  validationRoutes: [{ id: "5f-registrar-prof1", startFacilityId: "registrar-office", destinationFacilityId: "professional-room-1" }],
})

export const additionalFloorMaps = {
  GF: groundFloorMap,
  "2F": secondFloorMap,
  "4F": fourthFloorMap,
  "5F": fifthFloorMap,
}
