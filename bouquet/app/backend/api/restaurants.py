from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
from db import get_db
import os
from supabase import create_client, Client

router = APIRouter()

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wigvkfxvdbrkzpelsfgt.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZ3ZrZnh2ZGJya3pwZWxzZmd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTczOTA2NCwiZXhwIjoyMDcxMzE1MDY0fQ.uyktfQNtgpqyx21AMcGZ_xtLy8ujgUAUq5NM7DfsRgk")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Modelos Pydantic
class Restaurant(BaseModel):
    id: str
    slug: str
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    qr_code: Optional[str] = None
    lobby_enabled: bool = True
    created_at: str

class Item(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image: Optional[str] = None
    available: bool = True

@router.get("/restaurants/{slug}", response_model=Restaurant)
async def get_restaurant_by_slug(slug: str):
    """
    Obtener información del restaurante por slug
    """
    try:
        response = supabase.table("restaurants").select("*").eq("slug", slug).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Restaurante no encontrado")
        
        return Restaurant(**response.data)
    
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Restaurante no encontrado")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/restaurants/{slug}/menu", response_model=List[Item])
async def get_restaurant_menu(slug: str):
    """
    Obtener menú del restaurante por slug
    """
    try:
        # Primero verificar que el restaurante existe
        restaurant_response = supabase.table("restaurants").select("id").eq("slug", slug).single().execute()
        
        if not restaurant_response.data:
            raise HTTPException(status_code=404, detail="Restaurante no encontrado")
        
        # Por ahora retornamos un menú de ejemplo
        # En el futuro esto vendría de una tabla 'menu_items' relacionada con el restaurante
        sample_menu = [
            {
                "id": "1",
                "name": "Ensalada César",
                "description": "Lechuga romana, crutones, parmesano y aderezo césar",
                "price": 12.50,
                "category": "Ensaladas",
                "image": "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=caesar%20salad%20fresh%20lettuce%20croutons&image_size=square",
                "available": True
            },
            {
                "id": "2",
                "name": "Pasta Carbonara",
                "description": "Pasta con salsa carbonara, panceta y parmesano",
                "price": 18.00,
                "category": "Pastas",
                "image": "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pasta%20carbonara%20creamy%20sauce%20bacon&image_size=square",
                "available": True
            },
            {
                "id": "3",
                "name": "Salmón a la Parrilla",
                "description": "Salmón fresco con vegetales de temporada",
                "price": 25.00,
                "category": "Pescados",
                "image": "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=grilled%20salmon%20vegetables%20elegant%20plate&image_size=square",
                "available": True
            },
            {
                "id": "4",
                "name": "Tiramisú",
                "description": "Postre italiano tradicional con café y mascarpone",
                "price": 8.50,
                "category": "Postres",
                "image": "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=tiramisu%20dessert%20coffee%20mascarpone&image_size=square",
                "available": True
            }
        ]
        
        return [Item(**item) for item in sample_menu]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/restaurants", response_model=List[Restaurant])
async def get_all_restaurants():
    """
    Obtener todos los restaurantes (para uso administrativo)
    """
    try:
        response = supabase.table("restaurants").select("*").execute()
        return [Restaurant(**restaurant) for restaurant in response.data]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")