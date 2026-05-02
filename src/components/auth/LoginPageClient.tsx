"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { BouquetLogo } from "@/components/landing/BouquetLogo";
import floralLeft from "@/assets/floral-assets/branches/complete_2.png";
import floralRight from "@/assets/floral-assets/branches/complete_3.png";

export default function LoginPageClient({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(initialError ?? null);
  const [showPassword, setShowPassword] = useState(false);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set([".login-blob", ".login-floral-left", ".login-floral-right", ".login-brand", ".login-heading", ".login-desc", ".login-card", ".login-card-content"], { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo([".login-blob"],
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 1, stagger: 0.08 },
      0
    )
    .fromTo(".login-floral-left",
      { opacity: 0, scale: 0.94 },
      { opacity: 0.06, scale: 1, duration: 0.9 },
      0
    )
    .fromTo(".login-floral-right",
      { opacity: 0, scale: 0.94 },
      { opacity: 0.05, scale: 1, duration: 0.9 },
      0.06
    )
    .fromTo(".login-brand",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      0.15
    )
    .fromTo(".login-heading",
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55 },
      0.25
    )
    .fromTo(".login-desc",
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      0.35
    )
    .fromTo(".login-card",
      { y: 30, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.75 },
      0.3
    )
    .fromTo(".login-card-content",
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.04 },
      0.6
    );
  }, { scope: containerRef });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPending(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; redirect?: string };
      if (!res.ok) {
        setFormError(data.error ?? "Credenciales incorrectas.");
        return;
      }
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setFormError("Error de red. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex min-h-svh items-center justify-center overflow-hidden bg-ink px-4 py-6 antialiased md:px-8 md:py-10 selection:bg-rose/20 selection:text-light">

      {/* Film grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025] mix-blend-screen"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
        }}
      />

      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="login-blob absolute -left-[15%] -top-[10%] h-[32rem] w-[32rem] rounded-full bg-rose/8 blur-3xl opacity-0" />
        <div className="login-blob absolute -right-[12%] -bottom-[8%] h-[28rem] w-[28rem] rounded-full bg-rose-pale/6 blur-3xl opacity-0" />
        <div className="login-blob absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-blush/5 blur-3xl opacity-0" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,230,235,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,235,.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      {/* Floral decorations */}
      <Image
        src={floralLeft}
        alt=""
        priority
        className="login-floral-left pointer-events-none absolute -left-[8%] -top-[5%] z-[2] w-[320px] opacity-[0.06] mix-blend-overlay grayscale -rotate-[10deg] md:w-[650px] lg:w-[900px] opacity-0"
      />
      <Image
        src={floralRight}
        alt=""
        priority
        className="login-floral-right pointer-events-none absolute -right-[8%] -bottom-[5%] z-[2] w-[280px] opacity-[0.05] mix-blend-overlay grayscale rotate-[14deg] md:w-[500px] lg:w-[800px] opacity-0"
      />

      {/* Divider top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-8 md:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">

        {/* ── Left column: Brand ── */}
        <section className="hidden lg:block">
          <div className="login-brand opacity-0">
            <BouquetLogo variant="light" size="md" showTagline />
          </div>

          <p className="login-brand opacity-0 mt-5 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-rose/55">
            Sistema unificado de acceso
          </p>

          <h1 className="login-heading opacity-0 mt-3 max-w-md font-serif text-3xl leading-[1.08] font-semibold tracking-[-0.02em] text-light md:text-5xl">
            Bienvenido
          </h1>



          {/* Minimal Editorial Manifest */}
          <div className="login-desc opacity-0 mt-12 space-y-6 max-w-xs">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.4em] text-rose/40 mb-8">
              Protocolos de Acceso
            </p>
            {[
              "Administración Central",
              "Gestión de Cadena",
              "Terminales de Salón",
              "Interfaces de Cocina",
            ].map((label, i) => (
              <div key={label} className="group flex items-center justify-between border-b border-white/[0.04] pb-4 last:border-0 transition-colors hover:border-rose/20">
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-[0.65rem] tabular-nums text-rose/50">
                    0{i + 1}
                  </span>
                  <span className="text-[0.9rem] font-medium tracking-tight text-light/80 group-hover:text-light transition-colors">
                    {label}
                  </span>
                </div>
                <div className="h-1 w-1 rounded-full bg-white/10 group-hover:bg-rose group-hover:shadow-[0_0_8px_rgba(199,91,122,0.8)] transition-all" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Right column: Login card ── */}
        <div className="login-card opacity-0 relative mx-auto w-full max-w-md">
          {/* Card shadow offset */}
          <div className="absolute inset-0 translate-y-3 translate-x-3 rounded-[2rem] bg-rose/5 blur-2xl" aria-hidden />

          <div className="relative overflow-hidden rounded-[2rem] bg-canvas/90 ring-1 ring-white/8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">

            {/* Top gradient line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose/25 to-transparent" aria-hidden />

            {/* Inner glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(199,91,122,0.06)_0%,transparent_60%)]" aria-hidden />

            <div className="login-card-content relative px-6 py-8 md:px-8 md:py-10">

              {/* Mobile brand (visible only on <lg) */}
              <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                <BouquetLogo variant="light" size="sm" />
                <p className="mt-3 text-[0.6rem] font-bold uppercase tracking-[0.28em] text-rose/50">
                  Sistema unificado de acceso
                </p>
              </div>

              {/* Header */}
              <div className="mb-6 text-center">
                <h2 className="font-serif text-xl font-semibold italic text-light md:text-2xl">
                  Iniciar sesión
                </h2>
                <p className="mt-1.5 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-dim/70">
                  Acceso centralizado
                </p>
              </div>

              {/* Error */}
              {formError && (
                <div
                  role="alert"
                  className="login-card-content relative mb-5 flex items-start gap-3 rounded-xl border border-rose/20 bg-rose/[0.06] px-4 py-3 text-sm"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                  <p className="text-[0.82rem] font-medium leading-[1.5] text-rose-pale">{formError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={submit} className="login-card-content flex flex-col gap-4">

                {/* Email Input */}
                <div className="group relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:translate-x-[-2px] group-focus-within:scale-90 group-focus-within:opacity-40">
                    <Mail className="h-4 w-4 text-dim/50" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={pending}
                    placeholder=" "
                    className="peer block h-14 w-full rounded-2xl border-2 border-white/[0.05] bg-white/[0.03] pl-11 pr-4 text-[0.95rem] font-medium text-light outline-none transition-all duration-300 placeholder:text-transparent focus:border-rose/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-rose/5 disabled:opacity-50"
                  />
                  <label
                    htmlFor="email"
                    className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-[0.85rem] font-medium text-dim/40 transition-all duration-300 peer-focus:-translate-y-9 peer-focus:translate-x-[-1.5rem] peer-focus:scale-90 peer-focus:text-rose/80 peer-[:not(:placeholder-shown)]:-translate-y-9 peer-[:not(:placeholder-shown)]:translate-x-[-1.5rem] peer-[:not(:placeholder-shown)]:scale-90"
                  >
                    Correo electrónico
                  </label>
                </div>

                {/* Password Input */}
                <div className="group relative mt-1">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:translate-x-[-2px] group-focus-within:scale-90 group-focus-within:opacity-40">
                    <Lock className="h-4 w-4 text-dim/50" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={pending}
                    placeholder=" "
                    className="peer block h-14 w-full rounded-2xl border-2 border-white/[0.05] bg-white/[0.03] pl-11 pr-12 font-medium text-light outline-none transition-all duration-300 placeholder:text-transparent focus:border-rose/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-rose/5 disabled:opacity-50"
                  />
                  <label
                    htmlFor="password"
                    className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-[0.85rem] font-medium text-dim/40 transition-all duration-300 peer-focus:-translate-y-9 peer-focus:translate-x-[-1.5rem] peer-focus:scale-90 peer-focus:text-rose/80 peer-[:not(:placeholder-shown)]:-translate-y-9 peer-[:not(:placeholder-shown)]:translate-x-[-1.5rem] peer-[:not(:placeholder-shown)]:scale-90"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-dim/30 transition-all hover:bg-white/5 hover:text-rose"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={pending || !email.trim() || !password}
                  className="group relative mt-2 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-rose text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(199,91,122,0.5)] transition-all duration-300 hover:bg-rose-light hover:shadow-[0_16px_36px_-14px_rgba(199,91,122,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:active:scale-100"
                >
                  {/* Hover sheen */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verificando…</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer text */}
              <p className="mt-5 text-center text-[0.65rem] leading-relaxed text-dim/40">
                Plataforma para uso exclusivo de restaurantes asociados a Bouquet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
