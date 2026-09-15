import { VERIFICATION_STATUS } from "./mapStandards.js"

export const EMERGENCY_EQUIPMENT_TYPES = {
  FIRE_EXTINGUISHER: "FIRE_EXTINGUISHER",
  FIRE_ALARM: "FIRE_ALARM",
}

const equipment = (id, floorId, type, x, y, page) => ({
  id,
  floorId,
  type,
  x,
  y,
  verificationStatus: VERIFICATION_STATUS.SOURCE_ALIGNED,
  coordinateStatus: VERIFICATION_STATUS.ESTIMATED,
  source: { title: "Emergency Evacuation", page },
})

export const emergencyEquipment = [
  equipment("extinguisher-gf-west-upper", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 230, 215, 1),
  equipment("extinguisher-gf-west-middle", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 230, 285, 1),
  equipment("extinguisher-gf-west-landing", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 230, 520, 1),
  equipment("extinguisher-gf-faculty", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 550, 610, 1),
  equipment("extinguisher-gf-east-lower", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 770, 610, 1),
  equipment("extinguisher-gf-driveway", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 850, 560, 1),
  equipment("alarm-gf-dining", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_ALARM, 470, 170, 1),
  equipment("alarm-gf-food-stalls", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_ALARM, 540, 200, 1),
  equipment("alarm-gf-theater", "GF", EMERGENCY_EQUIPMENT_TYPES.FIRE_ALARM, 240, 610, 1),

  equipment("extinguisher-3f-room-54", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 181, 118, 3),
  equipment("extinguisher-3f-room-53", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 332, 135, 3),
  equipment("extinguisher-3f-room-52", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 181, 213, 3),
  equipment("extinguisher-3f-room-51", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 332, 230, 3),
  equipment("extinguisher-3f-room-50", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 181, 307, 3),
  equipment("extinguisher-3f-room-49", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 332, 385, 3),
  equipment("extinguisher-3f-room-48", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 181, 430, 3),
  equipment("extinguisher-3f-library-west", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 580, 620, 3),
  equipment("extinguisher-3f-library-east", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 850, 620, 3),
  equipment("extinguisher-3f-virtual-lab", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 184, 715, 3),
  equipment("extinguisher-3f-room-43", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER, 330, 715, 3),
  equipment("alarm-3f-north", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_ALARM, 215, 40, 3),
  equipment("alarm-3f-southwest", "3F", EMERGENCY_EQUIPMENT_TYPES.FIRE_ALARM, 309, 660, 3),
]

export const getEmergencyEquipmentByFloor = (floorId) =>
  emergencyEquipment.filter((item) => item.floorId === floorId)

