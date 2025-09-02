import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChefHat, QrCode, ArrowRight, Database } from 'lucide-react';
import SupabaseTest from './SupabaseTest';

interface HomePageProps { }

export function HomePage({ }: HomePageProps) {
  const navigate = useNavigate();
  const [showSupabaseTest, setShowSupabaseTest] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[#8B4B6B] text-5xl font-serif italic mb-4">Bouquet</h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Sistema inteligente para dividir cuentas de restaurante
          </p>
        </div>

        {/* Main Options */}
        <div className="max-w-4xl w-full grid md:grid-cols-3 gap-6 mb-8">
          {/* Mesero Option */}
          <div
            onClick={() => navigate('/waiter')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-soft border border-[#8B4B6B]/20 hover:border-[#8B4B6B]/40 hover:shadow-medium transition-all cursor-pointer group"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#8B4B6B]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#8B4B6B]/20 transition-colors">
                <ChefHat className="h-8 w-8 text-[#8B4B6B]" />
              </div>
              <h3 className="text-xl font-semibold text-[#8B4B6B]">Soy Mesero</h3>
              <p className="text-gray-600 text-sm">
                Crear nuevas mesas, gestionar pedidos y generar códigos QR para clientes
              </p>
              <div className="flex items-center justify-center text-[#8B4B6B] group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium mr-2">Acceder</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Cliente Option */}
          <div
            onClick={() => navigate('/restaurant/demo')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-soft border border-[#8B4B6B]/20 hover:border-[#8B4B6B]/40 hover:shadow-medium transition-all cursor-pointer group"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#8B4B6B]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#8B4B6B]/20 transition-colors">
                <Users className="h-8 w-8 text-[#8B4B6B]" />
              </div>
              <h3 className="text-xl font-semibold text-[#8B4B6B]">Soy Cliente</h3>
              <p className="text-gray-600 text-sm">
                Crear una nueva mesa o unirme a una existente para dividir la cuenta
              </p>
              <div className="flex items-center justify-center text-[#8B4B6B] group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium mr-2">Ir al Lobby</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Código Option */}
          <div
            onClick={() => navigate('/join')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-soft border border-[#8B4B6B]/20 hover:border-[#8B4B6B]/40 hover:shadow-medium transition-all cursor-pointer group"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#8B4B6B]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#8B4B6B]/20 transition-colors">
                <QrCode className="h-8 w-8 text-[#8B4B6B]" />
              </div>
              <h3 className="text-xl font-semibold text-[#8B4B6B]">Tengo un Código</h3>
              <p className="text-gray-600 text-sm">
                Unirme directamente a una mesa existente usando un código de 6 dígitos
              </p>
              <div className="flex items-center justify-center text-[#8B4B6B] group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium mr-2">Ingresar Código</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 max-w-2xl text-center border border-[#8B4B6B]/10">
          <h4 className="text-[#8B4B6B] font-semibold mb-2">¿Primera vez usando Bouquet?</h4>
          <p className="text-gray-600 text-sm mb-4">
            Prueba nuestra demo interactiva para ver cómo funciona el sistema de división de cuentas
          </p>
          <button
            onClick={() => navigate('/restaurant/demo')}
            className="bg-[#8B4B6B] text-white px-6 py-2 rounded-lg hover:bg-[#7A4159] transition-colors text-sm font-medium"
          >
            Ver Demo
          </button>
        </div>

        {/* Debug Navigation Buttons */}
        <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4 text-center">🔧 Herramientas de Debugging</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/waiter')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
            >
              Página Waiter
            </button>
            <button
              onClick={() => navigate('/websocket-test')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors font-medium"
            >
              WebSocket Test
            </button>
            <button
              onClick={() => navigate('/simple-ws-test')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors font-medium"
            >
              Simple WS Test
            </button>
            <button
              onClick={() => navigate('/diagnostic')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors font-medium"
            >
              Diagnostic
            </button>
            <button
              onClick={() => navigate('/ws-test')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium"
            >
              WS Test
            </button>
            <button
              onClick={() => setShowSupabaseTest(true)}
              className="bg-green-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-900 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Database className="h-4 w-4" />
              Supabase
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Bouquet - Sistema de División de Cuentas</p>
        </div>
      </div>

      {/* Supabase Test Modal */}
      {showSupabaseTest && (
        <SupabaseTest onClose={() => setShowSupabaseTest(false)} />
      )}
    </div>
  );
}