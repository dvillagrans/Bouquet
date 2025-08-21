import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { sessionApi, handleApiError } from '../lib/api'
import { TableCodeGenerator } from '../components/TableCodeGenerator'
import { WaiterDashboard, type TableSession, type OrderItem } from '../components/WaiterDashboard'
import { Plus } from 'lucide-react'

const WaiterView = () => {
  const [loading, setLoading] = useState(false)
  const [activeTables, setActiveTables] = useState<TableSession[]>([])
  const [waiterName] = useState('Mesero Demo') // En producción vendría de autenticación
  const [restaurantName] = useState('Café Central') // En producción vendría de autenticación
  const [showCodeGenerator, setShowCodeGenerator] = useState(false)

  // Manejar código generado
  const handleCodeGenerated = async (code: string, tableNumber: string) => {
    setLoading(true)
    try {
      // Crear sesión simplificada
      const sessionData = {
        restaurant_name: restaurantName,
        waiter_name: waiterName,
        table_number: tableNumber,
        total_amount: 0,
        tip_percentage: 15,
        items: [],
        payment_method: 'stripe'
      }
      
      const session = await sessionApi.create(sessionData)
      
      // Agregar a la lista de mesas activas con datos simulados
      const newTable: TableSession = {
        id: session.session_id,
        table_number: tableNumber,
        join_code: code,
        created_at: new Date().toISOString(),
        participants_count: 0,
        total_amount: 0,
        status: 'active',
        last_activity: new Date().toISOString(),
        recent_orders: [],
        notifications: 0
      }
      
      setActiveTables(prev => [...prev, newTable])
      setShowCodeGenerator(false)
      toast.success(`Mesa creada: ${tableNumber}`)
      
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  // Actualizar mesas
  const handleTableUpdate = (updatedTables: TableSession[]) => {
    setActiveTables(updatedTables)
  }

  // Simular actualizaciones en tiempo real (en producción sería WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular actualizaciones de mesas con pedidos
      setActiveTables(prev => prev.map(table => {
        const shouldAddOrder = Math.random() > 0.8 && table.participants_count > 0
        const newOrder: OrderItem | null = shouldAddOrder ? {
          id: `order-${Date.now()}-${Math.random()}`,
          participant_name: `Cliente ${Math.floor(Math.random() * 4) + 1}`,
          item_name: ['Pizza Margherita', 'Hamburguesa', 'Ensalada César', 'Pasta Alfredo'][Math.floor(Math.random() * 4)],
          price: Math.floor(Math.random() * 20) + 10,
          quantity: Math.floor(Math.random() * 3) + 1,
          timestamp: new Date().toISOString(),
          status: 'pending'
        } : null
        
        return {
          ...table,
          participants_count: Math.max(0, Math.min(8, table.participants_count + Math.floor(Math.random() * 3) - 1)),
          total_amount: table.total_amount + (Math.random() * 5),
          recent_orders: newOrder ? [...table.recent_orders.slice(-4), newOrder] : table.recent_orders,
          notifications: newOrder ? table.notifications + 1 : table.notifications,
          last_activity: newOrder ? new Date().toISOString() : table.last_activity
        }
      }))
    }, 15000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8 safe-top safe-bottom">
      <div className="container-mobile">
        {/* Botón para generar nueva mesa */}
        <div className="mb-6">
          <button
            onClick={() => setShowCodeGenerator(!showCodeGenerator)}
            className="btn btn-primary w-full py-4 text-lg font-semibold"
          >
            <Plus className="mr-2 h-6 w-6" />
            {showCodeGenerator ? 'Ocultar Generador' : 'Generar Nueva Mesa'}
          </button>
        </div>

        {/* Generador de códigos */}
        {showCodeGenerator && (
          <div className="mb-6">
            <TableCodeGenerator
              onCodeGenerated={handleCodeGenerated}
              loading={loading}
            />
          </div>
        )}

        {/* Dashboard principal */}
        <WaiterDashboard
          activeTables={activeTables}
          onTableUpdate={handleTableUpdate}
          waiterName={waiterName}
          restaurantName={restaurantName}
        />
      </div>
    </div>
  )
}

export default WaiterView