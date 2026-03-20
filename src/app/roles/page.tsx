import Link from "next/link";

export const metadata = {
  title: "Acceso por Rol | Bouquet",
  description: "Selecciona tu rol para acceder al sistema",
};

const roles = [
  {
    id: "mesero",
    label: "Mesero",
    description: "Gestión de mesas y órdenes",
    href: "/mesero",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    accent: "glow",
    border: "border-glow/20 hover:border-glow/50",
    bg: "hover:bg-glow/[0.06]",
    text: "text-glow",
  },
  {
    id: "cocina",
    label: "Cocina",
    description: "Display de órdenes — estación cocina",
    href: "/cocina",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 19.5l-.75-5.25H9.75L9 19.5m3-13.5v-2.25m-6 2.25A2.25 2.25 0 0 0 3.75 8.25v.75c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75v-.75A2.25 2.25 0 0 0 18 6H6Z" />
      </svg>
    ),
    accent: "ember",
    border: "border-ember/20 hover:border-ember/50",
    bg: "hover:bg-ember/[0.06]",
    text: "text-ember",
  },
  {
    id: "barra",
    label: "Barra",
    description: "Display de órdenes — estación barra",
    href: "/barra",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 0 1 .45 1.328V19.5a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75v-3.172A2.25 2.25 0 0 1 4.2 15m15.6 0H4.2" />
      </svg>
    ),
    accent: "purple",
    border: "border-purple-500/20 hover:border-purple-500/50",
    bg: "hover:bg-purple-500/[0.06]",
    text: "text-purple-400",
  },
  {
    id: "admin",
    label: "Administración",
    description: "Dashboard, menú, reportes y staff",
    href: "/dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3h7.5M3.75 3v7.5M3.75 3 12 11.25m9-8.25h-7.5M21 3v7.5M21 3 12.75 11.25M3.75 20.25h7.5m-7.5 0v-7.5m0 7.5L12 12m9 8.25h-7.5m7.5 0v-7.5M21 20.25 12.75 12" />
      </svg>
    ),
    accent: "light",
    border: "border-light/10 hover:border-light/30",
    bg: "hover:bg-light/[0.04]",
    text: "text-light",
  },
];

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-ink text-light flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="mb-14 text-center">
        <Link href="/" className="inline-block mb-8 font-serif text-2xl font-semibold italic tracking-tight text-light/80 hover:text-light transition-colors">
          bouquet
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-light">
          ¿Con qué rol ingresás?
        </h1>
        <p className="mt-2 text-sm text-dim">
          Seleccioná tu estación para acceder al panel correspondiente
        </p>
      </div>

      {/* Role cards */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <Link
            key={role.id}
            href={role.href}
            className={`group flex items-center gap-5 border ${role.border} ${role.bg} bg-ink/60 px-7 py-6 transition-all duration-200 active:scale-[0.98]`}
          >
            <span className={`shrink-0 ${role.text} transition-transform duration-200 group-hover:scale-110`}>
              {role.icon}
            </span>
            <div>
              <p className={`text-base font-semibold ${role.text}`}>{role.label}</p>
              <p className="mt-0.5 text-[0.78rem] text-dim leading-snug">{role.description}</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-auto h-4 w-4 shrink-0 text-dim opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-[0.72rem] text-dim/50">
        Acceso sin autenticación — modo desarrollo
      </p>
    </div>
  );
}
