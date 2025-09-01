// Test simple de WebSocket sin dependencias de UI
const SimpleWSTest = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Prueba Simple WebSocket</h1>
            <p>Esta página carga sin shadcn/ui para evitar conflictos</p>

            <button
                onClick={() => {
                    console.log('=== INICIO PRUEBA WEBSOCKET ===')

                    // Verificar que WebSocket existe
                    if (typeof WebSocket === 'undefined') {
                        console.error('❌ WebSocket no está disponible en este navegador')
                        return
                    }

                    try {
                        console.log('🔗 Creando WebSocket...')
                        const ws = new WebSocket('ws://localhost:8000/ws')

                        console.log('📊 Estado inicial:', ws.readyState)
                        console.log('🌐 URL:', ws.url)

                        ws.onopen = function () {
                            console.log('✅ CONECTADO')
                            console.log('📊 Estado:', ws.readyState)

                            // Enviar ping
                            const ping = { type: 'ping', timestamp: new Date().toISOString() }
                            ws.send(JSON.stringify(ping))
                            console.log('📤 Ping enviado:', ping)
                        }

                        ws.onmessage = function (event) {
                            console.log('📥 Mensaje recibido:', event.data)
                        }

                        ws.onclose = function (event) {
                            console.log('🔌 Conexión cerrada')
                            console.log('📊 Código:', event.code)
                            console.log('📝 Razón:', event.reason)
                            console.log('🧹 Limpio:', event.wasClean)
                        }

                        ws.onerror = function (error) {
                            console.error('🚨 ERROR WebSocket:', error)
                            console.log('📊 Estado en error:', ws.readyState)
                        }

                        // Timeout de seguridad
                        setTimeout(() => {
                            console.log('⏰ Timeout - cerrando conexión de prueba')
                            if (ws.readyState !== WebSocket.CLOSED) {
                                ws.close()
                            }
                        }, 10000)

                    } catch (error) {
                        console.error('💥 Error creando WebSocket:', error)
                    }
                }}
                style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Probar WebSocket (abrir consola F12)
            </button>

            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
                <h3>Instrucciones:</h3>
                <ol>
                    <li>Abre la consola del navegador (F12)</li>
                    <li>Haz clic en el botón de arriba</li>
                    <li>Observa los logs en la consola</li>
                    <li>Reporta cualquier error que veas</li>
                </ol>
            </div>
        </div>
    )
}

export default SimpleWSTest