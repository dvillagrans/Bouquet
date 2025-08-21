import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Search, AlertCircle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { tableApi, restaurantApi, Restaurant } from '../lib/api';

interface JoinTableProps {}

interface TableInfo {
  id: string;
  restaurant_id: string;
  join_code: string;
  leader_name: string;
  table_number?: string;
  participant_count: number;
  status: string;
  created_at: string;
  expires_at: string;
}

export function JoinTable({}: JoinTableProps) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [step, setStep] = useState<'enter-code' | 'table-found'>('enter-code');

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
        setError('No se pudo cargar la información del restaurante');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [slug]);

  const handleBack = () => {
    if (step === 'table-found') {
      setStep('enter-code');
      setTableInfo(null);
      setJoinCode('');
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
            onClick={() => navigate(`/restaurant/${slug}`)}
            className="px-4 py-2 bg-[#8B4B6B] text-white rounded-lg hover:bg-[#7A4159] transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const searchTable = async (code: string) => {
    try {
      const table = await tableApi.findByJoinCode(code.toUpperCase());
      return table;
    } catch (error: any) {
      console.error('Error buscando mesa:', error);
      return null;
    }
  };

  const handleSearchTable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      toast.error('Por favor ingresa un código de mesa');
      return;
    }

    if (joinCode.length !== 6) {
      toast.error('El código debe tener 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      const table = await searchTable(joinCode);
      
      if (table) {
        setTableInfo(table);
        setStep('table-found');
        toast.success('¡Mesa encontrada!');
      } else {
        toast.error('Mesa no encontrada. Verifica el código.');
      }
      
    } catch (error) {
      toast.error('Error al buscar la mesa. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTable = () => {
    if (tableInfo) {
      // Redirigir al flujo normal de cliente con el código de mesa
      navigate(`/join/${tableInfo.join_code}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleCodeChange = (value: string) => {
    // Solo permitir caracteres alfanuméricos y convertir a mayúsculas
    const cleanValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (cleanValue.length <= 6) {
      setJoinCode(cleanValue);
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
          <p className="text-xs text-gray-600">UNIRSE A MESA</p>
        </div>
        
        <div className="w-10 h-10"></div>
      </div>

      <div className="max-w-md mx-auto">
        {step === 'enter-code' && (
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-[#8B4B6B] text-2xl font-serif italic mb-2">Unirse a Mesa</h2>
              <p className="text-gray-600 text-sm">Ingresa el código de 6 dígitos que te compartieron en {restaurant?.name || 'este restaurante'}</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchTable} className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-[#8B4B6B]/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Search className="h-5 w-5 text-[#8B4B6B]" />
                  <h3 className="text-[#8B4B6B] font-medium">Código de Mesa</h3>
                </div>
                
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="ABC123"
                  className="w-full px-4 py-4 border-2 border-[#8B4B6B]/30 rounded-lg focus:border-[#8B4B6B] focus:outline-none bg-white text-center text-2xl font-mono tracking-wider"
                  maxLength={6}
                  required
                />
                
                <div className="flex justify-center mt-3">
                  <div className="flex space-x-1">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-1 rounded-full transition-colors ${
                          index < joinCode.length 
                            ? 'bg-[#8B4B6B]' 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Ejemplo: ABC123, XYZ789
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || joinCode.length !== 6}
                className="w-full bg-[#8B4B6B] text-white py-4 px-6 rounded-lg hover:bg-[#7A4159] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Buscando mesa...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span className="font-medium">Buscar Mesa</span>
                  </>
                )}
              </button>
            </form>

            {/* Help Info */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#8B4B6B]/10">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-[#8B4B6B] mt-0.5" />
                <div>
                  <h3 className="text-[#8B4B6B] font-medium mb-1">¿No tienes el código?</h3>
                  <p className="text-sm text-gray-600">
                    Pídele a la persona que creó la mesa que te comparta el código de 6 dígitos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'table-found' && tableInfo && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-[#8B4B6B] text-2xl font-serif italic mb-2">¡Mesa Encontrada!</h2>
              <p className="text-gray-600 text-sm">Confirma que es la mesa correcta</p>
            </div>

            {/* Table Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-[#8B4B6B]/20">
              <div className="text-center mb-6">
                <div className="text-2xl font-mono font-bold text-[#8B4B6B] tracking-wider mb-2">
                  {tableInfo.join_code}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Creada por:</span>
                  <span className="font-medium text-[#8B4B6B]">{tableInfo.leader_name}</span>
                </div>
                
                {tableInfo.table_number && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Mesa:</span>
                    <span className="font-medium">{tableInfo.table_number}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Participantes:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{tableInfo.participant_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Creada a las:</span>
                  <span className="font-medium">{formatTime(tableInfo.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#8B4B6B]/10">
              <div className="text-center">
                <h3 className="text-[#8B4B6B] font-medium mb-1">{restaurant?.name || 'Restaurante'}</h3>
                <p className="text-sm text-gray-600">Mesa activa en este restaurante</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleJoinTable}
                className="w-full bg-[#8B4B6B] text-white py-4 px-6 rounded-lg hover:bg-[#7A4159] transition-colors font-medium"
              >
                Unirse a Esta Mesa
              </button>
              
              <button
                onClick={handleBack}
                className="w-full bg-white text-[#8B4B6B] py-3 px-6 rounded-lg border-2 border-[#8B4B6B] hover:bg-[#8B4B6B]/5 transition-colors"
              >
                Buscar Otra Mesa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}