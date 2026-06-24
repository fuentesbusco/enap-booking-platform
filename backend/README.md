# Backend - API de Reservas Sindicato ENAP

Este directorio contiene el servidor API (Backend) para la **Plataforma de Reservas del Sindicato ENAP**, desarrollado con **NestJS** y **TypeScript**.

La API está diseñada de forma modular y utiliza **MySQL** (mediante **TypeORM**) para la persistencia de datos. Valida en tiempo real todas las reglas de negocio, incluyendo aforos, tarifas diferenciadas por rol (socio, externo, patrocinado), cobro por noche (cabañas) o por jornada (quinchos, piscina, sede), y el bloqueo de fechas por límite de inventario y mantención.

---

## 🛠️ Características Técnicas

*   **Framework:** NestJS 11 (Express como motor subyacente).
*   **Base de Datos:** MySQL con TypeORM y ejecución automática de migraciones.
*   **Autenticación y Seguridad:** Autenticación basada en tokens JWT reales. Encriptación PBKDF2 (SHA-512) para contraseñas de usuarios. Helmet para cabeceras de seguridad y limitador de tasa global (Rate Limiting / Throttler).
*   **Almacenamiento Cloud:** Integración con AWS SDK v3 para subir comprobantes de pago e imágenes a Amazon S3.
*   **Notificaciones Transaccionales:** Envío asíncrono de correos en formato HTML mediante Amazon SES (vía SMTP / Nodemailer).
*   **Pasarela de Pago:** Integración de Mercado Pago Checkout Pro (Sandbox y producción) y Webhooks de confirmación automática.
*   **Cálculo de Disponibilidad:** Basado en el modelo de Categorías y Unidades de Inventario (estilo hotelero), asignando secuencialmente la primera unidad libre y permitiendo la reasignación administrativa validada.

---

## 📂 Estructura de Carpetas

```bash
src/
├── announcements/          # Módulo de comunicados y anuncios
├── auth/                   # Módulo de login, registro, JWT y encriptación PBKDF2
├── aws/                    # Módulo y servicio AWS para interactuar con Amazon S3
├── bookings/               # Módulo de reservas, lógica de tarifas, disponibilidad y asignación
├── faqs/                   # Módulo CRUD de preguntas frecuentes para la administración
├── feedbacks/              # Módulo CRUD de opiniones y valoraciones con moderación
├── health/                 # Endpoint público utilitario /health de verificación de salud
├── notifications/          # Módulo de notificaciones por email vía SMTP / AWS SES
├── spaces/                 # Módulo de categorías y configuración de espacios
├── users/                  # Módulo de perfil y administración de socios
├── app.module.ts           # Inicialización y registro de controladores/servicios globales
├── main.ts                 # Bootstrap de la app (puerto 3000, CORS y Helmet)
├── models.ts               # Interfaces y alias de datos de TypeScript
├── data-source.ts          # Configuración del origen de datos para la CLI de TypeORM
└── seed.service.ts         # Poblamiento automático de datos semilla (usuarios, categorías, FAQs)
```

---

## 🚀 Endpoints de la API

La API escucha por defecto en el puerto `3000` de tu localhost:

### Públicos
*   `GET /health`: Estado utilitario de salud.
*   `POST /auth/login`: Login enviando `{ "email": "carlos.munoz@enap.cl", "password": "password123" }`. Genera un JWT real.
*   `POST /auth/register`: Registro de un nuevo socio (solo dominios `@enap.cl` y `@enaprefinerias.cl`) o usuario general.
*   `GET /spaces`: Listado de categorías de recintos.
*   `GET /announcements`: Mural de anuncios.
*   `GET /faqs`: Preguntas frecuentes ordenadas.
*   `GET /feedbacks/space/:spaceId`: Opiniones aprobadas para un recinto.

### Protegidos por Token (Socio / External / Admin)
*   `GET /users/profile`: Obtención del perfil del usuario autenticado.
*   `PATCH /users/profile`: Edición del perfil del usuario (teléfono y correo).
*   `PATCH /users/change-password`: Modificación segura de contraseña.
*   `GET /bookings/me`: Reservas asociadas al usuario autenticado.
*   `GET /bookings/blocked-dates/:spaceId`: Cálculo dinámico de fechas bloqueadas por límite de unidades.
*   `POST /bookings`: Registro de una reserva (valida disponibilidad de unidades e invitados).
*   `POST /bookings/upload-receipt`: Carga multipart a Amazon S3 del comprobante y lo asocia a la reserva.
*   `POST /feedbacks`: Permite dejar una reseña (estado inicial `'pending_approval'`) al terminar una estadía.

### Protegidos para Administradores (`admin`)
*   `GET /users`: Listado de todos los usuarios registrados.
*   `POST /users`: Registro directo de un nuevo usuario (generando clave temporal de 6 caracteres).
*   `PATCH /users/:id/toggle-status`: Activar o desactivar cuenta.
*   `POST /spaces`: Crear categoría de recinto.
*   `PUT /spaces/:id`: Modificar categoría (ej: `totalUnits`, capacidad, precios).
*   `DELETE /spaces/:id`: Eliminar una categoría.
*   `POST /spaces/upload-photo`, `POST /gallery/upload-photo`, `POST /announcements/upload-photo`: Subida multipart de imágenes directas a AWS S3.
*   `GET /bookings`: Historial total de reservas.
*   `PATCH /bookings/:id/approve`: Aprobación de reserva y comprobante.
*   `PATCH /bookings/:id/reject`: Rechazo de reserva con notas de administración.
*   `PATCH /bookings/:id/assign-space`: Reasignar la reserva a una unidad física específica (ej: `"Cabaña 3"`), validando colisiones en tiempo real.
*   `GET /feedbacks`: Listado total de opiniones para moderación.
*   `PATCH /feedbacks/:id/approve` / `PATCH /feedbacks/:id/reject`: Aprobar o rechazar comentarios.

---

## 💻 Comandos de Ejecución

Sitúate en este directorio antes de correr los comandos:
```bash
cd backend
```

### Instalar dependencias
```bash
npm install
```

### Gestión de Base de Datos y Migraciones (TypeORM)
*   **Ejecutar migraciones pendientes**:
    ```bash
    npm run migration:run
    ```
*   **Generar una nueva migración** (después de modificar alguna entidad):
    ```bash
    npm run migration:generate -- src/migrations/NombreMigracion
    ```
*   **Revertir la última migración**:
    ```bash
    npm run migration:revert
    ```

### Arrancar en modo desarrollo (Watch Mode)
```bash
npm run start:dev
```

### Compilar el proyecto
```bash
npm run build
```

---

## 🧪 Ejemplos de Pruebas Rápidas (cURL)

Con el servidor corriendo en `http://localhost:3000`:

1.  **Health Check:**
    ```bash
    curl http://localhost:3000/health
    ```
2.  **Autenticarse (Login de Socio):**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"email": "carlos.munoz@enap.cl", "password": "password123"}' http://localhost:3000/auth/login
    ```
3.  **Listar Reservas Propias (Socio):**
    *(Reemplaza `<token>` con el token JWT real recibido del login anterior)*
    ```bash
    curl -H "Authorization: Bearer <token>" http://localhost:3000/bookings/me
    ```
