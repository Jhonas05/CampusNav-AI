import FacilityScheduleAdminPage from "@/pages/admin/FacilityScheduleAdminPage"
import { FACILITY_ADMIN_RESOURCES } from "@/services/facilityAdminService"

export default function FacilityHoursAdminPage() {
  return <FacilityScheduleAdminPage resource={FACILITY_ADMIN_RESOURCES.HOURS} />
}
