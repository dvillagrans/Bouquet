import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

const SimpleWebSocketTest = () => {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
    const [messages, setMessages] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    const addMessage = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setMessages(prev => [...prev.slice(-10), `[${timestamp}] ${msg}`])
    }

    const connectWebSocket = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN || status === 'connecting') {
            return
        }

        setStatus('connecting')
        setError(null)
        addMessage('🔗 Iniciando conexión WebSocket...')

        try {
            const ws = new WebSocket('ws://localhost:8000/ws')
            wsRef.current = ws

            // Timeout de 5 segundos
            const timeout = setTimeout(() => {
                if (ws.readyState === WebSocket.CONNECTING) {
                    addMessage('⏰ Timeout de conexión')
                    ws.close()
                    setStatus('error')
                    setError('Timeout de conexión')
                }
            }, 5000)

            ws.onopen = () => {
                clearTimeout(timeout)
                setStatus('connected')
                addMessage('✅ Conectado exitosamente')

                // Enviar ping inmediatamente
                setTimeout(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        const pingMsg = { type: 'ping', timestamp: new Date().toISOString() }
                        ws.send(JSON.stringify(pingMsg))
                        addMessage('📤 Ping enviado')
                    }
                }, 100)
            }

            ws.onmessage = (event) => {
                addMessage(`📥 Mensaje: ${event.data}`)
            }

            ws.onclose = (event) => {
                clearTimeout(timeout)
                setStatus('disconnected')
                addMessage(`🔌 Desconectado: código ${event.code} - ${event.reason || 'sin razón'}`)

                if (event.code !== 1000) {
                    setError(`Cierre anormal: ${event.code}`)
                }
            }

            ws.onerror = (event) => {
                clearTimeout(timeout)
                addMessage('🚨 Error de WebSocket')
                setError('Error de conexión WebSocket')
                console.error('WebSocket error:', event)
            }

        } catch (error) {
            setStatus('error')
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
            addMessage(`💥 Error al crear WebSocket: ${errorMsg}`)
            setError(errorMsg)
        }
    }

    const disconnect = () => {
        if (wsRef.current) {
            wsRef.current.close(1000, 'Desconexión manual')
            wsRef.current = null
        }
    }

    const sendTestMessage = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const testMsg = {
                type: 'join_session',
                session_id: 'test-123',
                user_type: 'waiter',
                user_id: 'test-user'
            }
            wsRef.current.send(JSON.stringify(testMsg))
            addMessage('📤 Mensaje de prueba enviado')
        }
    }

    const clearMessages = () => {
        setMessages([])
        setError(null)
    }

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [])

    const getStatusBadge = () => {
        switch (status) {
            case 'connected':
                return <Badge variant="default">Conectado</Badge>
            case 'connecting':
                return <Badge variant="secondary">Conectando...</Badge>
            case 'error':
                return <Badge variant="destructive">Error</Badge>
            default:
                return <Badge variant="secondary">Desconectado</Badge>
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        WebSocket Test Simple
                        {getStatusBadge()}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>Error: {error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={connectWebSocket}
                            disabled={status === 'connecting' || status === 'connected'}
                        >
                            Conectar
                        </Button>
                        <Button
                            onClick={disconnect}
                            variant="outline"
                            disabled={status === 'disconnected'}
                        >
                            Desconectar
                        </Button>
                        <Button
                            onClick={sendTestMessage}
                            variant="secondary"
                            disabled={status !== 'connected'}
                        >
                            Enviar Test
                        </Button>
                        <Button onClick={clearMessages} variant="ghost" size="sm">
                            Limpiar
                        </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <div className="text-sm font-mono space-y-1">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 italic">No hay mensajes...</p>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div key={idx}>{msg}</div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="text-xs text-gray-500">
                        Estado actual: {status} | Ready State: {wsRef.current?.readyState ?? 'N/A'}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SimpleWebSocketTest