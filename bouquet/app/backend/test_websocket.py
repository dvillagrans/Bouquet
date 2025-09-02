#!/usr/bin/env python3
"""
Script de prueba para verificar WebSocket del backend
"""
import asyncio
import websockets
import json
import sys

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    
    try:
        print(f"🔗 Conectando a {uri}...")
        async with websockets.connect(uri) as websocket:
            print("✅ ¡Conexión WebSocket exitosa!")
            
            # Enviar ping
            ping_message = {
                "type": "ping",
                "timestamp": "2024-01-01T00:00:00Z"
            }
            await websocket.send(json.dumps(ping_message))
            print(f"📤 Ping enviado: {ping_message}")
            
            # Esperar respuesta
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                print(f"📥 Respuesta recibida: {response}")
                
                # Enviar mensaje de join_session
                join_message = {
                    "type": "join_session",
                    "session_id": "test-session-123",
                    "user_type": "waiter",
                    "user_id": "test-waiter-1"
                }
                await websocket.send(json.dumps(join_message))
                print(f"📤 Join enviado: {join_message}")
                
                # Esperar respuesta
                response2 = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                print(f"📥 Respuesta join: {response2}")
                
            except asyncio.TimeoutError:
                print("⏰ Timeout esperando respuesta del servidor")
                
    except ConnectionRefusedError:
        print("❌ Conexión rechazada. ¿Está el servidor ejecutándose?")
        return False
    except Exception as e:
        print(f"💥 Error inesperado: {e}")
        return False
    
    print("✅ Prueba WebSocket completada exitosamente")
    return True

if __name__ == "__main__":
    print("🧪 Probando conexión WebSocket...")
    success = asyncio.run(test_websocket())
    sys.exit(0 if success else 1)