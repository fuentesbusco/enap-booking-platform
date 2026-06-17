# Backend - API de Reservas Sindicato ENAP

Este directorio contiene el servidor API (Backend) para la **Plataforma de Reservas del Sindicato ENAP**, desarrollado con **NestJS** y **TypeScript**.

La API está diseñada de forma modular y simula el almacenamiento persistente en memoria a través de sus servicios correspondientes, validando reglas de negocio reales tales como capacidades, tarifas por rol y solapamiento de fechas reservadas.

---

## 🛠️ Características Técnicas

*   **Framework:** NestJS 11 (Express como motor subyacente).
*   **CORS Habilitado:** Permitido para recibir peticiones cruzadas desde el cliente Angular en `http://localhost:4200`.
*   **Autenticación Emulada:** Login rápido de prueba que genera y firma un token en Base64 que contiene la identidad y rol del usuario.
*   **Validación de Permisos:** Filtros de validación para endpoints de lectura y escritura basados en cabeceras `Authorization: Bearer <token>`.
*   **Cálculo de Tarifas y Solapamientos:** Lógica matemática idéntica a la del frontend, validando colisiones contra rangos de fechas reservadas previamente.

---

## 📂 Estructura de Carpetas

```bash
src/
├── announcements/          # Endpoints para anuncios públicos
├── auth/                   # Módulo de login y lógica del mock JWT
├── bookings/               # Endpoints de creación, cálculo, aprobación y comprobantes de reservas
├── health/                 # Endpoint público utilitario /health
├── spaces/                 # CRUD de espacios reservables protegidos para administración
├── app.module.ts           # Inicialización y registro de controladores/servicios
├── main.ts                 # Bootstrap de la app (puerto 3000 y CORS)
└── models.ts               # Semillas de datos e interfaces de TypeScript
```

---

## 🚀 Endpoints de la API

La API escucha por defecto en el puerto `3000` de tu localhost:

### Públicos
*   `GET /health`: Estado utilitario de salud.
*   `POST /auth/login`: Login enviando `{ "email": "carlos.munoz@enap.cl" }`.
*   `GET /spaces`: Listado de todos los recintos.
*   `GET /announcements`: Mural de anuncios.

### Protegidos por Token (Socio / External / Admin)
*   `GET /users/profile`: Obtención del perfil del usuario autenticado.
*   `GET /bookings/me`: Reservas asociadas al usuario autenticado.
*   `POST /bookings`: Registro de una reserva (valida disponibilidad de fechas y cupos).
*   `POST /bookings/upload-receipt`: Simula la subida de un archivo y lo asocia a la reserva.

### Protegidos para Administradores (`admin`)
*   `GET /users`: Listado de todos los usuarios registrados en el sistema.
*   `POST /users`: Registro de un nuevo usuario.
*   `PATCH /users/:id/toggle-status`: Activar o desactivar la cuenta de un socio o usuario.
*   `POST /spaces`: Crear un nuevo recinto.
*   `PUT /spaces/:id`: Modificar propiedades de un recinto.
*   `DELETE /spaces/:id`: Eliminar un recinto.
*   `GET /bookings`: Historial total de reservas del sindicato.
*   `PATCH /bookings/:id/approve`: Aprobación de reserva.
*   `PATCH /bookings/:id/reject`: Rechazo de reserva agregando notas de administración.

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
    curl -X POST -H "Content-Type: application/json" -d '{"email": "carlos.munoz@enap.cl"}' http://localhost:3000/auth/login
    ```
3.  **Listar Reservas Propias (Socio):**
    *(Reemplaza `<token>` con el token Base64 recibido del login anterior)*
    ```bash
    curl -H "Authorization: Bearer <token>" http://localhost:3000/bookings/me
    ```
