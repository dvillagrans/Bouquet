'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSplitStore } from '@/store/useSplitStore';

interface Session {
  id: string;
  code: string;
  restaurant_name: string;
  currency: string;
  tip_rate: number;
  tax_rate: number;
}

export default function JoinSessionPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [guestName, setGuestName] = useState('');
  const [joining, setJoining] = useState(false);

  const { setSession: setStoreSession, setGuest } = useSplitStore();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions?code=${code.toUpperCase()}`);

        if (!response.ok) {
          toast.error('Sesión no encontrada');
          router.push('/');
          return;
        }

        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error('Error fetching session:', error);
        toast.error('Error al cargar la sesión');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchSession();
    }
  }, [code, router]);

  const handleJoin = async () => {
    if (!guestName.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }

    if (!session) return;

    setJoining(true);

    try {
      // Generar ID único para el guest
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Guardar en el store
      setStoreSession(session);
      setGuest(guestId, guestName.trim());

      toast.success(`¡Bienvenido ${guestName}!`);

      // Navegar a la vista de selección de items
      router.push(`/summary/${session.id}`);
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Error al unirse a la sesión');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral-tree-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50 flex items-center justify-center p-6">
      <Card className="glass-card border-0 p-8 max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-4xl font-script text-center text-buccaneer-700 mb-2">
            ¡Bienvenido!
          </CardTitle>
          <p className="text-center text-lg text-buccaneer-600">
            {session.restaurant_name}
          </p>
          <p className="text-center text-sm text-buccaneer-500">
            Mesa: {session.code}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="text-buccaneer-700">
              Tu nombre
            </Label>
            <Input
              id="guestName"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              className="glass-light border-0"
            />
          </div>

          <Button
            onClick={handleJoin}
            disabled={joining || !guestName.trim()}
            className="w-full bg-gradient-to-r from-coral-tree-500 to-pink-500 hover:from-coral-tree-600 hover:to-pink-600 text-white"
            size="lg"
          >
            {joining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uniéndose...
              </>
            ) : (
              'Unirse a la mesa'
            )}
          </Button>

          <div className="text-center text-sm text-buccaneer-500">
            <p>IVA: {session.tax_rate}% • Propina: {session.tip_rate}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
