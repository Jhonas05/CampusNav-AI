import { BookOpen, Building2, Construction, DoorClosed, DoorOpen, FlaskConical, HeartPulse, Landmark, ShieldCheck, SquareParking, UtensilsCrossed, Users, Wrench } from "lucide-react"

/**
 * Presentation-only facility category system.
 * Maps existing verified facility `kind` values (plus the known student-service
 * office ids) to a shared color language used by the 2D/3D maps, cards, chips,
 * and legends. Colors follow the Tailwind default palette plus a dedicated
 * route green; no facility data is modified.
 */

const CATEGORIES = {
  classroom: {
    key: "classroom",
    label: "Classrooms",
    icon: DoorOpen,
    map: { fill: "#DBEAFE", stroke: "#93C5FD", strong: "#2563EB" },
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    tile: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  academic: {
    key: "academic",
    label: "Academic Spaces",
    icon: BookOpen,
    map: { fill: "#E0E7FF", stroke: "#A5B4FC", strong: "#4F46E5" },
    chip: "border-indigo-200 bg-indigo-50 text-indigo-700",
    tile: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
  },
  laboratory: {
    key: "laboratory",
    label: "Laboratories",
    icon: FlaskConical,
    map: { fill: "#EDE9FE", stroke: "#C4B5FD", strong: "#7C3AED" },
    chip: "border-violet-200 bg-violet-50 text-violet-700",
    tile: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  administrative: {
    key: "administrative",
    label: "Administrative Offices",
    icon: Landmark,
    map: { fill: "#FEF3C7", stroke: "#FCD34D", strong: "#B45309" },
    chip: "border-amber-200 bg-amber-50 text-amber-800",
    tile: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  studentServices: {
    key: "studentServices",
    label: "Student Services",
    icon: Users,
    map: { fill: "#CCFBF1", stroke: "#5EEAD4", strong: "#0F766E" },
    chip: "border-teal-200 bg-teal-50 text-teal-700",
    tile: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
  },
  health: {
    key: "health",
    label: "Health Services",
    icon: HeartPulse,
    map: { fill: "#FFE4E6", stroke: "#FDA4AF", strong: "#BE123C" },
    chip: "border-rose-200 bg-rose-50 text-rose-700",
    tile: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
  food: {
    key: "food",
    label: "Food Areas",
    icon: UtensilsCrossed,
    map: { fill: "#FFEDD5", stroke: "#FDBA74", strong: "#C2410C" },
    chip: "border-orange-200 bg-orange-50 text-orange-700",
    tile: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
  },
  restroom: {
    key: "restroom",
    label: "Restrooms",
    icon: DoorClosed,
    map: { fill: "#CFFAFE", stroke: "#67E8F9", strong: "#0E7490" },
    chip: "border-cyan-200 bg-cyan-50 text-cyan-700",
    tile: "bg-cyan-100 text-cyan-700",
    dot: "bg-cyan-500",
  },
  utility: {
    key: "utility",
    label: "Utility & Support",
    icon: Wrench,
    map: { fill: "#F4F4F5", stroke: "#D4D4D8", strong: "#52525B" },
    chip: "border-zinc-200 bg-zinc-50 text-zinc-600",
    tile: "bg-zinc-100 text-zinc-600",
    dot: "bg-zinc-400",
  },
  access: {
    key: "access",
    label: "Entrances & Parking",
    icon: SquareParking,
    map: { fill: "#F1F5F9", stroke: "#CBD5E1", strong: "#475569" },
    chip: "border-slate-200 bg-slate-50 text-slate-600",
    tile: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  safety: {
    key: "safety",
    label: "Safety & Security",
    icon: ShieldCheck,
    map: { fill: "#FEE2E2", stroke: "#FCA5A5", strong: "#B91C1C" },
    chip: "border-red-200 bg-red-50 text-red-700",
    tile: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  general: {
    key: "general",
    label: "Campus Facilities",
    icon: Building2,
    map: { fill: "#F3F4F6", stroke: "#D1D5DB", strong: "#4B5563" },
    chip: "border-gray-200 bg-gray-50 text-gray-600",
    tile: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
  construction: {
    key: "construction",
    label: "Under Construction",
    icon: Construction,
    map: { fill: "#F5F5F7", stroke: "#9CA3AF", strong: "#6B7280" },
    chip: "border-dashed border-gray-300 bg-gray-50 text-gray-500",
    tile: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
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
 * Wayfinding semantics shared by the 2D and 3D maps and their legends.
 * Conventions: blue = you are here · red = destination / emergency path ·
 * route green = recommended route · safety green = EXIT signage ·
 * red = fire equipment.
 */
export const MAP_COLORS = {
  route: "#1E7A45",
  routeCasing: "#FFFFFF",
  routeUpcoming: "#8BC9A4",
  routeComplete: "#144D2E",
  emergencyRoute: "#DC2626",
  current: "#2563EB",
  destination: "#DC2626",
  arrivedFill: "#186238",
  stairs: "#6E6E73",
  exit: "#15803D",
  equipment: "#B91C1C",
}
