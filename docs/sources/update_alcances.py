import re

file_path = r"C:\Users\dvill\Downloads\Bouquet\docs\sources\sections\01_1_alcances_y_limitaciones.tex"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace Tab 1
tab1_start = r"AL-01 & \textbf{Gesti\'on de estructura"
tab1_end = r"AL-16 & \textbf{Dashboard Administrativo de Inteligencia de Negocio.} Visualizaci\'on de m\'etricas avanzadas (velocidad de venta, ingresos por zona, saturaci\'on de estaciones) extra\'idas del entorno OLAP en el VPS y despliegue en Vercel + Supabase con ambientes Prod y Preview separados. \\"

new_tab1 = r"""AL-01 & \textbf{Modelo de Base de Datos Transaccional.} Dise\~no e implementaci\'on de un modelo relacional en PostgreSQL para representar la operaci\'on restaurantera, incluyendo estructura organizacional, usuarios, mesas, sesiones, comensales, cat\'alogo, \'ordenes, estados de cocina, liquidaciones internas y eventos auditables, garantizando integridad referencial y trazabilidad de datos. \\
\rowcolor{altrow}
AL-02 & \textbf{Estructura Organizacional Jer\'arquica.} Creaci\'on y administraci\'on de los tres niveles: Cadena, Zona y Sucursal, con integridad referencial y herencia de configuraciones (moneda, impuestos, propinas). \\
AL-03 & \textbf{Gobernanza de Datos y RBAC.} Matriz de permisos detallada por rol (Admin Cadena, Gerente Zona, Gerente Sucursal, Mesero, Cocina/Chef y Comensal), con pol\'iticas de seguridad a nivel de fila (RLS) en Supabase seg\'un el nivel organizacional y alcance operativo correspondiente. \\
\rowcolor{altrow}
AL-04 & \textbf{Seguridad de Identidad y Contrase\~nas.} Alta de colaboradores con generaci\'on de contrase\~na temporal y flujo obligatorio de cambio en el primer inicio de sesi\'on (\texttt{isFirstLogin}). \\
AL-05 & \textbf{Cat\'alogo de Men\'u Multinivel.} Gesti\'on de \textit{Templates} a nivel de cadena para estandarizaci\'on y men\'us locales por sucursal con categor\'ias, productos, variantes y modificadores. \\
\rowcolor{altrow}
AL-06 & \textbf{Gesti\'on de Mesas y Floor Map.} Representaci\'on visual del sal\'on mediante coordenadas $X, Y$ y formas geom\'etricas (\texttt{rect}, \texttt{circle}); visualizaci\'on en tiempo real del estatus ocupacional. \\
AL-07 & \textbf{Mesa Virtual y Seguridad QR.} Generaci\'on de c\'odigos QR asociados a mesas f\'isicas mediante enlaces firmados con HMAC-SHA256, con validaci\'on del identificador de mesa y control de acceso a sesiones activas. El acceso de los comensales se restringe mediante la mesa virtual activa, la clave de acceso y el estado operativo de la sesi\'on. \\
\rowcolor{altrow}
AL-08 & \textbf{Interacci\'on Colaborativa de Comensales.} Flujo de uni\'on de comensales (\textit{Guests}) a una sesi\'on mediante clave de acceso; soporte para \'ordenes simult\'aneas sobre una misma mesa compartida. \\
AL-09 & \textbf{\'Ordenes con Integridad Hist\'orica.} Captura de \'ordenes individuales y compartidas con generaci\'on de \textit{snapshots} inmutables de nombre y precio para evitar inconsistencias por cambios futuros en el cat\'alogo. \\
\rowcolor{altrow}
AL-10 & \textbf{Personalizaci\'on de Productos y Modificadores.} Soporte para grupos de modificadores (\textit{Extras}, \textit{T\'erminos}) con reglas de sele\'ccion m\'inima/m\'axima y ajustes de precio autom\'aticos. \\
AL-11 & \textbf{Cocina Digital y KDS.} Enrutamiento de comandas por estaciones de preparaci\'on; tablero en tiempo real con historial de transiciones de estado para m\'etricas de desempe\~no. \\
\rowcolor{altrow}
AL-12 & \textbf{Divisi\'on de Cuenta Flexible.} C\'alculo del desglose de consumo por comensal, productos compartidos y total de mesa, permitiendo identificar montos individuales, aportaciones a cuenta compartida y saldo pendiente sin procesar cobros bancarios reales. \\
AL-13 & \textbf{Liquidaci\'on Interna.} Registro del estado de liquidaci\'on de cuentas individuales y compartidas, captura de aportaciones realizadas por los comensales, aplicaci\'on de descuentos autorizados y validaci\'on del monto pendiente con base en los consumos registrados. No se procesan transacciones bancarias reales ni se integran agregadores de pago en la versi\'on 1.0. \\
\rowcolor{altrow}
AL-14 & \textbf{Control de Concurrencia Transaccional.} Implementaci\'on de mecanismos de bloqueo transaccional, como \texttt{SELECT FOR UPDATE}, para prevenir registros duplicados o inconsistentes durante aportaciones simult\'aneas y asegurar la actualizaci\'on correcta del estado de liquidaci\'on de la mesa. \\
AL-15 & \textbf{Trazabilidad y Auditor\'ia.} Registro de operaciones administrativas y eventos cr\'iticos mediante una tabla de auditor\'ia que almacene usuario actor, fecha, acci\'on realizada, entidad afectada, direcci\'on IP, agente de usuario y estado previo/posterior cuando aplique. \\
\rowcolor{altrow}
AL-16 & \textbf{Pipeline Anal\'itico Apache Spark.} Implementaci\'on de jobs batch para extraer datos transaccionales, almacenarlos en capa Bronze, limpiarlos y normalizarlos en capa Silver, y generar agregados anal\'iticos en capa Gold para el c\'alculo de indicadores operativos y de negocio. \\
AL-17 & \textbf{Dashboard Administrativo de BI.} Visualizaci\'on de m\'etricas anal\'iticas generadas a partir de las capas Gold del pipeline, incluyendo ventas por sucursal, productos m\'as consumidos, tiempos de atenci\'on, actividad por mesa y estimaciones exploratorias de demanda, con filtros seg\'un el nivel organizacional del usuario. \\
\rowcolor{altrow}
AL-18 & \textbf{Trazabilidad Anal\'itica de Datos.} Documentaci\'on y validaci\'on del flujo de datos desde los registros transaccionales generados por la operaci\'on hasta las capas Bronze, Silver y Gold, asegurando que las m\'etricas del dashboard puedan relacionarse con su origen en la base de datos. \\"""

