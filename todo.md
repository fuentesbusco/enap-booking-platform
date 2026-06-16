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
- [/] **CRUD de Espacios (Frontend):** Listado y diseño visual implementado. Falta crear los formularios/modales de creación e ingreso de nuevos espacios.
- [/] **CRUD de Usuarios (Frontend):** Listado y visualización de socios activos. Falta el desarrollo de las pantallas para añadir usuarios y activar/desactivar socios sindicales.
- [ ] **Calendario Visual de Ocupación:** Vista tipo calendario mensual para ver qué espacios están ocupados en qué fechas de manera gráfica.

---

## ⚙️ Fase 1: Integración de Backend (NestJS + MySQL en `/backend`)

Para la siguiente etapa de desarrollo, se implementará el backend en **NestJS**. Las tareas requeridas son:

### Configuración Inicial & Arquitectura
- [ ] Configuración del proyecto NestJS con TypeScript y estructura modular.
- [ ] Conexión a la base de datos **MySQL** local y preparación de las entidades con **TypeORM**.
- [ ] Configuración del sistema de migraciones para la base de datos.

### Módulo de Autenticación & Usuarios
- [ ] Implementación de seguridad con **JWT (JSON Web Tokens)**.
- [ ] Registro de usuarios y encriptación de contraseñas.
- [ ] Decoradores y Guards personalizados en NestJS para restringir endpoints según roles (`socio`, `external`, `admin`).
- [ ] API de usuarios: Activación/desactivación de socios sindicales, consulta de perfiles.

### Gestión de Espacios y Reservas
- [ ] API de Espacios: Endpoints CRUD (`GET`, `POST`, `PUT`, `DELETE`).
- [ ] API de Reservas:
  - [ ] Endpoint de creación de reservas.
  - [ ] Validación automática de disponibilidad de fechas (evitar sobreventa).
  - [ ] Validación de capacidad máxima de invitados.
  - [ ] Cálculo matemático de tarifas en el backend según rol del usuario y cantidad de invitados.
  - [ ] Listado de reservas personales (`/bookings/me`) y globales para administración (`/bookings`).

### Integración de Almacenamiento (AWS S3)
- [ ] Configuración del SDK de AWS en NestJS.
- [ ] Implementación de cargador de archivos (Multer) en el backend.
- [ ] Endpoint para subir comprobante de pago bancario a un bucket de **AWS S3** y guardar la URL en la reserva.
- [ ] Endpoint para subir fotos de nuevos espacios.

### Integración del Frontend de Angular con la API
- [ ] Configuración de la URL base del API en los entornos de Angular (`frontend/src/environments/environment.ts`).
- [ ] Creación de un interceptor JWT para enviar automáticamente el token Bearer en el encabezado `Authorization` (`frontend/src/app/core/guards/jwt.interceptor.ts`).
- [ ] Conexión de todos los servicios (`frontend/src/app/core/services/`) a la API de NestJS con `HttpClient`.

---

## 🚀 Fase 2: Pasarela de Pago & Producción (AWS)

### Notificaciones & Plantillas
- [ ] Integración de **AWS SES** en NestJS para envío de correos automáticos.
- [ ] Plantilla de correo 1: Confirmación de reserva realizada con datos de transferencia.
- [ ] Plantilla de correo 2: Confirmación de aprobación del pago (Reserva confirmada).
- [ ] Plantilla de correo 3: Notificación de rechazo de comprobante con motivo adjunto.

### Infraestructura Cloud & Despliegue
- [ ] Configuración de una instancia **AWS EC2** para el backend NestJS con PM2 o Docker.
- [ ] Configuración de **AWS RDS** para la base de datos MySQL de producción.
- [ ] Configuración de reglas de seguridad (Security Groups) y DNS.

### Automatización de Pagos (Fase 2)
- [ ] Integración de la API de **Transbank Webpay** o **MercadoPago** en el backend.
- [ ] Retorno automático tras la pasarela de pagos.
- [ ] Endpoint de Webhook para recibir notificaciones asincrónicas de confirmación de pago y actualizar el estado de la reserva inmediatamente.
