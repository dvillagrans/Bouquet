const DiagnosticPage = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🔧 Diagnóstico WebSocket - Página Simple</h1>
            <p>Si puedes ver esta página, el enrutamiento funciona.</p>

            <div style={{ margin: '20px 0', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <h3>Información del Navegador:</h3>
                <p><strong>URL actual:</strong> {window.location.href}</p>
                <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                <p><strong>WebSocket disponible:</strong> {typeof WebSocket !== 'undefined' ? '✅ Sí' : '❌ No'}</p>
            </div>

            <button
                onClick={() => {
                    console.log('Probando WebSocket básico...')
                    try {
                        const ws = new WebSocket('ws://localhost:8000/ws')
                        console.log('WebSocket creado:', ws)
                        console.log('Estado inicial:', ws.readyState)

                        ws.onopen = () => console.log('✅ WebSocket abierto')
                        ws.onclose = (e) => console.log('🔌 WebSocket cerrado:', e.code, e.reason)
                        ws.onerror = (e) => console.log('🚨 WebSocket error:', e)

                        setTimeout(() => {
                            console.log('Estado después de 2s:', ws.readyState)
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ type: 'ping' }))
                                console.log('Ping enviado')
                            }
                        }, 2000)

                    } catch (error) {
                        console.error('Error creando WebSocket:', error)
                    }
                }}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Probar WebSocket (ver consola)
            </button>

            <div style={{ marginTop: '20px' }}>
                <h3>Instrucciones:</h3>
                <ol>
                    <li>Abre las herramientas de desarrollador (F12)</li>
                    <li>Ve a la pestaña "Console"</li>
                    <li>Haz clic en el botón "Probar WebSocket"</li>
                    <li>Observa los mensajes en la consola</li>
                </ol>
            </div>
        </div>
    )
}

export default DiagnosticPage