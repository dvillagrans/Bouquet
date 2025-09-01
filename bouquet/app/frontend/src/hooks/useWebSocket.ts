import { useEffect } from 'react'
import { useWebSocketContext } from '../contexts/WebSocketContext'

export interface WebSocketConfig {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

// Hook simplificado que usa el contexto compartido
export const useWebSocket = (config: WebSocketConfig = {}) => {
  const {
    onConnect,
    onDisconnect,
    onError
  } = config

  const webSocketContext = useWebSocketContext()

  // Efectos para manejar callbacks de conexión
  useEffect(() => {
    if (webSocketContext.isConnected && onConnect) {
      onConnect()
    }
  }, [webSocketContext.isConnected, onConnect])

  useEffect(() => {
    if (!webSocketContext.isConnected && webSocketContext.connectionStatus === 'disconnected' && onDisconnect) {
      onDisconnect()
    }
  }, [webSocketContext.isConnected, webSocketContext.connectionStatus, onDisconnect])

  useEffect(() => {
    if (webSocketContext.connectionStatus === 'error' && onError) {
      // Crear un evento mock para mantener compatibilidad
      const mockEvent = new Event('error') as any
      onError(mockEvent)
    }
  }, [webSocketContext.connectionStatus, onError])

  // Retornar todas las funciones del contexto
  return {
    isConnected: webSocketContext.isConnected,
    connectionStatus: webSocketContext.connectionStatus,
    lastMessage: webSocketContext.lastMessage,
    messageHistory: webSocketContext.messageHistory,
    sendMessage: webSocketContext.sendMessage,
    subscribe: webSocketContext.subscribe,
    joinTable: webSocketContext.joinTable,
    leaveTable: webSocketContext.leaveTable,
    notifyNewOrder: webSocketContext.notifyNewOrder,
    updateOrderStatus: webSocketContext.updateOrderStatus
  }
}

export default useWebSocket