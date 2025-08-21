from fastapi import APIRouter, HTTPException
from typing import Optional
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
class TableCreateRequest(BaseModel):
    staff_code: str
    leader_name: str
    table_number: Optional[str] = None
    restaurant_id: str

class Table(BaseModel):
    id: str
    restaurant_id: str
    join_code: str
    leader_name: str
    table_number: Optional[str] = None
    participant_count: int
    status: str
    created_at: str
    expires_at: str

class TableJoinRequest(BaseModel):
    participant_name: str

class TableJoinResponse(BaseModel):
    message: str
    table_id: str
    participant_id: str

@router.post("/tables/", response_model=Table)
async def create_table(request: TableCreateRequest):
    """
    Crear nueva mesa usando código de staff
    """
    try:
        # Usar la función de base de datos para crear la mesa
        response = supabase.rpc(
            "create_table",
            {
                "p_restaurant_id": request.restaurant_id,
                "p_staff_code": request.staff_code,
                "p_leader_name": request.leader_name,
                "p_table_number": request.table_number
            }
        ).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Error al crear la mesa")
        
        result = response.data[0]
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
        
        # Obtener los datos completos de la mesa creada
        table_response = supabase.table("tables").select("*").eq(
            "id", result["table_id"]
        ).single().execute()
        
        if not table_response.data:
            raise HTTPException(status_code=500, detail="Error al obtener datos de la mesa")
        
        return Table(**table_response.data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/tables/join/{join_code}", response_model=Table)
async def find_table_by_join_code(join_code: str):
    """
    Buscar mesa por código de unión
    """
    try:
        # Usar la función de base de datos para buscar la mesa
        response = supabase.rpc(
            "find_table_by_join_code",
            {"p_join_code": join_code.upper()}
        ).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Mesa no encontrada o código inválido")
        
        table_data = response.data[0]
        return Table(**table_data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.post("/tables/join/{join_code}", response_model=TableJoinResponse)
async def join_table(join_code: str, request: TableJoinRequest):
    """
    Unirse a una mesa existente
    """
    try:
        # Primero verificar que la mesa existe
        table_response = supabase.rpc(
            "find_table_by_join_code",
            {"p_join_code": join_code.upper()}
        ).execute()
        
        if not table_response.data or len(table_response.data) == 0:
            raise HTTPException(status_code=404, detail="Mesa no encontrada o código inválido")
        
        table_data = table_response.data[0]
        
        # Aquí podrías agregar lógica para registrar al participante
        # Por ahora, simplemente incrementamos el contador de participantes
        update_response = supabase.table("tables").update({
            "participant_count": table_data["participant_count"] + 1
        }).eq("id", table_data["id"]).execute()
        
        if not update_response.data:
            raise HTTPException(status_code=500, detail="Error al unirse a la mesa")
        
        # Generar ID de participante (en una implementación real, esto sería más sofisticado)
        import uuid
        participant_id = str(uuid.uuid4())
        
        return TableJoinResponse(
            message="Te has unido exitosamente a la mesa",
            table_id=table_data["id"],
            participant_id=participant_id
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/tables/{table_id}", response_model=Table)
async def get_table(table_id: str):
    """
    Obtener información de una mesa específica
    """
    try:
        response = supabase.table("tables").select("*").eq("id", table_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Mesa no encontrada")
        
        return Table(**response.data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.put("/tables/{table_id}/close")
async def close_table(table_id: str):
    """
    Cerrar una mesa
    """
    try:
        # Usar la función de base de datos para cerrar la mesa
        response = supabase.rpc(
            "close_table",
            {"p_table_id": table_id}
        ).execute()
        
        if not response.data or not response.data[0]:
            raise HTTPException(status_code=404, detail="Mesa no encontrada o ya cerrada")
        
        return {"message": "Mesa cerrada exitosamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")