# Frontend - Plataforma de Reservas Sindicato ENAP

Este directorio contiene la aplicación cliente (Frontend) para la **Plataforma de Reservas del Sindicato ENAP**, desarrollada con **Angular 18** y **Tailwind CSS**.

La interfaz simula todos los flujos e interacciones de los usuarios y administradores utilizando **Angular Signals** como gestor de estado reactivo y persistencia local en `sessionStorage` para testing rápido.

---

## ✨ Características Implementadas

### Vista del Socio / Cliente
*   **Inicio & Mural de Anuncios:** Página principal con un carrusel o listado de anuncios fijados.
*   **Selector de Espacios:** Catálogo interactivo de Cabañas, Quinchos y Piscinas con tarjetas visuales, equipamiento (`amenities`) y precios diferenciados por rol.
*   **Flujo de Reservas Interactiva (4 Pasos):**
    1.  *Detalle del Recinto:* Consulta de capacidades y condiciones.
    2.  *Selección de Fechas:* Rango de noches inhabilitando automáticamente las fechas bloqueadas y ocupadas.
    3.  *Invitados:* Ingreso de Nombre, RUT y Teléfono de acompañantes con tope de capacidad.
    4.  *Resumen y Pago:* Desglose detallado del precio, instrucciones de transferencia bancaria y zona para emular la carga de comprobantes.
*   **Mis Reservas:** Panel personal del socio para consultar sus solicitudes, códigos de reserva auto-generados y estados en tiempo real (`pending_payment`, `pending_approval`, `confirmed`, `rejected`).
*   **Accesos Rápidos de Autenticación:** Zona de ingreso (Login) con botones rápidos para iniciar sesión inmediatamente como Socio, Administrador o Público General para testeo rápido sin claves.

### Vista del Administrador (Panel de Control)
*   **Dashboard de Reservas:** Tablas con filtros de estado para ver las solicitudes entrantes y revisar comprobantes de transferencia.
*   **Flujo de Aprobación:** Botones para aprobar (`confirmed`) o rechazar (`rejected` con comentarios) comprobantes.
*   **CRUD de Espacios:** Pantalla completa de administración que abre un modal estilizado para agregar, editar y eliminar cabañas, quinchos o piscinas, actualizando las tarifas y capacidades al instante.
*   **CRUD de Usuarios:** Listado de socios y externos con botones de acción para activar o desactivar socios de manera inmediata.
*   **Calendario Visual de Ocupación:** Grilla mensual interactiva estructurada de lunes a domingo. Permite filtrar por recinto y muestra chips de color de reservas; al pasar el cursor (hover) despliega detalles de la reserva.

---

## 🛠️ Estructura de Carpetas

```bash
src/app/
├── core/                   # Capa lógica global
│   ├── guards/             # Guards para protección de rutas (Auth, Admin)
│   ├── mock-data.ts        # Semillas de datos y bloqueos estáticos
│   ├── models.ts           # Interfaces compartidas de TypeScript
│   └── services/           # Servicios reactivos (Auth, Bookings, Spaces, Users, Announcements)
├── features/               # Módulos y vistas principales
│   ├── admin/              # Componentes de administración (Reservas, Espacios, Usuarios, Calendario)
│   ├── auth/               # Pantalla de login
│   ├── booking/            # Componente de flujo de reserva paso a paso
│   ├── home/               # Cartelera de avisos e inicio
│   ├── my-bookings/        # Historial de reservas del usuario activo
│   └── spaces/             # Grilla pública de recintos
└── shared/                 # Componentes genéricos compartidos (Navbar, etc.)
```

---

## 🚀 Comandos Útiles

Sitúate en esta carpeta antes de correr los comandos:
```bash
cd frontend
```

### Instalar dependencias
```bash
npm install
```

### Iniciar servidor de desarrollo
Arranca el compilador y el servidor en local en [http://localhost:4200/](http://localhost:4200/):
```bash
npm run start
# o alternativamente
ng serve
```

### Ejecutar Pruebas Unitarias
```bash
npm run test
```

### Compilar para Producción
Compila y optimiza el código del lado del cliente, almacenando la build final en `frontend/dist/`:
```bash
npm run build
```
