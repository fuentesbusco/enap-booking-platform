# Manual de Usuario y Guía de Flujos de Pruebas

Esta guía detalla el funcionamiento de la Plataforma de Reservas del Centro Vacacional ENAP (Sindicato ENAP Refinería Bío Bío), los roles de acceso, los flujos de pruebas punta a punta y la configuración de las simulaciones locales para facilitar la certificación del sistema en entornos de desarrollo y producción.

---

## 🔑 1. Credenciales de Acceso Rápido
Para simplificar el proceso de pruebas locales, el sistema cuenta con botones de **Quick Login (Acceso Demo)** en la vista de ingreso (`/ingresar`). También puedes ingresar manualmente con las siguientes credenciales (la contraseña es común para todas: `password123`):

*   **Socio Sindical (Cliente):** `carlos.munoz@enap.cl` (Código Ficha: `ENP-0042`)
*   **Administrador:** `admin@sindicatoenap.cl` (Habilita el menú lateral **"Administración"**)
*   **Usuario Externo (Público General):** `ana@gmail.com`

---

## 🏕️ 2. Flujos de Pruebas de Reservas y Funcionalidades (Usuario)

### Flujo A: Reserva con Transferencia y Aprobación
Este flujo valida el registro de una reserva con pago fuera de línea y la aprobación manual por parte del administrador.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Socio (Carlos Muñoz)
    actor Admin as Administrador
    participant Srv as Servidor NestJS
    participant DB as Base de Datos MySQL
    
    Cliente->>Srv: Inicia sesión (carlos.munoz@enap.cl)
    Cliente->>Srv: Selecciona Espacio (Cabaña Boldos) y Fechas
    Cliente->>Srv: Registra acompañantes (Paso 2)
    Cliente->>Srv: Sube comprobante de transferencia y envía (Paso 3)
    Srv->>DB: Guarda reserva con estado "pending_approval"
    Srv-->>Cliente: Redirecciona a Paso 4 (Código ENP-2026-XXXXX)
    Admin->>Srv: Inicia sesión y va a Reservas -> Por Aprobar
    Admin->>Srv: Revisa comprobante y hace clic en "Aprobar"
    Srv->>DB: Actualiza estado a "confirmed" y envía email de confirmación
    Cliente->>Srv: Ingresa a "Mis Reservas"
    Srv-->>Cliente: Muestra reserva con estado "Confirmada" (badge verde)
