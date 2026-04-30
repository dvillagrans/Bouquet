import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-server";

export default async function MeseroLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.ok) {
    redirect("/login");
  }

  const allowed = [
    "PLATFORM_ADMIN",
    "CHAIN_ADMIN",
    "ZONE_MANAGER",
    "RESTAURANT_ADMIN",
    "ADMIN",
    "MESERO",
  ];
  if (!session.roles.some((r) => allowed.includes(r))) {
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}
