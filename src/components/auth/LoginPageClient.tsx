"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPageClient({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(initialError ?? null);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#0f0e0b] px-4 py-6 antialiased md:px-8 md:py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(70% 60% at 18% 18%, rgba(201,160,84,.25) 0%, rgba(201,160,84,0) 65%), radial-gradient(55% 50% at 78% 78%, rgba(122,92,62,.2) 0%, rgba(122,92,62,0) 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(237,232,225,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(237,232,225,.28) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-5 md:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="hidden animate-[reveal-left_650ms_ease-out] text-[#F5E6EB] lg:order-1 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a05455] bg-[#c9a0541f] px-3.5 py-1.5 text-[10px] font-medium tracking-[0.18em] uppercase md:px-4 md:text-[11px] md:tracking-[0.2em]">
            Bouquet
          </div>

          <h1 className="mt-4 max-w-xl font-serif text-3xl leading-[1.05] font-semibold tracking-tight md:mt-6 md:text-6xl">
            Bienvenido
            <span className="block font-sans text-[0.56em] font-light tracking-[0.16em] uppercase text-[#cdb590]">
              Sistema unificado de acceso
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#d6cfc4] md:mt-6 md:text-base">
            Un solo punto de entrada para toda la plataforma. Según tu rol serás redirigido automáticamente a tu área de trabajo.
          </p>
        </section>

        <Card className="order-1 relative overflow-hidden border-[#f5e8d026] bg-[#181510]/95 text-[#f5eee3] shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-xl animate-[reveal-up_700ms_ease-out] lg:order-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d1a354] to-transparent" aria-hidden />

          <CardHeader className="space-y-2 px-5 pb-4 pt-5 md:px-6 md:pt-6">
            <CardTitle className="text-center text-lg font-medium tracking-[0.08em] uppercase md:text-xl">Iniciar sesión</CardTitle>
            <CardDescription className="text-center text-xs tracking-[0.12em] uppercase text-[#ccbea8]">
              Acceso centralizado Bouquet
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
            {formError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#e2726b66] bg-[#e2726b1a] px-4 py-3 text-sm text-[#ffc6c1]"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{formError}</p>
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#dbcbb3]">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center">
                    <Mail className="size-4 text-[#ad9c81]" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={pending}
                    placeholder="tu@email.com"
                    className="h-11 border-[#f2dcc624] bg-[#231d15] pl-12 text-base text-[#f7efe3] placeholder:text-[#9b8d79] focus-visible:ring-[#d7ae62] lg:text-sm"
                    style={{ paddingLeft: "3rem" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#dbcbb3]">
                  Contraseña
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center">
                    <Lock className="size-4 text-[#ad9c81]" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={pending}
                    placeholder="••••••••"
                    className="h-11 border-[#f2dcc624] bg-[#231d15] pl-12 pr-11 font-mono text-base text-[#f7efe3] placeholder:text-[#9b8d79] focus-visible:ring-[#d7ae62] lg:text-sm"
                    style={{ paddingLeft: "3rem", paddingRight: "2.75rem" }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-md text-[#bca785] hover:bg-[#f3e3cb14] hover:text-[#f7efe3]"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={pending || !email.trim() || !password}
                className="mt-2 h-11 w-full bg-[#d1a354] text-sm text-[#1b160f] transition-transform duration-200 hover:scale-[1.01] hover:bg-[#ddb46e] disabled:hover:scale-100"
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
