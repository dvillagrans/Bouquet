# Manual de Instalación

## 1. Objetivo
Este manual describe los pasos para preparar el entorno, instalar dependencias y desplegar el sistema de gestión de mesas, órdenes y pagos.

## 2. Requisitos previos
- Sistema operativo Linux, macOS o Windows.
- Node.js LTS y npm.
- Base de datos PostgreSQL (o instancia administrada compatible).
- Cuenta/configuración de servicios externos necesarios (por ejemplo, autenticación y pagos).

## 3. Variables de entorno
Definir un archivo `.env` con las variables requeridas por el proyecto.

Variables típicas:
- URL de base de datos.
- Llaves de servicios backend.
- Credenciales o llaves públicas/secretas de pasarela de pago.
- URL base de la aplicación.

## 4. Instalación de dependencias
```bash
npm install
```

## 5. Configuración de base de datos
1. Validar conexión a la base de datos.
2. Ejecutar migraciones de esquema.
3. (Opcional) Cargar datos semilla para pruebas.

## 6. Ejecución en entorno de desarrollo
```bash
npm run dev
```

## 7. Construcción para producción
```bash
npm run build
npm start
```

## 8. Verificación de instalación
- Acceso a la pantalla principal.
- Consulta de menú en flujo de comensal.
- Visualización de módulos por rol (si aplica).
- Conexión correcta a base de datos.

## 9. Solución de problemas comunes
- Error de conexión a base de datos: verificar cadena de conexión y puertos.
- Variables no definidas: validar archivo `.env`.
- Fallas de compilación: revisar versión de Node.js y dependencias.

## 10. Consideraciones de despliegue
- Configurar HTTPS.
- Resguardar secretos fuera del repositorio.
- Habilitar monitoreo y respaldos de base de datos.
