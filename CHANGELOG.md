# Changelog (Registro de Cambios)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

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
