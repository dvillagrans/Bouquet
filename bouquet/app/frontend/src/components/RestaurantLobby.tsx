import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback';
import { QrCode, Users, Menu, Info, Plus, UserPlus, Loader2, Clock, MapPin, Wifi, CreditCard, Star } from 'lucide-react';
import { restaurantApi, Restaurant } from '../lib/api';

interface RestaurantLobbyProps {}

export function RestaurantLobby({}: RestaurantLobbyProps) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!slug) {
        setError('Slug del restaurante no encontrado');
        setLoading(false);
        return;
      }

      // Para demo, usar datos simulados
      if (slug === 'demo') {
        setRestaurant({
          id: 'demo',
          slug: 'demo',
          name: 'Café Central',
          description: 'Un acogedor café en el corazón de la ciudad con especialidades artesanales y ambiente familiar.',
          image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20cafe%20interior%20warm%20lighting%20coffee%20shop&image_size=landscape_16_9',
          qr_code: 'demo-qr-code',
          lobby_enabled: true,
          created_at: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      try {
        const restaurantData = await restaurantApi.getBySlug(slug);
        setRestaurant(restaurantData);
      } catch (err: any) {
        console.error('Error cargando restaurante:', err);
        setError('No se pudo cargar la información del restaurante');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [slug]);

  const handleCreateTable = () => {
    if (restaurant || slug) {
      navigate(`/restaurant/${slug}/create`);
    }
  };

  const handleJoinTable = () => {
    if (restaurant || slug) {
      navigate(`/restaurant/${slug}/join`);
    }
  };

  const handleViewMenu = () => {
    if (restaurant || slug) {
      navigate(`/restaurant/${slug}/menu`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B4B6B] mx-auto mb-4" />
          <p className="text-gray-600">Cargando información del restaurante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurante no encontrado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#8B4B6B] text-white rounded-lg hover:bg-[#7A4159] transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[#8B4B6B] text-3xl font-serif italic mb-2">Bouquet</h1>
        <p className="text-xs text-gray-600">RESTAURANT LOBBY</p>
      </div>

      {/* Restaurant Info */}
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-[#8B4B6B]/20">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
              <ImageWithFallback 
                src={restaurant?.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZWxlZ2FudHxlbnwxfHx8fDE3NTU3NDAwODd8MA&ixlib=rb-4.1.0&q=80&w=1080"}
                alt={restaurant?.name || "Restaurante"}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-[#8B4B6B] text-2xl font-serif italic mb-2">{restaurant?.name || "Café Central"}</h2>
            <div className="flex items-center justify-center mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-2 text-sm text-gray-600">4.8 (124 reseñas)</span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{restaurant?.description || "Un acogedor café en el corazón de la ciudad"}</p>
            
            {/* Restaurant Details */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Av. Principal 123, Centro</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Abierto: 8:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Today's Specials */}
          <div className="mb-6 p-4 bg-[#8B4B6B]/5 rounded-lg border border-[#8B4B6B]/10">
            <h3 className="text-[#8B4B6B] font-medium mb-3 text-center">🍽️ Especialidades del Día</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Café de Especialidad</span>
                <span className="font-medium">$4.50</span>
              </div>
              <div className="flex justify-between">
                <span>Croissant Artesanal</span>
                <span className="font-medium">$3.25</span>
              </div>
              <div className="flex justify-between">
                <span>Ensalada César</span>
                <span className="font-medium">$12.90</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Create New Table */}
            <button
              onClick={handleCreateTable}
              className="w-full bg-[#8B4B6B] text-white py-4 px-6 rounded-lg hover:bg-[#7A4159] transition-colors flex items-center justify-center space-x-3"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Crear Nueva Mesa</span>
            </button>

            {/* Join Existing Table */}
            <button
              onClick={handleJoinTable}
              className="w-full bg-white text-[#8B4B6B] py-4 px-6 rounded-lg border-2 border-[#8B4B6B] hover:bg-[#8B4B6B]/5 transition-colors flex items-center justify-center space-x-3"
            >
              <UserPlus className="h-5 w-5" />
              <span className="font-medium">Unirse a Mesa</span>
            </button>

            {/* View Menu */}
            <button
              onClick={handleViewMenu}
              className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-3"
            >
              <Menu className="h-5 w-5" />
              <span className="font-medium">Ver Menú</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Services */}
      <div className="max-w-md mx-auto mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#8B4B6B]/10">
          <h3 className="text-[#8B4B6B] font-medium mb-3 text-center">🏪 Servicios Disponibles</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <span>WiFi Gratis</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span>Pago con Tarjeta</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span>Grupos Grandes</span>
            </div>
            <div className="flex items-center space-x-2">
              <QrCode className="h-4 w-4 text-orange-600" />
              <span>Pago Digital</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Instructions */}
      {slug === 'demo' && (
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-blue-800 font-medium mb-1">🎯 Modo Demostración</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Estás probando Bouquet en el Café Central. Para crear una mesa usa el código: <strong>DEMO</strong>
                </p>
                <p className="text-xs text-blue-600">
                  • Crea una mesa → Código: DEMO<br/>
                  • Comparte con amigos → Código de mesa: ABC123<br/>
                  • Prueba el pago dividido
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="max-w-md mx-auto space-y-4">
        {/* How it works */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#8B4B6B]/10">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-[#8B4B6B] mt-0.5" />
            <div>
              <h3 className="text-[#8B4B6B] font-medium mb-1">¿Cómo funciona?</h3>
              <p className="text-sm text-gray-600">
                1. Crea una nueva mesa con el código del staff<br/>
                2. Comparte el código de mesa con tus amigos<br/>
                3. Todos pueden agregar sus pedidos<br/>
                4. Cada uno paga solo lo que consumió
              </p>
            </div>
          </div>
        </div>

        {/* QR Info */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#8B4B6B]/10">
          <div className="flex items-start space-x-3">
            <QrCode className="h-5 w-5 text-[#8B4B6B] mt-0.5" />
            <div>
              <h3 className="text-[#8B4B6B] font-medium mb-1">Código QR</h3>
              <p className="text-sm text-gray-600">
                Cada mesa genera un código único que puedes compartir por WhatsApp, SMS o mostrar en pantalla.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#8B4B6B]/10">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-[#8B4B6B] mt-0.5" />
            <div>
              <h3 className="text-[#8B4B6B] font-medium mb-1">Pago Inteligente</h3>
              <p className="text-sm text-gray-600">
                Selecciona exactamente lo que consumiste y paga con tarjeta de forma segura. Sin complicaciones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-xs text-gray-500">
        <p>Powered by Bouquet • Divide cuentas fácilmente</p>
      </div>
    </div>
  );
}