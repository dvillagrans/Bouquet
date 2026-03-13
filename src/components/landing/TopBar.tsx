import Link from "next/link";

export const TopBar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center border-b border-charcoal/5 bg-cream/80 px-6 backdrop-blur-md transition-all">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-charcoal">
          Buquet.
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold tracking-wide text-charcoal/70 md:flex">
          <Link href="#producto" className="transition-colors hover:text-charcoal">Producto</Link>
          <Link href="#soluciones" className="transition-colors hover:text-charcoal">Soluciones</Link>
          <Link href="#demo" className="transition-colors hover:text-charcoal">Demo</Link>
          <Link href="#nosotros" className="transition-colors hover:text-charcoal">Nosotros</Link>
          <Link href="#contacto" className="transition-colors hover:text-charcoal">Contacto</Link>
        </nav>

        <div className="flex items-center">
          <button className="hidden rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal-light md:block">
            Solicitar demo
          </button>
          <button className="block border border-charcoal/10 rounded-lg p-2 text-charcoal md:hidden">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
