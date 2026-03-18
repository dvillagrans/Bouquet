import Link from "next/link";
import type { Metadata } from "next";

type MenuPageProps = {
  params: Promise<{
    codigo: string;
  }>;
  searchParams: Promise<{
    guest?: string;
    pax?: string;
    from?: string;
  }>;
};

export default async function MesaMenuPage({ params, searchParams }: MenuPageProps) {
  const { codigo } = await params;
  const query = await searchParams;

  const guest = query.guest?.trim() || "Invitado";
  const pax = Number(query.pax || "1");

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream px-6 py-14 text-charcoal lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(183,146,93,0.12),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(168,185,165,0.12),transparent_30%)]" />

      <div className="relative mx-auto w-full max-w-5xl rounded-[2rem] border border-charcoal/10 bg-[linear-gradient(180deg,rgba(250,246,240,0.98),rgba(246,239,228,0.94))] p-7 shadow-[0_20px_60px_rgba(43,36,30,0.08)] lg:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-charcoal/55">Mesa activa</p>

        <h1 className="mt-3 font-serif text-4xl leading-tight text-charcoal-light lg:text-5xl">
          Mesa {decodeURIComponent(codigo)}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal/78">
          Hola, <span className="font-semibold text-coffee">{guest}</span>. {pax} persona{pax === 1 ? "" : "s"} en la mesa.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-lg border border-gold/25 bg-gold/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-coffee">
            Estado: conectado
          </span>
          <span className="rounded-lg border border-charcoal/10 bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/55">
            Acceso: {query.from || "directo"}
          </span>
        </div>

        <Link
          href={`/mesa/${encodeURIComponent(codigo)}`}
          className="mt-10 inline-flex min-h-11 items-center rounded-full border border-charcoal/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:border-gold hover:text-charcoal-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Volver a acceso de mesa
        </Link>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: Pick<MenuPageProps, "params">): Promise<Metadata> {
  const { codigo } = await params;

  return {
    title: `Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: "Estado de la mesa y acceso al flujo del menú de Bouquet.",
  };
}