```

1.  **Iniciar Reserva:** Ingresa con el usuario de Socio (`carlos.munoz@enap.cl`).
2.  **Seleccionar Espacio y Fechas:** Ve a **Espacios**, elige un recinto (ej: *Cabaña Los Boldos*) e introduce fechas válidas.
3.  **Añadir Acompañantes (Paso 2):** Agrega invitados. Si el recinto es del tipo **Piscina**, los primeros 5 invitados de un Socio son gratuitos. El desglose calculará el total en tiempo real.
4.  **Confirmar con Transferencia (Paso 3):** Selecciona la pestaña **"Transferencia Bancaria"**. Copia los datos bancarios, adjunta un comprobante (archivo PDF o imagen) y haz clic en **"Enviar reserva"**.
5.  **Revisión en Mis Reservas:** Serás redirigido al Paso 4 ("Reserva enviada") con un código único (ej: `ENP-2026-00004`). Haz clic en **"Ver mis reservas"** y confirma que aparece listada en estado **"En revisión"**.
6.  **Aprobación (Admin):** Cierra sesión e ingresa como Administrador (`admin@sindicatoenap.cl`). Ve a **Administración** ➔ **Reservas** ➔ pestaña **"Por aprobar"**.
    *   Puedes hacer clic en el enlace `📄 Comprobante` para abrir el documento adjunto (cargado en S3).
    *   Haz clic en **"Aprobar"**.
7.  **Comprobación Final:** Vuelve a loguearte con la cuenta de Carlos Muñoz y verifica en **Mis Reservas** que el estado ha cambiado a **"Confirmada"** (en color verde).

---

### Flujo B: Gestión de Perfil de Usuario y Seguridad
Valida la edición de datos personales del usuario y la actualización de contraseñas de forma segura en producción.
1.  **Ingresar a Perfil:** Inicia sesión con cualquier cuenta y haz clic en el menú **Mi Perfil** en la Navbar.
2.  **Modificar Datos de Contacto:**
    *   Intenta cambiar tu correo o teléfono.
    *   Ingresa un teléfono erróneo (ej: `12345`). Verás una alerta de error de formato. El sistema exige formato telefónico chileno: `^(\+56)?9\d{8}$` (ej: `912345678` o `+56912345678`).
    *   Modifica el teléfono a un formato válido y presiona **"Guardar cambios"**. El toast confirmará la actualización.
3.  **Actualizar Contraseña:**
    *   En la sección de seguridad, digita tu contraseña actual (`password123`), escribe tu nueva contraseña (ej. `nuevaClave12`) y confírmala.
    *   Presiona **"Actualizar Contraseña"**.
    *   Haz logout de la plataforma e inicia sesión nuevamente usando tu nueva contraseña para confirmar que quedó almacenada mediante hashing seguro PBKDF2 en el backend.

---

### Flujo C: Sistema de Opiniones y Moderación
Valida la subida de retroalimentación de los socios y la posterior aprobación del administrador.
1.  **Dejar Opinión (Socio):**
    *   Ingresa con tu cuenta de Socio. Ve a **Mis Reservas**.
    *   Para una estadía finalizada (cuyo check-out sea anterior o igual al día de hoy) y que no tenga opinión registrada, verás el botón **"⭐ Dejar Opinión"**.
    *   Haz clic en él. Selecciona una calificación (1 a 5 estrellas) y escribe un comentario de tu experiencia. Presiona **"Enviar Opinión"**.
    *   El comentario quedará listado en tu reserva en estado *"Pendiente de moderación"*.
2.  **Moderación (Administrador):**
    *   Inicia sesión como Administrador (`admin@sindicatoenap.cl`).
    *   Ve a **Administración ➔ Opiniones**.
    *   Verás la opinión creada en estado *Pendiente*. Puedes pulsar **"Aprobar"** o **"Rechazar"**.
    *   Haz clic en **"Aprobar"**.
3.  **Comprobación Pública:**
    *   Navega a la sección **Espacios**. Verás que el espacio evaluado actualizó su calificación promedio de estrellas y cantidad de votos.
    *   Entra al espacio y en el Paso 1 de la reserva, comprueba que la opinión aprobada ahora aparece listada en la sección de opiniones de los socios.

---

### Flujo D: Pronóstico del Clima Local y Alertas Preventivas
Valida cómo influye el clima en la experiencia del usuario de manera inteligente.
1.  **Clima en Portada:** En el Hero del Home, revisa el badge translúcido al lado de "Limache, Chile" que muestra las condiciones meteorológicas y temperatura en vivo.
2.  **Clima en Catálogo:** En `/espacios`, verifica el pill climatológico al lado del título "Espacios disponibles" que sirve para orientar al usuario antes de reservar.
3.  **Previsión en Reserva (Paso 1):** Inicia el checkout de un Quincho o Cabaña. Al lado del selector de fechas verás una previsión compacta para los siguientes 3 días (máxima y mínima).
4.  **Alerta Preventiva de Lluvia:**
    *   En el backend, el pronóstico diario es consumido de Open-Meteo. (Si la API falla, utiliza fallback de pruebas locales).
    *   Selecciona un Quincho o Piscina (espacios exteriores).
    *   Elige una fecha del calendario donde el pronóstico prevea precipitaciones (lluvia, chubascos, tormentas, llovizna).
    *   Al seleccionar la fecha, aparecerá automáticamente un banner ámbar: *"Alerta: Este es un espacio al aire libre y hay pronóstico de precipitaciones. Podrías preferir reprogramar"*.

---

### Flujo E: Guía de Estadía & FAQ Interactivo
Valida la consulta de soporte dinámico.
1.  **Sección de Ayuda:** En la página de Inicio, ve a la sección **"Guía de Estadía & FAQ Interactivo"**.
2.  **Visualizar Normas y FAQs:** Revisa la columna izquierda con normas críticas (uso de sábanas en cabañas, carbón en quinchos) y la columna derecha con el acordeón de Preguntas Frecuentes.
3.  **Interactuar con Preguntas:** Haz clic en una FAQ para expandir su contenido suavemente. Las FAQs que se listan son cargadas desde la base de datos (con las preguntas semilla de ENAP-turismo y sindicato).
4.  **Modificar FAQs (Admin):** Entra como Admin, ve a **Administración ➔ Preguntas Frecuentes** (`/admin/faqs`). Modifica, elimina o añade una pregunta nueva. Valida que se actualiza al instante en la Home.

---

### Flujo F: Reserva como Invitado (Usuario Anónimo)
1.  **Navegación Anónima:** Sin iniciar sesión, ve a **Espacios**, selecciona fechas y añade acompañantes.
2.  **Redirección de Autenticación:** Al pulsar "Continuar" en el Paso 2, el sistema detecta que no estás autenticado, guarda el progreso en `sessionStorage` y te redirige a `/ingresar`.
3.  **Identificarse como Invitado:** En la pantalla de ingreso, selecciona la pestaña **"Invitado"**. Rellena tus datos (RUT, Nombre, Correo) e ingresa opcionalmente un Código de Ficha de Socio Patrocinador. Haz clic en **"Continuar como Invitado"**.
4.  **Restauración del Checkout:** La plataforma te autentica de forma temporal y te devuelve de inmediato al Paso 3 del checkout conservando todos los datos que habías seleccionado. Carga el comprobante y finaliza tu reserva.

---

### Flujo G: Reserva de Quinchos y Piscina (Jornada Única)
1.  **Iniciar Reserva:** Ve a **Espacios**, selecciona un Quincho o la *Piscina General*.
2.  **Selector de Fecha de Jornada:** Verás el selector **"Día de la Jornada"** (check_in = check_out).
3.  **Verificación de Conflictos:**
    *   **Quinchos:** Si intentas seleccionar una fecha ocupada, aparecerá una alerta de conflicto en color rojo impidiendo continuar.
    *   **Piscina:** Múltiples socios pueden reservar el mismo día. La alerta de conflicto se mostrará únicamente cuando el aforo acumulado de todas las reservas de ese día alcance los 80 cupos máximos.

---

### Flujo H: Socio reserva para un Tercero Ocupante (Patrocinio de Beneficio)
1.  **Autenticación de Socio:** Ingresa con el usuario de Socio.
2.  **Selección de Cabaña:** Elige fechas. En acompañantes (Paso 2), selecciona la opción **"Para un Tercero Externo (Tarifa General)"**.
3.  **Datos del Tercero:** Ingresa Nombre Completo, RUT y Teléfono del ocupante tercero.
4.  **Verificación del Precio:** Observa que la tarifa base habrá cambiado automáticamente a la Tarifa General ($50.000/día).
5.  **Aprobación Admin:** Completa el pago. El Administrador verá la reserva marcada con la insignia **"Para Tercero"** y la caja con los datos del tercero en la columna Titular.

---

## 💼 3. Flujos de Gestión en Administración (Admin)

Al ingresar con la cuenta de Administrador, aparecerá el menú **Administración** en el navbar, dando acceso a las siguientes áreas CRUD reales:

### Gestión de Espacios (`/admin/espacios`)
*   **Subida Múltiple a S3:** Al crear o editar un espacio, puedes subir múltiples fotos desde tu equipo local. Las imágenes se envían a AWS S3 y se listan como miniaturas en el formulario. Puedes eliminar las fotos de forma individual.
*   **CRUD completo:** Permite crear, modificar y eliminar espacios.

### Gestión de Usuarios (`/admin/usuarios`)
*   **Registrar Usuario:** Permite crear cuentas directas. Las cuentas se inicializan con una contraseña alfanumérica aleatoria de 6 caracteres que se expone en el toast de éxito.
*   **Activar/Desactivar:** Permite suspender temporalmente el acceso de un usuario.

### Gestión de Avisos (`/admin/avisos`)
*   **Subida de Foto a S3:** Reemplazado el input de URL por un cargador de archivos directo a S3.
*   **Crear/Eliminar:** Permite publicar noticias destacadas y dar de baja anuncios antiguos.

### Gestión de Galería de Fotos (`/admin/galeria`)
*   **Cargador S3:** Permite subir imágenes de forma directa a S3 ingresando título y descripción.
*   **Eliminar:** Permite dar de baja fotos del carrusel público.

---

## 💳 4. Flujo de Certificación de Mercado Pago (Sandbox)

### Panel de Pruebas Sandbox (`/admin/mercadopago`)
1.  Ingresa al menú lateral **Test Mercado Pago** `💳`.
2.  Digita concepto, cantidad y monto, y haz clic en **"Generar Preferencia"**.
3.  Pulsa **"Abrir Pasarela de Pago (Sandbox) ↗"**. Se abrirá la pasarela real de pruebas de Mercado Pago.
4.  Utiliza las siguientes credenciales para pagar:
    *   **Email Comprador:** `TESTUSER8015616000490342967`
    *   **Contraseña Comprador:** `tBdnrZDT0m`
    *   **Tarjeta Visa (Aprobado):** `4168 8188 4444 7115` (Vencimiento: `11/30` | CVV: `123`)
5.  Una vez completado el pago, serás redirigido de vuelta al panel mostrando el banner verde **"¡Pago de Prueba Exitoso!"**.

### Rutas de Retorno para Checkout de Reservas (Éxito, Error y Pendiente)
Cuando pagas una reserva con Mercado Pago, serás redirigido a:
*   **Éxito (`/mercadopago/success`):** Muestra una tarjeta premium de éxito verde con el ID de pago, código de reserva y confirmación automática.
*   **Fallo (`/mercadopago/failure`):** Muestra una tarjeta roja para reintentar la transacción.
*   **Pendiente (`/mercadopago/pending`):** Muestra una tarjeta amarilla con información de acreditación pendiente.

---

## ⚙️ 5. Simulaciones Locales (Bypasses en el Backend)

Para facilitar el desarrollo local sin dependencias externas obligatorias, el backend incluye los siguientes mecanismos automáticos:

1.  **Simulación de AWS S3**: Si no se configuran las credenciales en el `.env`, el backend omite la carga real y genera una URL simulada válida.
2.  **Simulación de AWS SES (SMTP)**: Si las configuraciones de correo son de prueba, el backend omite la conexión y escribe en la consola de NestJS los detalles del correo que se habría enviado.
