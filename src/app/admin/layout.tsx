import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (!user.roles.includes("PLATFORM_ADMIN")) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
