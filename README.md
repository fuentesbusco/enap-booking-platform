# Plataforma de Reservas - Sindicato ENAP

Este proyecto contiene la Plataforma de Reservas para el **Sindicato ENAP**, desarrollado por **Atelier Busco**.

El repositorio está organizado como un monorepo con dos directorios principales:
*   📂 **`frontend/`**: Aplicación cliente en **Angular 18** + Tailwind CSS (prototipo interactivo).
*   📂 **`backend/`**: Servidor API en **NestJS** que implementa la lógica de negocio completa en memoria (Mock API).

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo una arquitectura desacoplada:

### Frontend
*   **Framework:** Angular 18 (Standalone Components, Signals para el manejo del estado).
*   **Estilos:** Tailwind CSS + PostCSS.
*   **Mock State:** Persistencia temporal en `sessionStorage` y Angular Signals reactivos.

### Backend (Actual)
*   **Framework:** NestJS 11 + TypeScript.
*   **Servidor HTTP:** Express (bajo NestJS).
*   **Autenticación:** Tokens firmados en Base64 que emulan el comportamiento y los roles de un JWT (`socio`, `admin`, `external`).

### Infraestructura (Siguiente Fase de Producción)
*   **Base de Datos:** MySQL conectada mediante TypeORM.
*   **Almacenamiento (S3):** Para la subida de comprobantes de transferencia y fotos de espacios.
*   **Infraestructura:** AWS EC2 (Servidor API) + RDS (MySQL) + SES (Notificaciones por email).

---

## 📂 Estructura de Carpetas

### Frontend (`frontend/src/app/`)
```bash
frontend/src/app/
├── core/                   # Lógica global e independiente de vistas
│   ├── guards/             # Protectores de rutas por rol (Auth / Admin)
│   ├── mock-data.ts        # Base de datos en memoria para el prototipo
│   ├── models.ts           # Interfaces y tipos globales
│   └── services/           # Servicios inyectables (Auth, Reservas, Espacios, Anuncios)
├── features/               # Componentes y páginas divididos por características
│   ├── admin/              # Panel de administración (Reservas, aprobación/rechazo)
│   ├── auth/               # Pantalla de Login con accesos de prueba
│   ├── booking/            # Flujo de reserva interactivo en 4 pasos
│   ├── home/               # Cartelera de anuncios y accesos rápidos
│   ├── my-bookings/        # Consulta del estado de reservas del socio
│   └── spaces/             # Catálogo de cabañas, quinchos y piscinas con detalles
└── shared/                 # Elementos comunes reutilizables
```

### Backend (`backend/src/`)
```bash
backend/src/
├── announcements/          # Controlador y servicio de comunicados/anuncios
├── auth/                   # Lógica de login y generación/validación de mock tokens
├── bookings/               # Endpoints de reservas, cálculo de tarifas y validaciones de solapamiento
├── health/                 # Endpoint utilitario /health de verificación de salud
├── spaces/                 # Controlador y servicio de recintos (cabañas, quinchos, piscinas)
├── models.ts               # Interfaces de dominio y semillas de datos compartidas
├── app.module.ts           # Registro de módulos, controladores y proveedores
└── main.ts                 # Configuración del bootstrap y habilitación de CORS
```

---

## 🚀 Instrucciones de Ejecución

### 💻 Ejecutar el Frontend (Angular)
1.  Entra en la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Arranca la aplicación en desarrollo (disponible en [http://localhost:4200/](http://localhost:4200/)):
    ```bash
    npm run start
    ```

### ⚙️ Ejecutar el Backend (NestJS)
1.  Entra en la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el servidor en modo desarrollo (disponible en [http://localhost:3000/](http://localhost:3000/)):
    ```bash
    npm run start:dev
    ```

---

## 📌 Documentación Adicional

Para más detalles acerca del diseño del sistema, modelos de datos, reglas de negocio y hoja de ruta de desarrollo, consulta los siguientes archivos en la raíz:
*   📄 **[design.md](file:///home/daniel/projects/enap-mock-frontend/design.md):** Arquitectura detallada, modelos de datos, reglas de precios y plan de migración al backend.
*   📄 **[todo.md](file:///home/daniel/projects/enap-mock-frontend/todo.md):** Listado de módulos por implementar y progreso actual del frontend y backend.
