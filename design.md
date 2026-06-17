# Documento de Diseño del Sistema - Plataforma de Reservas Sindicato ENAP

Este documento describe la arquitectura de software, los modelos de datos, las reglas de negocio y la estrategia de transición desde el prototipo actual (Mock Frontend) hacia el sistema de producción final.

---

## 1. Arquitectura de la Solución

El sistema se basa en una arquitectura cliente-servidor desacoplada:

```mermaid
graph LR
    A[Angular 18 Frontend] -- HTTP / JWT --> B[NestJS Backend API]
    B -- TypeORM --> C[(MySQL Database)]
    B -- SDK --> D[AWS S3 - Comprobantes/Fotos]
    B -- SDK --> E[AWS SES - Emails]
```

### Frontend (Prototipo Actual - en `/frontend`)
*   **Diseño Modular:** Dividido en capas (`core` para servicios/lógica de negocio global y `features` para las vistas).
*   **Manejo de Estado Reactivo:** Implementado mediante **Angular Signals** en los servicios del core para manejar de forma reactiva el estado del usuario activo (`AuthService`) y la lista de reservas (`BookingsService`).
*   **Persistencia Temporal:** El usuario autenticado de prueba se almacena en el `sessionStorage` del navegador para mantener la sesión activa al recargar la página.

### Backend (Fase 1 - Mock en Memoria en `/backend`)
*   **Framework:** NestJS 11 + TypeScript con controladores específicos para cada recurso (`health`, `auth`, `spaces`, `bookings`, `announcements`).
*   **Manejo de Estado:** Almacenado en memoria mediante variables locales en los servicios correspondientes (`bookings.service.ts`, `spaces.service.ts`, etc.) para simular una base de datos relacional activa.
*   **Autenticación y Seguridad:** Simulado a través de tokens en Base64 enviados en la cabecera `Authorization: Bearer <token>`. El backend decodifica el token para extraer el identificador y rol del usuario, validando sus permisos correspondientes.

### Backend (Siguiente Fase de Producción)
*   **Acceso a Datos:** **TypeORM** como ORM para definir los esquemas de bases de datos utilizando clases de TypeScript y manejar migraciones de forma automática.
*   **Motor de Base de Datos:** **MySQL** relacional para garantizar consistencia e integridad referencial.

---

## 2. Modelos de Datos (Entidades de Dominio)

