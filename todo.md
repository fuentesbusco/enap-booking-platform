# Hoja de Ruta y Listado de Tareas (TODO) - Plataforma de Reservas

Este archivo detalla el progreso actual del frontend (mock/prototipo) y las tareas de desarrollo e integración necesarias para llevar la aplicación a producción.

---

## 🎨 Fase 1: Frontend (Prototipo Interactivo en `/frontend`)

El frontend está desarrollado en Angular 18 + Tailwind CSS. A continuación se detalla el estado actual de los flujos de usuario simulados:

### Flujo de Clientes / Socios
- [x] **Selector de Espacios:** Catálogo interactivo de Cabañas, Quinchos y Piscinas con filtros y desglose de tarifas.
- [x] **Flujo de Reserva Completo (4 pasos):**
  - [x] **Paso 1 (Espacio):** Detalle, fotos, descripción y tarifas.
  - [x] **Paso 2 (Fechas):** Selección de check-in / check-out con validación visual de fechas ocupadas/bloqueadas.
  - [x] **Paso 3 (Invitados):** Registro de acompañantes (Nombre, RUT, Teléfono) con validación de capacidad máxima del recinto.
  - [x] **Paso 4 (Pago):** Detalle de desglose financiero, datos de transferencia y zona de carga de comprobante bancario.
- [x] **Panel "Mis Reservas":** Consulta del listado histórico de reservas del usuario logueado con estados y desgloses.
- [x] **Simulación de Carga de Comprobante:** Emulación de carga de archivos (PDF/imagen) para cambiar el estado a `pending_approval`.
- [x] **Cambio de Perfiles de Prueba:** Botones rápidos en el Login para cambiar de rol instantáneamente (`socio`, `admin`) para testing local.

### Panel de Administración
- [x] **Vista de Control de Reservas:** Tablas con filtros de estado y visualización rápida de comprobantes.
- [x] **Aprobación / Rechazo:** Acciones administrativas para cambiar el estado de las reservas a `confirmed` o `rejected`.
- [x] **CRUD de Espacios (Frontend):** Listado, creación, edición y eliminación (CRUD) totalmente funcionales mediante un formulario modal interactivo.
- [x] **CRUD de Usuarios (Frontend):** Listado de usuarios, pantallas para registrar nuevos perfiles y controles administrativos interactivos para activar/desactivar socios del sindicato.
- [x] **Calendario Visual de Ocupación:** Vista tipo calendario mensual interactivo para ver qué espacios están ocupados en qué fechas de manera gráfica (con filtros por recinto y detalles en hovers).

---

## ⚙️ Fase 1: Integración de Backend (NestJS + MySQL en `/backend`)

Para la siguiente etapa de desarrollo, se implementará el backend en **NestJS**. Las tareas requeridas son:

### Configuración Inicial & Arquitectura
- [x] Configuración del proyecto NestJS con TypeScript y estructura modular.
- [x] Conexión a la base de datos **MySQL** local y preparación de las entidades con TypeORM.
- [x] Configuración del sistema de migraciones para la base de datos.
- [x] Pruebas unitarias para el backend con al menos un 50% de cobertura (eliminando pruebas E2E).

### Módulo de Autenticación & Usuarios
- [x] Implementación de Login de prueba y emulación de tokens en Base64.
- [x] Métodos de decodificación y validación de tokens en la cabecera `Authorization`.
- [x] Implementación de seguridad real con **JWT (JSON Web Tokens)**.
- [x] Registro de usuarios y encriptación de contraseñas (implementado hash seguro PBKDF2 sin dependencias externas).
- [ ] Decoradores y Guards personalizados en NestJS para restringir endpoints según roles (`socio`, `external`, `admin`).
- [x] API de usuarios: Activación/desactivación de socios sindicales, consulta de perfiles y registro de nuevos usuarios.

### Gestión de Espacios y Reservas
- [x] API de Espacios: Endpoints GET para consultar espacios disponibles.
- [x] API de Anuncios: Endpoints GET para consultar anuncios publicados.
- [x] API de Reservas:
  - [x] Endpoint de creación de reservas.
  - [x] Validación de disponibilidad de fechas (evitando colisión de días bloqueados y solapamientos).
  - [x] Validación de capacidad máxima de invitados.
  - [x] Cálculo matemático de tarifas y desgloses de precios en el backend según rol de usuario.
  - [x] Listado de reservas personales (`/bookings/me`) y globales para administración (`/bookings`).
  - [x] Endpoints para simular la subida del comprobante bancario (`/bookings/upload-receipt`).
  - [x] Endpoints para aprobación y rechazo de reservas por parte del administrador.
- [x] API de Espacios: Endpoints de escritura/edición (`POST`, `PUT`, `DELETE`) para el CRUD de administración.

### Integración de Almacenamiento (AWS S3)
- [ ] Configuración del SDK de AWS en NestJS.
- [ ] Implementación de cargador de archivos (Multer) en el backend.
- [ ] Endpoint para subir comprobante de pago bancario real a un bucket de **AWS S3** y guardar la URL.
- [ ] Endpoint para subir fotos de nuevos espacios.

### Integración del Frontend de Angular con la API
- [ ] Configuración de la URL base del API en los entornos de Angular (`frontend/src/environments/environment.ts`).
- [x] Creación de un interceptor JWT para enviar automáticamente el token Bearer en el encabezado `Authorization` (`frontend/src/app/core/guards/jwt.interceptor.ts`).
- [ ] Conexión de todos los servicios (`frontend/src/app/core/services/`) a la API de NestJS con `HttpClient`.

---

## 🚀 Fase 2: Pasarela de Pago & Producción (AWS)

### Notificaciones & Plantillas
- [x] Integración de **AWS SES** (vía SMTP) en NestJS para envío de correos automáticos (creado módulo y servicio extensible de notificaciones).
- [x] Plantilla de correo 1: Confirmación de reserva realizada con datos de transferencia.
- [x] Plantilla de correo 2: Confirmación de aprobación del pago (Reserva confirmada).
- [ ] Plantilla de correo 3: Notificación de rechazo de comprobante con motivo adjunto.
- [ ] Notificación de correo al administrador: Nueva reserva realizada (aviso para revisión y aprobación).

### Infraestructura Cloud & Despliegue
- [ ] Configuración de una instancia **AWS EC2** para el backend NestJS con PM2 o Docker.
- [ ] Configuración de **AWS RDS** para la base de datos MySQL de producción.
- [ ] Configuración de reglas de seguridad (Security Groups) y DNS.

### Automatización de Pagos (Fase 2)
- [ ] Integración de la API de **Transbank Webpay** o **MercadoPago** en el backend.
- [ ] Retorno automático tras la pasarela de pagos.
- [ ] Endpoint de Webhook para recibir notificaciones asincrónicas de confirmación de pago y actualizar el estado de la reserva inmediatamente.
