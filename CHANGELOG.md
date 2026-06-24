# Changelog (Registro de Cambios)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [1.24.0] - 2026-06-24
### Añadido
- **Migración a Modelo de Categorías y Unidades de Inventario (Estilo Hotelero)**:
  - **Estructura de Base de Datos**: Añadida la columna `total_units` a `SpaceEntity` y `assigned_unit` a `Booking` en MySQL. Creada y ejecutada la migración `CategoryUnitsMigration1782328041715`.
  - **Sincronización de Datos Semilla**: Actualizado `seedSpaces()` para persistir y sincronizar únicamente las 4 categorías principales del Centro (Cabañas Familiares, Quinchos Familiares, Piscina General, Club House) con sus cantidades y capacidades correspondientes, eliminando filas físicas duplicadas redundantes.
  - **Asignación de Unidades Automática**: El backend asigna secuencialmente una unidad física desocupada (ej: Cabaña 1 a 6) para el rango de la reserva durante el checkout, garantizando estadía continua.
  - **Detección de Disponibilidad Dinámica**: El cálculo de bloqueos en `bookings.service.ts` se realiza a nivel de categoría comparando la cantidad de reservas solapadas contra `totalUnits`.
  - **Reasignación y Edición por el Administrador**: Selector dropdown en el módulo de reservas para cambiar y validar la asignación de unidades físicas (ej. Cabaña 1 a 6, Quincho 1 a 10) previniendo solapamientos accidentales.
  - **Calendario por Unidades**: El visualizador mensual de ocupación ahora renderiza explícitamente el nombre de la unidad física reservada (ej: `"Cabaña 3"`) en las celdas diarias de ocupación.

## [1.23.0] - 2026-06-23
### Añadido
- **Restricciones de Acceso y Solicitudes para Externos (Hito 2)**:
  - **Restricción de Dominios de Correo**: Limitación de registro e inicio de sesión de socios en la plataforma exclusivamente a direcciones con dominio `&#64;enap.cl` o `&#64;enaprefinerias.cl` en el frontend y backend.
  - **Correo Adicional para Reservas**: Campo opcional de correo de contacto adicional durante el flujo de reserva que replica todas las notificaciones transaccionales (confirmaciones de pago, aprobaciones, etc.) para mayor comodidad del socio.
  - **Consolidación de Cabañas y Disponibilidad de Conjunto**: Remoción de la selección individual de cabañas por parte del usuario durante el checkout y en la página de inicio (Home), consolidando la disponibilidad globalmente (se bloquea una fecha solo si las 6 cabañas están ocupadas simultáneamente) y asignando la primera libre automáticamente en el backend.
  - **Asignación y Validación Administrativa**: Habilitación de un selector interactivo (dropdown) en el panel de control de reservas de administración para que el administrador asigne y valide la asignación del número de cabaña específico (1 al 6) con verificación en tiempo real de disponibilidad.
  - **Formulario de Solicitud de Reserva para Externos**: Formulario web dinámico y premium en el login (`/ingresar?tab=guest`) para usuarios externos. Centralización del flujo redireccionando el banner de advertencia del catálogo directamente a este formulario interactivo. La solicitud se envía por correo al administrador con cabecera `replyTo` para respuesta asíncrona directa.

## [1.22.0] - 2026-06-20
### Añadido
- **Mejoras de Navegación y Usabilidad (Hito 2)**:
  - **Tarjeta de Datos del Titular**: Implementación de una tarjeta interactiva en el Paso 2 (Invitados) que muestra la información oficial del socio (Nombre, RUT, Ficha code) en formato de sólo lectura y permite la edición y guardado automático en base de datos de los datos de contacto (Teléfono y Correo electrónico) durante el checkout.
  - **Logotipo de Mayor Visibilidad en el Hero**: Rediseño de la sección Hero en la página de inicio para destacar el logotipo oficial en una tarjeta blanca con sombras, posicionada a la izquierda del texto principal en pantallas grandes para darle mayor jerarquía.
  - **Menú de Navegación Móvil (Hamburguesa)**: Implementación de un menú responsivo con botón de hamburguesa (`md:hidden`) y cajón vertical para todas las rutas y acciones rápidas de la plataforma.
  - **Instrucciones para Sandbox de Mercado Pago**: Adición de un cuadro de advertencia y guía de pruebas directamente en el Step 3 (Pago) para facilitar las pruebas con tarjetas y credenciales simuladas en modo incógnito, previniendo el error de "ambientes mezclados".

