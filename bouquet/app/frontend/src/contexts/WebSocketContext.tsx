import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react'

export interface WebSocketMessage {
  type: 'table_update' | 'new_order' | 'participant_joined' | 'participant_left' | 'order_status_change'
  tableId: string
  data: any
  timestamp: string
}

export interface WebSocketContextType {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastMessage: WebSocketMessage | null
  messageHistory: WebSocketMessage[]
  sendMessage: (message: Partial<WebSocketMessage>) => boolean
  subscribe: (messageType: string, callback: (message: WebSocketMessage) => void) => () => void
  joinTable: (tableId: string, role?: 'waiter' | 'customer') => boolean
  leaveTable: (tableId: string) => boolean
  notifyNewOrder: (tableId: string, orderData: any) => boolean
  updateOrderStatus: (tableId: string, orderId: string, status: string) => boolean
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = 'ws://localhost:8000/ws',
  reconnectInterval = 3000,
  maxReconnectAttempts = 3
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([])

  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<number | null>(null)
  const messageListeners = useRef<Map<string, Set<(message: WebSocketMessage) => void>>>(new Map())
  const isConnecting = useRef(false)

  // Conectar WebSocket
  const connect = useCallback(() => {
    if (isConnecting.current || ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    isConnecting.current = true
    setConnectionStatus('connecting')

    try {
      console.log('🔗 Intentando conectar WebSocket a:', url)
      ws.current = new WebSocket(url)

      // Timeout para conexión
      const connectionTimeout = setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CONNECTING) {
          console.warn('⏰ WebSocket timeout - cerrando conexión')
          ws.current?.close()
          isConnecting.current = false
          setConnectionStatus('error')
        }
      }, 5000) // 5 segundos es suficiente

      ws.current.onopen = () => {
        clearTimeout(connectionTimeout)
        isConnecting.current = false
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        console.log('✅ WebSocket conectado exitosamente')

        // Enviar ping de prueba
        try {
          ws.current?.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }))
        } catch (e) {
          console.warn('No se pudo enviar ping inicial:', e)
        }
      }

      ws.current.onmessage = (event) => {
        try {
          console.log('📥 Mensaje WebSocket recibido:', event.data)
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          setMessageHistory(prev => [...prev.slice(-49), message])

          // Notificar a todos los suscriptores del tipo de mensaje
          const listeners = messageListeners.current.get(message.type)
          if (listeners) {
            listeners.forEach(listener => listener(message))
          }

        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.current.onclose = (event) => {
        clearTimeout(connectionTimeout)
        isConnecting.current = false
        setIsConnected(false)
        setConnectionStatus('disconnected')

        console.log(`🔌 WebSocket cerrado: código ${event.code} (${event.reason || 'sin razón'})`)

        // Solo intentar reconectar si no fue un cierre intencional y el servidor puede estar disponible
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const backoffTime = reconnectInterval * Math.pow(2, reconnectAttempts.current - 1)
          console.log(`🔄 Intentando reconectar en ${backoffTime}ms... (${reconnectAttempts.current}/${maxReconnectAttempts})`)

          reconnectTimeout.current = window.setTimeout(() => {
            connect()
          }, backoffTime)
        } else if (event.code !== 1000 && event.code !== 1001) {
          setConnectionStatus('error')
          console.warn('❌ WebSocket: Máximo de intentos alcanzado. Funcionando en modo sin tiempo real.')
        }
      }

      ws.current.onerror = (error) => {
        clearTimeout(connectionTimeout)
        isConnecting.current = false
        console.warn('⚠️ WebSocket error (será manejado por onclose):', error.type)
        // Dejar que onclose maneje el estado y reconexión
      }

    } catch (error) {
      isConnecting.current = false
      setConnectionStatus('error')
      console.error('💥 Error creando WebSocket:', error)
    }
  }, [url, reconnectInterval, maxReconnectAttempts])

  // Desconectar WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = null
    }

    if (ws.current) {
      ws.current.close()
      ws.current = null
    }

    isConnecting.current = false
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  // Enviar mensaje
  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        type: message.type || 'table_update',
        tableId: message.tableId || '',
        data: message.data || {},
        timestamp: new Date().toISOString(),
        ...message
      }

      ws.current.send(JSON.stringify(fullMessage))
      return true
    } else {
      console.warn('WebSocket no está conectado')
      return false
    }
  }, [])

  // Suscribirse a un tipo de mensaje específico
  const subscribe = useCallback((messageType: string, callback: (message: WebSocketMessage) => void) => {
    if (!messageListeners.current.has(messageType)) {
      messageListeners.current.set(messageType, new Set())
    }

    const listeners = messageListeners.current.get(messageType)!
    listeners.add(callback)

    return () => {
      listeners.delete(callback)
      if (listeners.size === 0) {
        messageListeners.current.delete(messageType)
      }
    }
  }, [])

  // Unirse a una mesa específica
  const joinTable = useCallback((tableId: string, role: 'waiter' | 'customer' = 'waiter') => {
    return sendMessage({
      type: 'table_update',
      tableId,
      data: { action: 'join', role }
    })
  }, [sendMessage])

  // Salir de una mesa
  const leaveTable = useCallback((tableId: string) => {
    return sendMessage({
      type: 'table_update',
      tableId,
      data: { action: 'leave' }
    })
  }, [sendMessage])

  // Notificar nuevo pedido
  const notifyNewOrder = useCallback((tableId: string, orderData: any) => {
    return sendMessage({
      type: 'new_order',
      tableId,
      data: orderData
    })
  }, [sendMessage])

  // Actualizar estado de pedido
  const updateOrderStatus = useCallback((tableId: string, orderId: string, status: string) => {
    return sendMessage({
      type: 'order_status_change',
      tableId,
      data: { orderId, status }
    })
  }, [sendMessage])

  // Efecto para conectar automáticamente
  useEffect(() => {
    console.log('WebSocketProvider montado - iniciando conexión única')
    connect()

    return () => {
      console.log('WebSocketProvider desmontado - cerrando conexión')
      disconnect()
    }
  }, [connect, disconnect])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      messageListeners.current.clear()
    }
  }, [])

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionStatus,
    lastMessage,
    messageHistory,
    sendMessage,
    subscribe,
    joinTable,
    leaveTable,
    notifyNewOrder,
    updateOrderStatus
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Hook para usar el contexto WebSocket
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext debe ser usado dentro de un WebSocketProvider')
  }
  return context
}

export default WebSocketContext