import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'

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
  maxReconnectAttempts = 5
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
      ws.current = new WebSocket(url)
      
      ws.current.onopen = () => {
        isConnecting.current = false
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        console.log('WebSocket conectado (contexto compartido)')
      }
      
      ws.current.onmessage = (event) => {
        try {
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
      
      ws.current.onclose = () => {
        isConnecting.current = false
        setIsConnected(false)
        setConnectionStatus('disconnected')
        console.log('WebSocket desconectado (contexto compartido)')
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          console.log(`Intentando reconectar... (${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeout.current = window.setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else {
          setConnectionStatus('error')
          toast.error('No se pudo conectar al servidor en tiempo real')
        }
      }
      
      ws.current.onerror = (error) => {
        isConnecting.current = false
        setConnectionStatus('error')
        console.error('WebSocket error (contexto compartido):', error)
      }
      
    } catch (error) {
      isConnecting.current = false
      setConnectionStatus('error')
      console.error('Error creating WebSocket:', error)
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