## [1.21.0] - 2026-06-19
### Añadido
- **Validaciones de Propuesta Comercial (Hito 2)**:
  - **Espacio Club House**: Sembrado e incorporado de forma idempotente al catálogo de recintos bajo el tipo `quincho` con capacidad para 50 personas y tarifas correspondientes.
  - **Autogeneración de Código de Socio**: La ficha sindical se volvió opcional en la creación de usuarios administrativos; si se deja vacía al registrar un socio, se genera y asocia un código aleatorio `ENP-XXXX`.
  - **Selector de Tipo de Visita**: Se integró en el Paso 2 (Invitados) un selector triple: "Uso Personal", "Carga Familiar" y "Familiares o Amigos (Tercero)".
  - **Edad de Invitados**: Agregado el campo "Edad" en la tabla dinámica del Paso 2 y persistido en la base de datos de invitados.
  - **Modal de Reglamento y Términos**: Se implementó una ventana emergente interactiva en el Paso 3 que expone el reglamento del recinto al hacer clic en "términos de arriendo".
  - **Aviso de Revisión en 48 Horas**: Se detalló explícitamente en el Paso 4 del checkout de transferencias bancarias que la administración validará el comprobante de pago en un plazo máximo de 48 horas.
  - **Expiración Pasiva de 48 Horas**: Se implementó un limpiador automático en el backend que expira reservas pendientes de pago sin actividad tras 48 horas.
  - **Cierre los Lunes por Mantención**: Se inhabilitaron y bloquearon automáticamente los días lunes en el calendario y validaciones de reserva por mantención general.
- **Base de Datos**: Creada y ejecutada la migración `1781898600000-Hito2Enhancements.ts` para agregar las columnas `visit_type` (bookings) y `age` (guests) en MySQL.

## [1.20.0] - 2026-06-19
### Añadido
- **Gestión de Perfil de Usuario y Seguridad**: Implementado el componente `/perfil` que permite cambiar correo electrónico y teléfono (validado bajo formato Chile con regex `^(\+56)?9\d{8}$`), además de cambio seguro de contraseña encriptada mediante hashing PBKDF2 SHA-512 en el backend.
- **Subida de Múltiples Fotos y Carruseles**: Soporte para que los espacios admitan múltiples imágenes cargadas a AWS S3. Los clientes visualizan las fotos mediante carruseles interactivos con controles de navegación e indicadores de página.
- **Moderación de Opiniones / Feedback**: Los socios pueden valorar su estadía finalizada mediante estrellas (1 a 5) y comentarios escritos en "Mis Reservas" (estado inicial `pending_approval`). Añadido el panel `/admin/opiniones` para que los administradores aprueben o rechacen los comentarios, los cuales actualizan el rating promedio del recinto y se renderizan en el Step 1 del checkout al ser aprobados.
- **Guía de Estadía & FAQ Interactivo**: Sección de ayuda en el Home con normas críticas (equipaje, carbón, aforos) y un acordeón de Preguntas Frecuentes. Se añadió el panel CRUD `/admin/faqs` para gestionar las preguntas y respuestas.
- **Poblamiento de Datos Semilla de FAQs**: Configurada la carga automática e idempotente en el backend (`SeedService`) de 6 preguntas frecuentes enfocadas en turismo de Limache, validación de ficha sindical de socios, política de piscina y cancelaciones meteorológicas.
- **Pronóstico del Clima Local y Alertas**: Integrado el servicio `WeatherService` para consumir datos climatológicos en vivo desde **Open-Meteo** para Limache, con fallback local de contingencia. Renderiza badges y pills en el Hero, en el catálogo `/espacios`, un pronóstico de 3 días en el Step 1 del checkout, y gatilla automáticamente una alerta preventiva ámbar si el socio selecciona una fecha con precipitaciones para un espacio exterior.
- **Pie de Página Global (Footer)**: Extraído el footer a un componente reutilizable (`FooterComponent`), escapando el carácter `@` como `&#64;` para satisfacer las políticas estrictas de control de flujo del compilador de Angular (`NG5002`). Se incluyó en el pie de todas las pantallas públicas del cliente final, ocultándose del panel administrativo.
- **Certificación de Despliegue en Producción**:
  - **Frontend (Vercel)**: Desplegado en `https://enap-front-web.vercel.app`
  - **Backend (AWS Lambda & API Gateway)**: Desplegado mediante Serverless Framework en us-east-1 en `https://odru0vr5a5.execute-api.us-east-1.amazonaws.com/` con persistencia en AWS RDS MySQL, carga real de archivos a AWS S3 y envío SMTP asíncrono real de notificaciones mediante AWS SES.

## [1.19.0] - 2026-06-18
### Añadido
- **Infraestructura Serverless en AWS:** Creación del adaptador de entrada [lambda.ts](file:///home/daniel/projects/enap-mock-frontend/backend/src/lambda.ts) y de la especificación [serverless.yml](file:///home/daniel/projects/enap-mock-frontend/backend/serverless.yml) para el despliegue del backend en AWS Lambda + API Gateway mediante Serverless Framework, utilizando el perfil `new-account`.
- **Automatización de Despliegues en package.json:** Añadido soporte multiplataforma con `cross-env` para forzar la desactivación de telemetría y prompts de login interactivos, y automatización del compilado (`npm run build`) previo al despliegue.
- **Configuración de Permisos S3 con IAM:** Integradas políticas de IAM en el archivo de infraestructura para otorgar permisos nativos de lectura/escritura a la Lambda sobre el bucket de S3, eliminando la necesidad de almacenar llaves de acceso en texto plano.
- **Bypass de Mock en S3 (`AWS_S3_MOCK`):** Soporte en [aws.service.ts](file:///home/daniel/projects/enap-mock-frontend/backend/src/aws/aws.service.ts) para el parámetro `AWS_S3_MOCK=false` y optimización de inicialización del `S3Client` para delegar automáticamente las firmas a Roles de IAM cuando no hay claves `AKIA` estáticas presentes.
- **Optimización de Conexiones de DB (RDS):** Configurada la variable `DB_CONNECTION_LIMIT` en [app.module.ts](file:///home/daniel/projects/enap-mock-frontend/backend/src/app.module.ts) para evitar la saturación de conexiones a MySQL (RDS) por el escalado horizontal de contenedores Lambda.
- **Trazabilidad y Logs Estructurados en CloudWatch:** Integrado el `Logger` de NestJS en `AuthService`, `BookingsService`, `MercadoPagoController` y `MercadoPagoService` para reportar advertencias, flujos financieros, errores de API y cambios de estado directamente a AWS CloudWatch.
- **Auto-Confirmación de Reservas de Costo Cero ($0):** Implementada lógica para reservas gratuitas (ej. piscina para socio con menos de 5 invitados, o quinchos por convenio de costo $0):
  - **Backend**: Guarda la reserva con estado inicial `confirmed` (en vez de `pending_payment`) y envía directamente la plantilla de correo de confirmación de pago aprobado.
  - **Frontend**: Adapta de forma dinámica los Pasos 3 y 4 del flujo de reserva ocultando formularios de pago y cargadores de comprobantes bancarios, permitiendo la confirmación inmediata y mostrando mensajes de éxito con aprobación directa sin transferencias pendientes.
- **Orden de Reservas (Más nuevas primero):** Configurada la consulta en la base de datos en [bookings.service.ts](file:///home/daniel/projects/enap-mock-frontend/backend/src/bookings/bookings.service.ts) para ordenar las reservas de forma descendente por `id` (tanto para la lista personal de socios como para la administración), asegurando que los registros más recientes se desplieguen siempre arriba.
- **Rutas de Retorno para Mercado Pago en Admin:** Modificado [admin-mercadopago.component.ts](file:///home/daniel/projects/enap-mock-frontend/frontend/src/app/features/admin/mercadopago/admin-mercadopago.component.ts) para usar rutas sin query strings (`/admin/mercadopago/success`, `/admin/mercadopago/failure`, `/admin/mercadopago/pending`) en lugar de `?status=...` para cumplir con las restricciones de Mercado Pago, registradas las correspondientes subrutas de desarrollo en [admin.routes.ts](file:///home/daniel/projects/enap-mock-frontend/frontend/src/app/features/admin/admin.routes.ts), y añadidas secciones visuales en [admin-mercadopago.component.html](file:///home/daniel/projects/enap-mock-frontend/frontend/src/app/features/admin/mercadopago/admin-mercadopago.component.html) para inspeccionar los parámetros del callback (`payment_id`, `status`, `external_reference`, etc.).
- **Confirmación Automática desde URL de Retorno:** Actualizado [mercadopago-success.component.ts](file:///home/daniel/projects/enap-mock-frontend/frontend/src/app/features/mercadopago/mercadopago-success.component.ts) para que, al redirigirse tras un pago exitoso con `external_reference` y `payment_id`, invoque automáticamente al endpoint `/bookings/confirm-payment` del backend para confirmar la reserva de forma inmediata.

## [1.18.0] - 2026-06-18
### Añadido
- **Estandarización de Cabañas (1 a 6):** Configuración estricta de 6 cabañas con capacidad máxima de 6 personas, equipamiento completo y advertencias de traer sábanas y toallas.
- **Arriendo por Jornada Única para Quinchos y Piscina:** Selector único de "Día de la Jornada" que previene la selección de rangos de días, sincronizando check-in y check-out en la misma fecha, y validación de colisiones de fecha de forma inclusiva.
- **Flujo de Patrocinio de Terceros para Socios:** Selector interactivo para socios al reservar para terceros, solicitando datos personales del tercero ocupante y recalculando dinámicamente el precio final con la tarifa base general.
- **Detalle de Tercero en Administración:** Badge destacado "Para Tercero" y desglose de datos del ocupante patrocinado en la fila de reservas del administrador.
- **Visualización de Tarifas Diferenciadas:** Badges visuales en las tarjetas del catálogo ("Socio Sindicato" en verde, "Público / Externo" en gris) y leyendas indicando cobro diario o por jornada.
- **Columna Socio/No Socio en Reservas:** Integración de la columna "Tipo" en la tabla de administración de reservas para identificar de forma clara y con badges de colores a los socios y no socios.
- **Contraseñas Temporales en Creación de Usuario:** Generación automática de contraseñas alfanuméricas de 6 caracteres para usuarios creados vía administración. Exposición de la clave en el toast de éxito y envío simulado del correo de credenciales.
- **Módulo de Galería "Conoce el Centro":**
  - Vista pública `/conoce-el-centro` con efectos visuales, hovers, zooms y Lightbox responsivo navegable por teclado (flechas y tecla Escape).
  - Panel CRUD de administración en `/admin/galeria` para gestionar (agregar y eliminar) las fotos del recinto turístico.
- **Spinner de Carga en Mis Reservas:** Implementación de un spinner animado en el listado de reservas del usuario para mejorar la experiencia visual de carga de datos.
- **Fotos Reales del Centro Turístico:** Reemplazo de imágenes de stock de Unsplash por fotos reales provistas por el cliente (`/images/*`) en la Home, espacios y avisos, incluyendo actualización automática en caliente en el arranque (`SeedService`).

## [1.17.0] - 2026-06-17
### Añadido
- **Conexión de Frontend a API de NestJS:** Refactorizados todos los servicios globales (`AuthService`, `SpacesService`, `BookingsService`, `AnnouncementsService`, `UsersService`) para realizar llamadas HTTP reales a los endpoints del backend en lugar de usar datos mocks locales.
- **Formularios de Autenticación y Registro:** Rediseñado el componente `LoginComponent` con soporte para tres flujos (Ingresar con correo/contraseña, Registrar cuenta de socio, e ingresar como Invitado ingresando un código de socio).
- **Endpoint de Fechas Bloqueadas:** Creado el endpoint público `GET /bookings/blocked-dates/:spaceId` en el backend que calcula dinámicamente todas las fechas bloqueadas estáticas y las reservas vigentes (`confirmed`, `pending_approval`) del recinto.
- **Flujo de Reserva de Invitados:** Implementado mecanismo en `BookingFlowComponent` que almacena el progreso de la reserva en `sessionStorage` para usuarios anónimos al proceder al pago, dirigiéndolos a identificarse o registrarse, para luego restaurar la reserva y permitir su finalización con subida real del comprobante bancario a AWS S3.
- **Mapeadores de Modelo:** Añadidas funciones de mapeo bidireccionales en el frontend (`models.ts`) para convertir de forma segura las respuestas del backend (`camelCase`) a la estructura consumida por la UI (`snake_case`).

## [1.16.0] - 2026-06-17
### Añadido
- **Configuración de Entornos en Angular:** Ejecutado el generador de la CLI de Angular `ng g environments` para crear `environment.ts` (producción) y `environment.development.ts` (desarrollo local) bajo la carpeta `frontend/src/environments/`.
- **URL Base de la API:** Definida la variable `apiUrl` apuntando al backend local de NestJS en `http://localhost:3000` en ambos archivos de entorno para centralizar las llamadas HTTP del frontend.

## [1.15.1] - 2026-06-17
### Solucionado
- **Error de Dependencias de JwtAuthGuard (`UnknownDependenciesException`):** Reubicado el registro de `MercadoPagoController` desde `MercadoPagoModule` hacia `AppModule.controllers`. Esto permite que el controlador y sus guards de autenticación resuelvan adecuadamente la dependencia de `AuthService` (que está declarada localmente en `AppModule`), alineándose con la arquitectura de controladores globales del proyecto.

## [1.15.0] - 2026-06-17
### Añadido
- **Creación de Preferencias de Pago en Mercado Pago:** Se implementó el método `createPreference` en `MercadoPagoService` y se expuso en `POST /mercadopago/preference` en el nuevo `MercadoPagoController` (protegido por `JwtAuthGuard`). Esto permite generar un identificador único de preferencia (`id`) e `init_point` redireccionando al usuario a Checkout Pro.
- **Pruebas Unitarias de Preferencias:** Se crearon las especificaciones `mercadopago.controller.spec.ts` y se actualizaron las de `mercadopago.service.spec.ts` mockeando el comportamiento del SDK de Mercado Pago (`Preference.create`) para validar que las peticiones se realicen correctamente sin llamadas HTTP reales.

## [1.14.0] - 2026-06-17
### Añadido
- **Integración de SDK de Mercado Pago:** Instalación del paquete `mercadopago` y creación de `MercadoPagoModule` y `MercadoPagoService` para encapsular la inicialización de `MercadoPagoConfig` usando `MP_ACCESS_TOKEN` desde el archivo `.env`.

## [1.13.0] - 2026-06-17
### Añadido
- **Carga de Fotos de Espacios a S3:** Creado el endpoint `POST /spaces/upload-photo` en `SpacesController` para permitir a administradores subir imágenes (fotos) de espacios turísticos o deportivos directamente a AWS S3.
- **Seguridad en Carga de Fotos:** Restringido el endpoint con `JwtAuthGuard`, `RolesGuard` y `@Roles('admin')`.
- **Mapeo y Fallback de Fotos:** Integrado Multer `FileInterceptor('file')` con lógica de fallback dinámico para peticiones simuladas.
- **Pruebas de Controlador de Espacios:** Actualizadas las pruebas en `spaces.controller.spec.ts` para proveer mocks del cliente S3/AwsService y validar la subida de imágenes, fallback y control de acceso por roles en `SpacesController`.

## [1.12.0] - 2026-06-17
### Añadido
- **Carga de Comprobantes a S3:** Modificación del endpoint `POST /bookings/upload-receipt` en `BookingsController` integrando el interceptor `FileInterceptor('file')` de Multer para aceptar archivos físicos, subirlos a AWS S3 utilizando `AwsService` y guardar la URL resultante.
- **Manejo de Fallback de Archivos:** Implementada compatibilidad hacia atrás mediante generación automática de URLs simuladas en S3 cuando no se adjunte un archivo físico.
- **Pruebas Unitarias de Controlador:** Creado `bookings.controller.spec.ts` para cubrir todos los escenarios de subida de archivos binarios, fallbacks y validaciones de IDs en `BookingsController`.

## [1.11.0] - 2026-06-17
### Añadido
- **Cargador de archivos (Multer):** Instalación de la dependencia de desarrollo `@types/multer` y configuración global del módulo `MulterModule` en `AppModule` con un límite de tamaño de archivo de 10 MB (coherente con las directivas físicas de API Gateway HTTP/REST Proxy).

## [1.10.0] - 2026-06-17
### Añadido
- **Configuración de AWS SDK v3:** Instalación de la dependencia `@aws-sdk/client-s3` e implementación del servicio `AwsService` y módulo `AwsModule` para administrar de forma centralizada la conexión a Amazon S3 y realizar cargas de archivos binarios de forma parametrizada.
- **Documentación de Límites de Payload en AWS S3/API Gateway:** Registro detallado en `design.md` sobre las restricciones físicas de tamaño de payload según la arquitectura serverless/proxy de AWS (10MB para API Gateway HTTP/REST, 6MB para Lambda Proxy y el impacto de reducción a ~7.5MB / ~4.5MB debido a la codificación de archivos binarios a texto Base64).
- **Pruebas unitarias de AWS:** Pruebas en `aws.service.spec.ts` mockeando el comportamiento de `S3Client` para validar la correcta resolución de URLs de objetos S3 tras una carga.

## [1.9.0] - 2026-06-17
### Añadido
- **Limitación de Tasa Global (`ThrottlerModule`):** Configuración del módulo de rate limiting oficial de NestJS `@nestjs/throttler` de forma global con un límite de seguridad de 100 peticiones por minuto por IP.
- **Protección Antiactividad en Autenticación:** Aplicado límite estricto de 5 intentos de inicio de sesión por minuto al endpoint `login` en `AuthController`.
- **Protección en Reservas y Pagos:** Aplicado límite de 10 peticiones por minuto a la creación de reservas (`create`) y carga de comprobantes de pago (`uploadReceipt`) en `BookingsController`.

## [1.8.0] - 2026-06-17
### Añadido
- **Middleware Helmet para Cabeceras de Seguridad:** Integración del paquete `helmet` en el backend para establecer de manera segura directivas HTTP críticas (Clickjacking, XSS Auditor, MIME Sniffing, Content Security Policy, etc.).
- **Políticas de CORS Seguras:** Restricción de CORS en `main.ts` configurando de manera dinámica orígenes basados en la variable `ALLOWED_ORIGINS` del entorno (con fallback al origen de desarrollo de Angular `http://localhost:4200`), y limitación explícita de métodos HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, etc.).

## [1.7.0] - 2026-06-17
### Añadido
- **Guard de Autenticación JWT (`JwtAuthGuard`):** Implementación de guard personalizado en NestJS que extrae, parsea y valida tokens Bearer desde la cabecera `Authorization` utilizando `AuthService.verifyToken` e inyecta el usuario decodificado en la petición (`request.user`).
- **Guard de Autorización de Roles (`RolesGuard`):** Guard personalizado que lee metadatos de rutas para restringir endpoints de manera granular en base a roles.
- **Decorador `@Roles()`:** Decorador de metadatos personalizado para asociar roles (`socio`, `external`, `admin`) a controladores o endpoints específicos.
- **Decorador `@CurrentUser()`:** Decorador de parámetros para extraer limpiamente el objeto de usuario autenticado del request en los controladores.
- **Protección de Controladores:**
  - `BookingsController`: Protegido a nivel global con `JwtAuthGuard` y `RolesGuard`. Endpoints `getAll`, `approve` y `reject` restringidos a `admin`.
  - `UsersController`: Protegido a nivel global. Endpoints `getAll`, `create` y `toggleStatus` restringidos a `admin`.
  - `SpacesController`: Protegido de manera selectiva. Endpoints de escritura (`create`, `update`, `delete`) protegidos y restringidos a `admin`, manteniendo `getAll` público.
- **Pruebas unitarias para Guards:** Creación de especificaciones completas para `jwt-auth.guard.spec.ts` y `roles.guard.spec.ts` que validan todas las ramificaciones y excepciones lanzadas, logrando un 100% de cobertura en los guards de seguridad.

## [1.6.0] - 2026-06-17
### Añadido
- **Plantilla HTML de Notificación al Administrador (Nueva Reserva):** Creación de una plantilla de correo electrónico HTML utilizando los colores corporativos del Sindicato, incluyendo un distintivo visual de estado "Nueva Solicitud" (`#E8F0FE` / `#1A73E8`) para alertar al administrador de nuevas reservas registradas.
- **Detalles del Solicitante y de la Reserva:** Inclusión del perfil completo del usuario (nombre, rut, rol, nº de ficha, correo electrónico) y datos de la reserva (código, recinto, fechas, días totales y monto total).
- **Enlace de Acción Directa:** Incorporación de un botón de acción directa en el correo para redirigir al panel de administración de reservas (`/admin/bookings`).
- **Integración y Configuración:** Configuración de la variable de entorno `ADMIN_EMAIL` en `.env` e integración del envío asíncrono del correo en `createBooking` de `BookingsService`.
- **Pruebas unitarias de notificación administrativa:** Actualización de las especificaciones en `bookings.service.spec.ts` para verificar la correcta emisión de la notificación administrativa con el asunto, código y destinatario configurados, manteniendo tolerancia a fallos SMTP.

## [1.5.0] - 2026-06-17
### Añadido
- **Plantilla HTML de Rechazo de Comprobante (Observación de Pago):** Creación de una plantilla de correo electrónico HTML utilizando los colores corporativos del Sindicato con detalles de advertencia visual clara (`#C5221F` / `#FFF5F5`) para notificar al socio que su comprobante de pago fue rechazado.
- **Visualización de Motivo de Rechazo:** Inclusión dinámica del motivo (notas administrativas o `adminNotes` ingresadas por el administrador) de forma destacada en el correo.
- **Instrucciones para Subir Nuevo Comprobante:** Explicación paso a paso de los pasos para volver a cargar un comprobante válido en la sección "Mis Reservas" de la plataforma, incluyendo una caja de referencia rápida con los datos de transferencia del sindicato.
- **Integración en Rechazo de Reservas:** Integración del envío asíncrono en segundo plano del correo en el método `rejectBooking` de `BookingsService`.
- **Pruebas unitarias de rechazo:** Añadidas pruebas en `bookings.service.spec.ts` para verificar el envío correcto del correo con el motivo de rechazo correspondiente, controlando con tolerancia de fallos cualquier problema SMTP.

## [1.4.0] - 2026-06-17
### Añadido
- **Plantilla HTML de Confirmación de Pago (Reserva Aprobada):** Creación de una plantilla de correo electrónico HTML utilizando los colores corporativos del Sindicato para informar al usuario de la aprobación de su pago y la confirmación oficial de su reserva.
- **Instrucciones de Check-in en Correo:** Inclusión de información de acceso importante en el correo (horarios de check-in/check-out, requisitos de cédula de identidad y código de reserva, y normas del recinto).
- **Integración en Aprobación de Reservas:** Integración del envío asíncrono en segundo plano del correo en el método `approveBooking` de `BookingsService`.
- **Pruebas unitarias de aprobación:** Añadidas pruebas en `bookings.service.spec.ts` para validar que la aprobación de reservas desencadena el envío de correo de pago aprobado con el código y destinatario correctos, manejando con tolerancia de fallos cualquier error SMTP.

## [1.3.0] - 2026-06-17
### Añadido
- **Plantilla HTML de Confirmación de Reserva:** Creación de una plantilla de correo electrónico HTML con estilos CSS inline utilizando los colores corporativos del Sindicato (Forest `#1B4332`, Sage `#52796F`, Mist `#F0F4F1`, Charcoal `#1A1A2E`).
- **Detalle Dinámico en Correo:** El correo incluye toda la información crítica para el usuario: código de reserva, nombre del espacio, fechas formateadas en `dd/MM/yyyy`, número de invitados con su lista de nombres y RUTs, y un desglose financiero completo.
- **Datos de Transferencia Bancaria:** Inclusión de un recuadro destacado con los datos de cuenta del Banco Estado del Sindicato y las instrucciones para cargar el comprobante dentro de las 24 horas.
- **Integración asíncrona:** Inyección de `NotificationsService` en `BookingsService` para disparar el correo de confirmación de reserva en segundo plano (fire-and-forget), previniendo cualquier retraso en la API por latencia SMTP.
- **Pruebas y Cobertura:** Configuración de mocks y assertions en `bookings.service.spec.ts` para verificar la llamada al método de envío de correos y la tolerancia a fallos del servicio en caso de errores en el envío de notificaciones.

---

## [1.2.0] - 2026-06-16
### Añadido (Backend - MySQL & TypeORM)
- **Persistencia en Base de Datos Local:** Integración completa de **MySQL** utilizando **TypeORM** en reemplazo de los arreglos en memoria temporales.
- **Modelos de Entidades de Base de Datos:**
  - `UserEntity` para gestionar datos de usuarios, roles, número de ficha y credenciales.
  - `SpaceEntity` para gestionar recintos (cabañas, quinchos, piscinas) con almacenamiento de imágenes y amenities mediante `simple-json`.
  - `Booking` para el registro de reservas principales vinculadas a usuarios y espacios.
  - `GuestEntity` para la lista de acompañantes asociada a cada reserva (relación 1:N).
  - `AnnouncementEntity` para anuncios públicos del sindicato.
- **Servicio Semillero (Seeder):** Implementación de `SeedService` (`OnApplicationBootstrap`) que pobla automáticamente la base de datos con registros por defecto de espacios, anuncios y usuarios con contraseñas encriptadas al iniciar la aplicación por primera vez.
- **Configuración Dinámica:** Integración de `@nestjs/config` para cargar variables de conexión de base de datos desde un archivo `.env` local.
- **Refactorización Asíncrona:** Conversión de todos los métodos de los servicios (`UsersService`, `SpacesService`, `BookingsService`, `AnnouncementsService`) y controladores a operaciones asíncronas basadas en `Promises`.
- **Sistema de Migraciones con TypeORM:**
  - Configuración del archivo de origen de datos (`src/data-source.ts`) cargando dinámicamente las credenciales desde el archivo `.env`.
  - Creación de scripts automatizados en `package.json` para la CLI de TypeORM (`typeorm`, `migration:generate`, `migration:run`, `migration:revert`).
  - Configuración en `AppModule` para ejecutar automáticamente las migraciones pendientes en el arranque de la aplicación (`migrationsRun`) y controlar de manera segura la sincronización mediante variables de entorno (`DB_SYNCHRONIZE` y `DB_MIGRATIONS_RUN`).
  - Generación y ejecución de la migración inicial (`1781668353815-InitialSchema.ts`) con el esquema de tablas relacionales completo.
- **Seguridad Real con JWT (JSON Web Tokens):**
  - Reemplazo del mock de tokens codificados en Base64 por firmas criptográficas reales utilizando la librería oficial `@nestjs/jwt`.
  - Configuración dinámica de `JwtModule` inyectando `ConfigService` para leer `JWT_SECRET` y `JWT_EXPIRATION` desde las variables de entorno.
  - Refactorización de `AuthService` para inyectar `JwtService` y firmar/verificar tokens con autenticidad criptográfica real.
  - Mantenimiento de la firma y compatibilidad de métodos en el servicio, garantizando un impacto cero en los controladores existentes.
- **Interceptor JWT (Frontend):**
  - Creación del interceptor HTTP funcional `jwt.interceptor.ts` en Angular para adjuntar automáticamente el token Bearer (`Authorization`) en peticiones HTTP salientes desde el almacenamiento local o de sesión.
  - Registro del interceptor en la configuración global de la aplicación (`app.config.ts`) mediante `provideHttpClient(withInterceptors([jwtInterceptor]))`.
- **Módulo y Servicio de Notificaciones (SMTP / AWS SES):**
  - Creación de `NotificationsModule` y `NotificationsService` encapsulando la lógica para envíos de correo utilizando la librería estándar `nodemailer` a través de servidores SMTP.
  - Definición de parámetros SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) en el archivo `.env`.
  - Estructuración extensible preparada para incorporar otros canales de notificación (como SMS o notificaciones push) en etapas posteriores.
  - Inclusión de pruebas unitarias (`notifications.service.spec.ts`) mockeando el transportador de `nodemailer` para asegurar el correcto flujo de envío y gestión de excepciones en aislamiento.

### Solucionado
- **Errores de Compilación de Decoradores (TS1272):** Uso de `import type` para importar alias y tipos de modelos (`UserRole`, `SpaceType`, `BookingStatus`, `PriceBreakdown`) resolviendo errores de metadatos de decoradores bajo la configuración `"isolatedModules": true`.
- **Error de Importación de Supertest en Tests:** Cambio del estilo de importación a importación por defecto (`import request from 'supertest'`) para corregir errores de tipado e invocación en entornos NodeNext/ESM.
- **Parseo de Variables de Entorno Booleanas:** Corrección de la lectura de variables como `DB_SYNCHRONIZE` y `DB_MIGRATIONS_RUN` para parsear explícitamente los valores de cadena (`"true"`/`"false"`) a booleanos lógicos.
- **Estabilidad de E2E Tests:** Configuración en `app.e2e-spec.ts` para cargar variables de entorno utilizando `dotenv/config`, incremento en el timeout de Jest a 20s para permitir conexiones a bases de datos remotas, y adición del hook `afterAll` para cerrar la aplicación y liberar los sockets de conexión de forma limpia.
- **Correcciones en Compilación del Frontend (HTML):** Solución a errores de compilación del compilador de Angular (`NG5002`) en `AdminCalendarComponent` provocados por el uso de slashes (`/`) en las propiedades de enlace directo de clases (por ejemplo, `[class.bg-mist/15]`), reemplazándolos por enlaces correctos con `[ngClass]`.
- **Tipos de Pruebas Unitarias de Espacios:** Corrección de advertencias de tipo en `spaces.controller.spec.ts` definiendo `mockSpaceDto` en snake_case para calzar con la firma del DTO esperada por el controlador.

---

## [1.1.0] - 2026-06-15
### Añadido (Backend - Funcionalidades de Negocio)
- **Registro y Seguridad de Usuarios:** Implementación de encriptación y hashing de contraseñas seguro mediante algoritmo PBKDF2 sin dependencias externas (usando módulo nativo `crypto` de Node.js).
- **Control y Activación Administrativa:** Endpoints para que el administrador active o desactive socios del sindicato (`PATCH /users/:id/toggle-status`).
- **Autenticación Bearer Token (Mock):** Sistema de decodificación y validación de tokens codificados en Base64 en el encabezado `Authorization`.
- **Cálculo de Tarifas y Reglas de Negocio:** Algoritmo en backend para validar capacidad máxima de acompañantes, verificar colisión de fechas ocupadas/bloqueadas, y calcular desgloses de precios de forma matemática diferenciando tarifas de socios, invitados y externos.
- **CRUD de Espacios:** Endpoints de escritura/edición (`POST`, `PUT`, `DELETE`) de recintos para administración.

### Añadido (Frontend - Paneles Interactivos)
- **CRUD de Espacios (Frontend):** Formulario interactivo mediante ventanas modales para el listado, creación, edición y eliminación de recintos.
- **CRUD de Usuarios (Frontend):** Listado de usuarios activos, creación de nuevos perfiles, y botones de acción rápida para activar/desactivar el estado de socios sindicales.
- **Calendario Visual de Ocupación:** Vista mensual interactiva tipo calendario para visualizar de manera gráfica la disponibilidad de los recintos con soporte para filtros por tipo de espacio y hovers con detalles de las reservas.

---

## [1.0.0] - 2026-06-12
### Añadido (Estructura Base & Prototipo Angular)
- **Estructura Monorepo:** Configuración base del proyecto segregado en `/frontend` (Angular 18 + TailwindCSS) y `/backend` (NestJS).
- **Prototipo de Clientes (Frontend):**
  - Catálogo interactivo de Cabañas, Quinchos y Piscinas.
  - Flujo de reservas en 4 pasos (Espacio -> Fechas -> Invitados -> Pago/Transferencia).
  - Carga de comprobante de pago emulada y consulta en panel de "Mis Reservas".
  - Botón de cambio rápido de perfil de prueba (`socio`, `admin`, `external`) para pruebas locales.
- **Panel Administrativo (Frontend):** Listado y gestión global de reservas (aprobación/rechazo de comprobantes de pago).
- **Endpoints de Lectura (Backend Mock):** APIs iniciales para consultar espacios y anuncios disponibles desde datos en memoria.
- **Documentación del Proyecto:** Creación de guías de diseño (`design.md`), hoja de ruta (`todo.md`) y guías de inicio rápido en `README.md`.
