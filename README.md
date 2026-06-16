# Plataforma de Reservas - Sindicato ENAP

Este proyecto contiene la Plataforma de Reservas para el **Sindicato ENAP**, desarrollado por **Atelier Busco**.

El repositorio está organizado en dos directorios principales:
*   📂 **`frontend/`**: Aplicación cliente desarrollada en Angular 18 + Tailwind CSS (prototipo interactivo).
*   📂 **`backend/`**: Servidor API en NestJS + TypeORM + MySQL (en desarrollo).

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo una arquitectura desacoplada:

### Frontend
*   **Framework:** Angular 18 (Standalone Components, Signals para manejo de estado).
*   **Estilos:** Tailwind CSS + PostCSS.
*   **Mock State:** Persistencia temporal en `sessionStorage` y Angular Signals reactivos para emular la base de datos en memoria.

### Backend & Infraestructura (Fase de Producción)
*   **Backend:** NestJS + TypeScript.
*   **ORM:** TypeORM.
*   **Base de Datos:** MySQL.
*   **Almacenamiento (S3):** Para la subida de comprobantes de transferencia y fotos de espacios.
*   **Infraestructura:** AWS EC2 (Servidor API) + RDS (MySQL) + SES (Envío de correos de confirmación/notificación).

---

## 📂 Estructura del Directorio `frontend/`

La estructura interna del frontend sigue la siguiente estructura limpia:

```bash
frontend/src/app/
├── core/                   # Lógica global e independiente de vistas
│   ├── guards/             # Protectores de rutas por rol (Auth / Admin)
│   ├── mock-data.ts        # Base de datos en memoria para el prototipo
│   ├── models.ts           # Interfaces y tipos de TypeScript globales
│   └── services/           # Servicios inyectables (Auth, Reservas, Espacios, Anuncios)
├── features/               # Componentes y páginas divididos por características
│   ├── admin/              # Panel de administración (Listado de reservas, aprobación/rechazo)
│   ├── auth/               # Pantalla de Login con accesos directos de prueba
│   ├── booking/            # Flujo de reserva interactivo en 4 pasos
│   ├── home/               # Página de bienvenida, cartelera de anuncios y accesos rápidos
│   ├── my-bookings/        # Vista para que el socio consulte el estado de sus reservas
│   └── spaces/             # Catálogo de cabañas, quinchos y piscinas con detalles
└── shared/                 # Elementos comunes reutilizables
    └── components/         # Navbar y componentes de interfaz genéricos
```

---

## 🚀 Instrucciones de Ejecución (Frontend)

Para iniciar el entorno de desarrollo local del frontend, sigue estos pasos:

### 1. Requisitos Previos
*   Node.js (versión 18 o superior recomendada)
*   npm (incluido con Node.js)

### 2. Navegar al Directorio del Frontend
Antes de ejecutar cualquier comando, entra en la carpeta `frontend`:
```bash
cd frontend
```

### 3. Instalación de Dependencias
Ejecuta el siguiente comando para descargar e instalar todas las dependencias requeridas:
```bash
npm install
```

### 4. Servidor de Desarrollo
Para arrancar la aplicación de desarrollo en [http://localhost:4200/](http://localhost:4200/):
```bash
npm run start
# o alternativamente:
ng serve
```
La aplicación se recargará automáticamente si realizas cambios en los archivos fuente.

### 5. Construcción para Producción
Para compilar el proyecto y generar el bundle optimizado en `frontend/dist/`:
```bash
npm run build
```

---

## 📌 Documentación Adicional

Para más detalles acerca del diseño del sistema, modelos de datos, reglas de negocio y hoja de ruta de desarrollo, consulta los siguientes archivos en la raíz:
*   📄 **[design.md](file:///home/daniel/projects/enap-mock-frontend/design.md):** Arquitectura detallada, modelos de datos, reglas de precios y plan de migración al backend.
*   📄 **[todo.md](file:///home/daniel/projects/enap-mock-frontend/todo.md):** Listado de módulos por implementar y progreso actual del frontend y backend.
