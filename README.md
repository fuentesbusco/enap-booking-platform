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

### Backend
*   **Framework:** NestJS 11 + TypeScript.
*   **Servidor HTTP:** Express (bajo NestJS).
*   **Autenticación:** Tokens JWT reales firmados mediante `JwtModule` y encriptación PBKDF2 para contraseñas de usuarios.
*   **Base de Datos:** MySQL integrada con TypeORM.
*   **Almacenamiento:** Amazon S3 para comprobantes de pago, fotos de recintos y anuncios.
*   **Notificaciones:** Amazon SES para correos automatizados transaccionales (confirmaciones, notificaciones a administración, rechazos).
*   **Pasarela de Pago:** Mercado Pago (Checkout Pro y Sandbox) con confirmación automática.

### Infraestructura (Producción)
*   **Backend:** AWS Lambda + API Gateway (Serverless Framework) para escalado elástico y alta disponibilidad.
*   **Base de Datos:** AWS RDS MySQL.
*   **Frontend:** Vercel (Angular 18 Standalone Components + Signals).
*   **Meteorología:** Integración en vivo con Open-Meteo API para pronósticos y alertas preventivas de lluvia en Limache.

---

## 📂 Estructura de Carpetas

### Frontend (`frontend/src/app/`)
```bash
frontend/src/app/
├── core/                   # Lógica global e independiente de vistas
│   ├── guards/             # Protectores de rutas por rol (Auth / Admin)
│   ├── mock-data.ts        # Base de datos en memoria para el prototipo
│   ├── models.ts           # Interfaces y tipos globales
│   └── services/           # Servicios inyectables (Auth, Reservas, Espacios, Usuarios, Anuncios)
├── features/               # Componentes y páginas divididos por características
│   ├── admin/              # Panel de administración
│   │   ├── bookings/       # Aprobación y visualización de comprobantes
│   │   ├── spaces/         # Formulario modal interactivo para CRUD de espacios
│   │   ├── users/          # Listado y activación/desactivación de socios
│   │   ├── calendar/       # Calendario visual mensual con filtros y detalles
│   │   └── treasury/       # Reportes de caja
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
├── spaces/                 # CRUD completo de recintos (cabañas, quinchos, piscinas) para admin
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

---

## 🔑 Credenciales de Prueba (Testing Local)

El backend inicializa automáticamente la base de datos con las siguientes cuentas de prueba (contraseña común para todas: `password123`):

*   **Socio (Cliente):** `carlos.munoz@enap.cl`
*   **Administrador:** `admin@sindicatoenap.cl` (Habilita la pestaña **"Administración"** en la barra de navegación)
*   **Usuario Externo:** `ana@gmail.com`

*Nota: La pantalla de ingreso (`/ingresar`) incluye botones de acceso rápido (**"Socio Demo"** y **"Admin Demo"**) que inician sesión automáticamente con las credenciales de prueba con un solo clic.*

### 🏕️ Flujo de Reserva como Invitado
Para realizar una reserva sin tener una cuenta registrada en la plataforma:
1. Navega por el catálogo de **Espacios**, selecciona uno y haz clic en **"Reservar"**.
2. Rellena los datos de fechas e invitados.
3. Al avanzar al paso de Pago, el sistema detectará que no estás logueado y te llevará a la pantalla de ingreso, conservando tu reserva en segundo plano (`sessionStorage`).
4. Selecciona la pestaña **"Invitado"**, completa tus datos personales (nombre, RUT, correo), introduce tu **Código de Socio** de pruebas (ej: `ENP-0078`) y presiona **"Continuar como Invitado"**.
5. Se te autenticará de forma temporal y regresarás directamente al paso de pago para cargar el comprobante bancario real y confirmar tu reserva.

---

## 🏨 Sistema de Categorías y Unidades de Inventario (Modelo Hotelero)

La plataforma utiliza un modelo de inventario estilo hotelero para optimizar la ocupación y evitar la selección de cabañas o quinchos específicos por parte del usuario final:

1. **Gestión Consolidada**: En lugar de exponer recintos físicos individuales en la base de datos (por ejemplo, 6 cabañas como filas separadas), la base de datos registra 4 grandes categorías de espacios con la propiedad `totalUnits`.
2. **Capacidad y Unidades**:
   *   **Cabañas Familiares**: 1 categoría, 6 unidades físicas disponibles (`totalUnits: 6`), capacidad de 6 personas por unidad.
   *   **Quinchos Familiares**: 1 categoría, 10 unidades físicas disponibles (`totalUnits: 10`), capacidad de 15 personas por unidad.
   *   **Piscina General**: 1 categoría, aforo total compartido (`totalUnits: 1`), capacidad máxima de 80 personas concurrentes.
   *   **Club House**: 1 categoría, 1 unidad física (`totalUnits: 1`), capacidad máxima de 50 personas.
3. **Asignación Automática**: Durante el checkout, el backend busca secuencialmente la primera unidad libre (ej: `"Cabaña 3"` o `"Quincho 5"`) que no posea solapamientos para las fechas seleccionadas, asegurando una estadía continua.
4. **Reasignación Administrativa**: El panel de administración permite cambiar la unidad asignada a una reserva a través de un dropdown. La API valida automáticamente que la nueva unidad no tenga colisiones con otras reservas activas antes de confirmar el cambio.
