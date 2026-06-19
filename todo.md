# Hoja de Ruta y Listado de Tareas (TODO) - Plataforma de Reservas

Este archivo detalla el progreso actual del frontend (mock/prototipo) y las tareas de desarrollo e integración necesarias para llevar la aplicación a producción.

---

## 🎨 Fase 1: Frontend (Prototipo Interactivo en `/frontend`)

El frontend está desarrollado en Angular 18 + Tailwind CSS. A continuación se detalla el estado actual de los flujos de usuario simulados:

### Flujo de Clientes / Socios
- [x] **Selector de Espacios:** Catálogo interactivo de Cabañas, Quinchos y Piscinas con filtros y desglose de tarifas.
- [x] **Estandarización de Cabañas (1 a 6):** Configuración de exactamente 6 cabañas con capacidad máxima de 6 personas y amenities actualizados (descripción y advertencia de sábanas/toallas).
- [x] **Arriendo por Jornada Única (Quinchos/Piscina):** Selector de fecha único ("Día de la Jornada") que iguala check-in y check-out.
  - [x] **Disponibilidad Exclusiva (Quinchos):** Bloqueo total de la fecha ante cualquier reserva activa.
  - [x] **Capacidad Compartida (Piscina):** No exclusividad. Múltiples socios pueden reservar el mismo día hasta alcanzar la capacidad máxima (80 personas), bloqueándose solo cuando el aforo total está completo.
- [x] **Flujo de Patrocinio a Tercero:** Selector para socio para arriendos a terceros externos con registro de sus datos (Nombre, RUT, Teléfono) y cálculo dinámico de tarifa base general.
- [x] **Refinamiento de Tarifas en Catálogo:** Badges "Socio Sindicato" (verde) y "Público / Externo" (gris) para cada espacio y aclaraciones de tipo de cobro (por día o jornada).
- [x] **Flujo de Reserva Completo (4 pasos):**
  - [x] **Paso 1 (Espacio):** Detalle, fotos, descripción y tarifas.
  - [x] **Paso 2 (Fechas):** Selección de check-in / check-out (rango para cabañas, día único para quinchos/piscina) con validación visual de fechas ocupadas/bloqueadas.
  - [x] **Paso 3 (Invitados):** Registro de acompañantes (Nombre, RUT, Teléfono) con validación de capacidad máxima del recinto y opción de tercero para socios.
  - [x] **Paso 4 (Pago):** Detalle de desglose financiero, datos de transferencia y zona de carga de comprobante bancario.
- [x] **Panel "Mis Reservas":** Consulta del listado histórico de reservas del usuario logueado con estados y desgloses.
- [x] **Spinner de Carga en Mis Reservas:** Bloqueo visual durante la obtención de las reservas para evitar la visualización de listas vacías temporales.
- [x] **Galería Pública con Lightbox:** Sección interactiva "Conoce el Centro" con un visor en pantalla completa (Lightbox) navegable mediante teclado (flechas y ESC).
- [x] **Imágenes Reales en la Home y Espacios:** Integración de fotos reales locales (`/images/*`) provistas por el cliente en el catálogo de espacios y la Home.
- [x] **Simulación de Carga de Comprobante:** Emulación de carga de archivos (PDF/imagen) para cambiar el estado a `pending_approval`.
- [x] **Cambio de Perfiles de Prueba:** Botones rápidos en el Login para cambiar de rol instantáneamente (`socio`, `admin`) para testing local.

### Panel de Administración
- [x] **Vista de Control de Reservas:** Tablas con filtros de estado y visualización rápida de comprobantes.
- [x] **Columna Socio/No Socio en Reservas:** Columna "Tipo" en la administración de reservas que discrimina con badges de colores.
- [x] **Visualización de Reserva para Tercero:** Badge "Para Tercero" y desglose de datos del ocupante patrocinado en la tabla de control de reservas.
- [x] **Aprobación / Rechazo:** Acciones administrativas para cambiar el estado de las reservas a `confirmed` o `rejected`.
- [x] **CRUD de Espacios (Frontend):** Listado, creación, edición y eliminación (CRUD) totalmente funcionales mediante un formulario modal interactivo.
- [x] **CRUD de Usuarios (Frontend):** Listado de usuarios, pantallas para registrar nuevos perfiles y controles administrativos interactivos para activar/desactivar socios del sindicato.
- [x] **Contraseñas Temporales:** Generación de clave aleatoria de 6 caracteres al crear un usuario, visible en el toast de éxito.
- [x] **Galería de Imágenes (CRUD):** Panel CRUD interactivo en `/admin/galeria` para agregar y eliminar fotos de la galería.
- [x] **Checkbox de Avisos Destacados:** Corrección en el checkbox de avisos en la administración para persistir y ordenar correctamente los avisos fijos.
- [x] **Imágenes en Avisos (CRUD):** Campo de URL de imagen en el formulario de creación de avisos, visualización de miniatura en la lista y almacenamiento en base de datos.
- [x] **Calendario Visual de Ocupación:** Vista tipo calendario mensual interactivo para ver qué espacios están ocupados en qué fechas de manera gráfica (con filtros por recinto y detalles en hovers).

---

## ⚙️ Fase 1: Integración de Backend (NestJS + MySQL en `/backend`)

Para la siguiente etapa de desarrollo, se implementará el backend en **NestJS**. Las tareas requeridas son:

