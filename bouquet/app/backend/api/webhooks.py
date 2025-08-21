from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any
from models.session import Session
from db import get_db
import json
import hmac
import hashlib
import os
from datetime import datetime

router = APIRouter()

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Webhook para notificaciones de Stripe"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        # Verificar firma del webhook (en producción)
        endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        if endpoint_secret and sig_header:
            try:
                # Verificar firma de Stripe
                verify_stripe_signature(payload, sig_header, endpoint_secret)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid signature: {str(e)}"
                )
        
        # Parsear evento
        try:
            event = json.loads(payload)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload"
            )
        
        # Procesar evento según tipo
        event_type = event.get('type')
        
        if event_type == 'payment_intent.succeeded':
            await handle_payment_success(event['data']['object'], db)
        elif event_type == 'payment_intent.payment_failed':
            await handle_payment_failure(event['data']['object'], db)
        elif event_type == 'payment_intent.canceled':
            await handle_payment_canceled(event['data']['object'], db)
        else:
            # Evento no manejado, pero no es error
            print(f"Unhandled event type: {event_type}")
        
        return {"status": "success", "message": "Webhook processed"}
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )

def verify_stripe_signature(payload: bytes, sig_header: str, endpoint_secret: str):
    """Verificar firma de webhook de Stripe"""
    elements = sig_header.split(',')
    signature = None
    timestamp = None
    
    for element in elements:
        key, value = element.split('=')
        if key == 'v1':
            signature = value
        elif key == 't':
            timestamp = value
    
    if not signature or not timestamp:
        raise ValueError("Missing signature or timestamp")
    
    # Crear firma esperada
    signed_payload = f"{timestamp}.{payload.decode('utf-8')}"
    expected_signature = hmac.new(
        endpoint_secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        raise ValueError("Signature verification failed")

async def handle_payment_success(
    payment_intent: Dict[str, Any],
    db: AsyncSession
):
    """Manejar pago exitoso"""
    try:
        # Extraer metadatos del payment intent
        metadata = payment_intent.get('metadata', {})
        session_id = metadata.get('session_id')
        participant_id = metadata.get('participant_id')
        
        if not session_id or not participant_id:
            print("Missing session_id or participant_id in payment metadata")
            return
        
        # Buscar sesión
        result = await db.execute(
            select(Session).where(Session.session_id == session_id)
        )
        session = result.scalar_one_or_none()
        
        if not session:
            print(f"Session not found: {session_id}")
            return
        
        # Buscar participante y marcar como pagado
        for participant in session.participants:
            if participant.get('id') == participant_id:
                participant['paid'] = True
                participant['payment_confirmed_at'] = datetime.utcnow().isoformat()
                participant['stripe_payment_intent'] = payment_intent['id']
                break
        
        await db.commit()
        print(f"Payment confirmed for participant {participant_id} in session {session_id}")
        
    except Exception as e:
        print(f"Error handling payment success: {str(e)}")
        await db.rollback()

async def handle_payment_failure(
    payment_intent: Dict[str, Any],
    db: AsyncSession
):
    """Manejar fallo de pago"""
    try:
        metadata = payment_intent.get('metadata', {})
        session_id = metadata.get('session_id')
        participant_id = metadata.get('participant_id')
        
        if not session_id or not participant_id:
            return
        
        # Buscar sesión
        result = await db.execute(
            select(Session).where(Session.session_id == session_id)
        )
        session = result.scalar_one_or_none()
        
        if not session:
            return
        
        # Marcar pago como fallido
        for participant in session.participants:
            if participant.get('id') == participant_id:
                participant['payment_failed'] = True
                participant['payment_failed_at'] = datetime.utcnow().isoformat()
                participant['failure_reason'] = payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')
                break
        
        await db.commit()
        print(f"Payment failed for participant {participant_id} in session {session_id}")
        
    except Exception as e:
        print(f"Error handling payment failure: {str(e)}")
        await db.rollback()

async def handle_payment_canceled(
    payment_intent: Dict[str, Any],
    db: AsyncSession
):
    """Manejar cancelación de pago"""
    try:
        metadata = payment_intent.get('metadata', {})
        session_id = metadata.get('session_id')
        participant_id = metadata.get('participant_id')
        
        if not session_id or not participant_id:
            return
        
        # Buscar sesión
        result = await db.execute(
            select(Session).where(Session.session_id == session_id)
        )
        session = result.scalar_one_or_none()
        
        if not session:
            return
        
        # Marcar pago como cancelado
        for participant in session.participants:
            if participant.get('id') == participant_id:
                participant['payment_canceled'] = True
                participant['payment_canceled_at'] = datetime.utcnow().isoformat()
                break
        
        await db.commit()
        print(f"Payment canceled for participant {participant_id} in session {session_id}")
        
    except Exception as e:
        print(f"Error handling payment cancellation: {str(e)}")
        await db.rollback()

@router.post("/test")
async def test_webhook(
    request: Request
):
    """Endpoint de prueba para webhooks"""
    payload = await request.body()
    headers = dict(request.headers)
    
    return {
        "message": "Test webhook received",
        "payload_size": len(payload),
        "headers": headers,
        "timestamp": datetime.utcnow().isoformat()
    }