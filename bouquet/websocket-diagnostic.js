// Script de diagnóstico para WebSocket
// Ejecutar en la consola del navegador para diagnosticar problemas

console.log('🔍 Iniciando diagnóstico WebSocket...')

// Test 1: Verificar conectividad HTTP
console.log('1️⃣ Verificando conectividad HTTP...')
fetch('http://localhost:8000/health')
    .then(response => {
        console.log('✅ HTTP OK:', response.status, response.statusText)
        return response.json()
    })
    .then(data => {
        console.log('📋 Respuesta del servidor:', data)

        // Test 2: Verificar WebSocket
        console.log('2️⃣ Probando WebSocket...')
        testWebSocket()
    })
    .catch(error => {
        console.error('❌ HTTP Error:', error)
        console.log('🔧 Posibles causas:')
        console.log('   - El servidor backend no está ejecutándose')
        console.log('   - Puerto 8000 bloqueado por firewall')
        console.log('   - Problema de red local')
    })

function testWebSocket() {
    const ws = new WebSocket('ws://localhost:8000/ws')
    const startTime = Date.now()

    console.log('🔗 Creando conexión WebSocket...')
    console.log('📍 URL:', ws.url)
    console.log('📊 Estado inicial:', ws.readyState)

    const timeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
            console.warn('⏰ Timeout de conexión (5s)')
            ws.close()
        }
    }, 5000)

    ws.onopen = function (event) {
        clearTimeout(timeout)
        const connectTime = Date.now() - startTime
        console.log(`✅ WebSocket conectado en ${connectTime}ms`)
        console.log('📊 Estado:', ws.readyState)
        console.log('🌐 Protocolo:', ws.protocol || 'ninguno')
        console.log('🔗 URL:', ws.url)

        // Enviar ping
        console.log('📤 Enviando ping...')
        ws.send(JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
        }))
    }

    ws.onmessage = function (event) {
        console.log('📥 Mensaje recibido:', event.data)
        try {
            const data = JSON.parse(event.data)
            console.log('📋 Mensaje parseado:', data)

            if (data.type === 'pong') {
                console.log('🏓 Pong recibido - WebSocket funcionando correctamente')

                // Test de unión a sesión
                console.log('📤 Probando join_session...')
                ws.send(JSON.stringify({
                    type: 'join_session',
                    session_id: 'diagnostic-test',
                    user_type: 'waiter',
                    user_id: 'diagnostic-user'
                }))
            }

            if (data.type === 'joined_session') {
                console.log('🎉 Join session exitoso - Diagnóstico completado')
                console.log('✅ WebSocket completamente funcional')
                ws.close(1000, 'Diagnóstico completado')
            }
        } catch (e) {
            console.warn('⚠️ No se pudo parsear mensaje como JSON:', e)
        }
    }

    ws.onclose = function (event) {
        clearTimeout(timeout)
        console.log('🔌 WebSocket cerrado')
        console.log('📊 Código:', event.code)
        console.log('📝 Razón:', event.reason || 'ninguna')
        console.log('🧹 Limpio:', event.wasClean)

        // Códigos de error comunes
        const errorCodes = {
            1000: 'Cierre normal',
            1001: 'Endpoint desconectándose',
            1002: 'Error de protocolo',
            1003: 'Tipo de datos no soportado',
            1005: 'Sin código de estado',
            1006: 'Conexión cerrada anormalmente',
            1007: 'Datos inconsistentes',
            1008: 'Violación de política',
            1009: 'Mensaje muy grande',
            1010: 'Extensión faltante',
            1011: 'Error interno del servidor',
            1012: 'Servidor reiniciando',
            1013: 'Try again later',
            1014: 'Bad gateway',
            1015: 'TLS handshake failed'
        }

        const description = errorCodes[event.code] || 'Código desconocido'
        console.log('📖 Descripción:', description)

        if (event.code !== 1000) {
            console.log('🔧 Posibles causas del problema:')
            if (event.code === 1006) {
                console.log('   - Red interrumpida')
                console.log('   - Servidor WebSocket no configurado')
                console.log('   - Firewall bloqueando WebSockets')
                console.log('   - Proxy/NAT interfiriendo')
            } else if (event.code === 1002) {
                console.log('   - Error en el protocolo WebSocket')
                console.log('   - Versión de WebSocket incompatible')
            } else if (event.code === 1011) {
                console.log('   - Error interno del servidor')
                console.log('   - Revisar logs del backend')
            }
        }
    }

    ws.onerror = function (error) {
        clearTimeout(timeout)
        console.error('🚨 Error de WebSocket:', error)
        console.log('📊 Estado al error:', ws.readyState)
        console.log('🔧 Posibles causas:')
        console.log('   - CORS mal configurado para WebSockets')
        console.log('   - Servidor no soporta WebSockets')
        console.log('   - Puerto bloqueado')
        console.log('   - SSL/TLS requerido')
    }

    // Monitorear cambios de estado
    const stateMonitor = setInterval(() => {
        const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']
        console.log(`📊 Estado WebSocket: ${states[ws.readyState]} (${ws.readyState})`)

        if (ws.readyState === WebSocket.CLOSED) {
            clearInterval(stateMonitor)
        }
    }, 500)
}

console.log('🏁 Diagnóstico iniciado. Revisa los mensajes arriba.')