import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wifi, WifiOff, Send, Trash2 } from 'lucide-react'

const WebSocketTest = () => {
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
    const [url, setUrl] = useState('ws://localhost:8000/ws')
    const [message, setMessage] = useState('')
    const [logs, setLogs] = useState<string[]>([])

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    }

    const connect = () => {
        try {
            setStatus('connecting')
            log(`Intentando conectar a: ${url}`)

            const websocket = new WebSocket(url)

            websocket.onopen = () => {
                setStatus('connected')
                log('✅ WebSocket conectado exitosamente')
            }

            websocket.onmessage = (event) => {
                log(`📥 Mensaje recibido: ${event.data}`)
                try {
                    const data = JSON.parse(event.data)
                    log(`📋 Mensaje parseado: ${JSON.stringify(data, null, 2)}`)
                } catch (e) {
                    log(`⚠️ No se pudo parsear como JSON`)
                }
            }

            websocket.onclose = (event) => {
                setStatus('disconnected')
                log(`❌ WebSocket cerrado: código ${event.code}, razón: ${event.reason}`)
                setWs(null)
            }

            websocket.onerror = (error) => {
                setStatus('error')
                log(`🚨 Error de WebSocket`)
                console.error('WebSocket error:', error)
            }

            setWs(websocket)

        } catch (error) {
            setStatus('error')
            log(`💥 Error al crear WebSocket: ${(error as Error).message}`)
        }
    }

    const disconnect = () => {
        if (ws) {
            ws.close()
            setWs(null)
        }
    }

    const sendMessage = () => {
        if (ws && ws.readyState === WebSocket.OPEN && message.trim()) {
            ws.send(message)
            log(`📤 Mensaje enviado: ${message}`)
            setMessage('')
        } else {
            log('❌ WebSocket no está conectado o mensaje vacío')
        }
    }

    const sendPing = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const pingMessage = {
                type: 'ping',
                timestamp: new Date().toISOString()
            }
            ws.send(JSON.stringify(pingMessage))
            log(`🏓 Ping enviado`)
        } else {
            log('❌ WebSocket no está conectado')
        }
    }

    const joinSession = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const joinMessage = {
                type: 'join_session',
                session_id: 'test-session-123',
                user_type: 'waiter',
                user_id: 'test-waiter-1'
            }
            ws.send(JSON.stringify(joinMessage))
            log(`🚪 Enviando solicitud para unirse a sesión de prueba`)
        } else {
            log('❌ WebSocket no está conectado')
        }
    }

    const clearLog = () => {
        setLogs([])
    }

    const getStatusBadge = () => {
        switch (status) {
            case 'connected':
                return <Badge variant="success"><Wifi className="h-3 w-3 mr-1" />Conectado</Badge>
            case 'connecting':
                return <Badge variant="warning">Conectando...</Badge>
            case 'error':
                return <Badge variant="error"><WifiOff className="h-3 w-3 mr-1" />Error</Badge>
            default:
                return <Badge variant="secondary"><WifiOff className="h-3 w-3 mr-1" />Desconectado</Badge>
        }
    }

    useEffect(() => {
        log('Componente de prueba WebSocket cargado')
        return () => {
            if (ws) {
                ws.close()
            }
        }
    }, [])

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-5 w-5" />
                        WebSocket Test para Bouquet
                    </CardTitle>
                    <CardDescription>
                        Herramienta de diagnóstico para probar la conexión WebSocket con el backend
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium">Estado:</span>
                        {getStatusBadge()}
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Conexión</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">URL del WebSocket</label>
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="ws://localhost:8000/ws"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={connect}
                                disabled={status === 'connecting' || status === 'connected'}
                                className="flex-1"
                            >
                                Conectar
                            </Button>
                            <Button
                                onClick={disconnect}
                                variant="outline"
                                disabled={status === 'disconnected'}
                                className="flex-1"
                            >
                                Desconectar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mensajes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Mensaje personalizado</label>
                            <div className="flex gap-2">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escribe tu mensaje..."
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <Button onClick={sendMessage} size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={sendPing} variant="outline" size="sm">
                                Enviar Ping
                            </Button>
                            <Button onClick={joinSession} variant="outline" size="sm">
                                Unirse a Sesión Test
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Log de Actividad</CardTitle>
                    <Button onClick={clearLog} variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Limpiar
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 italic">No hay mensajes en el log...</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Alert className="mt-6">
                <AlertDescription>
                    <strong>Instrucciones:</strong>
                    <ol className="list-decimal ml-4 mt-2 space-y-1">
                        <li>Verifica que el backend esté ejecutándose en el puerto 8000</li>
                        <li>Haz clic en "Conectar" para establecer la conexión WebSocket</li>
                        <li>Prueba enviando un ping o uniéndote a una sesión de prueba</li>
                        <li>Observa el log para verificar que los mensajes se envían y reciben correctamente</li>
                    </ol>
                </AlertDescription>
            </Alert>
        </div>
    )
}

export default WebSocketTest