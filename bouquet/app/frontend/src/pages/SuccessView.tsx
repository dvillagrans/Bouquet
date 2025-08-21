import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { sessionApi, paymentApi, handleApiError, type Session, type PaymentStatus } from '../lib/api'
import { CheckCircle, Download, Share2, Home, Receipt, Clock } from 'lucide-react'

const SuccessView = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [participantId] = useState(searchParams.get('participant'))
  const [isReceiptView] = useState(window.location.pathname.includes('/receipt/'))

  useEffect(() => {
    if (sessionId) {
      loadData()
    }
  }, [sessionId])

  const loadData = async () => {
    if (!sessionId) return
    
    setLoading(true)
    try {
      const [sessionData, statusData] = await Promise.all([
        sessionApi.get(sessionId),
        paymentApi.getStatus(sessionId)
      ])
      
      setSession(sessionData)
      setPaymentStatus(statusData)
    } catch (error) {
      toast.error(handleApiError(error))
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const shareReceipt = async () => {
    if (!session) return
    
    const shareData = {
      title: `Recibo - ${session.restaurant_name}`,
      text: `Recibo de la cuenta dividida en ${session.restaurant_name}`,
      url: `${window.location.origin}/receipt/${sessionId}`
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Enlace del recibo copiado al portapapeles')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Error al compartir')
    }
  }

  const downloadReceipt = () => {
    if (!session || !paymentStatus) return
    
    // Crear contenido del recibo
    const receiptContent = `
=== RECIBO DE CUENTA DIVIDIDA ===

Restaurante: ${session.restaurant_name}
${session.waiter_name ? `Mesero: ${session.waiter_name}\n` : ''}${session.table_number ? `Mesa: ${session.table_number}\n` : ''}
Fecha: ${new Date(session.created_at).toLocaleDateString()}

--- DETALLES DE LA CUENTA ---
Subtotal: $${session.total_amount.toFixed(2)}
Propina (${session.tip_percentage}%): $${session.tip_amount.toFixed(2)}
Total: $${(session.total_amount + session.tip_amount).toFixed(2)}

--- PARTICIPANTES ---
${session.participants.map(p => 
  `${p.name}: $${p.amount_owed.toFixed(2)} ${p.paid ? '✓ Pagado' : '⏳ Pendiente'}`
).join('\n')}

--- RESUMEN DE PAGOS ---
Total recaudado: $${paymentStatus.total_collected.toFixed(2)}
Participantes que pagaron: ${paymentStatus.paid_participants}/${paymentStatus.total_participants}
Progreso: ${paymentStatus.completion_percentage.toFixed(1)}%

--- ITEMS ---
${session.items.map(item => 
  `${item.name}: $${item.price.toFixed(2)} x${item.quantity || 1}`
).join('\n')}

Generado por Bouquet
    `
    
    // Crear y descargar archivo
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recibo-${session.restaurant_name.replace(/\s+/g, '-').toLowerCase()}-${sessionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Recibo descargado')
  }

  const getCurrentParticipant = () => {
    if (!session || !participantId) return null
    return session.participants.find(p => p.id === participantId)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mb-4 h-8 w-8 border-primary-600"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session || !paymentStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-error-100 flex items-center justify-center">
            <Receipt className="h-8 w-8 text-error-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Sesión no encontrada</h2>
          <p className="mb-4 text-gray-600">No se pudo cargar la información de la sesión</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const currentParticipant = getCurrentParticipant()
  const isPaymentSuccess = currentParticipant && !isReceiptView

  return (
    <div className="min-h-screen bg-gray-50 py-8 safe-top safe-bottom">
      <div className="container-mobile">
        {/* Header de éxito o recibo */}
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isPaymentSuccess ? 'bg-success-100' : 'bg-primary-100'
          }`}>
            {isPaymentSuccess ? (
              <CheckCircle className="h-8 w-8 text-success-600" />
            ) : (
              <Receipt className="h-8 w-8 text-primary-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {isPaymentSuccess ? '¡Pago Exitoso!' : 'Recibo de Cuenta'}
          </h1>
          
          <p className="text-gray-600">
            {isPaymentSuccess 
              ? 'Tu pago ha sido procesado correctamente'
              : `Resumen de la cuenta en ${session.restaurant_name}`
            }
          </p>
        </div>

        {/* Información del pago individual (solo si es pago exitoso) */}
        {isPaymentSuccess && currentParticipant && (
          <div className="card mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">
                ${currentParticipant.amount_owed.toFixed(2)}
              </div>
              <div className="text-gray-600 mb-4">Monto pagado por {currentParticipant.name}</div>
              
              {currentParticipant.items && currentParticipant.items.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Tus items:</h4>
                  <div className="space-y-2">
                    {currentParticipant.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del restaurante */}
        <div className="card mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Información del Restaurante</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Restaurante:</span>
              <span className="font-medium">{session.restaurant_name}</span>
            </div>
            {session.waiter_name && (
              <div className="flex justify-between">
                <span className="text-gray-600">Mesero:</span>
                <span className="font-medium">{session.waiter_name}</span>
              </div>
            )}
            {session.table_number && (
              <div className="flex justify-between">
                <span className="text-gray-600">Mesa:</span>
                <span className="font-medium">{session.table_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium">{new Date(session.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Resumen de la cuenta */}
        <div className="card mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen de la Cuenta</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${session.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Propina ({session.tip_percentage}%):</span>
              <span>${session.tip_amount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${(session.total_amount + session.tip_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de pagos */}
        <div className="card mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Estado de Pagos</h2>
          
          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso de pagos</span>
              <span>{paymentStatus.completion_percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-success-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${paymentStatus.completion_percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                ${paymentStatus.total_collected.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Recaudado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {paymentStatus.paid_participants}/{paymentStatus.total_participants}
              </div>
              <div className="text-sm text-gray-600">Participantes</div>
            </div>
          </div>

          {paymentStatus.all_paid && (
            <div className="rounded-lg bg-success-50 border border-success-200 p-3">
              <div className="flex items-center text-success-800">
                <CheckCircle className="mr-2 h-5 w-5" />
                <span className="font-medium">¡Todos los pagos completados!</span>
              </div>
            </div>
          )}
        </div>

        {/* Lista de participantes */}
        <div className="card mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Participantes</h2>
          <div className="space-y-3">
            {session.participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <div className="font-medium text-gray-900">{participant.name}</div>
                  <div className="text-sm text-gray-600">
                    ${participant.amount_owed.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center">
                  {participant.paid ? (
                    <div className="flex items-center text-success-600">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span className="text-sm font-medium">Pagado</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-warning-600">
                      <Clock className="mr-1 h-4 w-4" />
                      <span className="text-sm font-medium">Pendiente</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items de la cuenta */}
        {session.items.length > 0 && (
          <div className="card mb-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Items de la Cuenta</h2>
            <div className="space-y-2">
              {session.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} {item.quantity && item.quantity > 1 && `x${item.quantity}`}</span>
                  <span>${((item.price * (item.quantity || 1))).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareReceipt}
              className="btn btn-outline"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </button>
            <button
              onClick={downloadReceipt}
              className="btn btn-outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </button>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary w-full"
          >
            <Home className="mr-2 h-5 w-5" />
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessView