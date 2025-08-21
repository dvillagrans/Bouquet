# Bouquet - API Contract 📋

## Información General

**Base URL**: `http://localhost:8000/api`  
**Versión**: v1.0  
**Formato**: JSON  
**Autenticación**: No requerida (MVP)  
**Rate Limiting**: 100 requests/minuto por IP  

## Códigos de Estado HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 404 | Not Found | Recurso no encontrado |
| 422 | Unprocessable Entity | Error de validación |
| 500 | Internal Server Error | Error interno del servidor |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

## Modelos de Datos

### Session
```typescript
interface Session {
  id: number
  session_id: string           // UUID único
  restaurant_name: string
  waiter_name?: string
  table_number?: string
  status: 'active' | 'completed' | 'cancelled'
  total_amount: number         // Monto en decimales
  tip_percentage: number       // Porcentaje 0-100
  tip_amount: number          // Calculado automáticamente
  items: Item[]
  participants: Participant[]
  qr_code?: string            // Base64 encoded image
  join_url?: string
  payment_method: string      // 'stripe', 'mock', etc.
  created_at: string          // ISO 8601 timestamp
  updated_at: string          // ISO 8601 timestamp
}
```

### Item
```typescript
interface Item {
  id?: string
  name: string
  price: number               // Precio unitario
  quantity?: number           // Default: 1
  participants?: string[]     // IDs de participantes
}
```

### Participant
```typescript
interface Participant {
  id: string                  // UUID único
  name: string
  email?: string
  phone?: string
  amount_owed: number         // Monto calculado a pagar
  items: ParticipantItem[]    // Items asignados
  paid: boolean               // Estado de pago
  payment_id?: string         // ID del pago procesado
  transaction_id?: string     // ID de transacción externa
  split_method: 'equal' | 'item_based' | 'custom'
}
```

### ParticipantItem
```typescript
interface ParticipantItem {
  name: string
  price: number
  shared_with: number         // Número de personas compartiendo
  individual_cost: number     // Costo individual calculado
}
```

---

## Endpoints de Sesiones

### POST /sessions/
**Descripción**: Crear nueva sesión de división de cuenta

**Request Body**:
```json
{
  "restaurant_name": "Restaurante El Buen Sabor",
  "waiter_name": "Juan Pérez",
  "table_number": "Mesa 5",
  "total_amount": 150.00,
  "tip_percentage": 15.0,
  "items": [
    {
      "name": "Pizza Margherita",
      "price": 25.00,
      "quantity": 2
    },
    {
      "name": "Coca Cola",
      "price": 5.00,
      "quantity": 4
    }
  ],
  "payment_method": "stripe"
}
```

