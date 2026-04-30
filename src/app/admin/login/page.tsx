import { redirect } from "next/navigation";

export const metadata = {
  title: "Redirigiendo... | Bouquet",
};

export default function AdminLoginRedirectPage() {
  redirect("/login");
}
