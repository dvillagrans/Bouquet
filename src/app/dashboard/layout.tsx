import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Fijo */}
      <Sidebar />
      
      {/* Contenido Principal con offset para el sidebar */}
      <main className="flex-1 ml-64 min-h-screen relative">
        {children}
      </main>
    </div>
  );
}
