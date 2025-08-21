from sqlalchemy import Column, String, Float, Boolean, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
import uuid

class Session(BaseModel):
    """Modelo para sesiones de división de cuentas"""
    __tablename__ = "sessions"
    
    # ID único de la sesión
    session_id = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, index=True)
    
    # Información del restaurante/mesero
    restaurant_name = Column(String(255), nullable=False)
    waiter_name = Column(String(255), nullable=True)
    table_number = Column(String(50), nullable=True)
    
    # Estado de la sesión
    status = Column(String(50), default="active")  # active, completed, cancelled
    
    # Total de la cuenta
    total_amount = Column(Float, nullable=False)
    tip_percentage = Column(Float, default=0.0)
    tip_amount = Column(Float, default=0.0)
    
    # Items de la cuenta (JSON)
    items = Column(JSON, nullable=False, default=list)
    
    # Participantes y sus divisiones
    participants = Column(JSON, nullable=False, default=list)
    
    # QR Code para que se unan los invitados
    qr_code = Column(Text, nullable=True)
    join_url = Column(String(500), nullable=True)
    
    # Configuración de pagos
    payment_method = Column(String(50), default="stripe")  # stripe, paypal, etc.
    allow_partial_payments = Column(Boolean, default=True)
    
    # Metadatos adicionales
    metadata = Column(JSON, nullable=True, default=dict)
    
    def __repr__(self):
        return f"<Session(session_id={self.session_id}, restaurant={self.restaurant_name}, total={self.total_amount})>"