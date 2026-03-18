import Link from "next/link";

const cols = {
  Producto:  ["Sala en vivo", "Flujo de órdenes", "Pagos", "Reportes"],
  Empresa:   ["Nosotros", "Blog", "Casos de éxito", "Prensa"],
  Legal:     ["Privacidad", "Términos de uso", "Cookies"],
};

export const Footer = () => (
  <footer className="border-t border-wire bg-ink">
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr]">
        {/* Brand */}
        <div className="flex flex-col gap-4 lg:max-w-[200px]">
          <Link href="/" className="font-serif text-[1.5rem] font-semibold italic tracking-tight text-light/80 transition-opacity hover:opacity-60">
            bouquet
          </Link>
          <p className="text-[0.8rem] font-medium leading-[1.75] text-dim">
            Hospitality OS para restaurantes que no aceptan el desorden.
          </p>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-wire">
            México · 2025
          </p>
        </div>

        {/* Links */}
        {Object.entries(cols).map(([group, items]) => (
          <div key={group}>
            <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-dim">
              {group}
            </p>
            <ul className="space-y-2.5">
              {items.map(item => (
                <li key={item}>
                  <Link href="#" className="text-[0.82rem] font-medium text-dim/70 transition-colors hover:text-light">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-wire pt-8 sm:flex-row sm:items-center">
        <p className="text-[0.7rem] font-medium text-dim/50">
          © 2025 Bouquet Operations S.A. de C.V. Todos los derechos reservados.
        </p>
        <p className="text-[0.7rem] font-medium text-dim/40">
          Hecho con cuidado en México
        </p>
      </div>
    </div>
  </footer>
);
