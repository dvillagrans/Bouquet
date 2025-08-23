from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import logging

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
                await connection.send_text(json.dumps(message)