import FacilityOperationsAdminPage from "@/pages/admin/FacilityOperationsAdminPage"
import { FACILITY_ADMIN_RESOURCES } from "@/services/facilityAdminService"

export default function ServiceAdminPage() {
  return <FacilityOperationsAdminPage resource={FACILITY_ADMIN_RESOURCES.SERVICES} />
}
