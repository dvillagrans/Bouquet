from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel, Field
from models.session import Session
from db import get_db
import uuid
import requests
import os

router = APIRouter()

# Pydantic models
class PaymentRequest(BaseModel):
    participant_id: str
    amount: float = Field(..., gt=0)
    payment_method: str = Field(default="stripe")
    card_token: Optional[str] = None
    metadata: Optional[dict] = Field(default={})

class PaymentResponse(BaseModel):
    payment_id: str
    status: str
    amount: float
    participant_id: str
    transaction_id: Optional[str] = None
    message: str

@router.post("/{session_id}/pay", response_model=PaymentResponse)
async def process_payment(
    session_id: str,
    payment_data: PaymentRequest,
    db: AsyncSession = Depends(get_db)
):
    """Procesar pago de un participante"""
    try:
        # Validar session_id
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID format"
        )
    
    # Obtener sesión
    result = await db.execute(
        select(Session).where(Session.session_id == session_uuid)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Buscar participante
    participant = None
    for p in session.participants:
        if p.get("id") == payment_data.participant_id:
            participant = p
            break
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    
    if participant.get("paid", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Participant has already paid"
        )
    
    # Validar monto
    expected_amount = participant.get("amount_owed", 0)
    if abs(payment_data.amount - expected_amount) > 0.01:  # Tolerancia de 1 centavo
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount {payment_data.amount} does not match expected amount {expected_amount}"
        )
    
    # Procesar pago según el método
    payment_result = await process_payment_method(
        payment_data.payment_method,
        payment_data.amount,
        payment_data.card_token,
        payment_data.metadata
    )
    
    if payment_result["success"]:
        # Marcar como pagado
        participant["paid"] = True
        participant["payment_id"] = payment_result["payment_id"]
        participant["transaction_id"] = payment_result.get("transaction_id")
        
        # Actualizar sesión
        await db.commit()
        
        return PaymentResponse(
            payment_id=payment_result["payment_id"],
            status="completed",
            amount=payment_data.amount,
            participant_id=payment_data.participant_id,
            transaction_id=payment_result.get("transaction_id"),
            message="Payment processed successfully"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment failed: {payment_result.get('error', 'Unknown error')}"
        )

async def process_payment_method(
    method: str,
    amount: float,
    card_token: Optional[str],
    metadata: dict
) -> dict:
    """Procesar pago según el método seleccionado"""
    
    if method == "stripe":
        return await process_stripe_payment(amount, card_token, metadata)
    elif method == "mock":
        # Método mock para desarrollo
        return {
            "success": True,
            "payment_id": str(uuid.uuid4()),
            "transaction_id": f"mock_{uuid.uuid4().hex[:8]}"
        }
    else:
        return {
            "success": False,
            "error": f"Unsupported payment method: {method}"
        }

async def process_stripe_payment(
    amount: float,
    card_token: Optional[str],
    metadata: dict
) -> dict:
    """Procesar pago con Stripe"""
    try:
        # Aquí iría la integración real con Stripe
        # Por ahora, simulamos el pago
        
        stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe_secret_key:
            return {
                "success": False,
                "error": "Stripe not configured"
            }
        
        # Simulación de llamada a Stripe API
        # En producción, usar stripe.PaymentIntent.create()
        
        return {
            "success": True,
            "payment_id": str(uuid.uuid4()),
            "transaction_id": f"pi_{uuid.uuid4().hex[:24]}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@router.get("/{session_id}/status")
async def get_payment_status(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtener estado de pagos de una sesión"""
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
    
    total_participants = len(session.participants)
    paid_participants = len([p for p in session.participants if p.get("paid", False)])
    total_collected = sum([p.get("amount_owed", 0) for p in session.participants if p.get("paid", False)])
    
    return {
        "session_id": str(session.session_id),
        "total_amount": session.total_amount + session.tip_amount,
        "total_collected": total_collected,
        "total_participants": total_participants,
        "paid_participants": paid_participants,
        "completion_percentage": (paid_participants / total_participants * 100) if total_participants > 0 else 0,
        "all_paid": paid_participants == total_participants and total_participants > 0
    }