**Response 201**:
```json
{
  "id": 1,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "restaurant_name": "Restaurante El Buen Sabor",
  "waiter_name": "Juan Pérez",
  "table_number": "Mesa 5",
  "status": "active",
  "total_amount": 150.00,
  "tip_percentage": 15.0,
  "tip_amount": 22.50,
  "items": [
    {
      "id": "item_1",
      "name": "Pizza Margherita",
      "price": 25.00,
      "quantity": 2
    }
  ],
  "participants": [],
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "join_url": "http://localhost:5173/join/550e8400-e29b-41d4-a716-446655440000",
  "payment_method": "stripe",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Errores**:
- `400`: Datos inválidos (restaurant_name requerido, total_amount > 0)
- `422`: Error de validación de campos

---

### GET /sessions/{session_id}
**Descripción**: Obtener información de una sesión específica

**Parámetros**:
- `session_id` (path): UUID de la sesión

**Response 200**:
```json
{
  "id": 1,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "restaurant_name": "Restaurante El Buen Sabor",
  "status": "active",
  "total_amount": 150.00,
  "tip_amount": 22.50,
  "participants": [
    {
      "id": "participant_1",
      "name": "María García",
      "email": "maria@email.com",
      "amount_owed": 57.50,
      "paid": false,
      "split_method": "equal"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Errores**:
- `400`: Formato de session_id inválido
- `404`: Sesión no encontrada

---

### POST /sessions/{session_id}/join
**Descripción**: Unirse a una sesión como participante

**Parámetros**:
- `session_id` (path): UUID de la sesión

**Request Body**:
```json
{
  "name": "María García",
  "email": "maria@email.com",
  "phone": "+1234567890"
}
```

**Response 200**:
```json
{
  "message": "Successfully joined session",
  "participant_id": "participant_550e8400-e29b-41d4-a716-446655440001"
}
```

**Errores**:
- `400`: Sesión no activa o nombre requerido
- `404`: Sesión no encontrada

---

### PUT /sessions/{session_id}/calculate
**Descripción**: Calcular división de la cuenta entre participantes

**Parámetros**:
- `session_id` (path): UUID de la sesión

**Response 200**:
```json
{
  "message": "Split calculated successfully",
  "participants": [
    {
      "id": "participant_1",
      "name": "María García",
      "amount_owed": 57.50,
      "split_method": "equal",
      "items": []
    },
    {
      "id": "participant_2",
      "name": "Carlos López",
      "amount_owed": 57.50,
      "split_method": "equal",
      "items": []
    }
  ]
}
```

**Errores**:
- `400`: No hay participantes en la sesión
- `404`: Sesión no encontrada

---

## Endpoints de Pagos

### POST /payments/{session_id}/pay
**Descripción**: Procesar pago de un participante

**Parámetros**:
- `session_id` (path): UUID de la sesión

**Request Body**:
```json
{
  "participant_id": "participant_1",
  "amount": 57.50,
  "payment_method": "stripe",
  "card_token": "tok_1234567890",
  "metadata": {
    "description": "Pago de cuenta dividida"
  }
}
```

**Response 200**:
```json
{
  "payment_id": "pay_550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "amount": 57.50,
  "participant_id": "participant_1",
  "transaction_id": "pi_1234567890abcdef",
  "message": "Payment processed successfully"
}
```

**Errores**:
- `400`: Monto incorrecto, participante ya pagó, o datos de pago inválidos
- `404`: Sesión o participante no encontrado
- `422`: Error en procesamiento de pago

---

### GET /payments/{session_id}/status
**Descripción**: Obtener estado de pagos de una sesión

**Parámetros**:
- `session_id` (path): UUID de la sesión

**Response 200**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_amount": 172.50,
  "total_collected": 115.00,
  "total_participants": 3,
  "paid_participants": 2,
  "completion_percentage": 66.7,
  "all_paid": false
}
```

**Errores**:
- `404`: Sesión no encontrada

---

## Endpoints de Webhooks

### POST /webhooks/stripe
**Descripción**: Webhook para notificaciones de Stripe

**Headers**:
- `stripe-signature`: Firma de verificación de Stripe

**Request Body**: Evento de Stripe en formato JSON

**Response 200**:
```json
{
  "status": "success",
  "message": "Webhook processed"
}
```

**Eventos Soportados**:
- `payment_intent.succeeded`: Pago exitoso
- `payment_intent.payment_failed`: Pago fallido
- `payment_intent.canceled`: Pago cancelado

---

### POST /webhooks/test
**Descripción**: Endpoint de prueba para webhooks

**Response 200**:
```json
{
  "message": "Test webhook received",
  "payload_size": 1024,
  "headers": {
    "content-type": "application/json",
    "user-agent": "Test-Agent/1.0"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Endpoints de Sistema

### GET /
**Descripción**: Información básica de la API

**Response 200**:
```json
{
  "message": "Bouquet API"
}
```

---

### GET /health
**Descripción**: Health check del servicio

**Response 200**:
```json
{
  "status": "healthy"
}
```

---

## Manejo de Errores

### Formato de Error Estándar
```json
{
  "detail": "Descripción del error",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/sessions/invalid-id",
  "request_id": "req_550e8400-e29b-41d4-a716-446655440000"
}
```

### Códigos de Error Específicos

| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Error de validación de datos |
| `SESSION_NOT_FOUND` | Sesión no encontrada |
| `PARTICIPANT_NOT_FOUND` | Participante no encontrado |
| `PAYMENT_FAILED` | Error en procesamiento de pago |
| `SESSION_INACTIVE` | Sesión no está activa |
| `ALREADY_PAID` | Participante ya realizó el pago |
| `AMOUNT_MISMATCH` | Monto de pago no coincide |
| `INVALID_SESSION_ID` | Formato de session_id inválido |

---

## Ejemplos de Uso

### Flujo Completo: Crear Sesión y Procesar Pagos

```bash
# 1. Crear sesión
curl -X POST http://localhost:8000/api/sessions/ \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_name": "Pizzería Mario",
    "waiter_name": "Ana",
    "total_amount": 80.00,
    "tip_percentage": 18.0,
    "items": [
      {"name": "Pizza Grande", "price": 30.00, "quantity": 2},
      {"name": "Bebidas", "price": 20.00, "quantity": 1}
    ]
  }'

# Response: session_id = "abc123..."

# 2. Participante se une
curl -X POST http://localhost:8000/api/sessions/abc123.../join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Martínez",
    "email": "pedro@email.com"
  }'

# 3. Calcular división
curl -X PUT http://localhost:8000/api/sessions/abc123.../calculate

# 4. Procesar pago
curl -X POST http://localhost:8000/api/payments/abc123.../pay \
  -H "Content-Type: application/json" \
  -d '{
    "participant_id": "participant_xyz...",
    "amount": 47.20,
    "payment_method": "mock"
  }'

# 5. Verificar estado
curl http://localhost:8000/api/payments/abc123.../status
```

---

## Consideraciones de Implementación

### Validaciones
- **session_id**: Debe ser UUID válido
- **total_amount**: Debe ser > 0 y <= 10000
- **tip_percentage**: Debe estar entre 0 y 100
- **participant_name**: Mínimo 1 carácter, máximo 100
- **email**: Formato de email válido (opcional)
- **phone**: Formato internacional válido (opcional)

### Límites
- **Participantes por sesión**: Máximo 50
- **Items por sesión**: Máximo 100
- **Duración de sesión**: 24 horas (auto-expiración)
- **Tamaño de request**: Máximo 1MB

### Seguridad
- **Rate limiting**: 100 requests/minuto por IP
- **CORS**: Configurado para dominios permitidos
- **Input sanitization**: Todos los inputs son sanitizados
- **SQL injection**: Protegido via ORM (SQLAlchemy)
- **XSS**: Headers de seguridad configurados

### Performance
- **Cache**: Redis para sesiones activas
- **Database**: Índices en session_id y timestamps
- **Pagination**: Para endpoints que retornan listas
- **Compression**: Gzip habilitado

---

## Versionado de API

### Estrategia
- **URL Versioning**: `/api/v1/`, `/api/v2/`
- **Backward Compatibility**: Mantenida por 12 meses
- **Deprecation**: Notificación 6 meses antes
- **Migration Guide**: Documentación de cambios

### Changelog

#### v1.0 (Actual)
- ✅ CRUD de sesiones
- ✅ Gestión de participantes
- ✅ Cálculo de divisiones
- ✅ Pagos mock
- ✅ Webhooks básicos

#### v1.1 (Próximo)
- 🔄 Integración Stripe real
- 🔄 Autenticación JWT
- 🔄 Paginación en listados
- 🔄 Filtros avanzados

---

## Testing

### Postman Collection
Disponible en: `/docs/postman/bouquet-api.json`

### Swagger/OpenAPI
Documentación interactiva: `http://localhost:8000/docs`

### Ejemplos de Test
```javascript
// Jest/Supertest example
describe('Sessions API', () => {
  test('should create session successfully', async () => {
    const response = await request(app)
      .post('/api/sessions/')
      .send({
        restaurant_name: 'Test Restaurant',
        total_amount: 100.00,
        tip_percentage: 15.0
      })
      .expect(201)
    
    expect(response.body.session_id).toBeDefined()
    expect(response.body.qr_code).toMatch(/^data:image\/png;base64,/)
  })
})
```

---

*Esta documentación se actualiza automáticamente con cada release. Para la versión más reciente, consulta `/docs` en el servidor de desarrollo.*

**Última actualización**: Enero 2024  
**Versión de API**: v1.0  
**Contacto**: dev@bouquet.app