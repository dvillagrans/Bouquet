# Bouquet 🧾

Una aplicación web progresiva (PWA) para dividir cuentas de restaurante de manera fácil y rápida entre amigos y familiares.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Creación de Sesiones**: Los meseros pueden crear nuevas sesiones de división de cuenta
- **Unión Fácil**: Los invitados se unen escaneando un código QR o usando un enlace
- **División Inteligente**: Calcula automáticamente cuánto debe pagar cada persona
- **Pagos Simulados**: Sistema de pagos mock para desarrollo y pruebas
- **Tiempo Real**: Actualizaciones en vivo del estado de los pagos

### 📱 PWA (Progressive Web App)
- **Instalable**: Se puede instalar como app nativa en dispositivos móviles
- **Offline**: Funcionalidad básica disponible sin conexión a internet
- **Responsive**: Diseño optimizado para móviles, tablets y desktop
- **Service Worker**: Cache inteligente para mejor rendimiento
- **Push Notifications**: Notificaciones de estado de pagos (futuro)

### 🎨 Interfaz de Usuario
- **Diseño Moderno**: UI limpia y profesional con Tailwind CSS
- **Accesible**: Cumple con estándares de accesibilidad web
- **Intuitiva**: Flujo de usuario simple y directo
- **Animaciones**: Transiciones suaves y feedback visual

## 🏗️ Arquitectura

### Backend (FastAPI)
```
app/backend/
├── main.py              # Aplicación principal FastAPI
├── api/                 # Endpoints de la API
│   ├── sessions.py      # Gestión de sesiones
│   ├── payments.py      # Procesamiento de pagos
│   └── webhooks.py      # Webhooks de pagos
├── models/              # Modelos de base de datos
│   ├── base.py          # Modelo base
│   └── session.py       # Modelo de sesión
├── services/            # Lógica de negocio
│   ├── calc.py          # Cálculos de división
│   └── qr.py            # Generación de códigos QR
├── db.py                # Configuración de base de datos
└── requirements.txt     # Dependencias Python
```

### Frontend (React + Vite)
```
app/frontend/
├── src/
│   ├── pages/           # Páginas principales
│   │   ├── WaiterView.tsx    # Vista del mesero
│   │   ├── GuestView.tsx     # Vista del invitado
│   │   └── SuccessView.tsx   # Vista de éxito
│   ├── lib/
│   │   └── api.ts       # Cliente API y tipos
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Punto de entrada
├── public/              # Archivos estáticos PWA
│   ├── manifest.json    # Manifiesto PWA
│   ├── sw.js           # Service Worker
│   └── offline.html    # Página offline
└── package.json        # Dependencias Node.js
```

## 🛠️ Tecnologías

### Backend
- **FastAPI**: Framework web moderno y rápido para Python
- **SQLAlchemy**: ORM para base de datos
- **PostgreSQL**: Base de datos relacional
- **Pydantic**: Validación de datos
- **QRCode**: Generación de códigos QR
- **Uvicorn**: Servidor ASGI

### Frontend
- **React 18**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para JavaScript
- **Vite**: Herramienta de build rápida
- **Tailwind CSS**: Framework de CSS utilitario
- **React Router**: Enrutamiento del lado del cliente
- **Zustand**: Gestión de estado ligera
- **Axios**: Cliente HTTP
- **Sonner**: Notificaciones toast
- **Lucide React**: Iconos

### PWA
- **Vite PWA Plugin**: Configuración automática de PWA
- **Workbox**: Service Worker y estrategias de cache
- **Web App Manifest**: Configuración de instalación

### DevOps
- **Docker**: Containerización
- **Docker Compose**: Orquestación de servicios
- **Nginx**: Servidor web y proxy reverso
- **PostgreSQL**: Base de datos
- **Redis**: Cache y sesiones

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- Python 3.11+
- Docker y Docker Compose
- pnpm (recomendado) o npm

### Desarrollo Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd bouquet
```

2. **Configurar Backend**
```bash
cd app/backend
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor de desarrollo
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. **Configurar Frontend**
```bash
cd app/frontend
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

### Desarrollo con Docker

1. **Desarrollo completo**
```bash
docker-compose --profile dev up
```

2. **Solo servicios de base de datos**
```bash
docker-compose up postgres redis
```

### Producción

```bash
# Construir y ejecutar en producción
docker-compose --profile prod up -d

# Con monitoreo
docker-compose --profile prod --profile monitoring up -d
```

## 📱 Uso de la Aplicación

### Para Meseros
1. Accede a `/waiter` o la página principal
2. Completa la información del restaurante
3. Agrega los items de la cuenta (opcional)
4. Establece el total y porcentaje de propina
5. Crea la sesión y comparte el código QR

### Para Invitados
1. Escanea el código QR o usa el enlace compartido
2. Ingresa tu nombre y información de contacto
3. Únete a la sesión
4. Espera a que se calcule la división
5. Realiza tu pago cuando esté listo

### Flujo de División
1. **Creación**: El mesero crea una nueva sesión
2. **Unión**: Los invitados se unen usando QR o enlace
3. **Cálculo**: Se calcula automáticamente la división
4. **Pago**: Cada participante paga su parte
5. **Confirmación**: Se muestra el recibo final

## 🔧 Configuración

### Variables de Entorno

**Backend (.env)**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/bouquet
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000/api
VITE_ENVIRONMENT=development
```

### Base de Datos

La aplicación usa PostgreSQL con las siguientes tablas principales:
- `sessions`: Información de sesiones de división
- `participants`: Participantes en cada sesión (JSON)
- `items`: Items de la cuenta (JSON)

## 🧪 Testing

### Backend
```bash
cd app/backend
pytest
```

### Frontend
```bash
cd app/frontend
pnpm run test
```

### E2E Testing
```bash
pnpm run test:e2e
```

## 📦 Deployment

### Vercel (Frontend)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Railway/Heroku (Backend)
1. Configura las variables de entorno
2. Conecta la base de datos PostgreSQL
3. Deploy usando Docker o buildpack

### Docker (Completo)
```bash
# Producción con Docker
docker-compose --profile prod up -d
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **Backend**: Sigue PEP 8 y usa Black para formateo
- **Frontend**: Usa ESLint y Prettier
- **Commits**: Usa Conventional Commits
- **Testing**: Mantén cobertura > 80%

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: Ver `/docs` para documentación detallada
- **Issues**: Reporta bugs en GitHub Issues
- **Discusiones**: Usa GitHub Discussions para preguntas

## 🗺️ Roadmap

Ver `docs/roadmap.md` para el plan de desarrollo futuro.

## 📊 API Documentation

Ver `docs/api-contract.md` para documentación completa de la API.

---

**Bouquet** - Dividir cuentas nunca fue tan fácil 🎉