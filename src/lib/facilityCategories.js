import { BookOpen, Building2, Construction, DoorClosed, DoorOpen, FlaskConical, HeartPulse, Landmark, ShieldCheck, SquareParking, UtensilsCrossed, Users, Wrench } from "lucide-react"

/**
 * Presentation-only facility category system.
 *
 * Maps existing verified facility `kind` values (plus the known student-service
 * office ids) to the shared visual language used by the 2D/3D maps, cards,
 * chips, and legends. No facility data is modified.
 *
 * CampusNav is monochrome, so a category is identified by its **icon** first.
 * The gray ladder below only separates adjacent shapes on the map surface, and
 * `construction` additionally carries a dashed border — meaning never rests on
 * a shade alone.
 */

const CATEGORIES = {
  classroom: {
    key: "classroom",
    label: "Classrooms",
    icon: DoorOpen,
    map: { fill: "#FFFFFF", stroke: "#C7C7CC", strong: "#48484A" },
    chip: "border-[#D2D2D7] bg-white text-[#48484A]",
    tile: "bg-[#F5F5F7] text-[#1D1D1F]",
    dot: "bg-[#C7C7CC]",
  },
  academic: {
    key: "academic",
    label: "Academic Spaces",
    icon: BookOpen,
    map: { fill: "#F7F7F9", stroke: "#B4B4B8", strong: "#3A3A3C" },
    chip: "border-[#C7C7CC] bg-[#FAFAFA] text-[#3A3A3C]",
    tile: "bg-[#F0F0F2] text-[#1D1D1F]",
    dot: "bg-[#B4B4B8]",
  },
  laboratory: {
    key: "laboratory",
    label: "Laboratories",
    icon: FlaskConical,
    map: { fill: "#EDEDEF", stroke: "#9A9A9F", strong: "#2C2C2E" },
    chip: "border-[#AEAEB2] bg-[#F5F5F7] text-[#2C2C2E]",
    tile: "bg-[#E3E3E6] text-[#1D1D1F]",
    dot: "bg-[#9A9A9F]",
  },
  administrative: {
    key: "administrative",
    label: "Administrative Offices",
    icon: Landmark,
    map: { fill: "#E3E3E6", stroke: "#8E8E93", strong: "#1D1D1F" },
    chip: "border-[#8E8E93] bg-[#F0F0F2] text-[#1D1D1F]",
    tile: "bg-[#D2D2D7] text-[#1D1D1F]",
    dot: "bg-[#8E8E93]",
  },
  studentServices: {
    key: "studentServices",
    label: "Student Services",
    icon: Users,
    map: { fill: "#F2F2F4", stroke: "#A4A4A9", strong: "#48484A" },
    chip: "border-[#AEAEB2] bg-[#FAFAFA] text-[#48484A]",
    tile: "bg-[#EBEBED] text-[#1D1D1F]",
    dot: "bg-[#A4A4A9]",
  },
  health: {
    key: "health",
    label: "Health Services",
    icon: HeartPulse,
    map: { fill: "#FAFAFA", stroke: "#6E6E73", strong: "#1D1D1F" },
    chip: "border-[#6E6E73] bg-white text-[#1D1D1F]",
    tile: "bg-[#E8E8EA] text-[#1D1D1F]",
    dot: "bg-[#6E6E73]",
  },
  food: {
    key: "food",
    label: "Food Areas",
    icon: UtensilsCrossed,
    map: { fill: "#F5F5F7", stroke: "#C2C2C6", strong: "#6E6E73" },
    chip: "border-[#C7C7CC] bg-[#F5F5F7] text-[#6E6E73]",
    tile: "bg-[#F0F0F2] text-[#48484A]",
    dot: "bg-[#C2C2C6]",
  },
  restroom: {
    key: "restroom",
    label: "Restrooms",
    icon: DoorClosed,
    map: { fill: "#FAFAFB", stroke: "#AEAEB2", strong: "#6E6E73" },
    chip: "border-[#AEAEB2] bg-white text-[#6E6E73]",
    tile: "bg-[#F5F5F7] text-[#48484A]",
    dot: "bg-[#AEAEB2]",
  },
  utility: {
    key: "utility",
    label: "Utility & Support",
    icon: Wrench,
    map: { fill: "#F0F0F2", stroke: "#D2D2D7", strong: "#8E8E93" },
    chip: "border-[#D2D2D7] bg-[#FAFAFA] text-[#6E6E73]",
    tile: "bg-[#F0F0F2] text-[#6E6E73]",
    dot: "bg-[#D2D2D7]",
  },
  access: {
    key: "access",
    label: "Entrances & Parking",
    icon: SquareParking,
    map: { fill: "#F5F5F7", stroke: "#D8D8DC", strong: "#8E8E93" },
    chip: "border-[#D8D8DC] bg-[#FAFAFA] text-[#6E6E73]",
    tile: "bg-[#F5F5F7] text-[#6E6E73]",
    dot: "bg-[#D8D8DC]",
  },
  safety: {
    key: "safety",
    label: "Safety & Security",
    icon: ShieldCheck,
    map: { fill: "#E6E6E9", stroke: "#1D1D1F", strong: "#000000" },
    chip: "border-2 border-[#1D1D1F] bg-white text-[#1D1D1F]",
    tile: "bg-[#1D1D1F] text-white",
    dot: "bg-[#1D1D1F]",
  },
  general: {
    key: "general",
    label: "Campus Facilities",
    icon: Building2,
    map: { fill: "#FAFAFA", stroke: "#D2D2D7", strong: "#6E6E73" },
    chip: "border-[#D2D2D7] bg-[#FAFAFA] text-[#6E6E73]",
    tile: "bg-[#F5F5F7] text-[#48484A]",
    dot: "bg-[#D2D2D7]",
  },
  construction: {
    key: "construction",
    label: "Under Construction",
    icon: Construction,
    // Hatched on the map; dashed in chips. Never identified by shade alone.
    map: { fill: "#F5F5F7", stroke: "#8E8E93", strong: "#6E6E73" },
    chip: "border-dashed border-[#AEAEB2] bg-[#FAFAFA] text-[#6E6E73]",
    tile: "bg-[#F5F5F7] text-[#8E8E93]",
    dot: "bg-[#8E8E93]",
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
 * Wayfinding marks shared by the 2D and 3D maps and their legends.
 *
 * Monochrome, so every mark is separated by form rather than hue:
 * · current location — solid dark disc with a white ring
 * · destination      — white disc with a heavy dark ring, labelled DESTINATION
 * · route            — solid dark stroke over a white casing
 * · upcoming route   — the same stroke at reduced contrast
 * · emergency path   — dark stroke rendered dashed by the emergency overlay
 * · exit / equipment — dark marks carrying their own EXIT / equipment glyphs
 */
export const MAP_COLORS = {
  route: "#1D1D1F",
  routeCasing: "#FFFFFF",
  routeUpcoming: "#AEAEB2",
  routeComplete: "#000000",
  emergencyRoute: "#000000",
  current: "#1D1D1F",
  destination: "#000000",
  arrivedFill: "#1D1D1F",
  stairs: "#6E6E73",
  exit: "#1D1D1F",
  equipment: "#48484A",
}
