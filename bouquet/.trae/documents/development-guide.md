# Bouquet - Guía de Desarrollo

## 📋 Tabla de Contenidos

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Instalación](#instalación)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Variables de Entorno](#variables-de-entorno)
5. [Desarrollo Local](#desarrollo-local)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Flujo de Desarrollo](#flujo-de-desarrollo)
8. [Testing](#testing)
9. [Deployment](#deployment)

## 🛠️ Configuración del Entorno

### Prerrequisitos

- **Node.js**: v18 o superior
- **npm** o **pnpm**: Gestor de paquetes
- **Docker**: Para desarrollo con contenedores (opcional)
- **Git**: Control de versiones

### Herramientas Recomendadas

- **VS Code**: Editor con extensiones de React y TypeScript
- **Postman**: Para testing de APIs
- **Redis Desktop Manager**: Para monitoreo de cache

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/bouquet.git
cd bouquet
```

### 2. Instalar Dependencias

**Frontend:**
```bash
cd app/frontend
npm install
```

**Backend:**
```bash
cd app/backend
npm install
```

### 3. Configuración con Docker (Opcional)

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

## 🗄️ Configuración de Base de Datos

### Supabase Setup

1. **Crear cuenta en Supabase**: [https://supabase.com](https://supabase.com)
2. **Crear nuevo proyecto**
3. **Obtener credenciales**:
   - URL del proyecto
   - Anon key
   - Service role key

### Ejecutar Migraciones

```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Login a Supabase
supabase login

# Inicializar proyecto local
supabase init

# Ejecutar migraciones
supabase db push
```

### Scripts SQL Iniciales

Ejecutar en el SQL Editor de Supabase:

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ejecutar scripts de creación de tablas
-- (Ver technical-architecture.md para DDL completo)
```

## 🔧 Variables de Entorno

### Frontend (.env)

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

### Backend (.env)

```env
# Database
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_KEY=tu_supabase_service_key
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Redis
REDIS_URL=redis://localhost:6379

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx

# App Config
PORT=3001
JWT_SECRET=tu_jwt_secret_muy_seguro
NODE_ENV=development

# QR Config
QR_BASE_URL=http://localhost:5173/table
```

## 🚀 Desarrollo Local

### Iniciar Servicios

**1. Redis (si no usas Docker):**
```bash
# macOS con Homebrew
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server

# Windows con WSL
sudo service redis-server start
```

**2. Backend:**
```bash
cd app/backend
npm run dev
```

**3. Frontend:**
```bash
cd app/frontend
npm run dev
```

### URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Supabase Dashboard**: Tu URL de Supabase

## 📁 Estructura del Proyecto

```
bouquet/
├── app/
│   ├── frontend/                 # React + TypeScript + Vite
│   │   ├── src/
│   │   │   ├── components/       # Componentes reutilizables
│   │   │   ├── pages/           # Páginas principales
│   │   │   ├── hooks/           # Custom hooks
│   │   │   ├── services/        # API calls y servicios
│   │   │   ├── types/           # TypeScript types
│   │   │   ├── utils/           # Utilidades
│   │   │   └── styles/          # Estilos globales
│   │   ├── public/              # Assets estáticos
│   │   └── package.json
│   └── backend/                 # Express + TypeScript
│       ├── src/
│       │   ├── controllers/     # Controladores de rutas
│       │   ├── services/        # Lógica de negocio
│       │   ├── models/          # Modelos de datos
│       │   ├── middleware/      # Middlewares
│       │   ├── routes/          # Definición de rutas
│       │   ├── utils/           # Utilidades
│       │   └── types/           # TypeScript types
│       └── package.json
├── docs/                        # Documentación adicional
├── .trae/documents/            # Documentación del proyecto
├── docker-compose.yml          # Configuración Docker
└── README.md
```

## 🔄 Flujo de Desarrollo

### Branching Strategy

```
main                    # Producción
├── develop            # Desarrollo principal
│   ├── feature/xxx    # Nuevas características
│   ├── bugfix/xxx     # Corrección de bugs
│   └── hotfix/xxx     # Fixes urgentes
```

### Workflow

1. **Crear rama desde develop**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollar y commitear**:
   ```bash
   git add .
   git commit -m "feat: agregar funcionalidad X"
   ```

3. **Push y Pull Request**:
   ```bash
   git push origin feature/nueva-funcionalidad
   # Crear PR en GitHub hacia develop
   ```

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## 🧪 Testing

### Frontend Testing

```bash
cd app/frontend

# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Backend Testing

```bash
cd app/backend

# Ejecutar tests
npm run test

# Tests de integración
npm run test:integration

# Tests con coverage
npm run test:coverage
```

### Testing Manual

**Postman Collection**: Importar `docs/postman-collection.json`

**Flujo de Testing**:
1. Crear mesa como mesero
2. Agregar ítems a la mesa
3. Generar QR
4. Simular cliente escaneando QR
5. Seleccionar ítems y pagar
6. Verificar estado en dashboard del mesero

## 🚢 Deployment

### Producción

**Frontend (Vercel/Netlify)**:
```bash
# Build de producción
cd app/frontend
npm run build

# Deploy automático con git push
git push origin main
```

**Backend (Railway/Heroku)**:
```bash
# Configurar variables de entorno en plataforma
# Deploy automático con git push
git push origin main
```

### Variables de Entorno - Producción

```env
# Frontend
VITE_SUPABASE_URL=tu_supabase_url_prod
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_prod
VITE_API_BASE_URL=https://tu-api-prod.com/api
VITE_APP_ENV=production

# Backend
NODE_ENV=production
PORT=3001
SUPABASE_URL=tu_supabase_url_prod
SUPABASE_SERVICE_KEY=tu_supabase_service_key_prod
STRIPE_SECRET_KEY=sk_live_xxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
REDIS_URL=redis://tu-redis-prod:6379
```

### Monitoreo

- **Logs**: Configurar logging con Winston
- **Métricas**: Implementar health checks
- **Alertas**: Configurar notificaciones de errores

## 🔧 Comandos Útiles

```bash
# Limpiar node_modules
npm run clean

# Reinstalar dependencias
npm run fresh-install

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formateo de código
npm run format

# Build completo
npm run build:all
```

## 📞 Soporte

- **Issues**: Reportar en GitHub Issues
- **Documentación**: Ver `/docs` para más detalles
- **API Docs**: http://localhost:3001/api-docs (Swagger)

---

**¡Happy Coding! 🎉**