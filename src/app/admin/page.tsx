export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl border border-amber-500/20 bg-amber-500/5 p-12 rounded-3xl">
        <h1 className="text-4xl font-bold text-amber-500 mb-4">Super Admin Console</h1>
        <p className="text-gray-400 text-lg mb-8">
          Esta ruta está apartada estrictamente para la administración maestro 
          (SaaS multi-tenant, gestión global de suscripciones y facturación de inquilinos).
        </p>
        
        <div className="text-sm bg-[#111] p-4 rounded-xl text-left border border-white/10 text-gray-300 font-mono">
          <p className="mb-2"><strong>Acceso de Dueños (Restaurantes):</strong> /dashboard</p>
          <p><strong>Acceso Root:</strong> /admin</p>
        </div>
      </div>
    </div>
  );
}
