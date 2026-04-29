import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTableBill } from "@/actions/comensal";
import { SplitBillScreen } from "@/components/guest/SplitBillScreen";
import CheckoutSuccessScreen from "@/components/guest/CheckoutSuccessScreen";
import { consumeTableJoinProofQuery } from "@/lib/consume-table-join-proof";
import { resolveGuestTableAccess } from "@/lib/guest-table-access";
import { cookies } from "next/headers";

type CuentaPageProps = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ guest?: string; pax?: string; from?: string; k?: string }>;
};

export async function generateMetadata({ params }: CuentaPageProps): Promise<Metadata> {
  const { codigo } = await params;
  return {
    title: `Cuenta · Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: "División de cuenta de la mesa",
  };
}

export default async function CuentaPage({ params, searchParams }: CuentaPageProps) {
  const { codigo } = await params;
  const sp = await searchParams;
  const tableCode = decodeURIComponent(codigo);

  consumeTableJoinProofQuery(tableCode, sp, `/mesa/${encodeURIComponent(tableCode)}/cuenta`);

  const access = await resolveGuestTableAccess(tableCode);
  if (access.status === "not_found") notFound();
  if (access.status === "need_login") {
    redirect(`/mesa/${encodeURIComponent(access.canonicalQr)}/`);
  }
  if (access.status === "session_ended") {
    const store = await cookies();
    const checkoutCookie = store.get(`bq_checkout_${access.canonicalQr}`)?.value;
    if (checkoutCookie) {
      try {
        const data = JSON.parse(checkoutCookie);
        return <CheckoutSuccessScreen guestName={data.guestName} isLastPayer={data.isLastPayer} branchName="Bouquet" />;
      } catch (e) {}
    }

    return (
      <main className="cuenta-ended-root relative flex min-h-[100dvh] w-full max-w-full items-center justify-center overflow-x-hidden bg-[#0b0a08] px-6 py-10 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 20% 0%, rgba(201,160,84,0.16), transparent 56%), radial-gradient(100% 80% at 80% 100%, rgba(77,132,96,0.14), transparent 58%), linear-gradient(180deg, #0b0a08 0%, #090806 100%)",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "140px 140px",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full blur-3xl"
          style={{
            background: "rgba(201,160,84,0.2)",
            animation: "cuenta-ended-float-a 9s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: "rgba(110,139,106,0.22)",
            animation: "cuenta-ended-float-b 10s ease-in-out infinite",
          }}
        />

        <section
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-[#3d3224] bg-[rgba(16,14,11,0.76)] px-7 py-10 text-center shadow-[0_30px_80px_-34px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:px-10 sm:py-12"
          style={{ animation: "cuenta-ended-card-enter 0.66s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 120% at 50% 0%, rgba(201,160,84,0.12), transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 45%)",
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px opacity-70"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(201,160,84,0.65) 50%, transparent 100%)",
              animation: "cuenta-ended-line-sweep 2.9s ease-in-out infinite",
            }}
          />

          <div
            className="relative mx-auto mb-7 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[#6f5738] bg-[rgba(201,160,84,0.12)] shadow-[0_0_36px_rgba(201,160,84,0.2)]"
            style={{ animation: "cuenta-ended-icon-breathe 3.8s ease-in-out infinite" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-9 w-9 text-[#d0a768]"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>

          <h1
            className="relative mx-auto max-w-lg font-serif text-[clamp(2rem,6vw,3rem)] font-medium leading-[1.04] tracking-tight text-[#f5ecde]"
            style={{ animation: "cuenta-ended-content-enter 0.52s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both" }}
          >
            Esta sesión ha terminado
          </h1>

          <p
            className="relative mx-auto mt-5 max-w-[38ch] font-sans text-[15px] leading-relaxed text-[#b3a892] sm:text-base"
            style={{ animation: "cuenta-ended-content-enter 0.52s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both" }}
          >
            Ya has completado tu pago o tu sesión fue cerrada. Esperamos verte de nuevo pronto.
          </p>

          <div className="relative mt-9" style={{ animation: "cuenta-ended-content-enter 0.52s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both" }}>
            <a
              href="/"
              className="group inline-flex min-h-11 items-center justify-center rounded-full border border-[#8a6b44] bg-[#d0a768] px-9 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#251b12] transition-transform duration-300 hover:-translate-y-px hover:bg-[#deb882] active:translate-y-0"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-1/2 -left-10 h-7 w-8 -translate-y-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-all duration-700 group-hover:left-[105%] group-hover:opacity-100"
              />
              Ir al inicio
            </a>
          </div>

          <p
            className="relative mt-10 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#7f725f]"
            style={{ animation: "cuenta-ended-content-enter 0.52s cubic-bezier(0.22, 1, 0.36, 1) 0.34s both" }}
          >
            Powered by Bouquet
          </p>
        </section>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes cuenta-ended-float-a {
                0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.46; }
                50% { transform: translate3d(28px, -18px, 0); opacity: 0.68; }
              }
              @keyframes cuenta-ended-float-b {
                0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.38; }
                50% { transform: translate3d(-20px, 16px, 0); opacity: 0.6; }
              }
              @keyframes cuenta-ended-card-enter {
                0% { opacity: 0; transform: translate3d(0, 16px, 0) scale(0.985); }
                100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
              }
              @keyframes cuenta-ended-content-enter {
                0% { opacity: 0; transform: translate3d(0, 10px, 0); }
                100% { opacity: 1; transform: translate3d(0, 0, 0); }
              }
              @keyframes cuenta-ended-line-sweep {
                0%, 100% { opacity: 0.3; transform: scaleX(0.7); }
                50% { opacity: 0.95; transform: scaleX(1); }
              }
              @keyframes cuenta-ended-icon-breathe {
                0%, 100% { transform: scale(1); box-shadow: 0 0 36px rgba(201,160,84,0.2); }
                50% { transform: scale(1.045); box-shadow: 0 0 44px rgba(201,160,84,0.3); }
              }
              @media (prefers-reduced-motion: reduce) {
                .cuenta-ended-root * {
                  animation-duration: 1ms !important;
                  animation-iteration-count: 1 !important;
                  transition-duration: 1ms !important;
                }
              }
            `,
          }}
        />
      </main>
    );
  }

  if (
    access.status === "ok" &&
    (sp.guest !== undefined || sp.pax !== undefined || sp.from !== undefined)
  ) {
    redirect(`/mesa/${encodeURIComponent(access.table.publicCode)}/cuenta`);
  }

  const { table, guestName, partySize } = access;
  const bill = await getTableBill(table.publicCode);
  const partySizeDisplay = bill.guestCount > 0 ? bill.guestCount : partySize;

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-bg-solid text-text-primary">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      <SplitBillScreen
        tableCode={table.publicCode}
        guestName={guestName}
        partySize={partySizeDisplay}
        initialBill={bill}
      />
    </div>
  );
}
