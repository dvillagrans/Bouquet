from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel, Field
from models.session import Session
from db import get_db
from services.qr import generate_qr_code
from services.calc import calculate_split
import uuid

router = APIRouter()

# Pydantic models para request/response
class SessionCreate(BaseModel):
    restaurant_name: str = Field(..., min_length=1, max_length=255)
    waiter_name: Optional[str] = Field(None, max_length=255)
    table_number: Optional[str] = Field(None, max_length=50)
    total_amount: float = Field(..., gt=0)
    tip_percentage: float = Field(default=0.0, ge=0, le=100)
    items: List[dict] = Field(default=[])
    payment_method: str = Field(default="stripe")

class SessionResponse(BaseModel):
    id: int
    session_id: str
    restaurant_name: str
    waiter_name: Optional[str]
    table_number: Optional[str]
    status: str
    total_amount: float
    tip_percentage: float
    tip_amount: float
    items: List[dict]
    participants: List[dict]
    qr_code: Optional[str]
    join_url: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

class ParticipantJoin(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)

@router.post("/", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Crear nueva sesión de división de cuenta"""
    try:
        # Calcular tip amount
        tip_amount = (session_data.total_amount * session_data.tip_percentage) / 100
        
        # Crear nueva sesión
        new_session = Session(
            restaurant_name=session_data.restaurant_name,
            waiter_name=session_data.waiter_name,
            table_number=session_data.table_number,
            total_amount=session_data.total_amount,
            tip_percentage=session_data.tip_percentage,
            tip_amount=tip_amount,
            items=session_data.items,
            payment_method=session_data.payment_method
        )
        
        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)
        
        # Generar QR code y URL de unión
        join_url = f"http://localhost:5174/join/{new_session.session_id}"
        qr_code = generate_qr_code(join_url)
        
        new_session.join_url = join_url
        new_session.qr_code = qr_code
        
        await db.commit()
        await db.refresh(new_session)
        
        return new_session
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating session: {str(e)}"
        )

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener sesión por ID"""
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID format"
        )
    
    result = await db.execute(
        select(Session).where(Session.session_id == session_uuid)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return session

@router.post("/{session_id}/join")
async def join_session(
    session_id: str,
    participant: ParticipantJoin,
    db: AsyncSession = Depends(get_db)
):
    """Unirse a una sesión como participante"""
    session = await get_session(session_id, db)
    
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active"
        )
    
    # Agregar participante
    new_participant = {
        "id": str(uuid.uuid4()),
        "name": participant.name,
        "email": participant.email,
        "phone": participant.phone,
        "amount_owed": 0.0,
        "items": [],
        "paid": False
    }
    
    session.participants.append(new_participant)
    await db.commit()
    
    return {"message": "Successfully joined session", "participant_id": new_participant["id"]}

@router.put("/{session_id}/calculate")
async def calculate_session_split(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Calcular división de la cuenta"""
    session = await get_session(session_id, db)
    
    if not session.participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No participants in session"
        )
    
    # Calcular división usando el servicio
    updated_participants = calculate_split(
        session.items,
        session.participants,
        session.total_amount,
        session.tip_amount
    )
    
    session.participants = updated_participants
    await db.commit()
    
    return {"message": "Split calculated successfully", "participants": updated_participants}