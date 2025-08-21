import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Key, Users, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { staffApi, tableApi, restaurantApi, Restaurant } from '../lib/api';

interface CreateTableProps {}

export function CreateTable({}: CreateTableProps) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'staff-code' | 'table-created'>('staff-code');
  const [formData, setFormData] = useState({
    staffCode: '',
    leaderName: '',
    tableNumber: ''
  });
  const [tableData, setTableData] = useState<{
    joinCode: string;
    tableId: string;
    shareUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!slug) {
        setError('Slug del restaurante no encontrado');
        setLoading(false);
        return;
      }

      try {
        const restaurantData = await restaurantApi.getBySlug(slug);
        setRestaurant(restaurantData);
      } catch (err: any) {
        console.error('Error cargando restaurante:', err);
        
        // Fallback para modo demo
        if (slug === 'demo') {
          const demoRestaurant: Restaurant = {
            id: 'demo',
            slug: 'demo',
            name: 'Café Central',
            description: 'Un acogedor café en el corazón de la ciudad',
            image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20cafe%20interior%20warm%20lighting%20coffee%20shop&image_size=landscape_16_9',
            qr_code: 'demo-qr-code',
            lobby_enabled: true,
            created_at: new Date().toISOString()
          };
          setRestaurant(demoRestaurant);
          console.log('Usando datos demo para el restaurante');
        } else {
          setError('No se pudo cargar la información del restaurante');
        }
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [slug]);

  const handleBack = () => {
    if (step === 'table-created') {
      setStep('staff-code');
      setTableData(null);
    } else {
      navigate(`/restaurant/${slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B4B6B] mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No se pudo cargar la información del restaurante'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#8B4B6B] text-white rounded-lg hover:bg-[#7A4159] transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const validateStaffCode = async (code: string) => {
    if (!restaurant) {
      throw new Error('Información del restaurante no disponible');
    }

    // Modo demo: acepta código "DEMO"
    if (restaurant.slug === 'demo') {
      return code.toUpperCase() === 'DEMO';
    }

    try {
      const result = await staffApi.validateCode(restaurant.id, code);
      return result.valid;
    } catch (error: any) {
      console.error('Error validando código:', error);
      throw error;
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.staffCode.trim() || !formData.leaderName.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    try {
      // Validar código de staff
      const isValidCode = await validateStaffCode(formData.staffCode);
      
      if (!isValidCode) {
        toast.error('Código de staff inválido. Verifica con el personal.');
        setLoading(false);
        return;
      }

      // Crear mesa usando la API o datos demo
      if (restaurant!.slug === 'demo') {
        // Modo demo: generar datos mock
        const mockJoinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const mockTableId = `demo-table-${Date.now()}`;
        const shareUrl = `${window.location.origin}/join/${mockJoinCode}`;
        
        setTableData({
          joinCode: mockJoinCode,
          tableId: mockTableId,
          shareUrl
        });
        
        console.log('Mesa demo creada:', { joinCode: mockJoinCode, tableId: mockTableId });
      } else {
        // Modo normal: usar API
        const tableDataPayload = {
          staff_code: formData.staffCode,
          leader_name: formData.leaderName.trim(),
          table_number: formData.tableNumber.trim() || undefined,
          restaurant_id: restaurant!.id
        };
        
        const newTable = await tableApi.create(tableDataPayload);
        const shareUrl = `${window.location.origin}/join/${newTable.join_code}`;
        
        setTableData({
          joinCode: newTable.join_code,
          tableId: newTable.id,
          shareUrl
        });
      }
      
      setStep('table-created');
      toast.success('¡Mesa creada exitosamente!');
      
    } catch (error) {
      toast.error('Error al crear la mesa. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (tableData) {
      try {
        await navigator.clipboard.writeText(tableData.joinCode);
        setCopied(true);
        toast.success('Código copiado al portapapeles');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Error al copiar el código');
      }
    }
  };

  const handleCopyUrl = async () => {
    if (tableData) {
      try {
        await navigator.clipboard.writeText(tableData.shareUrl);
        toast.success('Enlace copiado al portapapeles');
      } catch (error) {
        toast.error('Error al copiar el enlace');
      }
    }
  };

  const handleShareWhatsApp = () => {
    if (tableData && restaurant) {
      const message = `¡Únete a mi mesa en ${restaurant.name}! 🍽️\n\nCódigo: ${tableData.joinCode}\nEnlace: ${tableData.shareUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleGoToTable = () => {
    if (tableData) {
      navigate(`/join/${tableData.joinCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#8B4B6B]/20 hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#8B4B6B]" />
        </button>
        
        <div className="text-center">
          <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
          <p className="text-xs text-gray-600">CREAR MESA</p>
        </div>
        
        <div className="w-10 h-10"></div>
      </div>

      <div className="max-w-md mx-auto">
        {step === 'staff-code' && (
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-[#8B4B6B] text-2xl font-serif italic mb-2">Crear Nueva Mesa</h2>
              <p className="text-gray-600 text-sm">Necesitas un código del staff de {restaurant.name} para crear una mesa</p>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTable} className="space-y-6">
              {/* Staff Code */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-[#8B4B6B]/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Key className="h-5 w-5 text-[#8B4B6B]" />
                  <h3 className="text-[#8B4B6B] font-medium">Código del Staff</h3>
                </div>
                
                <input
                  type="text"
                  value={formData.staffCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, staffCode: e.target.value.toUpperCase() }))}
                  placeholder="Ej: 1234"
                  className="w-full px-4 py-3 border-2 border-[#8B4B6B]/30 rounded-lg focus:border-[#8B4B6B] focus:outline-none bg-white text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                  required
                />
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Solicita este código al personal del restaurante
                </p>
              </div>

              {/* Leader Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-[#8B4B6B]/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-5 w-5 text-[#8B4B6B]" />
                  <h3 className="text-[#8B4B6B] font-medium">Información de la Mesa</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Tu nombre *</label>
                    <input
                      type="text"
                      value={formData.leaderName}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaderName: e.target.value }))}
                      placeholder="Ej: María García"
                      className="w-full px-4 py-3 border-2 border-[#8B4B6B]/30 rounded-lg focus:border-[#8B4B6B] focus:outline-none bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Número de mesa (opcional)</label>
                    <input
                      type="text"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, tableNumber: e.target.value }))}
                      placeholder="Ej: Mesa 5"
                      className="w-full px-4 py-3 border-2 border-[#8B4B6B]/30 rounded-lg focus:border-[#8B4B6B] focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B4B6B] text-white py-4 px-6 rounded-lg hover:bg-[#7A4159] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creando mesa...</span>
                  </>
                ) : (
                  <span className="font-medium">Crear Mesa</span>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 'table-created' && tableData && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-[#8B4B6B] text-2xl font-serif italic mb-2">¡Mesa Creada!</h2>
              <p className="text-gray-600 text-sm">Comparte el código con tus amigos para que se unan</p>
            </div>

            {/* Table Code */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-[#8B4B6B]/20">
              <h3 className="text-[#8B4B6B] font-medium mb-4 text-center">Código de Mesa</h3>
              
              <div className="bg-[#8B4B6B]/5 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-[#8B4B6B] tracking-wider mb-2">
                    {tableData.joinCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center space-x-2 text-sm text-[#8B4B6B] hover:text-[#7A4159] transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copiado' : 'Copiar código'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-[#8B4B6B]/20">
              <h3 className="text-[#8B4B6B] font-medium mb-4">Compartir Mesa</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📱</span>
                  <span>Compartir por WhatsApp</span>
                </button>
                
                <button
                  onClick={handleCopyUrl}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar enlace</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoToTable}
                className="w-full bg-[#8B4B6B] text-white py-4 px-6 rounded-lg hover:bg-[#7A4159] transition-colors font-medium"
              >
                Ir a Mi Mesa
              </button>
              
              <button
                onClick={() => navigate(`/restaurant/${slug}`)}
                className="w-full bg-white text-[#8B4B6B] py-3 px-6 rounded-lg border-2 border-[#8B4B6B] hover:bg-[#8B4B6B]/5 transition-colors"
              >
                Volver al Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}