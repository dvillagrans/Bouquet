"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type TableAccessScreenProps = {
  tableCode: string;
  isLikelyValid: boolean;
};

export function TableAccessScreen({ tableCode, isLikelyValid }: TableAccessScreenProps) {
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalizedCode = tableCode.toUpperCase();
  const canContinue = isLikelyValid && guestName.trim().length >= 2 && Number(partySize) >= 1;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const query = new URLSearchParams({
      guest: guestName.trim(),
      pax: partySize,
      from: "qr",
    });

    try {
      await router.push(`/mesa/${encodeURIComponent(tableCode)}/menu?${query.toString()}`);
    } catch {
      setSubmitError("No pudimos continuar con el acceso. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream text-charcoal">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(183,146,93,0.18),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(168,185,165,0.16),transparent_28%),radial-gradient(circle_at_50%_110%,rgba(122,92,62,0.08),transparent_36%)]" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,250,244,0.85),rgba(255,250,244,0))]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:px-10 xl:px-14">
        <div className="w-full rounded-[2rem] border border-charcoal/10 bg-[linear-gradient(180deg,rgba(250,246,240,0.98),rgba(246,239,228,0.94))] p-6 shadow-[0_20px_60px_rgba(43,36,30,0.10)] lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-coffee/80">Acceso por QR</p>
            <span className="rounded-full border border-gold/20 bg-cream px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold">
              Bouquet mesa
            </span>
          </div>

          <h1 className="mt-5 max-w-2xl font-serif text-[clamp(3rem,6vw,5.4rem)] leading-[0.92] tracking-[-0.05em] text-charcoal-light">
            Bienvenido a tu mesa virtual
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-charcoal/72 lg:text-lg">
            Acceso a tu mesa y al menú.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12 xl:gap-16">
            <section className="lg:pr-8 xl:pr-12">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-charcoal/55">Código detectado</p>

              <div className="mt-4 flex items-end gap-4">
                <p className="font-mono text-[clamp(2.2rem,4vw,3.4rem)] font-semibold tracking-[0.2em] text-coffee">
                  {normalizedCode}
                </p>
                <span className="mb-2 h-px flex-1 bg-gradient-to-r from-gold/45 via-charcoal/10 to-transparent" />
              </div>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-charcoal/68">
                Mesa detectada por QR.
              </p>

              <div className="mt-6 space-y-3 border-t border-charcoal/10 pt-5 text-sm leading-relaxed text-charcoal/78">
                <p className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-deep" aria-hidden="true" />
                  Estado del QR:{" "}
                  <span className={["font-semibold", isLikelyValid ? "text-sage-deep" : "text-ember"].join(" ")}>
                    {isLikelyValid ? "listo para ingresar" : "formato no reconocido"}
                  </span>
                </p>
                <p>Si falla, pide ayuda al personal.</p>
              </div>

              <Link
                href="/"
                className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-charcoal/70 underline decoration-charcoal/30 underline-offset-4 hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Volver al inicio
              </Link>
            </section>

            <section className="lg:border-l lg:border-charcoal/10 lg:pl-10 xl:pl-16">
              <p className="text-[0.63rem] font-semibold uppercase tracking-[0.28em] text-charcoal/55">Acceso privado</p>
              <h2 className="mt-4 font-serif text-3xl leading-[0.95] text-charcoal lg:text-[2.25rem]">Identifícate para entrar</h2>

              <p id="table-access-help" className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/72">
                Completa tus datos para entrar.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-4"
                aria-describedby="table-access-help table-access-status"
                aria-busy={isSubmitting}
              >
                <label className="block max-w-xl" htmlFor="guest-name">
                  <span className="mb-1.5 block text-sm font-medium text-charcoal/78">
                    Nombre del comensal
                  </span>
                  <input
                    id="guest-name"
                    type="text"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="Escribe tu nombre"
                    aria-describedby="guest-name-help"
                    className="w-full max-w-xl rounded-xl border border-charcoal/15 bg-ivory px-4 py-3 text-base text-charcoal outline-none transition placeholder:text-charcoal/35 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20"
                    maxLength={40}
                    required
                  />
                  <span id="guest-name-help" className="mt-1.5 block text-xs leading-relaxed text-charcoal/60">Mínimo 2 caracteres.</span>
                </label>

                <label className="block max-w-xl" htmlFor="party-size">
                  <span className="mb-1.5 block text-sm font-medium text-charcoal/78">
                    Personas en tu grupo
                  </span>
                  <input
                    id="party-size"
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    inputMode="numeric"
                    value={partySize}
                    onChange={(event) => setPartySize(event.target.value)}
                    aria-describedby="party-size-help"
                    className="w-full rounded-xl border border-charcoal/15 bg-ivory px-4 py-3 text-base text-charcoal outline-none transition focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20"
                    required
                  />
                  <span id="party-size-help" className="mt-1.5 block text-xs leading-relaxed text-charcoal/60">Entre 1 y 20.</span>
                </label>

                <button
                  type="submit"
                  disabled={!canContinue || isSubmitting}
                  aria-busy={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-charcoal px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition hover:-translate-y-px hover:bg-charcoal-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Entrando..." : "Entrar a la mesa"}
                </button>
              </form>

              <p id="table-access-status" className="sr-only" aria-live="polite">
                {isSubmitting ? "Procesando acceso a la mesa." : ""}
              </p>

              {submitError && (
                <p className="mt-4 rounded-lg border border-ember/20 bg-ember-pale p-3 text-sm text-ember" role="alert">
                  {submitError}
                </p>
              )}

              {!isLikelyValid && (
                <p className="mt-4 rounded-lg border border-ember/20 bg-ember-pale p-3 text-sm text-ember" role="alert">
                  El código no cumple el formato esperado. Puedes continuar con otro QR o pedir apoyo al personal.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
