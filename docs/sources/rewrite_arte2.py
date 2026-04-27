import re

file_path = r"C:\Users\dvill\Downloads\Bouquet\docs\sources\sections\02_0_estado_del_arte.tex"

new_content = r"""\section{Estado del Arte}

\subsection{Antecedentes Acad\'emicos y T\'ecnicos}

El presente trabajo se ubica en la intersecci\'on entre los sistemas transaccionales
para operaci\'on restaurantera, la ingenier\'ia de datos y la inteligencia de negocio.
Aunque el caso de uso visible corresponde a una plataforma web progresiva para la
gesti\'on de mesas, \'ordenes y liquidaciones internas, el eje t\'ecnico del proyecto se
centra en la generaci\'on, modelado, transformaci\'on y explotaci\'on anal\'itica de datos
operativos.

Por esta raz\'on, el estado del arte se organiza en seis ejes principales:
digitalizaci\'on de la operaci\'on restaurantera, captura estructurada de datos
transaccionales, trazabilidad de eventos, arquitecturas anal\'iticas OLTP/OLAP,
procesamiento batch con Apache Spark y visualizaci\'on de indicadores mediante
dashboards de inteligencia de negocio.

\subsubsection{Digitalizaci\'on de la Operaci\'on Restaurantera}

La digitalizaci\'on de restaurantes ha evolucionado desde sistemas de punto de venta
(POS) tradicionales hacia plataformas m\'as integradas que conectan men\'us digitales,
\'ordenes, cocina, administraci\'on y reportes operativos. Diversos trabajos han se\~nalado
que la incorporaci\'on de tecnolog\'ias digitales en el \textit{front of house} y
\textit{back of house} puede mejorar la eficiencia operativa, reducir errores de
captura y agilizar la comunicaci\'on entre \'areas del restaurante
\cite{lee_digital_2024, tan_tabletop_2020, katagri_smart_2025}.

En este contexto, los sistemas de autoservicio en mesa y los men\'us digitales mediante
c\'odigo QR han adquirido relevancia por permitir que el comensal interact\'ue directamente
con el cat\'alogo del restaurante. Tan y Netessine documentan que las tecnolog\'ias
implementadas en mesa pueden impactar positivamente en la duraci\'on del servicio, la
rotaci\'on de mesas y la productividad del establecimiento \cite{tan_tabletop_2020}.
Asimismo, sistemas recientes de pedidos digitales integran interfaces responsivas,
actualizaciones en tiempo real y reducci\'on de intermediaci\'on manual entre comensal
y cocina \cite{katagri_smart_2025}.

No obstante, la literatura tambi\'en advierte que la digitalizaci\'on no garantiza por s\'i
misma una mejor experiencia de usuario. Estudios sobre men\'us QR muestran que la
facilidad de uso, la utilidad percibida, la privacidad y la preferencia por interacci\'on
humana influyen directamente en la aceptaci\'on de estas tecnolog\'ias
\cite{koay_qr_2024, hewage_qr_2024, yigitoglu_sustainable_2025}. Por ello, en el
presente proyecto, el QR y la PWA se consideran mecanismos de acceso y captura de datos
de baja fricci\'on, no \'unicamente elementos de modernizaci\'on visual.

\subsubsection{Captura Estructurada de Datos Transaccionales}

Un reto fundamental en la digitalizaci\'on restaurantera consiste en convertir las
interacciones operativas en datos estructurados. En sistemas tradicionales, informaci\'on
como pedidos, tiempos de preparaci\'on, consumo por mesa, participaci\'on de comensales,
cancelaciones o liquidaciones suele quedar fragmentada entre comandas f\'isicas, POS,
hojas de c\'alculo o reportes administrativos posteriores.

Para que estos datos puedan utilizarse en an\'alisis operativo, deben registrarse desde
su origen con consistencia, integridad referencial y trazabilidad. Esto implica dise\~nar
un modelo transaccional capaz de representar entidades como sucursales, mesas, sesiones,
comensales, productos, \'ordenes, estados de cocina y liquidaciones internas. Adem\'as,
es necesario conservar informaci\'on hist\'orica mediante mecanismos como snapshots de
productos, precios y modificadores al momento de la orden, evitando que cambios futuros
en el cat\'alogo alteren el significado de transacciones pasadas.

Desde esta perspectiva, la plataforma propuesta no se limita a digitalizar el pedido,
sino que estructura la operaci\'on del restaurante como una fuente formal de datos. Cada
acci\'on relevante, como la apertura de una mesa virtual, el registro de una orden, el
cambio de estado en cocina o la captura de una aportaci\'on de liquidaci\'on, se convierte
en un evento persistido que posteriormente puede transformarse en indicadores anal\'iticos.

\subsubsection{Trazabilidad, Eventos y Consistencia Operativa}

Los sistemas con m\'ultiples actores conectados en tiempo real requieren mecanismos que
garanticen consistencia entre interfaces. En un restaurante, comensales, meseros, cocina
y administraci\'on interact\'uan sobre una misma sesi\'on operativa. Esto genera retos
relacionados con concurrencia, duplicidad de operaciones, cambios de estado y
sincronizaci\'on de informaci\'on.

Las arquitecturas orientadas a eventos han sido utilizadas para modelar sistemas donde
las actualizaciones deben propagarse entre distintos componentes y usuarios. Iovescu y
Tudose destacan la importancia de dise\~nar comandos idempotentes, eventos persistentes y
flujos robustos ante reconexiones o fallos parciales \cite{iovescu_realtime_2024}. Estos
principios resultan relevantes para el presente proyecto, ya que operaciones como
confirmar una orden o registrar una aportaci\'on de liquidaci\'on no deben duplicarse si
existen errores de red o intentos simult\'aneos.

Asimismo, la consistencia transaccional en bases de datos relacionales sigue siendo un
aspecto cr\'itico cuando distintas acciones afectan el mismo estado financiero u operativo.
En el caso de la liquidaci\'on interna, el sistema debe impedir que dos aportaciones
simult\'aneas excedan el monto pendiente de una mesa. Para ello, pueden emplearse mecanismos
de control transaccional en PostgreSQL, como bloqueos a nivel de fila mediante
\texttt{SELECT FOR UPDATE}, validando el estado actual antes de confirmar una operaci\'on.

\subsubsection{Arquitecturas OLTP, OLAP y Modelo Medallion}

Los sistemas transaccionales (OLTP) est\'an dise\~nados para registrar operaciones frecuentes,
mantener consistencia y responder con baja latencia a acciones del usuario. Sin embargo,
las consultas anal\'iticas complejas, los agregados hist\'oricos y los indicadores de negocio
pueden afectar el rendimiento de la operaci\'on si se ejecutan directamente sobre la base
transaccional. Por ello, diversos enfoques de arquitectura de datos proponen separar la
capa operativa de la capa anal\'itica \cite{kleppmann2017designing}.

En este contexto, la arquitectura Medallion organiza el flujo anal\'itico en capas
progresivas de refinamiento. La capa Bronze almacena datos crudos provenientes de la
operaci\'on; la capa Silver contiene datos limpios, normalizados y enriquecidos; y la capa
Gold concentra agregados orientados a consumo anal\'itico. Este enfoque permite conservar
trazabilidad entre los datos originales y las m\'etricas finales, al mismo tiempo que
facilita la validaci\'on y mantenimiento del pipeline.

Para el presente proyecto, la arquitectura Medallion permite transformar los registros
transaccionales de mesas, \'ordenes, productos, estados de cocina y liquidaciones internas
en datasets anal\'iticos. Estos datasets pueden utilizarse para construir indicadores como
ventas por sucursal, productos m\'as consumidos, actividad por franja horaria, tiempos de
preparaci\'on, desempe\~no de estaciones y estimaciones exploratorias de demanda.

\subsubsection{Procesamiento Batch con Apache Spark}

Apache Spark es un motor de procesamiento distribuido ampliamente utilizado para tareas
de ingenier\'ia de datos, an\'alisis batch y transformaci\'on de grandes vol\'umenes de
informaci\'on. Zaharia et al. introducen los RDD como una abstracci\'on para procesamiento
en memoria con tolerancia a fallos, sentando las bases de Spark como plataforma para
cargas anal\'iticas escalables \cite{zaharia2012resilient}.

Aunque la validaci\'on inicial del presente proyecto se realizar\'a en un entorno controlado,
Spark permite dise\~nar un pipeline anal\'itico preparado para escalar conforme aumente el
volumen de datos generado por la operaci\'on restaurantera. El uso de Spark se justifica
por la necesidad de transformar datos transaccionales en estructuras anal\'iticas mediante
procesos repetibles, documentables y separables de la operaci\'on principal.

Dentro del proyecto, Spark se utilizar\'a para ejecutar procesos batch de extracci\'on,
limpieza, normalizaci\'on, enriquecimiento y agregaci\'on. Estos procesos permitir\'an generar
las capas Bronze, Silver y Gold, separando la captura operativa en Supabase/PostgreSQL de
la consulta anal\'itica utilizada por el dashboard administrativo.

\subsubsection{Inteligencia de Negocio en Restaurantes}

La inteligencia de negocio aplicada a restaurantes permite convertir datos operativos en
informaci\'on \'util para la toma de decisiones. M\'etricas como ingresos por sucursal,
productos m\'as vendidos, horarios de mayor demanda, duraci\'on promedio de servicio,
tiempos de preparaci\'on y comportamiento de consumo pueden apoyar la planeaci\'on operativa,
la asignaci\'on de personal, la optimizaci\'on del men\'u y la evaluaci\'on del desempe\~no.

Los sistemas comerciales actuales suelen ofrecer reportes integrados, especialmente en
plataformas POS consolidadas. Sin embargo, muchas de estas herramientas operan como
ecosistemas cerrados, dependientes de hardware, servicios propietarios o modelos de
licenciamiento espec\'ificos. Adem\'as, la trazabilidad completa desde el comensal individual,
la mesa virtual, la orden, el estado de cocina y la liquidaci\'on interna no siempre se
encuentra disponible como modelo de datos explotable de forma independiente.

El presente proyecto busca cubrir esta brecha mediante una plataforma que registra la
operaci\'on en una base de datos relacional propia y posteriormente transforma dichos datos
en indicadores mediante un pipeline anal\'itico. De esta manera, la inteligencia de negocio
no se plantea como un m\'odulo aislado, sino como resultado directo de un dise\~no transaccional
orientado a datos.

\subsection{Soluciones Comerciales Relacionadas}

En el mercado existen soluciones maduras para la gesti\'on restaurantera, tales como Toast,
Square for Restaurants, Lightspeed Restaurant, TouchBistro y Loyverse POS. Estas plataformas
integran funcionalidades como punto de venta, gesti\'on de \'ordenes, divisi\'on de tickets, reportes,
KDS e incluso pagos digitales. Sin embargo, su enfoque principal suele estar centrado en la
operaci\'on del restaurante desde la perspectiva del personal, cajero o administrador.

Tambi\'en existen soluciones orientadas a men\'us digitales mediante QR, como Biomenus, cuyo
valor principal se concentra en la presentaci\'on de informaci\'on del men\'u, filtros nutricionales
y accesibilidad para el comensal. Estas plataformas resuelven adecuadamente la consulta del
cat\'alogo, pero no necesariamente integran la gesti\'on de sesiones de mesa, \'ordenes por comensal,
cocina, liquidaci\'on interna y anal\'itica transaccional bajo un mismo modelo de datos.

Por otro lado, procesadores como Stripe, Conekta o Mercado Pago ofrecen infraestructura para
cobros digitales, tokenizaci\'on y conciliaci\'on de pagos. Sin embargo, en la versi\'on 1.0 del
presente proyecto no se contempla el procesamiento bancario real. Estas plataformas se
consideran \'unicamente como posibles integraciones futuras, ya que el alcance actual se limita
al registro interno del estado de liquidaci\'on de las cuentas.

La Tabla~\ref{tab:soluciones_comerciales} resume las principales capacidades observadas en
soluciones comerciales y las contrasta con el enfoque del sistema propuesto.

{\small
\setlength{\tabcolsep}{3pt}
\renewcommand{\arraystretch}{1.4}
\begin{longtable}{>{\raggedright\arraybackslash}p{2.5cm}
                >{\centering\arraybackslash}p{1.7cm}
                >{\centering\arraybackslash}p{1.7cm}
                >{\centering\arraybackslash}p{1.8cm}
                >{\centering\arraybackslash}p{1.8cm}
                >{\raggedright\arraybackslash}p{5cm}}
\caption{Comparaci\'on de Soluciones Comerciales Relacionadas}
\label{tab:soluciones_comerciales}\\
\hline
\thead{Soluci\'on} & \thead{QR / men\'u} & \thead{KDS} &
\thead{Split bill} & \thead{Pipeline anal\'itico \\ propio} & \thead{Observaci\'on} \\
\hline
\endfirsthead

\hline
\thead{Soluci\'on} & \thead{QR / men\'u} & \thead{KDS} &
\thead{Split bill} & \thead{Pipeline anal\'itico \\ propio} & \thead{Observaci\'on} \\
\hline
\endhead

\hline
\endfoot

Toast & S\'i & S\'i & S\'i & No visible al usuario &
Ecosistema POS robusto con reportes integrados, pero dependiente del proveedor. \\
\rowcolor{altrow}
Square Restaurants & S\'i & S\'i & S\'i & No visible al usuario &
Plataforma madura para operaci\'on y pagos; la anal\'itica depende del ecosistema Square. \\
Lightspeed & S\'i & S\'i & S\'i & No visible al usuario &
Soluci\'on POS integral con reportes, orientada a operaci\'on comercial. \\
\rowcolor{altrow}
TouchBistro & Parcial & S\'i & S\'i & No visible al usuario &
Buen soporte para restaurante tradicional, con enfoque POS y administraci\'on interna. \\
Loyverse POS & Parcial & S\'i & Parcial & No visible al usuario &
Freemium con POS, KDS e inventario; QR ordering depende de integraciones externas. \\
\rowcolor{altrow}
Biomenus & S\'i & No & No & No &
Especializado en men\'u digital, nutrici\'on y filtros; no gestiona \'ordenes ni anal\'itica operativa completa. \\
Deliverect & Parcial & Parcial & No & No visible al usuario &
Orquestador omnicanal de \'ordenes, m\'as orientado a integraciones externas que a mesa virtual. \\
\rowcolor{altrow}
\textbf{Sistema propuesto} & \textbf{S\'i} & \textbf{S\'i} & \textbf{S\'i, interno} & \textbf{S\'i} &
PWA con mesa virtual, captura transaccional propia, Spark Medallion y dashboard anal\'itico. \\
\hline
\end{longtable}
}

\subsection{S\'intesis del Estado del Arte y Brecha Identificada}

A partir de la revisi\'on realizada, se observa que existen avances importantes en
digitalizaci\'on restaurantera, autoservicio mediante QR, sistemas POS, KDS, reportes
administrativos y procesamiento anal\'itico. Sin embargo, estas capacidades suelen
presentarse de forma fragmentada o dentro de ecosistemas comerciales cerrados.

Por un lado, las plataformas POS y KDS resuelven adecuadamente la operaci\'on interna del
restaurante, pero la trazabilidad individual del comensal, la mesa virtual compartida y
la divisi\'on aut\'onoma de cuenta no siempre forman parte del flujo principal. Por otro
lado, las soluciones de men\'u QR facilitan la consulta del cat\'alogo, pero usualmente no
integran \'ordenes, cocina, liquidaci\'on interna y explotaci\'on anal\'itica bajo un mismo modelo
de datos.

Desde la perspectiva de Ciencia de Datos, la brecha principal no se limita a la existencia
de interfaces digitales para ordenar o pagar, sino a la ausencia de una arquitectura que
conecte de manera expl\'icita la operaci\'on transaccional con un pipeline anal\'itico propio.
Es decir, muchas soluciones generan datos, pero no todas exponen o estructuran dichos datos
para construir un flujo verificable desde el evento operativo hasta la m\'etrica de negocio.

El presente proyecto se posiciona en esa brecha. La plataforma propuesta integra una PWA
para la captura de eventos operativos en restaurante, una base de datos relacional para
garantizar consistencia y trazabilidad, y un pipeline batch con Apache Spark bajo una
arquitectura Medallion para transformar los datos en indicadores anal\'iticos. As\'i, el valor
central del sistema no se encuentra \'unicamente en la digitalizaci\'on del servicio, sino en
la construcci\'on de una arquitectura de datos que permite convertir la operaci\'on diaria en
inteligencia de negocio.

En consecuencia, la propuesta se diferencia por articular tres niveles: primero, la captura
operativa mediante mesas virtuales, \'ordenes y liquidaci\'on interna; segundo, el modelado
transaccional con trazabilidad hist\'orica; y tercero, el procesamiento anal\'itico mediante
Spark para generar datasets Gold y dashboards administrativos. Esta integraci\'on permite
abordar el caso restaurantero no solo como un problema de software operativo, sino como un
problema de ingenier\'ia y an\'alisis de datos.
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("success")