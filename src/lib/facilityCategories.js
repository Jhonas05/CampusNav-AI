import { BookOpen, Building2, Construction, DoorClosed, DoorOpen, FlaskConical, HeartPulse, Landmark, ShieldCheck, SquareParking, UtensilsCrossed, Users, Wrench } from "lucide-react"

/**
 * Presentation-only facility category system.
 * Maps existing verified facility `kind` values (plus the known student-service
 * office ids) to a category label and icon. Application chrome (chips, tiles,
 * dots) is monochrome under DEC-UI-003 and distinguishes categories by icon
 * and label; `map` holds the map-canvas wayfinding tints used only inside the
 * 2D/3D viewport and its legend. No facility data is modified.
 */

const CATEGORIES = {
  classroom: {
    key: "classroom",
    label: "Classrooms",
    icon: DoorOpen,
    map: { fill: "#DBEAFE", stroke: "#93C5FD", strong: "#2563EB" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  academic: {
    key: "academic",
    label: "Academic Spaces",
    icon: BookOpen,
    map: { fill: "#E0E7FF", stroke: "#A5B4FC", strong: "#4F46E5" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  laboratory: {
    key: "laboratory",
    label: "Laboratories",
    icon: FlaskConical,
    map: { fill: "#EDE9FE", stroke: "#C4B5FD", strong: "#7C3AED" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  administrative: {
    key: "administrative",
    label: "Administrative Offices",
    icon: Landmark,
    map: { fill: "#FEF3C7", stroke: "#FCD34D", strong: "#B45309" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  studentServices: {
    key: "studentServices",
    label: "Student Services",
    icon: Users,
    map: { fill: "#CCFBF1", stroke: "#5EEAD4", strong: "#0F766E" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  health: {
    key: "health",
    label: "Health Services",
    icon: HeartPulse,
    map: { fill: "#FFE4E6", stroke: "#FDA4AF", strong: "#BE123C" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  food: {
    key: "food",
    label: "Food Areas",
    icon: UtensilsCrossed,
    map: { fill: "#FFEDD5", stroke: "#FDBA74", strong: "#C2410C" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  restroom: {
    key: "restroom",
    label: "Restrooms",
    icon: DoorClosed,
    map: { fill: "#CFFAFE", stroke: "#67E8F9", strong: "#0E7490" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  utility: {
    key: "utility",
    label: "Utility & Support",
    icon: Wrench,
    map: { fill: "#F4F4F5", stroke: "#D4D4D8", strong: "#52525B" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  access: {
    key: "access",
    label: "Entrances & Parking",
    icon: SquareParking,
    map: { fill: "#F1F5F9", stroke: "#CBD5E1", strong: "#475569" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  safety: {
    key: "safety",
    label: "Safety & Security",
    icon: ShieldCheck,
    map: { fill: "#FEE2E2", stroke: "#FCA5A5", strong: "#B91C1C" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  general: {
    key: "general",
    label: "Campus Facilities",
    icon: Building2,
    map: { fill: "#F3F4F6", stroke: "#D1D5DB", strong: "#4B5563" },
    chip: "border-line-strong bg-fill text-ink",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
  construction: {
    key: "construction",
    label: "Under Construction",
    icon: Construction,
    map: { fill: "#F5F5F7", stroke: "#9CA3AF", strong: "#6B7280" },
    chip: "border-dashed border-ink-faint bg-surface text-ink-soft",
    tile: "bg-fill-strong text-ink",
    dot: "bg-ink-faint",
  },
}

const STUDENT_SERVICE_IDS = new Set(["guidance-office", "osas", "rotc-office"])

const KIND_TO_CATEGORY = {
  Room: "classroom",
  Academic: "academic",
  Laboratory: "laboratory",
  Office: "administrative",
  Clinic: "health",
  Dining: "food",
  Restroom: "restroom",
  Utility: "utility",
  Parking: "access",
  Entrance: "access",
  Safety: "safety",
  Facility: "general",
  Construction: "construction",
}

export const getFacilityCategory = (facility) => {
  if (!facility) return CATEGORIES.general
  if (STUDENT_SERVICE_IDS.has(facility.id)) return CATEGORIES.studentServices
  return CATEGORIES[KIND_TO_CATEGORY[facility.kind]] || CATEGORIES.general
}

export const getCategoryByKey = (key) => CATEGORIES[key] || CATEGORIES.general

export const listMapCategories = (facilityList) => {
  const seen = new Map()
  facilityList.forEach((facility) => {
    const category = getFacilityCategory(facility)
    if (!seen.has(category.key)) seen.set(category.key, category)
  })
  return [...seen.values()]
}

/**
 * Wayfinding semantics shared by the 2D and 3D maps and their legends
 * (CampusNav Ink, DEC-UI-002). Conventions: ink = you are here ·
 * CampusNav green = route and destination (the destination is also a pin
 * shape, so it never relies on color alone) · emergency red = approved
 * evacuation path and fire equipment, Emergency Mode only · safety green =
 * EXIT signage.
 */
export const MAP_COLORS = {
  route: "#15703C",
  routeOutline: "#0B4224",
  routeCasing: "#FFFFFF",
  routeUpcoming: "#8BC9A4",
  routeComplete: "#0B4224",
  emergencyRoute: "#B3261E",
  emergencyRouteComplete: "#7A1A14",
  emergencyRouteUpcoming: "#E3A39E",
  current: "#1D1F20",
  destination: "#15703C",
  destinationTint: "#DCEEE2",
  arrivedFill: "#15703C",
  selected: "#15703C",
  stairs: "#5D5D60",
  exit: "#15803D",
  equipment: "#B3261E",
  paper: "#FBFBFA",
  hallway: "#EDEDEB",
  hallwayLine: "#C9C9CB",
  wall: "#8A8A8D",
  label: "#1D1F20",
  labelMuted: "#7A7A7D",
}
