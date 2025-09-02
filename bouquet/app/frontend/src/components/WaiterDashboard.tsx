import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  QrCode, 
  Users, 
  Copy, 
  Eye, 
  DollarSign, 
  Wifi, 
  Bell,
  CheckCircle,
  X,
  Activity
} from 'lucide-react'
import { RealTimeOrders, type OrderNotification } from './RealTimeOrders'
import { useWebSocketContext } from '../contexts/WebSocketContext'

export interface TableSession {
  id: string
  table_number: string
  join_code: string
  created_at: string
  participants_count: number
  total_amount: number
  status: 'active' | 'completed' | 'waiting'
  last_activity: string
  recent_orders: OrderItem[]
  notifications: number
}

export interface OrderItem {
  id: string
  participant_name: string
  item_name: string
  price: number
  quantity: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'served'
}

interface WaiterDashboardProps {
  activeTables: TableSession[]
  onTableUpdate: (tables: TableSession[]) => void
  waiterName: string
  restaurantName: string
}

export const WaiterDashboard: React.FC<WaiterDashboardProps> = ({
  activeTables,
  onTableUpdate,
  waiterName,
  restaurantName
}) => {
  const navigate = useNavigate()
  const [showRealTimeOrders, setShowRealTimeOrders] = useState(false)
  const [recentOrdersCount, setRecentOrdersCount] = useState(0)
  
  // WebSocket para actualizaciones en tiempo real
  const { isConnected, messageHistory } = useWebSocketContext()

  // Escuchar eventos de participantes que se unen
  useEffect(() => {
    const latestMessage = messageHistory[messageHistory.length - 1]
    if (latestMessage && latestMessage.type === 'participant_joined') {
      const { participantName, tableName, joinTime, tableCode } = latestMessage.data
      const { tableId } = latestMessage
      
      // Actualizar la mesa correspondiente
      const updatedTables = activeTables.map(table => {
        if (table.id === tableId || table.join_code === tableCode) {
          return {
            ...table,
            participants_count: table.participants_count + 1,
            last_activity: joinTime
          }
        }
        return table
      })
      
      // Si la mesa no existe en activeTables, crear una nueva entrada
      const existingTable = activeTables.find(table => table.id === tableId || table.join_code === tableCode)
      if (!existingTable) {
        const newTable: TableSession = {
          id: tableId,
          table_number: tableName || `Mesa ${tableCode}`,
          join_code: tableCode,
          created_at: joinTime,
          participants_count: 1,
          total_amount: 0,
          status: 'active',
          last_activity: joinTime,
          recent_orders: [],
          notifications: 0
        }
        updatedTables.push(newTable)
      }
      
      onTableUpdate(updatedTables)
      toast.success(`${participantName} se unió a la mesa ${tableName || tableCode}`)
    }
  }, [messageHistory, activeTables, onTableUpdate])

  // Copiar código al portapapeles
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Código copiado al portapapeles')
    } catch (error) {
      toast.error('Error al copiar código')
    }
  }

  // Ver detalles de la mesa
  const viewTable = (tableId: string) => {
    navigate(`/join/${tableId}?waiter=true`)
  }

  // Cerrar mesa
  const closeTable = (tableId: string) => {
    const updatedTables = activeTables.filter(table => table.id !== tableId)
    onTableUpdate(updatedTables)
    toast.success('Mesa cerrada')
  }

  // Marcar pedido como servido
  const markOrderServed = (tableId: string, orderId: string) => {
    const updatedTables = activeTables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          recent_orders: table.recent_orders.map(order => 
            order.id === orderId ? { ...order, status: 'served' as const } : order
          ),
          notifications: Math.max(0, table.notifications - 1)
        }
      }
      return table
    })
    onTableUpdate(updatedTables)
    toast.success('Pedido marcado como servido')
  }

  // Formatear tiempo relativo
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h`
  }

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa'
      case 'waiting': return 'Esperando'
      case 'completed': return 'Completada'
      default: return 'Desconocido'
    }
  }

  // Manejar nuevos pedidos del componente RealTimeOrders
  const handleOrderUpdate = (order: OrderNotification) => {
    // Actualizar contador de pedidos recientes
    setRecentOrdersCount(prev => prev + 1)
    
    // Actualizar la mesa correspondiente
    const updatedTables = activeTables.map(table => {
      if (table.id === order.tableId) {
        const newOrder: OrderItem = {
          id: order.id,
          participant_name: order.participantName,
          item_name: order.itemName,
          price: order.price,
          quantity: order.quantity,
          timestamp: order.timestamp,
          status: order.status
        }
        
        return {
          ...table,
          recent_orders: [...table.recent_orders.slice(-4), newOrder],
          notifications: table.notifications + 1,
          total_amount: table.total_amount + (order.price * order.quantity),
          last_activity: order.timestamp
        }
      }
      return table
    })
    
    onTableUpdate(updatedTables)
  }

  // Calcular estadísticas
  const totalTables = activeTables.length
  const totalParticipants = activeTables.reduce((sum, table) => sum + table.participants_count, 0)
  const totalAmount = activeTables.reduce((sum, table) => sum + table.total_amount, 0)
  const totalNotifications = activeTables.reduce((sum, table) => sum + table.notifications, 0)
  const activeTableIds = activeTables.map(table => table.id)

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dashboard Mesero</h2>
            <p className="text-gray-600">{waiterName} - {restaurantName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-sm ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              <Wifi className="h-4 w-4" />
              <span>{isConnected ? 'En línea' : 'Desconectado'}</span>
            </div>
            {totalNotifications > 0 && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Bell className="h-4 w-4" />
                <span>{totalNotifications} nuevos</span>
              </div>
            )}
            <button
              onClick={() => setShowRealTimeOrders(!showRealTimeOrders)}
              className={`btn btn-outline btn-sm ${
                showRealTimeOrders ? 'bg-primary-50 border-primary-300' : ''
              }`}
            >
              <Activity className="h-4 w-4 mr-1" />
              Tiempo Real
              {recentOrdersCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {recentOrdersCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{totalTables}</div>
            <div className="text-sm text-gray-600">Mesas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalParticipants}</div>
            <div className="text-sm text-gray-600">Comensales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalNotifications}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
        </div>
      </div>

      {/* Panel de pedidos en tiempo real */}
      {showRealTimeOrders && (
        <div className="mb-6">
          <RealTimeOrders
            activeTables={activeTableIds}
            onOrderUpdate={handleOrderUpdate}
          />
        </div>
      )}

      {/* Lista de mesas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Mesas Activas</h3>
          <span className="text-sm text-gray-500">{totalTables} mesas</span>
        </div>
        
        {activeTables.length === 0 ? (
          <div className="card text-center py-8">
            <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mesas activas</h3>
            <p className="text-gray-600">Genera tu primera mesa para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTables.map((table) => (
              <div key={table.id} className="card hover:shadow-md transition-shadow">
                {/* Header de la mesa */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                        <QrCode className="h-5 w-5 text-primary-600" />
                      </div>
                      {table.notifications > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{table.notifications}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{table.table_number}</h4>
                      <p className="text-sm text-gray-500">Código: {table.join_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Hace {formatTimeAgo(table.last_activity)}</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                      {getStatusText(table.status)}
                    </div>
                  </div>
                </div>
                
                {/* Información de la mesa */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{table.participants_count} comensales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>${table.total_amount.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Pedidos recientes */}
                {table.recent_orders.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Pedidos Recientes</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {table.recent_orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                          <div className="flex-1">
                            <span className="font-medium">{order.participant_name}</span>
                            <span className="text-gray-600 ml-2">{order.item_name} x{order.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">${(order.price * order.quantity).toFixed(2)}</span>
                            {order.status === 'pending' && (
                              <button
                                onClick={() => markOrderServed(table.id, order.id)}
                                className="text-green-600 hover:text-green-700"
                                title="Marcar como servido"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {order.status === 'served' && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyCode(table.join_code)}
                    className="btn btn-outline flex-1 text-sm"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </button>
                  <button
                    onClick={() => viewTable(table.id)}
                    className="btn btn-primary flex-1 text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Mesa
                  </button>
                  <button
                    onClick={() => closeTable(table.id)}
                    className="btn btn-outline text-red-600 hover:bg-red-50 px-3"
                    title="Cerrar mesa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WaiterDashboard