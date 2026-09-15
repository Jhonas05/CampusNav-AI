import { VERIFICATION_STATUS } from "./mapStandards.js"

const documentSource = {
  title: "Emergency Evacuation",
  file: "Emergency Evacuation.pdf",
  pages: "1-5",
}

export const EMERGENCY_DISCLAIMER = "CampusNav Emergency Mode supplements, but does not replace, official evacuation signage and instructions from emergency personnel."

export const NO_VERIFIED_ROUTE_MESSAGE = "No verified digital evacuation route is available from this location. Follow the posted evacuation signage and instructions from authorized emergency personnel."

export const emergencyGuidance = [
  "Stay calm.",
  "Use the nearest safe exit.",
  "Do not run or return for belongings.",
  "Proceed to the designated assembly area when verified.",
  "Follow instructions from emergency personnel.",
  "Wait until the area is declared safe.",
]

const pendingContact = (id, label, numbers) => ({
  id,
  label,
  numbers,
  source: documentSource,
  verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION,
  lastVerified: null,
})

export const emergencyContacts = [
  pendingContact("national-emergency", "General National Emergency", ["911"]),
  pendingContact("caloocan-police-substation-5", "Caloocan City Police Sub-Station 5 (Camarin / Zapote Rd., Brgy. 177)", ["+63 (2) 962-0451", "+63 (2) 939-8430"]),
  pendingContact("caloocan-central-fire", "Caloocan City Central Fire Station", ["(02) 324-6527"]),
  pendingContact("bfp-caloocan-alternate", "Bureau of Fire Protection - Caloocan (mobile/alternate)", ["0917-117-7873"]),
]

