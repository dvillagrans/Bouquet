from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import logging
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        # Store active connections by session/table ID
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Store connection metadata
        self.connection_info: Dict[WebSocket, Dict] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str = None, user_type: str = "guest", user_id: str = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        # Store connection info
        self.connection_info[websocket] = {
            "session_id": session_id,
            "user_type": user_type,  # "waiter" or "guest"
            "user_id": user_id
        }
        
        # Add to session group if session_id provided
        if session_id:
            if session_id not in self.active_connections:
                self.active_connections[session_id] = []
            self.active_connections[session_id].append(websocket)
            
            logger.info(f"New {user_type} connected to session {session_id}. Total connections: {len(self.active_connections[session_id])}")
            
            # Notify other clients in the session about new connection
            await self.broadcast_to_session(session_id, {
                "type": "user_joined",
                "user_type": user_type,
                "user_id": user_id,
                "timestamp": self._get_timestamp()
            }, exclude=websocket)
        else:
            logger.info(f"New {user_type} connected without session")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        connection_info = self.connection_info.get(websocket, {})
        session_id = connection_info.get("session_id")
        user_type = connection_info.get("user_type")
        user_id = connection_info.get("user_id")
        
        # Remove from session group
        if session_id and session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
                
                # Clean up empty session groups
                if not self.active_connections[session_id]:
                    del self.active_connections[session_id]
                
                logger.info(f"{user_type} disconnected from session {session_id}")
                
                # Notify remaining clients about disconnection
                if session_id in self.active_connections:
                    asyncio.create_task(self.broadcast_to_session(session_id, {
                        "type": "user_left",
                        "user_type": user_type,
                        "user_id": user_id,
                        "timestamp": self._get_timestamp()
                    }))
        
        # Remove connection info
        if websocket in self.connection_info:
            del self.connection_info[websocket]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
    
    async def broadcast_to_session(self, session_id: str, message: dict, exclude: WebSocket = None):
        """Broadcast a message to all connections in a session"""
        if session_id not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[session_id]:
            if connection == exclude:
                continue
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to session {session_id}: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_to_waiters(self, message: dict):
        """Broadcast a message to all waiter connections"""
        disconnected = []
        for websocket, info in self.connection_info.items():
            if info.get("user_type") == "waiter":
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting to waiter: {e}")
                    disconnected.append(websocket)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    def get_session_connections_count(self, session_id: str) -> int:
        """Get the number of active connections for a session"""
        return len(self.active_connections.get(session_id, []))
    
    def _get_timestamp(self):
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()

# Global connection manager instance
manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time communication"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                await handle_websocket_message(websocket, message)
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Internal server error"
                }, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def handle_websocket_message(websocket: WebSocket, message: dict):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    if message_type == "join_session":
        # Client wants to join a specific session/table
        session_id = message.get("session_id")
        user_type = message.get("user_type", "guest")
        user_id = message.get("user_id")
        
        if session_id:
            # Update connection info
            manager.connection_info[websocket].update({
                "session_id": session_id,
                "user_type": user_type,
                "user_id": user_id
            })
            
            # Add to session group
            if session_id not in manager.active_connections:
                manager.active_connections[session_id] = []
            if websocket not in manager.active_connections[session_id]:
                manager.active_connections[session_id].append(websocket)
            
            # Send confirmation
            await manager.send_personal_message({
                "type": "joined_session",
                "session_id": session_id,
                "connections_count": manager.get_session_connections_count(session_id)
            }, websocket)
            
            # Notify others in the session
            await manager.broadcast_to_session(session_id, {
                "type": "user_joined",
                "user_type": user_type,
                "user_id": user_id,
                "connections_count": manager.get_session_connections_count(session_id)
            }, exclude=websocket)
    
    elif message_type == "order_update":
        # Broadcast order updates to session participants
        session_id = manager.connection_info[websocket].get("session_id")
        if session_id:
            await manager.broadcast_to_session(session_id, {
                "type": "order_update",
                "data": message.get("data"),
                "user_id": message.get("user_id"),
                "timestamp": manager._get_timestamp()
            })
    
    elif message_type == "payment_update":
        # Broadcast payment updates
        session_id = manager.connection_info[websocket].get("session_id")
        if session_id:
            await manager.broadcast_to_session(session_id, {
                "type": "payment_update",
                "data": message.get("data"),
                "user_id": message.get("user_id"),
                "timestamp": manager._get_timestamp()
            })
    
    elif message_type == "table_status_update":
        # Broadcast table status updates to waiters
        await manager.broadcast_to_waiters({
            "type": "table_status_update",
            "data": message.get("data"),
            "timestamp": manager._get_timestamp()
        })
    
    elif message_type == "ping":
        # Respond to ping with pong
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": manager._get_timestamp()
        }, websocket)
    
    else:
        # Unknown message type
        await manager.send_personal_message({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, websocket)

# Import asyncio for background tasks