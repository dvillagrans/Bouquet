import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { sessionApi, paymentApi, handleApiError, type Session, type ParticipantJoin, type Participant } from '../lib/api'
import { AlertCircle } from 'lucide-react'

// Import new components
import { Welcome } from '../components/Welcome'
import { NameEntry } from '../components/NameEntry'
import { Home } from '../components/Home'
import { Menu, type MenuItem } from '../components/Menu'
import { Basket, type BasketItem } from '../components/Basket'
import { Payment } from '../components/Payment'
import { SharedBill } from '../components/SharedBill'

type Screen = 'welcome' | 'nameEntry' | 'home' | 'menu' | 'basket' | 'payment' | 'sharedBill'
type Category = 'drinks' | 'breakfast' | 'appetizers' | 'dishes' | 'desserts'

const GuestView = () => {
  const { sessionId, participantId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // New state for prototype functionality
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome')
  const [userName, setUserName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('drinks')
  const [basket, setBasket] = useState<BasketItem[]>([])

  // Determinar paso inicial basado en parámetros
  useEffect(() => {
    if (sessionId) {
      loadSession()
      
      // Si viene de creación de sesión o es un enlace de pago directo
      if (searchParams.get('created') === 'true' || participantId) {
        // Mantener flujo del prototipo
        setCurrentScreen('welcome')
      }
    }
  }, [sessionId, participantId, searchParams])

  const loadSession = async () => {
    if (!sessionId) return
    
    setLoading(true)
    try {
      const sessionData = await sessionApi.get(sessionId)
      setSession(sessionData)
      
      // Si hay participantId, buscar el participante
      if (participantId) {
        const participant = sessionData.participants.find(p => p.id === participantId)
        if (participant) {
          setCurrentParticipant(participant)
          setUserName(participant.name)
        }
      }
    } catch (error) {
      toast.error(handleApiError(error))
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = async (name: string) => {
    if (!sessionId) {
      toast.error('ID de sesión no válido')
      return
    }

    const joinForm: ParticipantJoin = {
      name: name.trim(),
      email: '',
      phone: ''
    }

    setLoading(true)
    try {
      const result = await sessionApi.join(sessionId, joinForm)
      toast.success('Te has unido a la sesión exitosamente')
      
      // Recargar sesión para obtener datos actualizados
      await loadSession()
      
      // Buscar el participante recién creado
      const updatedSession = await sessionApi.get(sessionId)
      const newParticipant = updatedSession.participants.find(p => p.id === result.participant_id)
      if (newParticipant) {
        setCurrentParticipant(newParticipant)
      }
      
      setCurrentScreen('home')
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  // Basket management functions
  const addToBasket = (item: MenuItem) => {
    setBasket(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    toast.success(`${item.name} agregado al carrito`)
  }

  const removeFromBasket = (itemId: string) => {
    setBasket(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(itemId)
      return
    }
    setBasket(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const getTotalAmount = () => {
    return basket.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Screen navigation functions
  const handleWelcomeNext = () => {
    if (currentParticipant && userName) {
      setCurrentScreen('home')
    } else {
      setCurrentScreen('nameEntry')
    }
  }

  const handleNameSubmit = (name: string) => {
    setUserName(name)
    if (sessionId && !currentParticipant) {
      handleJoinSession(name)
    } else {
      setCurrentScreen('home')
    }
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setCurrentScreen('menu')
  }

  const handleBackToHome = () => {
    setCurrentScreen('home')
  }

  const handleViewBasket = () => {
    setCurrentScreen('basket')
  }

  const handleProceedToPayment = () => {
    setCurrentScreen('payment')
  }

  const handleProceedToSharedBill = () => {
    setCurrentScreen('sharedBill')
  }

  const handleOrderComplete = async () => {
    if (!sessionId || !currentParticipant) {
      toast.error('Error: Información de sesión no disponible')
      return
    }
    
    setPaymentLoading(true)
    try {
      await paymentApi.process(sessionId, {
        participant_id: currentParticipant.id,
        amount: getTotalAmount(),
        payment_method: 'mock' // Usar método mock para desarrollo
      })
      
      toast.success('Pago procesado exitosamente')
      setBasket([])
      navigate(`/success/${sessionId}?participant=${currentParticipant.id}`)
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mb-4 h-8 w-8 border-primary-600"></div>
          <p className="text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-error-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Sesión no encontrada</h2>
          <p className="mb-4 text-gray-600">La sesión que buscas no existe o ha expirado</p>
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

  // Render appropriate screen based on current state
  return (
    <div className="min-h-screen">
      {currentScreen === 'welcome' && (
        <Welcome onNext={handleWelcomeNext} />
      )}
      
      {currentScreen === 'nameEntry' && (
        <NameEntry onSubmit={handleNameSubmit} />
      )}
      
      {currentScreen === 'home' && (
        <Home 
          userName={userName || currentParticipant?.name || 'Usuario'}
          onCategorySelect={handleCategorySelect}
          onViewBasket={handleViewBasket}
          basketCount={basket.reduce((total, item) => total + item.quantity, 0)}
        />
      )}
      
      {currentScreen === 'menu' && (
        <Menu 
          category={selectedCategory}
          onBack={handleBackToHome}
          onAddToBasket={addToBasket}
          onViewBasket={handleViewBasket}
          basketCount={basket.reduce((total, item) => total + item.quantity, 0)}
        />
      )}
      
      {currentScreen === 'basket' && (
        <Basket 
          items={basket}
          onBack={handleBackToHome}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromBasket}
          onProceedToPayment={handleProceedToPayment}
          total={getTotalAmount()}
        />
      )}
      
      {currentScreen === 'payment' && (
        <Payment 
          total={getTotalAmount()}
          onBack={() => setCurrentScreen('basket')}
          onProceedToSharedBill={handleProceedToSharedBill}
          onOrderComplete={handleOrderComplete}
        />
      )}
      
      {currentScreen === 'sharedBill' && (
        <SharedBill 
          items={basket}
          total={getTotalAmount()}
          onBack={() => setCurrentScreen('payment')}
          onOrderComplete={handleOrderComplete}
        />
      )}
      
      {/* Loading overlay for payments */}
      {paymentLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="spinner mb-4 h-8 w-8 border-primary-600 mx-auto"></div>
            <p className="text-gray-600">Procesando pago...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuestView