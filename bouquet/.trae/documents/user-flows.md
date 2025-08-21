# Bouquet - Flujos de Usuario

## 📋 Tabla de Contenidos

1. [Flujo del Mesero](#flujo-del-mesero)
2. [Flujo del Cliente](#flujo-del-cliente)
3. [Flujo del Administrador](#flujo-del-administrador)
4. [Casos de Uso Especiales](#casos-de-uso-especiales)
5. [Estados del Sistema](#estados-del-sistema)

## 👨‍🍳 Flujo del Mesero

### Diagrama Principal - Gestión de Mesa

```mermaid
flowchart TD
    A[Mesero llega al trabajo] --> B[Abrir aplicación web]
    B --> C[Pantalla de Login]
    C --> D{¿Credenciales válidas?}
    D -->|No| C
    D -->|Sí| E[Dashboard de Mesas]
    
    E --> F{¿Qué acción?}
    F -->|Nueva mesa| G[Crear Nueva Cuenta]
    F -->|Mesa existente| H[Seleccionar Mesa]
    F -->|Ver resumen| I[Ver Métricas del Día]
    
    G --> J[Ingresar número de mesa]
    J --> K[Confirmar creación]
    K --> L[Mesa creada - Estado: Activa]
    L --> M[Ir a Detalle de Mesa]
    
    H --> M[Detalle de Mesa]
    M --> N{¿Qué hacer en la mesa?}
    N -->|Agregar ítem| O[Formulario Agregar Ítem]
    N -->|Generar QR| P[Generar Código QR]
    N -->|Ver pagos| Q[Monitor de Pagos]
    N -->|Cerrar mesa| R[Proceso de Cierre]
    
    O --> O1[Ingresar nombre del ítem]
    O1 --> O2[Ingresar precio]
    O2 --> O3[Ingresar cantidad]
    O3 --> O4[Agregar notas opcionales]
    O4 --> O5[Guardar ítem]
    O5 --> M
    
    P --> P1[Verificar que hay ítems]
    P1 --> P2{¿Hay ítems en la mesa?}
    P2 -->|No| P3[Mostrar error: Agregar ítems primero]
    P2 -->|Sí| P4[Generar QR único]
    P4 --> P5[Mostrar QR en pantalla]
    P5 --> P6[Opción: Imprimir QR]
    P6 --> M
    P3 --> M
    
    Q --> Q1[Ver lista de ítems]
    Q1 --> Q2[Ver estado de pago por ítem]
    Q2 --> Q3[Ver porcentaje total pagado]
    Q3 --> Q4[Ver clientes que han pagado]
    Q4 --> M
    
    R --> R1{¿Mesa 100% pagada?}
    R1 -->|No| R2[Mostrar error: Pagos pendientes]
    R1 -->|Sí| R3[Confirmar cierre de mesa]
    R3 --> R4[Mesa cerrada - Generar reporte]
    R4 --> E
    R2 --> M
    
    I --> I1[Ver total de mesas del día]
    I1 --> I2[Ver ingresos totales]
    I2 --> I3[Ver mesas activas]
    I3 --> E
```

### Subproceso: Gestión de Ítems

```mermaid
flowchart TD
    A[Mesero en Detalle de Mesa] --> B[Click "Agregar Ítem"]
    B --> C[Formulario de Ítem]
    C --> D[Ingresar nombre]
    D --> E[Ingresar precio]
    E --> F[Seleccionar cantidad]
    F --> G{¿Agregar notas?}
    G -->|Sí| H[Escribir notas especiales]
    G -->|No| I[Guardar ítem]
    H --> I
    I --> J{¿Ítem guardado exitosamente?}
    J -->|Sí| K[Actualizar lista de ítems]
    J -->|No| L[Mostrar error]
    K --> M[Recalcular total de mesa]
    M --> N[Volver a Detalle de Mesa]
    L --> C
    
    N --> O{¿Agregar más ítems?}
    O -->|Sí| B
    O -->|No| P[Continuar con otras acciones]
```

## 📱 Flujo del Cliente

### Diagrama Principal - Experiencia del Comensal

```mermaid
flowchart TD
    A[Cliente en restaurante] --> B[Mesero muestra QR de mesa]
    B --> C[Cliente escanea QR con cámara]
    C --> D{¿QR válido?}
    D -->|No| E[Error: QR inválido o expirado]
    D -->|Sí| F[Cargar PWA en móvil]
    
    F --> G[Pantalla de Bienvenida]
    G --> H[Mostrar logo del restaurante]
    H --> I[Mostrar número de mesa]
    I --> J[Botón "Ver Mi Cuenta"]
    J --> K[Cargar cuenta de la mesa]
    
    K --> L{¿Hay ítems en la mesa?}
    L -->|No| M[Mensaje: La mesa aún no tiene ítems]
    L -->|Sí| N[Lista de ítems con checkboxes]
    
    N --> O[Cliente revisa lista completa]
    O --> P[Cliente selecciona sus ítems]
    P --> Q{¿Seleccionó al menos un ítem?}
    Q -->|No| R[Mensaje: Debe seleccionar al menos un ítem]
    Q -->|Sí| S[Calcular subtotal de ítems seleccionados]
    
    S --> T[Calcular IVA]
    T --> U[Calcular propina sugerida]
    U --> V[Mostrar desglose en barra inferior]
    V --> W[Botón "Proceder al Pago"]
    W --> X[Pantalla de Checkout]
    
    X --> Y[Resumen final de pago]
    Y --> Z[Seleccionar método de pago]
    Z --> AA{¿Qué método?}
    AA -->|Stripe| BB[Formulario de tarjeta Stripe]
    AA -->|MercadoPago| CC[Formulario MercadoPago]
    
    BB --> DD[Ingresar datos de tarjeta]
    CC --> DD
    DD --> EE[Validar datos]
    EE --> FF{¿Datos válidos?}
    FF -->|No| GG[Mostrar errores de validación]
    FF -->|Sí| HH[Procesar pago]
    
    GG --> DD
    HH --> II{¿Pago exitoso?}
    II -->|No| JJ[Mostrar error de pago]
    II -->|Sí| KK[Pantalla de confirmación]
    
    KK --> LL[Mostrar recibo digital]
    LL --> MM[Mostrar número de transacción]
    MM --> NN[Opción: Enviar recibo por email]
    NN --> OO[Mensaje: Gracias por su pago]
    OO --> PP[Opción: Volver a la cuenta]
    
    JJ --> X
    R --> P
    M --> QQ[Botón "Actualizar"]
    QQ --> K
    E --> RR[Contactar al mesero]
```

### Subproceso: Selección de Ítems

```mermaid
flowchart TD
    A[Cliente ve lista de ítems] --> B{¿Ítem tiene cantidad > 1?}
    B -->|Sí| C[Mostrar selector de cantidad]
    B -->|No| D[Checkbox simple]
    
    C --> E[Cliente selecciona cantidad deseada]
    E --> F[Actualizar subtotal en tiempo real]
    D --> F
    
    F --> G{¿Más ítems por seleccionar?}
    G -->|Sí| H[Continuar seleccionando]
    G -->|No| I[Revisar selección final]
    
    H --> A
    I --> J[Mostrar resumen de selección]
    J --> K[Calcular totales]
    K --> L[Habilitar botón de pago]
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
    B --> C[Pago queda en estado "pendiente"]
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

### Caso 3: Mesa con múltiples pagos simultáneos

```mermaid
flowchart TD
    A[Múltiples clientes pagan simultáneamente] --> B[Sistema bloquea ítems seleccionados]
    B --> C[Procesar pagos en paralelo]
    C --> D{¿Conflicto en ítems?}
    D -->|Sí| E[Primer pago exitoso toma el ítem]
    D -->|No| F[Todos los pagos procesan normalmente]
    E --> G[Segundo cliente ve ítem no disponible]
    G --> H[Sugerir seleccionar otros ítems]
    F --> I[Actualizar estado de mesa en tiempo real]
```

## 📊 Estados del Sistema

### Estados de Mesa

```mermaid
stateDiagram-v2
    [*] --> Creada
    Creada --> Activa : Agregar primer ítem
    Activa --> ConQR : Generar QR
    ConQR --> PagoParcial : Cliente paga
    PagoParcial --> PagoParcial : Más pagos
    PagoParcial --> Completada : 100% pagado
    Completada --> Cerrada : Mesero cierra
    Cerrada --> [*]
    
    Activa --> Cancelada : Mesero cancela
    ConQR --> Cancelada : Mesero cancela
    PagoParcial --> Cancelada : Mesero cancela
    Cancelada --> [*]
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

1. **Tiempo de sesión**: Las selecciones de clientes expiran en 30 minutos
2. **Concurrencia**: El sistema maneja múltiples clientes pagando simultáneamente
3. **Recuperación**: Los meseros pueden ver el estado en tiempo real
4. **Notificaciones**: El sistema notifica cambios de estado automáticamente
5. **Backup**: Todos los estados se persisten en la base de datos

## 🔧 Consideraciones Técnicas

* **WebSockets**: Para actualizaciones en tiempo real

* **Estado local**: Mantener estado en localStorage para recuperación

* **Retry logic**: Reintentos automáticos para operaciones críticas

* **Logging**: Registrar todos los cambios de estado para auditoría

