# Frontend - Plataforma de Reservas Sindicato ENAP

Este directorio contiene la aplicación cliente (Frontend) para la **Plataforma de Reservas del Sindicato ENAP**, desarrollada con **Angular 18** y **Tailwind CSS**.

La interfaz interactúa directamente con la API en NestJS (usando `jwtInterceptor` para adjuntar de forma transparente el token JWT en las cabeceras). El estado reactivo y del clima local de Limache se gestiona de forma eficiente a través de **Angular Signals**.

---

## ✨ Características Implementadas

### Vista del Socio / Cliente
*   **Inicio & Mural de Anuncios:** Página de portada con avisos destacados, carruseles de fotos locales del recinto, y un acordeón dinámico de Preguntas Frecuentes (FAQs) cargado desde base de datos.
*   **Clima y Alertas:** Widget en el Hero con la temperatura actual en vivo de Limache (vía Open-Meteo) y alertas preventivas color ámbar si se intenta reservar un espacio al aire libre en un día con lluvia pronosticada.
*   **Selector de Espacios:** Catálogo de recintos agrupados por categorías (Cabañas Familiares, Quinchos Familiares, Piscina General, Club House) con galerías de imágenes y tarifas dinámicas socio/público.
*   **Flujo de Reservas en 4 Pasos:**
    1.  *Detalle:* Fotos y descripción del espacio.
    2.  *Fechas:* Selector de rango de noches (cabañas) o día único (quinchos/piscina). Se deshabilitan lunes (mantenimiento) y días agotados según disponibilidad física de unidades (6 cabañas, 10 quinchos).
    3.  *Invitados:* Tarjeta del titular (para verificar RUT/Ficha y actualizar Teléfono/Correo) y registro dinámico de invitados (Nombre, RUT, Edad) con validación de aforo. Selector de arriendo a terceros con tarifas base general.
    4.  *Pago:* Desglose detallado, instrucciones de transferencia bancaria con cargador multipart a S3, o botón de Mercado Pago Checkout Pro (con aviso e instrucciones para pruebas en Sandbox). Las reservas con valor $0 (ej: piscina con socio y menos de 5 invitados) se confirman al instante con un solo clic.
*   **Mis Reservas:** Historial de solicitudes (con insignia de estado en revisión, confirmada, cancelada, expirada o rechazada). Las reservas sin pago se cancelan de forma pasiva tras 48 horas de inactividad.
*   **Opiniones y Valoraciones:** Botón para valorar con estrellas (1 a 5) y comentario al finalizar una estadía.
*   **Mi Perfil y Seguridad (`/perfil`):** Edición de contacto (validación de celular chileno) y cambio de contraseña con hashing PBKDF2.

### Vista del Administrador (Panel de Control)
*   **Dashboard de Reservas:** Visualización global de reservas con buscador y filtros. Columna "Tipo" diferenciando Socio/No Socio y badge "Para Tercero". Acciones rápidas para aprobar o rechazar con comentarios (se notifica automáticamente por email al socio).
*   **Reasignación de Unidad Específica:** Dropdown en la grilla para reasignar la reserva a una cabaña (1 al 6) o quincho (1 al 10) específico, con validación de colisiones en tiempo real.
*   **Calendario Mensual de Ocupación:** Grilla interactiva estructurada por mes que despliega explícitamente el nombre de la unidad reservada (ej: `"Cabaña 3"`, `"Quincho 5"`) en cada día y permite filtrar por recinto.
*   **CRUDs de Gestión:** Módulos completos para administrar Espacios (con carga multipart de fotos a S3), FAQs, Usuarios (activar/desactivar y contraseñas temporales automáticas), Avisos, Opiniones (moderador) y Fotos de Galería.

---

## 🛠️ Estructura de Carpetas

```bash
src/app/
├── core/                   # Capa lógica global
├── core/guards/            # Guards de protección de rutas por rol y jwtInterceptor
├── core/services/          # Servicios HTTP (Auth, Bookings, Spaces, Users, Announcements, Weather)
├── core/models.ts          # Interfaces de datos físicas compartidas con el backend
├── features/               # Módulos y pantallas principales
│   ├── admin/              # Componentes de administración (Reservas, Espacios, Usuarios, Calendario, Galería, FAQs, Opiniones)
│   ├── auth/               # Pantalla de Login y Registro de socios/externos
│   ├── booking/            # Componente de flujo de reserva paso a paso (Steps 1 a 4)
│   ├── home/               # Cartelera de avisos, normas y FAQs interactivos
│   ├── my-bookings/        # Historial de reservas del usuario y formulario de opiniones
│   ├── profile/            # Edición de perfil y seguridad
│   └── spaces/             # Grilla pública del catálogo de recintos
└── shared/                 # Componentes genéricos compartidos (Navbar, Footer, etc.)
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