Los modelos están definidos en [models.ts (Frontend)](file:///home/daniel/projects/enap-mock-frontend/frontend/src/app/core/models.ts) y en [models.ts (Backend)](file:///home/daniel/projects/enap-mock-frontend/backend/src/models.ts). La estructura se compone de las siguientes entidades:

### Usuario (`User`)
*   `id` (number): Identificador único.
*   `full_name` (string): Nombre completo.
*   `rut` (string): RUT chileno para validación de identidad.
*   `email` (string): Correo electrónico.
*   `role` (`UserRole`): Roles del sistema (`socio`, `external`, `admin`).
*   `ficha_number` (string, opcional): Número de ficha sindical (solo para socios).

### Espacio (`Space`)
*   `id` (number): Identificador único.
*   `name` (string): Nombre comercial del espacio.
*   `type` (`SpaceType`): Clasificación del espacio (`cabin` | `quincho` | `pool`).
*   `description` (string): Descripción detallada.
*   `max_capacity` (number): Límite máximo de personas permitidas.
*   `base_price` (number): Tarifa por día para usuarios externos.
*   `socio_price` (number): Tarifa por día preferencial para socios del sindicato.
*   `guest_price` (number): Costo diario por invitado adicional.
*   `free_guests_for_socio` (number): Cantidad de invitados libres de cobro permitidos para socios.
*   `images` (string[]): Rutas/URLs de fotos del recinto.
*   `amenities` (string[]): Lista de comodidades.

### Invitado (`Guest`)
*   `id` (number, opcional): ID autoincremental del invitado.
*   `full_name` (string): Nombre del invitado.
*   `rut` (string): RUT de control de acceso.
*   `phone` (string, opcional): Teléfono de contacto.

### Reserva (`Booking`)
*   `id` (number): Identificador único.
*   `booking_code` (string): Código de reserva autogenerado legible (ej: `ENP-2025-00004`).
*   `user` (`User`): Usuario titular de la reserva.
*   `space` (`Space`): Espacio reservado.
*   `check_in` (string): Fecha de entrada (`YYYY-MM-DD`).
*   `check_out` (string): Fecha de salida (`YYYY-MM-DD`).
*   `status` (`BookingStatus`): Estados del ciclo de vida de la reserva (`pending_payment`, `pending_approval`, `confirmed`, `cancelled`, `rejected`, `expired`).
*   `total_amount` (number): Monto final calculado a pagar.
*   `guests` (`Guest`[]): Lista de personas invitadas.
*   `receipt_url` (string, opcional): Enlace al comprobante de transferencia bancaria subido.
*   `admin_notes` (string, opcional): Comentarios o motivos de rechazo del administrador.
*   `created_at` (string): Fecha y hora de creación.
*   `price_breakdown` (`PriceBreakdown`): Detalle pormenorizado del cobro final.

---

## 3. Reglas de Negocio Clave (Implementadas en NestJS)

### 3.1 Cálculo de Tarifas (`calculatePriceBreakdown`)
El backend NestJS calcula dinámicamente el precio final en [bookings.service.ts](file:///home/daniel/projects/enap-mock-frontend/backend/src/bookings/bookings.service.ts):
1.  **Días de Reserva:** Determina la diferencia de días entre `check_in` y `check_out` (mínimo 1 día).
2.  **Costo Base del Espacio:** Determina si aplica `socio_price` o `base_price` multiplicando el valor unitario por la cantidad de días de reserva.
3.  **Cobro por Acompañantes:**
    *   Si el titular es `socio`, tiene derecho a un cupo gratuito de acompañantes definido por `free_guests_for_socio` (ej. 5 invitados en piscina).
    *   Cualquier invitado adicional que supere el límite permitido se cobra diariamente al costo unitario de `guest_price`.
    *   Si el titular es `external`, no hay cupos gratuitos; se cobra `guest_price` para cada invitado del listado.

### 3.2 Validación de Bloqueos de Disponibilidad
Antes de registrar cualquier reserva, el backend valida si las fechas están libres:
1.  **Bloqueos Estáticos:** Compara las fechas solicitadas contra el diccionario `blockedDates` cargado con fechas fuera de servicio programadas.
2.  **Solapamiento de Reservas:** Verifica que no exista ninguna reserva activa (en estado `confirmed` o `pending_approval`) en el mismo recinto que coincida con las fechas solicitadas.
3.  **Límite de Capacidad:** Valida que el número de personas en `guests` no exceda el `max_capacity` del recinto.

---

## 4. Endpoints Habilitados en la API

La API del backend expone los siguientes endpoints (escuchando por defecto en el puerto `3000`):

*   `GET /health`: Estado utilitario de salud del servicio.
*   `POST /auth/login`: Validación de credenciales simulada; entrega el token Base64 y la información del usuario.
*   `GET /spaces`: Obtención de todos los espacios reservables y sus tarifas.
*   `POST /spaces`: (Admin) Creación de un nuevo espacio.
*   `PUT /spaces/:id`: (Admin) Edición y actualización de las propiedades de un espacio.
*   `DELETE /spaces/:id`: (Admin) Eliminación de un espacio.
*   `GET /announcements`: Lista de comunicados informativos publicados.
*   `GET /bookings`: (Admin) Listado de todas las reservas del sistema.
*   `GET /bookings/me`: Historial de reservas asociadas al usuario autenticado actual.
*   `POST /bookings`: Creación de una reserva (ejecuta validaciones de capacidad y disponibilidad de fechas).
*   `POST /bookings/upload-receipt`: Simula la recepción de un comprobante de transferencia y lo asocia a la reserva en estado `pending_approval`.
*   `PATCH /bookings/:id/approve`: (Admin) Aprobación administrativa (pasa a `confirmed`).
*   `PATCH /bookings/:id/reject`: (Admin) Rechazo administrativo (pasa a `rejected` y adjunta comentarios del administrador).

---

## 5. Próxima Etapa de Integración en el Frontend

Para comunicar la aplicación de Angular con la API de NestJS:
1.  **Actualizar Entorno:** Definir la propiedad `apiUrl: 'http://localhost:3000'` en los archivos `environment.ts` de Angular.
2.  **Interceptor JWT:** Crear un interceptor de Angular que intercepte todas las llamadas HTTP salientes y adjunte la cabecera `Authorization: Bearer <token>` cuando el token esté disponible.
3.  **Actualizar Clientes HTTP:** Reemplazar los retornos mock en memoria (`of(MOCK_...)`) en los servicios del frontend (`AuthService`, `BookingsService`, `SpacesService`, `AnnouncementsService`) por peticiones REST reales utilizando `HttpClient`.