idx1 = text.find(r"AL-01 & \textbf{Gesti\'on de estructura")
if idx1 == -1:
    print("Failed to find tab 1 start")
idx2 = text.find(tab1_end) + len(tab1_end)
text = text[:idx1] + new_tab1 + text[idx2:]

tab2_start = r"LM-01 & Múltiples pisos"
tab2_end = r"de lineamientos de seguridad aplicables, como PCI~DSS. \\"

new_tab2 = r"""LM-01 & Múltiples pisos o áreas por sucursal &
  Requiere modelo de datos y plano de planta más complejo. Pospuesto para versión futura. \\
\rowcolor{altrow}
LM-02 & Recuperación de contraseña de usuarios colaboradores &
  El restablecimiento se gestiona manualmente por el usuario con permisos de alta. Se incluirá en v1.1. \\
LM-03 & Motor de recomendaciones complejo &
  Requiere integraci\'on de modelos de grafos o filtrado colaborativo avanzado. Pospuesto para versiones posteriores. \\
\rowcolor{altrow}
LM-04 & Modelos predictivos avanzados de aprendizaje autom\'atico &
  La versi\'on 1.0 contempla estimaciones exploratorias de demanda y an\'alisis descriptivo
  sobre datos hist\'oricos o simulados, pero no incluye modelos avanzados de machine
  learning, redes neuronales ni sistemas predictivos complejos. \\
LM-05 & Gestión de inventario en cocina &
  La disponibilidad de productos se gestiona manualmente activando o desactivando ítems en el catálogo. \\
\rowcolor{altrow}
LM-06 & Reservaciones y pre-orden de mesas &
  La activación de la mesa virtual ocurre únicamente cuando el comensal está físicamente en el restaurante. \\
LM-07 & Aplicación móvil nativa (iOS / Android) &
  El sistema se desarrolla como PWA accesible desde el navegador. Sin apps en App Store ni Google Play. \\
\rowcolor{altrow}
LM-08 & Integración con sistemas POS externos &
  La plataforma opera de forma independiente. Sin integración con Micros, Toast, Square, etc. \\
LM-09 & Notificaciones push nativas fuera de la app &
  La versi\'on 1.0 contempla notificaciones internas y actualizaciones en tiempo real
  dentro de la PWA mientras la sesi\'on se encuentre activa. No se implementan
  notificaciones push nativas del sistema operativo cuando la aplicaci\'on est\'e cerrada. \\
\rowcolor{altrow}
LM-10 & Programa de lealtad o fidelización de comensales &
  Los datos de consumo se registran para fines analíticos internos, no para programas al cliente final. \\
LM-11 & Procesamiento de pagos con tarjeta o agregadores externos &
  La versión 1.0 no procesará cobros reales con tarjeta, transferencias o billeteras
  digitales. El sistema únicamente registrará el estado interno de liquidación de la
  cuenta con base en los montos capturados en la aplicación. La integración futura
  con agregadores de pago requerirá el uso de proveedores certificados y el cumplimiento
  de lineamientos de seguridad aplicables, como PCI~DSS. \\"""

