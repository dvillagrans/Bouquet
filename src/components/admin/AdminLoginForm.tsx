"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, Shield, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function safePath(from: string | undefined): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) return "/admin";
  if (from.startsWith("/admin/login")) return "/admin";
  return from;
}

export default function AdminLoginForm({
  initialFrom,
  initialError,
}: {
  initialFrom?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bouquet.com");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const banner =
    initialError === "missing_secret"
      ? "Falta AUTH_SECRET (o NEXTAUTH_SECRET / BOUQUET_ADMIN_AUTH_SECRET) en el servidor Node. En Vercel: Project Settings → Environment Variables → Production → Redeploy. `next start` local sin secret: BOUQUET_ADMIN_ALLOW_DEV_AUTH_SECRET=1."
      : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setFormError(data.error ?? "Credenciales incorrectas.");
        return;
      }
      router.push(safePath(initialFrom));
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
        <section className="hidden animate-[reveal-left_650ms_ease-out] text-[#ede8e1] lg:order-1 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a05455] bg-[#c9a0541f] px-3.5 py-1.5 text-[10px] font-medium tracking-[0.18em] uppercase md:px-4 md:text-[11px] md:tracking-[0.2em]">
            <Shield className="size-3.5 text-[#d7ae62]" aria-hidden />
            BouquetOps Security Layer
          </div>

          <h1 className="mt-4 max-w-xl font-serif text-3xl leading-[1.05] font-semibold tracking-tight md:mt-6 md:text-6xl">
            Centro de mando
            <span className="block font-sans text-[0.56em] font-light tracking-[0.16em] uppercase text-[#cdb590]">
              Operaciones premium en tiempo real
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#d6cfc4] md:mt-6 md:text-base">
            Administra cadenas, restaurantes, equipos y flujo de servicio desde un punto de control
            diseñado para sesiones críticas.
          </p>

          <p className="mt-3 text-[11px] tracking-[0.1em] uppercase text-[#a59680] sm:hidden">
            Sesion segura y monitoreo activo
          </p>
        </section>

        <Card className="order-1 relative overflow-hidden border-[#f5e8d026] bg-[#181510]/95 text-[#f5eee3] shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-xl animate-[reveal-up_700ms_ease-out] lg:order-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d1a354] to-transparent" aria-hidden />

          <CardHeader className="space-y-2 px-5 pb-4 pt-5 md:px-6 md:pt-6">
            <CardTitle className="text-center text-lg font-medium tracking-[0.08em] uppercase md:text-xl">Admin Login</CardTitle>
            <CardDescription className="text-center text-xs tracking-[0.12em] uppercase text-[#ccbea8]">
              Acceso restringido para super administradores
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
            {(banner || formError) && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#e2726b66] bg-[#e2726b1a] px-4 py-3 text-sm text-[#ffc6c1]"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{formError ?? banner}</p>
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#dbcbb3]">
                  Correo corporativo
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center">
                    <Mail className="size-4 text-[#ad9c81]" />
                  </div>
                  <Input
                    suppressHydrationWarning
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={pending}
                    placeholder="admin@bouquet.com"
                    className="h-11 border-[#f2dcc624] bg-[#231d15] pl-12 text-base text-[#f7efe3] placeholder:text-[#9b8d79] focus-visible:ring-[#d7ae62] lg:text-sm"
                    style={{ paddingLeft: "3rem" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#dbcbb3]">
                  Contraseña
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center">
                    <Lock className="size-4 text-[#ad9c81]" />
                  </div>
                  <Input
                    suppressHydrationWarning
                    id="admin-password"
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
                    Verificando credenciales...
                  </>
                ) : (
                  "Entrar a BouquetOps"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-[#f2dcc61f] bg-transparent px-5 py-4 md:px-6">
            <p className="w-full text-center text-[11px] tracking-[0.11em] uppercase text-[#b8a690]">
              B2B Core System · Monitoreo activo
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