### Configuración Inicial & Arquitectura
- [x] Configuración del proyecto NestJS con TypeScript y estructura modular.
- [x] Conexión a la base de datos **MySQL** local y preparación de las entidades con TypeORM.
- [x] Configuración del sistema de migraciones para la base de datos.
- [x] Pruebas unitarias para el backend con al menos un 50% de cobertura (eliminando pruebas E2E).
- [x] Integración de utilidades de seguridad (Helmet y CORS seguro).
- [x] Integración de Throttler (Rate Limiting) en login y reservas.

### Módulo de Autenticación & Usuarios
- [x] Implementación de Login de prueba y emulación de tokens en Base64.
- [x] Métodos de decodificación y validación de tokens en la cabecera `Authorization`.
- [x] Implementación de seguridad real con **JWT (JSON Web Tokens)**.
- [x] Registro de usuarios y encriptación de contraseñas (implementado hash seguro PBKDF2 sin dependencias externas).
- [x] Decoradores y Guards personalizados en NestJS para restringir endpoints según roles (`socio`, `external`, `admin`).
- [x] API de usuarios: Activación/desactivación de socios sindicales, consulta de perfiles y registro de nuevos usuarios.

### Gestión de Espacios y Reservas
- [x] **API de Espacios:** Endpoints GET para consultar espacios disponibles.
- [x] **API de Anuncios:** Endpoints GET para consultar anuncios publicados.
- [x] **API de Galería:** Endpoints GET, POST y DELETE con seguridad basada en roles (JWT/Admin).
- [x] **API de Reservas:**
  - [x] Endpoint de creación de reservas.
  - [x] Validación de disponibilidad de fechas (evitando colisión de días bloqueados y solapamientos).
  - [x] Validación de capacidad máxima de invitados.
  - [x] Cálculo matemático de tarifas y desgloses de precios en el backend según rol de usuario.
  - [x] Listado de reservas personales (`/bookings/me`) y globales para administración (`/bookings`).
  - [x] Endpoints para simular la subida del comprobante bancario (`/bookings/upload-receipt`).
  - [x] Endpoints para aprobación y rechazo de reservas por parte del administrador.
- [x] **Generación de Contraseñas Temporales:** Retorno de contraseña autogenerada en el DTO de respuesta al crear usuario en la administración.
- [x] **Sincronización de Imágenes en Caliente:** Actualización en caliente de URLs de Unsplash por locales (`/images/*`) en el arranque (`SeedService`).
- [x] **API de Espacios:** Endpoints de escritura/edición (`POST`, `PUT`, `DELETE`) para el CRUD de administración.

### Integración de Almacenamiento (AWS S3)
- [x] Configuración del SDK de AWS en NestJS.
- [x] Implementación de cargador de archivos (Multer) en el backend.
- [x] Endpoint para subir comprobante de pago bancario real a un bucket de **AWS S3** y guardar la URL.
- [x] Endpoint para subir fotos de nuevos espacios.

### Integración del Frontend de Angular con la API
- [x] Configuración de la URL base del API en los entornos de Angular (`frontend/src/environments/environment.ts`).
- [x] Creación de un interceptor JWT para enviar automáticamente el token Bearer en el encabezado `Authorization` (`frontend/src/app/core/guards/jwt.interceptor.ts`).
- [x] Conexión de todos los servicios (`frontend/src/app/core/services/`) a la API de NestJS con `HttpClient`.

---

## 🚀 Fase 2: Pasarela de Pago & Producción (AWS)

### Notificaciones & Plantillas
- [x] Integración de **AWS SES** (vía SMTP) en NestJS para envío de correos automáticos (creado módulo y servicio extensible de notificaciones).
- [x] Plantilla de correo 1: Confirmación de reserva realizada con datos de transferencia.
- [x] Plantilla de correo 2: Confirmación de aprobación del pago (Reserva confirmada).
- [x] Plantilla de correo 3: Notificación de rechazo de comprobante con motivo adjunto.
- [x] Notificación de correo al administrador: Nueva reserva realizada (aviso para revisión y aprobación).

### Infraestructura Cloud & Despliegue
- [x] Configuración de infraestructura Serverless en **AWS Lambda + API Gateway** mediante Serverless Framework.
- [x] Configuración de **AWS RDS** para la base de datos MySQL de producción con pool de conexiones optimizado para Lambda.
- [x] Configuración de reglas de seguridad (Security Groups, CORS, roles de IAM) y DNS.

### Automatización de Pagos (Fase 2)
- [x] Integración de la API de **MercadoPago** en el backend (SDK, inicialización y credenciales).
- [x] Integración de la API de **Transbank Webpay** en el backend (simulado/maquetado).
- [x] Páginas de Retorno de Mercado Pago (Frontend): Creación de vistas de éxito, fallo y pendiente para validación del retorno.
- [x] Endpoint de confirmación de pago para recibir notificaciones de transacciones de Mercado Pago y actualizar el estado de la reserva inmediatamente.

---

## 🚀 Despliegue en Producción
- [x] **Frontend (Vercel)**: Desplegado exitosamente en producción.
  - Producción: `https://enap-front-web.vercel.app`
- [x] **Backend (AWS Lambda & API Gateway)**: Desplegado mediante Serverless Framework en us-east-1.
  - Endpoint Base: `https://odru0vr5a5.execute-api.us-east-1.amazonaws.com/`
- [x] **Base de Datos (AWS RDS MySQL)**: Conexiones activas con pool optimizado.
- [x] **Almacenamiento (AWS S3)**: Carga en producción de comprobantes de reserva y fotografías para espacios y galería.
- [x] **Notificaciones (AWS SES)**: Correos automatizados para titular y administración.