idx1 = text.find(tab2_start)
if idx1 == -1:
    print("Failed to find tab 2 start")
idx2 = text.find(tab2_end) + len(tab2_end)
text = text[:idx1] + new_tab2 + text[idx2:]

new_tab3 = r"""Un solo piso por sucursal &
  El m\'odulo de mesas f\'isicas gestiona una \'unica \'area plana por sucursal. No se implementa un sistema de coordenadas o plano de planta para m\'ultiples pisos o secciones. \\
\rowcolor{altrow}
Sin soporte offline &
  La plataforma se desarrolla como una aplicaci\'on web progresiva (PWA) con el objetivo de
  ofrecer una experiencia similar a una aplicaci\'on m\'ovil instalada, facilitar el acceso desde
  dispositivos personales y permitir su incorporaci\'on a la pantalla de inicio sin pasar por
  tiendas de aplicaciones. No obstante, debido a la naturaleza transaccional y colaborativa
  del sistema, no se contempla operaci\'on offline en la versi\'on 1.0. Las acciones principales
  requieren sincronizaci\'on en tiempo real. \\
Un solo idioma (espa\~nol) &
  La interfaz y todos los textos est\'an en espa\~nol. No se implementa internacionalizaci\'on (i18n) ni soporte multi-idioma. \\
\rowcolor{altrow}
Acceso mediante PWA en navegador web &
  Los comensales acceden desde el navegador de su dispositivo m\'ovil mediante c\'odigos QR.
  La aplicaci\'on puede agregarse a la pantalla de inicio como PWA, pero no requiere
  instalaci\'on desde tiendas de aplicaciones ni contempla versiones nativas para iOS o Android. \\
Liquidaci\'on interna sin procesamiento bancario &
  El sistema registra el estado de liquidaci\'on de las cuentas con base en los montos
  capturados dentro de la aplicaci\'on. No se procesan pagos reales, tarjetas, transferencias
  ni billeteras digitales en la versi\'on 1.0. La integraci\'on con agregadores de pago
  queda documentada como trabajo futuro. \\"""

idx1 = text.find(r"Un solo piso por sucursal &")
if idx1 == -1:
    print("Failed to find tab 3 start")
idx2 = text.find(r"ni billeteras digitales en la vers")
idx2 = text.find(r"\\", idx2) + 2
text = text[:idx1] + new_tab3 + text[idx2:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Update complete")
