import FacilityScheduleAdminPage from "@/pages/admin/FacilityScheduleAdminPage"
import { FACILITY_ADMIN_RESOURCES } from "@/services/facilityAdminService"

export default function FacilityHourExceptionsAdminPage() {
  return <FacilityScheduleAdminPage resource={FACILITY_ADMIN_RESOURCES.EXCEPTIONS} />
}
