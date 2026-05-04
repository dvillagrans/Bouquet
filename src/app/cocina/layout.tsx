import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

export default async function CocinaLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const allowed = [
    "PLATFORM_ADMIN",
    "CHAIN_ADMIN",
    "ZONE_MANAGER",
    "RESTAURANT_ADMIN",
    "ADMIN",
    "COCINA",
  ];
  if (!user.roles.some((r) => allowed.includes(r))) {
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}
