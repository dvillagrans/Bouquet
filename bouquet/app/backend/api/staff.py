from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os
from supabase import create_client, Client

router = APIRouter()

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wigvkfxvdbrkzpelsfgt.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZ3ZrZnh2ZGJya3pwZWxzZmd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTczOTA2NCwiZXhwIjoyMDcxMzE1MDY0fQ.uyktfQNtgpqyx21AMcGZ_xtLy8ujgUAUq5NM7DfsRgk")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Modelos Pydantic
class StaffCodeValidationRequest(BaseModel):
    restaurant_id: str
    code: str

class StaffCodeValidationResponse(BaseModel):
    valid: bool
    message: str

class StaffCodeCreateRequest(BaseModel):
    restaurant_id: str
    staff_id: str
    max_uses: Optional[int] = 10
    expires_hours: Optional[int] = 24

class StaffCode(BaseModel):
    id: str
    restaurant_id: str
    code: str
    created_by: str
    expires_at: str
    used_count: int
    max_uses: int
    active: bool
    created_at: str

@router.post("/staff/validate-code", response_model=StaffCodeValidationResponse)
async def validate_staff_code(request: StaffCodeValidationRequest):
    """
    Validar código de staff
    """
    try:
        # Llamar a la función de base de datos para validar el código
        response = supabase.rpc(
            "validate_staff_code",
            {
                "p_restaurant_id": request.restaurant_id,
                "p_code": request.code
            }
        ).execute()
        
        if not response.data or len(response.data) == 0:
            return StaffCodeValidationResponse(
                valid=False,
                message="Error al validar el código"
            )
        
        result = response.data[0]
        return StaffCodeValidationResponse(
            valid=result["valid"],
            message=result["message"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.post("/staff/generate-code", response_model=StaffCode)
async def generate_staff_code(request: StaffCodeCreateRequest):
    """
    Generar nuevo código de staff
    """
    try:
        # Generar código aleatorio de 4-6 dígitos
        import random
        import string
        
        code = ''.join(random.choices(string.digits, k=4))
        
        # Calcular fecha de expiración
        from datetime import datetime, timedelta
        expires_at = datetime.utcnow() + timedelta(hours=request.expires_hours)
        
        # Insertar en la base de datos
        response = supabase.table("staff_codes").insert({
            "restaurant_id": request.restaurant_id,
            "code": code,
            "created_by": request.staff_id,
            "expires_at": expires_at.isoformat(),
            "max_uses": request.max_uses,
            "active": True
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Error al crear el código")
        
        return StaffCode(**response.data[0])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/staff/codes/{restaurant_id}", response_model=List[StaffCode])
async def get_active_staff_codes(restaurant_id: str):
    """
    Obtener códigos de staff activos para un restaurante
    """
    try:
        response = supabase.table("staff_codes").select("*").eq(
            "restaurant_id", restaurant_id
        ).eq(
            "active", True
        ).order(
            "created_at", desc=True
        ).execute()
        
        return [StaffCode(**code) for code in response.data]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.delete("/staff/codes/{code_id}")
async def deactivate_staff_code(code_id: str):
    """
    Desactivar un código de staff
    """
    try:
        response = supabase.table("staff_codes").update({
            "active": False
        }).eq("id", code_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Código no encontrado")
        
        return {"message": "Código desactivado exitosamente"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")