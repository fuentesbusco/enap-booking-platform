# Changelog (Registro de Cambios)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

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

### Solucionado
- **Errores de Compilación de Decoradores (TS1272):** Uso de `import type` para importar alias y tipos de modelos (`UserRole`, `SpaceType`, `BookingStatus`, `PriceBreakdown`) resolviendo errores de metadatos de decoradores bajo la configuración `"isolatedModules": true`.
- **Error de Importación de Supertest en Tests:** Cambio del estilo de importación a importación por defecto (`import request from 'supertest'`) para corregir errores de tipado e invocación en entornos NodeNext/ESM.

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
