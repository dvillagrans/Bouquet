import StaffManager from "@/components/dashboard/StaffManager";
import { getStaffData } from "@/actions/staff";

export const metadata = {
  title: "Personal | Bouquet Dashboard",
};

export default async function DashboardStaffPage() {
  const staff = await getStaffData();

  return <StaffManager initialStaff={staff} />;
}
