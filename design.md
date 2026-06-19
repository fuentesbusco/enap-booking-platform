# Documento de Diseño del Sistema - Plataforma de Reservas Sindicato ENAP

Este documento describe la arquitectura de software final, los modelos de datos físicos, las reglas de negocio críticas, la seguridad y el esquema de despliegue en producción de la Plataforma de Reservas del Centro Vacacional ENAP (Limache, Chile).

---

## 1. Arquitectura de la Solución (Producción)

La plataforma está diseñada como una aplicación web desacoplada (Decoupled Single Page Application):

```mermaid
graph TD
    A[Vercel - Angular 18 Client] -- HTTPS / JWT --> B[AWS Lambda + API Gateway - NestJS API]
    B -- TypeORM --> C[(AWS RDS - MySQL Database)]
    B -- SDK v3 --> D[AWS S3 - Comprobantes/Fotos]
    B -- SMTP/SES --> E[AWS SES - Notificaciones Email]
    B -- HTTPS --> F[Open-Meteo API - Clima Limache]
    B -- HTTPS --> G[Mercado Pago API - Pasarela y Webhooks]
```

### Frontend (Cliente - `/frontend`)
*   **Framework:** Angular 18 con Standalone Components.
*   **Estado Reactivo:** Uso de **Angular Signals** en servicios centrales para mantener reactividad en autenticación, reservas y estado del clima.
*   **Estilos:** Vanilla CSS con Tailwind CSS para una interfaz responsive, moderna y premium.
*   **Componentes Compartidos:** Header/Navbar global y un Footer institucional unificado (`FooterComponent`) presente en todas las páginas públicas del cliente (Inicio, Catálogo de Espacios, Paso de Reserva, Perfil de Usuario, Mis Reservas y Login) y excluido del panel administrativo.

### Backend (API Servidor - `/backend`)
*   **Framework:** NestJS 11 con controladores modulares por dominio.
*   **Acceso a Datos:** TypeORM como ORM relacional manejando esquemas de datos físicos.
*   **Motor de Base de Datos:** MySQL hospedado en **AWS RDS**.
*   **Infraestructura Serverless:** Desplegado en **AWS Lambda** detrás de **API Gateway** mediante Serverless Framework, garantizando escalabilidad automática y bajo costo.

---

## 2. Modelos de Datos (Entidades Físicas MySQL)

El backend define y persiste las siguientes tablas:

### Usuario (`UserEntity`)
*   `id` (int, PK autoincremental): Identificador único.
*   `fullName` (varchar): Nombre completo.
*   `rut` (varchar, unique): RUT chileno para validación.
*   `email` (varchar, unique): Correo electrónico.
*   `role` (enum: `'socio' | 'external' | 'admin'`): Perfil de usuario.
*   `fichaNumber` (varchar, nullable): Código de ficha sindical. Se genera automáticamente como `ENP-XXXX` si se registra un socio en la administración sin un código manual.
*   `isActive` (boolean, default true): Estado de cuenta.
*   `passwordHash` (varchar): Hash criptográfico de contraseña.
*   `phone` (varchar, nullable): Teléfono de contacto (validado bajo formato Chile).

### Espacio (`SpaceEntity`)
*   `id` (int, PK): Identificador único.
*   `name` (varchar): Nombre del espacio.
*   `type` (varchar): Tipo de recinto (`cabin` | `quincho` | `pool`).
*   `description` (text): Reseña descriptiva.
*   `maxCapacity` (int): Aforo máximo de personas.
*   `basePrice` (int): Tarifa diaria para público externo.
*   `socioPrice` (int): Tarifa diaria preferencial para socios.
*   `guestPrice` (int): Costo adicional por invitado excedente.
*   `freeGuestsForSocio` (int): Número de invitados gratis diarios permitidos para socios.
*   `images` (simple-json): Array de URLs de fotos almacenadas en AWS S3.
*   `amenities` (simple-json): Comodidades disponibles.

### Reserva (`Booking`)
*   `id` (int, PK): Identificador único.
*   `bookingCode` (varchar, unique): Código legible (ej. `ENP-2026-00004`).
*   `checkIn` (varchar): Fecha de entrada (`YYYY-MM-DD`).
*   `checkOut` (varchar): Fecha de salida (`YYYY-MM-DD`).
*   `status` (varchar): Estados (`pending_payment`, `pending_approval`, `confirmed`, `cancelled`, `rejected`, `expired`).
*   `totalAmount` (int): Total calculado.
*   `receiptUrl` (varchar, nullable): URL de imagen del comprobante de transferencia en S3.
*   `adminNotes` (text, nullable): Causa del rechazo de reserva o notas de cobro.
*   `priceBreakdown` (simple-json): Desglose financiero.
*   `isForThirdParty` (boolean): Flag de patrocinio de socio a tercero.
*   `thirdPartyName` / `thirdPartyRut` / `thirdPartyPhone` (nullable): Datos del ocupante externo.
*   `adminCreatedForExternal` (boolean): Flag de reserva creada por admin.
*   `termsAccepted` (boolean, default true): Registro de aceptación de los términos del recinto.
*   `visitType` (varchar, nullable): Declaración del tipo de visita (`personal`, `family`, `friends`).

### Invitado (`GuestEntity`)
*   `id` (int, PK): Identificador de invitado.
*   `fullName` (varchar): Nombre del acompañante.
*   `rut` (varchar): RUT.
*   `phone` (varchar, nullable): Teléfono.
*   `age` (int, nullable): Edad del invitado para el registro dinámico.
*   `booking` (ManyToOne -> Booking): Vínculo de reserva.

