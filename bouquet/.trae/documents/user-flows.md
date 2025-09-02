# Bouquet - Flujos de Usuario

## 📋 Tabla de Contenidos

1. [Flujo del Mesero](#flujo-del-mesero)
2. [Flujo del Cliente](#flujo-del-cliente)
3. [Flujo del Administrador](#flujo-del-administrador)
4. [Casos de Uso Especiales](#casos-de-uso-especiales)
5. [Estados del Sistema](#estados-del-sistema)

## 👨‍🍳 Flujo del Mesero

### Diagrama Principal - Flujo Simplificado

```mermaid
flowchart TD
    A[Mesero llega al trabajo] --> B[Abrir aplicación web]
    B --> C[Pantalla de Login]
    C --> D{¿Credenciales válidas?}
    D -->|No| C
    D -->|Sí| E[Dashboard Principal]
    
    E --> F{¿Qué acción?}
    F -->|Generar código de mesa| G[Generar Código]
    F -->|Ver mesas activas| H[Dashboard de Mesas]
    F -->|Ver métricas| I[Ver Métricas del Día]
    
    G --> G1[Click: Generar Código]
    G1 --> G2[Sistema genera código de 6 dígitos]
    G2 --> G3[Mostrar código y QR]
    G3 --> G4[Mesa activa - Esperando clientes]
    G4 --> H
    
    H --> H1[Lista de mesas activas]
    H1 --> H2[Ver detalles de mesa específica]
    H2 --> H3[Monitor en tiempo real]
    H3 --> H4{¿Acción en mesa?}
    H4 -->|Ver pedidos| H5[Lista de ítems pedidos]
    H4 -->|Ver pagos| H6[Estado de pagos]
    H4 -->|Cerrar mesa| H7[Cerrar mesa]
    H4 -->|Volver| H1
    
    H5 --> H8[WebSocket: Actualizaciones automáticas]
    H6 --> H8
    H8 --> H3
    
    H7 --> H9{¿Mesa 100% pagada?}
    H9 -->|No| H10[Error: Pagos pendientes]
    H9 -->|Sí| H11[Confirmar cierre]
    H11 --> H12[Mesa cerrada]
    H12 --> H1
    H10 --> H3
    
    I --> I1[Total de mesas del día]
    I1 --> I2[Ingresos totales]
    I2 --> I3[Mesas activas]
    I3 --> E
```

### Subproceso: Generación de Código de Mesa

```mermaid
flowchart TD
    A[Mesero en Dashboard] --> B[Click: Generar Nueva Mesa]
    B --> C[Sistema genera código único]
    C --> D[Código de 6 dígitos creado]
    D --> E[Generar QR automáticamente]
    E --> F[Mostrar código y QR en pantalla]
    F --> G[Mesa registrada como activa]
    G --> H[WebSocket: Notificar sistema]
    H --> I[Código listo para compartir]
    I --> J{¿Qué hacer?}
    J -->|Mostrar a clientes| K[Clientes escanean QR]
    J -->|Generar otro código| B
    J -->|Ver dashboard| L[Ir a Dashboard de Mesas]
    K --> M[Clientes se conectan a la mesa]
    M --> N[Actualizaciones en tiempo real]
    N --> L
```

## 📱 Flujo del Cliente

### Diagrama Principal - Experiencia del Cliente

```mermaid
flowchart TD
    A[Cliente en restaurante] --> B[Mesero muestra QR de mesa]
    B --> C[Cliente escanea QR con cámara]
    C --> D{¿QR válido?}
    D -->|No| E[Error: QR inválido o expirado]
    D -->|Sí| F[Cargar PWA en móvil]
    
    F --> G[Pantalla de Bienvenida]
    G --> H[Mostrar información del restaurante]
    H --> I[Mostrar código de mesa]
    I --> J[Solicitar autenticación del usuario]
    J --> K{¿Usuario autenticado?}
    K -->|No| L[Registro/Login obligatorio]
    K -->|Sí| M[Acceder al menú digital]
    L --> L1[Ingresar email y nombre]
    L1 --> L2[Verificar email (opcional)]
    L2 --> M
    
    M --> N[WebSocket: Conectar a mesa como participante]
    N --> O[Cargar menú del restaurante por categorías]
    O --> P[Explorar categorías disponibles]
    P --> Q[Seleccionar ítem del menú base]
    Q --> R{¿Ítem tiene modificadores?}
    R -->|Sí| S[Mostrar grupos de modificadores]
    R -->|No| W[Especificar cantidad]
    
    S --> T[Seleccionar modificadores obligatorios]
    T --> U[Seleccionar modificadores opcionales]
    U --> V[Calcular precio con modificadores]
    V --> W
    
    W --> X[Agregar al carrito personal]
    X --> Y[WebSocket: Notificar al mesero y otros participantes]
    
    Y --> Z{¿Continuar pidiendo?}
    Z -->|Sí| P
    Z -->|No| AA[Revisar carrito completo]
    
    AA --> BB[Calcular subtotal con modificadores]
    BB --> CC[Calcular IVA]
    CC --> DD[Calcular propina sugerida]
    DD --> EE[Mostrar desglose total]
    EE --> FF[Botón: Proceder al Pago]
    FF --> GG[Pantalla de Checkout]
    
    Y --> Z[Resumen final de pago]
    Z --> AA[Seleccionar método de pago]
    AA --> BB{¿Qué método?}
    BB -->|Stripe| CC[Formulario de tarjeta Stripe]
    BB -->|MercadoPago| DD[Formulario MercadoPago]
    
    CC --> EE[Ingresar datos de tarjeta]
    DD --> EE
    EE --> FF[Validar datos]
    FF --> GG{¿Datos válidos?}
    GG -->|No| HH[Mostrar errores de validación]
    GG -->|Sí| II[Procesar pago]
    
    HH --> EE
    II --> JJ{¿Pago exitoso?}
    JJ -->|No| KK[Mostrar error de pago]
    JJ -->|Sí| LL[WebSocket: Notificar pago exitoso]
    
    LL --> MM[Pantalla de confirmación]
    MM --> NN[Mostrar recibo digital]
    NN --> OO[Mostrar número de transacción]
    OO --> PP[Opción: Enviar recibo por email]
    PP --> QQ[Mensaje: Gracias por su pago]
    QQ --> RR[Opción: Continuar en la mesa]
    
    KK --> Y
    E --> SS[Contactar al mesero]
    RR --> TT[Seguir conectado para más pedidos]
    TT --> M
```

### Subproceso: Selección de Ítems del Cliente con Modificadores

```mermaid
flowchart TD
    A[Cliente autenticado ve menú] --> B[Explorar categorías del menú]
    B --> C[Seleccionar categoría específica]
    C --> D[Ver ítems base de la categoría]
    D --> E[Seleccionar ítem base del menú]
    
    E --> F{¿Ítem tiene grupos de modificadores?}
    F -->|No| M[Especificar cantidad]
    F -->|Sí| G[Cargar grupos de modificadores]
    
    G --> H[Mostrar modificadores obligatorios]
    H --> I[Seleccionar opciones obligatorias]
    I --> J{¿Hay modificadores opcionales?}
    J -->|Sí| K[Mostrar modificadores opcionales]
    J -->|No| L[Calcular precio final]
    
    K --> K1[Seleccionar modificadores deseados]
    K1 --> L
    
    L --> L1[Precio base + ajustes de modificadores]
    L1 --> M
    
    M --> N[Agregar notas especiales (opcional)]
    N --> O[Confirmar selección]
    O --> P[Guardar en TAB_ITEMS con JSON de modificadores]
    P --> Q[WebSocket: Notificar mesero y participantes]
    Q --> R[Actualizar total de mesa en tiempo real]
    R --> S{¿Continuar pidiendo?}
    S -->|Sí| A
    S -->|No| T[Revisar carrito completo]
    
    T --> U[Ver resumen con modificadores]
    U --> V[Calcular subtotal + IVA + propina]
    V --> W[Habilitar botón de pago]
    W --> X[Proceder al checkout]
```

### Subproceso: Autenticación Obligatoria de Usuario

```mermaid
flowchart TD
    A[Cliente accede vía QR] --> B[Verificar si usuario está autenticado]
    B --> C{¿Usuario ya autenticado?}
    C -->|Sí| D[Continuar al menú]
    C -->|No| E[Mostrar pantalla de autenticación]
    
    E --> F{¿Qué método prefiere?}
    F -->|Email| G[Formulario de registro/login]
    F -->|Google| H[OAuth con Google]
    F -->|Facebook| I[OAuth con Facebook]
    
    G --> G1[Ingresar email]
    G1 --> G2[Ingresar nombre completo]
    G2 --> G3[Validar email formato]
    G3 --> G4{¿Email válido?}
    G4 -->|No| G5[Mostrar error de validación]
    G4 -->|Sí| G6[Crear usuario en base de datos]
    G5 --> G1
    
    H --> H1[Autenticación con Google]
    H1 --> H2[Obtener datos del perfil]
    H2 --> H3[Crear/actualizar usuario]
    
    I --> I1[Autenticación con Facebook]
    I1 --> I2[Obtener datos del perfil]
    I2 --> I3[Crear/actualizar usuario]
    
    G6 --> J[Usuario creado exitosamente]
    H3 --> J
    I3 --> J
    
    J --> K[Crear participante en la mesa]
    K --> L[Asignar user_id al participante]
    L --> M[WebSocket: Notificar nueva conexión]
    M --> D
    
    D --> N[Acceso completo al sistema]
    N --> O[Puede realizar pedidos y pagos]
```

## 👨‍💼 Flujo del Administrador

### Diagrama de Administración

```mermaid
flowchart TD
    A[Administrador] --> B[Login con credenciales admin]
    B --> C{¿Credenciales válidas?}
    C -->|No| B
    C -->|Sí| D[Dashboard Administrativo]
    
    D --> E{¿Qué gestionar?}
    E -->|Métricas| F[Ver Métricas Globales]
    E -->|Configuración| G[Configurar Sistema]
    E -->|Staff| H[Gestionar Personal]
    E -->|Reportes| I[Generar Reportes]
    
    F --> F1[Métricas de uso diario]
    F1 --> F2[Conversiones de pago]
    F2 --> F3[Errores del sistema]
    F3 --> F4[Mesas más activas]
    F4 --> D
    
    G --> G1[Configurar % IVA]
    G1 --> G2[Configurar % propina por defecto]
    G2 --> G3[Configurar métodos de pago]
    G3 --> G4[Guardar configuración]
    G4 --> D
    
    H --> H1[Ver lista de meseros]
    H1 --> H2[Agregar nuevo mesero]
    H2 --> H3[Editar mesero existente]
    H3 --> H4[Desactivar mesero]
    H4 --> D
    
    I --> I1[Reporte de ventas diarias]
    I1 --> I2[Reporte de meseros]
    I2 --> I3[Reporte de métodos de pago]
    I3 --> I4[Exportar reportes]
    I4 --> D
```

## 🔄 Casos de Uso Especiales

### Caso 1: Cliente abandona el pago

```mermaid
flowchart TD
    A[Cliente en proceso de pago] --> B[Cliente cierra aplicación]
    B --> C[Pago queda en estado pendiente]
    C --> D[Sistema mantiene selección por 30 min]
    D --> E{¿Cliente regresa?}
    E -->|Sí| F[Restaurar selección]
    E -->|No| G[Liberar ítems seleccionados]
    F --> H[Continuar con pago]
    G --> I[Ítems disponibles para otros]
```

### Caso 2: Error en el pago

```mermaid
flowchart TD
    A[Cliente procesa pago] --> B[Error en pasarela de pago]
    B --> C[Mostrar mensaje de error específico]
    C --> D{¿Tipo de error?}
    D -->|Tarjeta rechazada| E[Sugerir verificar datos]
    D -->|Error de red| F[Sugerir reintentar]
    D -->|Error del sistema| G[Contactar soporte]
    E --> H[Volver a formulario de pago]
    F --> H
    G --> I[Mostrar información de contacto]
```

### Caso 3: Mesa con múltiples clientes conectados

```mermaid
flowchart TD
    A[Múltiples clientes conectados a la mesa] --> B[WebSocket: Sincronización en tiempo real]
    B --> C[Cada cliente ve pedidos de otros]
    C --> D[Cliente A agrega ítem]
    D --> E[WebSocket: Notificar a todos los clientes]
    E --> F[Actualizar vista de todos instantáneamente]
    F --> G[Cliente B ve nuevo ítem agregado]
    G --> H[Cliente B puede agregar sus propios ítems]
    H --> I[WebSocket: Notificar mesero y otros clientes]
    I --> J[Mesero ve todos los pedidos en tiempo real]
    J --> K[Sistema mantiene sincronización continua]
```

## 📊 Estados del Sistema

### Estados de Mesa

```mermaid
stateDiagram-v2
    [*] --> waiting_customers
    waiting_customers --> active : Primer cliente se conecta
    active --> partial_payment : Cliente realiza pago parcial
    partial_payment --> partial_payment : Más pagos parciales
    partial_payment --> fully_paid : 100% pagado
    fully_paid --> closed : Mesero cierra mesa
    closed --> [*]
    
    waiting_customers --> abandoned : Timeout sin clientes
    active --> abandoned : Timeout sin actividad
    partial_payment --> abandoned : Timeout sin completar
    abandoned --> [*]
```

### Estados de Pago

```mermaid
stateDiagram-v2
    [*] --> Iniciado
    Iniciado --> Procesando : Enviar a pasarela
    Procesando --> Exitoso : Pago aprobado
    Procesando --> Fallido : Pago rechazado
    Procesando --> Error : Error técnico
    
    Exitoso --> [*]
    Fallido --> Reintento : Cliente reintenta
    Error --> Reintento : Cliente reintenta
    Reintento --> Procesando
    
    Fallido --> [*] : Cliente abandona
    Error --> [*] : Cliente abandona
```

### Estados de Ítem

```mermaid
stateDiagram-v2
    [*] --> Disponible
    Disponible --> Seleccionado : Cliente selecciona
    Seleccionado --> Disponible : Cliente deselecciona
    Seleccionado --> Pagado : Pago exitoso
    Pagado --> [*]
    
    Seleccionado --> Disponible : Timeout (30 min)
```

***

## 📝 Notas Importantes

1. **Flujo Simplificado**: El mesero usa códigos de staff temporales para generar mesas, los clientes eligen sus propios ítems del menú estructurado
2. **Autenticación Obligatoria**: Todos los usuarios deben autenticarse antes de realizar pedidos o pagos
3. **Sistema de Menú Completo**: Categorías, ítems base, modificadores y cálculos automáticos de precios
4. **Modificadores Flexibles**: Soporte para modificadores obligatorios y opcionales con ajustes de precio
5. **Estados de Mesa Granulares**: 6 estados (waiting_customers, active, partial_payment, fully_paid, closed, abandoned)
6. **Tiempo Real**: WebSockets mantienen sincronización instantánea entre todos los dispositivos
7. **Concurrencia**: Múltiples clientes autenticados pueden conectarse y pedir simultáneamente
8. **Persistencia**: Todos los pedidos, modificadores y pagos se guardan automáticamente en Supabase
9. **Recuperación**: El sistema mantiene el estado incluso si se pierde la conexión
10. **Notificaciones**: Actualizaciones automáticas para meseros y clientes
11. **Trazabilidad**: Cada pedido está vinculado a un usuario específico para auditoría completa
12. **Validaciones Automáticas**: Constraints de base de datos para integridad de precios y cálculos

## 🔧 Consideraciones Técnicas

* **WebSockets (Supabase Realtime)**: Sincronización instantánea de pedidos, pagos y estado de mesa

* **Base de Datos**: Supabase PostgreSQL con Row Level Security (RLS) para seguridad

* **Estado Reactivo**: Zustand para manejo de estado local con persistencia

* **PWA**: Aplicación web progresiva para experiencia nativa en móviles

* **Códigos QR**: Generación automática de códigos únicos de 6 dígitos

* **Pagos**: Integración con Stripe y MercadoPago para procesamiento seguro

* **Retry Logic**: Reintentos automáticos para operaciones críticas de red

* **Logging**: Auditoría completa de todas las transacciones y cambios de estado

