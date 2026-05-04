import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

export default async function ChainAuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const allowed = ["PLATFORM_ADMIN", "CHAIN_ADMIN"];
  if (!user.roles.some((r) => allowed.includes(r))) {
    redirect("/login?error=unauthorized");
  }

  // Tenant scope: CHAIN_ADMIN must administer at least one chain
  if (user.roles.includes("CHAIN_ADMIN") && user.chainIds.length === 0) {
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}
