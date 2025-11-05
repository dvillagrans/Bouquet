import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50 flex items-center justify-center p-6">
      <Card className="glass-card border-0 p-8 max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-script text-buccaneer-700 mb-4">
            Buquet
          </h1>
          <p className="text-2xl font-elegant text-buccaneer-600">
            Divide. Paga. Disfruta.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-lg text-buccaneer-700">
            Progressive Web App para dividir cuentas en restaurantes de forma transparente, rápida y segura.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/join/demo">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-coral-tree-500 to-pink-500 hover:from-coral-tree-600 hover:to-pink-600 text-white"
            >
              Unirse a una mesa (Demo)
            </Button>
          </Link>

          <Link href="/host/create">
            <Button
              size="lg"
              variant="outline"
              className="w-full"
            >
              Crear sesión (Restaurante)
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-buccaneer-500">
          <p>🔄 Migración a Next.js 15 + Supabase + Stripe en progreso</p>
        </div>
      </Card>
    </div>
  );
}
