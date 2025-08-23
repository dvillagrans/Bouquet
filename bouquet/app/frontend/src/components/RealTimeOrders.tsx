import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useWebSocketContext, type WebSocketMessage } from '../contexts/WebSocketContext'
import { 
  Bell, 
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react'

export interface OrderNotification {
  id: string
  tableId: string
  tableName: string
  participantName: string
  itemName: string
  quantity: number
  price: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'served'
  isNew: boolean
}

interface RealTimeOrdersProps {
  activeTables: string[] // IDs de mesas activas
  onOrderUpdate?: (order: OrderNotification) => void
  className?: string
}

export const RealTimeOrders: React.FC<RealTimeOrdersProps> = ({
  activeTables,
  onOrderUpdate,
  className = ''
}) => {
  const [orders, setOrders] = useState<OrderNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const {
    isConnected,
    connectionStatus,
    subscribe,
    updateOrderStatus,
    joinTable
  } = useWebSocketContext()

  // Efectos para manejar eventos de conexión
  useEffect(() => {
    if (isConnected) {
      toast.success('Conectado al sistema en tiempo real')
      // Unirse a todas las mesas activas
      activeTables.forEach(tableId => {
        joinTable(tableId, 'waiter')
      })
    }
  }, [isConnected, activeTables, joinTable])

  useEffect(() => {
    if (!isConnected && connectionStatus === 'disconnected') {
      toast.warning('Desconectado del sistema en tiempo real')
    }
  }, [isConnected, connectionStatus])

  useEffect(() => {
    if (connectionStatus === 'error') {
      toast.error('Error en la conexión en tiempo real')
    }
  }, [connectionStatus])

  // Manejar nuevos pedidos
  useEffect(() => {
    const unsubscribeNewOrder = subscribe('new_order', (message: WebSocketMessage) => {
      const orderData = message.data
      const newOrder: OrderNotification = {
        id: orderData.orderId || `order-${Date.now()}`,
        tableId: message.tableId,
        tableName: orderData.tableName || `Mesa ${message.tableId.slice(-4)}`,
        participantName: orderData.participantName || 'Cliente',
        itemName: orderData.itemName || 'Item',
        quantity: orderData.quantity || 1,
        price: orderData.price || 0,
        timestamp: message.timestamp,
        status: 'pending',
        isNew: true
      }
      
      setOrders(prev => [newOrder, ...prev.slice(0, 49)]) // Mantener últimos 50
      setUnreadCount(prev => prev + 1)
      onOrderUpdate?.(newOrder)
      
      // Mostrar notificación
      toast.success(
        `Nuevo pedido: ${newOrder.participantName} - ${newOrder.itemName}`,
        {
          description: `${newOrder.tableName} - $${(newOrder.price * newOrder.quantity).toFixed(2)}`,
          action: {
            label: 'Ver',
            onClick: () => setShowNotifications(true)
          }
        }
      )
    })

    const unsubscribeOrderStatus = subscribe('order_status_change', (message: WebSocketMessage) => {
      const { orderId, status } = message.data
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status, isNew: false }
          : order
      ))
    })

    const unsubscribeParticipantJoined = subscribe('participant_joined', (message: WebSocketMessage) => {
      const { participantName, tableName } = message.data
      
      toast.info(
        `${participantName} se unió a ${tableName}`,
        {
          description: 'Nuevo comensal en la mesa'
        }
      )
    })

    return () => {
      unsubscribeNewOrder()
      unsubscribeOrderStatus()
      unsubscribeParticipantJoined()
    }
  }, [subscribe, onOrderUpdate])

  // Unirse a nuevas mesas cuando se agregan
  useEffect(() => {
    if (isConnected) {
      activeTables.forEach(tableId => {
        joinTable(tableId, 'waiter')
      })
    }
  }, [activeTables, isConnected, joinTable])

  // Marcar pedido como confirmado
  const confirmOrder = (order: OrderNotification) => {
    updateOrderStatus(order.tableId, order.id, 'confirmed')
    setOrders(prev => prev.map(o => 
      o.id === order.id 
        ? { ...o, status: 'confirmed', isNew: false }
        : o
    ))
    toast.success('Pedido confirmado')
  }

  // Marcar pedido como servido
  const serveOrder = (order: OrderNotification) => {
    updateOrderStatus(order.tableId, order.id, 'served')
    setOrders(prev => prev.map(o => 
      o.id === order.id 
        ? { ...o, status: 'served', isNew: false }
        : o
    ))
    toast.success('Pedido servido')
  }

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = () => {
    setOrders(prev => prev.map(order => ({ ...order, isNew: false })))
    setUnreadCount(0)
  }

  // Formatear tiempo relativo
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h`
  }

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100'
      case 'confirmed': return 'text-blue-600 bg-blue-100'
      case 'served': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'confirmed': return 'Confirmado'
      case 'served': return 'Servido'
      default: return 'Desconocido'
    }
  }

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const recentOrders = orders.slice(0, 10)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con estado de conexión */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Pedidos en Tiempo Real</h3>
          <div className={`flex items-center gap-1 text-sm ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
        
        {/* Botón de notificaciones */}
        <button
          onClick={() => {
            setShowNotifications(!showNotifications)
            if (!showNotifications) markAllAsRead()
          }}
          className="relative btn btn-outline"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-3">
          <div className="text-xl font-bold text-orange-600">{pendingOrders.length}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xl font-bold text-blue-600">{orders.filter(o => o.status === 'confirmed').length}</div>
          <div className="text-sm text-gray-600">Confirmados</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xl font-bold text-green-600">{orders.filter(o => o.status === 'served').length}</div>
          <div className="text-sm text-gray-600">Servidos</div>
        </div>
      </div>

      {/* Lista de pedidos pendientes */}
      {pendingOrders.length > 0 && (
        <div className="card">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Pedidos Pendientes ({pendingOrders.length})
          </h4>
          <div className="space-y-2">
            {pendingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{order.tableName}</span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">{order.participantName}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {order.itemName} x{order.quantity} - ${(order.price * order.quantity).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">{formatTimeAgo(order.timestamp)}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmOrder(order)}
                    className="btn btn-primary btn-sm"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => serveOrder(order)}
                    className="btn btn-outline btn-sm"
                  >
                    Servir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel de notificaciones */}
      {showNotifications && (
        <div className="card">
          <h4 className="font-semibold text-gray-900 mb-3">Actividad Reciente</h4>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="mx-auto h-8 w-8 mb-2" />
              <p>No hay pedidos recientes</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentOrders.map((order) => (
                <div key={order.id} className={`p-3 rounded-lg border ${
                  order.isNew ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{order.tableName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{formatTimeAgo(order.timestamp)}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{order.participantName}</span> pidió{' '}
                    <span className="font-medium">{order.itemName}</span> x{order.quantity}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${(order.price * order.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estado de conexión detallado */}
      {!isConnected && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">Sin conexión en tiempo real</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Los pedidos no se actualizarán automáticamente. Estado: {connectionStatus}
          </p>
        </div>
      )}
    </div>
  )
}

export default RealTimeOrders