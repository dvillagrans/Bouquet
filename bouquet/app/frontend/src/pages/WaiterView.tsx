import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { sessionApi, handleApiError } from '../lib/api'
import { TableCodeGenerator } from '../components/TableCodeGenerator'
import { WaiterDashboard, type TableSession, type OrderItem } from '../components/WaiterDashboard'
import { ConnectionStatus, ConnectedIndicator } from '../components/ConnectionStatus'
import { useWebSocketContext } from '../contexts/WebSocketContext'
import { Plus, ChefHat, Wifi } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'

const WaiterView = () => {
  const [loading, setLoading] = useState(false)
  const [activeTables, setActiveTables] = useState<TableSession[]>([])
  const [waiterName] = useState('Mesero Demo') // En producción vendría de autenticación
  const [restaurantName] = useState('Café Central') // En producción vendría de autenticación
  const [showCodeGenerator, setShowCodeGenerator] = useState(false)

  // WebSocket context para tiempo real
  const { isConnected, subscribe } = useWebSocketContext()

  // Manejar código generado
  const handleCodeGenerated = async (tableNumber: string) => {
    setLoading(true)
    try {
      // Crear sesión en el backend
      const sessionData = {
        restaurant_name: restaurantName,
        waiter_name: waiterName,
        table_number: tableNumber,
        total_amount: 0.01, // Mínimo valor requerido por validación
        tip_percentage: 15,
        items: [],
        payment_method: 'stripe'
      }

      const session = await sessionApi.create(sessionData)

      // Extraer el código de 6 dígitos del session_id para mostrar
      const displayCode = session.session_id.toUpperCase().slice(-6)

      // Agregar a la lista de mesas activas
      const newTable: TableSession = {
        id: session.session_id,
        table_number: tableNumber,
        join_code: displayCode,
        created_at: session.created_at,
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

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    // Suscribirse a actualizaciones de WebSocket si está disponible
    if (isConnected) {
      const unsubscribeNewOrder = subscribe('new_order', (message) => {
        console.log('Nueva orden recibida:', message)
        // Actualizar estado basado en el mensaje WebSocket
      })

      const unsubscribeTableUpdate = subscribe('table_update', (message) => {
        console.log('Actualización de mesa:', message)
        // Actualizar estado basado en el mensaje WebSocket
      })

      return () => {
        unsubscribeNewOrder()
        unsubscribeTableUpdate()
      }
    }

    // Fallback: simulación sin WebSocket para demostración
    const interval = setInterval(() => {
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
    }, isConnected ? 30000 : 15000) // Menos frecuente si hay WebSocket

    return () => clearInterval(interval)
  }, [isConnected, subscribe])

  return (
    <div className="min-h-screen bg-background">
      {/* Header with restaurant info */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                {restaurantName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Panel de mesero • {waiterName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ConnectedIndicator />
              {isConnected ? (
                <Badge variant="default" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  En línea
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  Sin conexión
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Connection status details */}
        <ConnectionStatus showDetails />

        {/* Nueva mesa section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear Nueva Mesa
            </CardTitle>
            <CardDescription>
              Genera un código QR para que los comensales se unan a una mesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowCodeGenerator(!showCodeGenerator)}
              variant={showCodeGenerator ? "secondary" : "default"}
              size="lg"
              className="w-full"
            >
              <Plus className="mr-2 h-5 w-5" />
              {showCodeGenerator ? 'Ocultar Generador' : 'Generar Nueva Mesa'}
            </Button>
          </CardContent>
        </Card>

        {/* Table code generator */}
        {showCodeGenerator && (
          <div className="mb-6">
            <TableCodeGenerator
              onCodeGenerated={handleCodeGenerated}
              loading={loading}
            />
          </div>
        )}

        <Separator className="my-6" />

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