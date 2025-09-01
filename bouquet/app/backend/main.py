from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import sessions, payments, webhooks, restaurants, staff, tables, websockets
from db import init_db

app = FastAPI(
    title="Bouquet API",
    description="API para dividir cuentas en restaurantes",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
                "http://localhost:5174",  # Frontend Vite dev server
        "http://127.0.0.1:5174",
        "https://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(restaurants.router, prefix="/api", tags=["restaurants"])
app.include_router(staff.router, prefix="/api", tags=["staff"])
app.include_router(tables.router, prefix="/api", tags=["tables"])
app.include_router(websockets.router, tags=["websockets"])

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/")
async def root():
    return {"message": "Bouquet API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)