### Preguntas Frecuentes (`FaqEntity`)
*   `id` (int, PK): Identificador único.
*   `question` (varchar): Pregunta de soporte.
*   `answer` (text): Respuesta explicativa.
*   `order` (int): Prioridad de ordenamiento en el acordeón del frontend.

### Opiniones / Feedback (`FeedbackEntity`)
*   `id` (int, PK): Identificador único.
*   `rating` (int): Calificación de 1 a 5 estrellas.
*   `comment` (text): Comentarios sobre la estadía.
*   `status` (varchar, default `'pending_approval'`): Moderación (`pending_approval`, `approved`, `rejected`).
*   `createdAt` (datetime): Registro temporal.
*   `booking` (OneToOne -> Booking): Reserva que califica.
*   `user` (ManyToOne -> UserEntity): Autor.
*   `space` (ManyToOne -> SpaceEntity): Espacio evaluado.

---

## 3. Reglas de Negocio Clave

### 3.1 Validaciones de Contacto y Formato de Teléfono
Para guardar datos en el perfil o en el registro de reservas, se exige y valida telefónicamente el formato de Chile mediante la expresión regular `^(\+56)?9\d{8}$` (ej: `+56912345678` o `912345678`), limpiando espacios en blanco de forma automática antes de procesar.

### 3.2 Integración Meteorológica (Open-Meteo & Alertas Dinámicas)
*   **Servicio centralizado (`WeatherService`):** Consume en tiempo real el clima de Limache, Chile (`latitud=-33.0153`, `longitud=-71.2675`) mediante la API pública de **Open-Meteo** (con fallback a un set de datos mockeados locales en caso de caída).
*   **Uso Utilitario:**
    *   *Catálogo (`/espacios`)*: Muestra un pill con la temperatura actual en Limache.
    *   *Flujo de Reserva (Paso 1)*: Carga el pronóstico de los siguientes 3 días.
    *   *Alerta de Clima por Fecha*: Si el usuario selecciona una fecha que cae dentro del rango de pronóstico y es un espacio exterior (Piscina o Quincho) con previsión de lluvia o tormenta, el frontend gatilla dinámicamente un banner ámbar recomendando evaluar la reprogramación.

### 3.3 Gestión de Múltiples Imágenes (AWS S3)
Los espacios turísticos admiten subir múltiples fotos. La administración las carga a través de un endpoint multipart (Multer) directo a un bucket de **AWS S3** y las guarda en formato JSON. El frontend renderiza estas fotos a través de carruseles interactivos con flechas de navegación e indicadores de páginas.

### 3.4 Moderación de Reseñas / Feedback
*   Una vez que finaliza la estadía de una reserva (`checkOut <= hoy`), el socio puede escribir una valoración de estrellas y comentario desde "Mis Reservas".
*   La valoración se almacena con estado `pending_approval`.
*   El administrador cuenta con un panel (`/admin/opiniones`) para aprobar o rechazar comentarios.
*   Únicamente las opiniones en estado **Aprobado** se despliegan en el catálogo de espacios y promedian la puntuación de estrellas de cada recinto.

### 3.5 Expiración Automática Pasiva (48 Horas)
Las reservas creadas en estado `pending_payment` que no cuenten con un comprobante de transferencia y que superen las 48 horas de antigüedad desde su creación son marcadas automáticamente como `expired` de manera dinámica bajo demanda (durante consultas de disponibilidad, creación de reservas o carga del dashboard de usuario).

### 3.6 Cierre de Disponibilidades los Lunes (Mantención General)
Para dar cumplimiento a la mantención general del Centro Vacacional, el backend inyecta de forma dinámica los días lunes del año como bloqueados en la consulta de fechas ocupadas y rechaza preventivamente cualquier solicitud de reserva que abarque un día lunes.

---

## 4. Endpoints de la API (NestJS)

*   `GET /health`: Salud del sistema.
*   `POST /auth/login`: Autenticación real con JWT seguro.
*   `POST /auth/register`: Registro de nuevos usuarios y hashing PBKDF2.
*   `PATCH /users/profile/update`: Edición de perfil de usuario (Email, Teléfono Chile, Cambio de Clave).
*   `POST /gallery/upload-photo` / `POST /spaces/upload-photo` / `POST /announcements/upload-photo`: Subida multipart de archivos a S3.
*   `GET /faqs`, `POST /faqs`, `PUT /faqs/:id`, `DELETE /faqs/:id`: CRUD administrativo de FAQ.
*   `GET /feedbacks`, `GET /feedbacks/space/:spaceId`, `POST /feedbacks`: Flujo de opiniones.
*   `PATCH /feedbacks/:id/approve` / `PATCH /feedbacks/:id/reject`: Moderación por el administrador.
*   `POST /bookings/confirm-payment`: Webhook de Mercado Pago para procesar y confirmar transacciones instantáneamente.

---

## 5. Esquema de Seguridad y Criptografía

1.  **JWT (JSON Web Tokens):** Firmados y validados con clave secreta asimétrica en producción. Los Guards de NestJS interceptan peticiones inyectando la identidad del usuario e inspeccionando roles (`socio`, `admin`, `external`).
2.  **Hashing PBKDF2:** Las contraseñas se almacenan mediante 1000 iteraciones SHA-512 y salts aleatorios de 16 bytes.
3.  **Seguridad de Infraestructura:** El backend restringe accesos a la base de datos MySQL (AWS RDS) únicamente a la función Lambda mediante Security Groups cerrados.
