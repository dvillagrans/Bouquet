import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface WebSocketMessage {
  type: 'table_update' | 'new_order' | 'participant_joined' | 'participant_left' | 'order_status_change'
  tableId: string
  data: any
  timestamp: string
}

export interface WebSocketConfig {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export const useWebSocket = (config: WebSocketConfig = {}) => {
  const {
    url = 'ws://localhost:8000/ws',
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError
  } = config

  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([])
  
  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<number | null>(null)
  const messageListeners = useRef<Map<string, (message: WebSocketMessage) => void>>(new Map())

  // Conectar WebSocket
  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus('connecting')
    
    try {
      ws.current = new WebSocket(url)
      
      ws.current.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        if (onConnect) {
          onConnect()
        }
        console.log('WebSocket conectado')
      }
      
      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          setMessageHistory(prev => [...prev.slice(-49), message])
          
          messageListeners.current.forEach((listener, type) => {
            if (message.type === type) {
              listener(message)
            }
          })
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.current.onclose = () => {
        setIsConnected(false)
        setConnectionStatus('disconnected')
        if (onDisconnect) {
          onDisconnect()
        }
        console.log('WebSocket desconectado')
        
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
        setConnectionStatus('error')
        if (onError) {
          onError(error)
        }
        console.error('WebSocket error:', error)
      }
      
    } catch (error) {
      setConnectionStatus('error')
      console.error('Error creating WebSocket:', error)
    }
  }, [url, reconnectInterval, maxReconnectAttempts, onConnect, onDisconnect, onError])

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
    messageListeners.current.set(messageType, callback)
    
    return () => {
      messageListeners.current.delete(messageType)
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
    connect()
    
    return () => {
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

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    messageHistory,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    joinTable,
    leaveTable,
    notifyNewOrder,
    updateOrderStatus
  }
}

export default useWebSocket