import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Acceso Admin | Bouquet",
  description: "Inicia sesión en la consola BouquetOps.",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <AdminLoginForm initialFrom={params.from} initialError={params.error} />;
}
