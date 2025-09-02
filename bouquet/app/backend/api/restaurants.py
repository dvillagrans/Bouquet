from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
from db import get_db
import os

router = APIRouter()

# Configuración de Supabase (opcional)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Inicializar Supabase solo si las credenciales están disponibles
supabase = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("Supabase client initialized successfully")
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        supabase = None
else:
    print("Supabase credentials not found, using local database only")

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
        if supabase:
            response = supabase.table("restaurants").select("*").eq("slug", slug).single().execute()
            
            if not response.data:
                raise HTTPException(status_code=404, detail="Restaurante no encontrado")
            
            return Restaurant(**response.data)
        else:
            # Fallback a datos de demostración
            demo_restaurants = {
                "cafe-central": {
                    "id": "1",
                    "slug": "cafe-central",
                    "name": "Café Central",
                    "description": "Un acogedor café en el centro de la ciudad",
                    "image": "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20cafe%20interior%20warm%20lighting&image_size=landscape_4_3",
                    "qr_code": None,
                    "lobby_enabled": True,
                    "created_at": "2024-01-01T00:00:00Z"
                }
            }
            
            if slug not in demo_restaurants:
                raise HTTPException(status_code=404, detail="Restaurante no encontrado")
            
            return Restaurant(**demo_restaurants[slug])
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/restaurants/{slug}/menu", response_model=List[Item])
async def get_restaurant_menu(slug: str):
    """
    Obtener menú del restaurante por slug
    """
    try:
        # Verificar que el restaurante existe
        if supabase:
            restaurant_response = supabase.table("restaurants").select("id").eq("slug", slug).single().execute()
            
            if not restaurant_response.data:
                raise HTTPException(status_code=404, detail="Restaurante no encontrado")
        else:
            # Para modo demo, solo verificar que el slug sea válido
            valid_slugs = ["cafe-central"]
            if slug not in valid_slugs:
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
        if supabase:
            response = supabase.table("restaurants").select("*").execute()
            return [Restaurant(**restaurant) for restaurant in response.data]
        else:
            # Fallback a datos de demostración
            demo_restaurants = [
                {
                    "id": "1",
                    "slug": "cafe-central",
                    "name": "Café Central",
                    "description": "Un acogedor café en el centro de la ciudad",
                    "image": "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20cafe%20interior%20warm%20lighting&image_size=landscape_4_3",
                    "qr_code": None,
                    "lobby_enabled": True,
                    "created_at": "2024-01-01T00:00:00Z"
                }
            ]
            return [Restaurant(**restaurant) for restaurant in demo_restaurants]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")