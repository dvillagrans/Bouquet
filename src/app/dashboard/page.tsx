import { redirect } from "next/navigation";

export default function DashboardIndex() {
  // Por ahora redirigimos directamente a mesas, que es el módulo que estamos trabajando
  redirect("/dashboard/mesas");
}
