# Checklist de Pruebas - Certificación de Entrega

Este documento sirve como bitácora y lista de verificación (checklist) de aseguramiento de calidad (QA) para validar el correcto funcionamiento de la plataforma en su totalidad antes del envío final al cliente.

---

## 🔐 1. Autenticación y Registro

- [x] **Registro de Socio Sindical**
  - *Acción:* Ir a `/ingresar` ➔ Registro, completar datos y un RUT válido, con un número de Ficha Sindical (ej: `ENP-0112`).
  - *Resultado esperado:* Registro exitoso, redirección automática al inicio con sesión activa y rol de **Socio**.
- [x] **Registro de Usuario Externo**
  - *Acción:* Registrarse sin ingresar número de ficha.
  - *Resultado esperado:* Registro exitoso, redirección con sesión activa y rol de **Externo** (tarifa base).
- [x] **Ingreso Directo (Login)**
  - *Acción:* Iniciar sesión con un correo y contraseña registrados.
  - *Resultado esperado:* Redirección a la página de inicio o a la última página de reserva intentada.
- [x] **Acceso Rápido (Demos)**
  - *Acción:* Hacer clic en "Socio Demo" o "Admin Demo" en la pantalla de ingreso.
  - *Resultado esperado:* Inicio de sesión instantáneo con las credenciales preconfiguradas.
- [x] **Cierre de Sesión**
  - *Acción:* Pulsar el botón **"Salir"** en el navbar o sidebar.
  - *Resultado esperado:* Sesión destruida en el cliente, redirección al inicio y ocultamiento de opciones privadas.
- [x] **Ingreso con Contraseña Temporal**
  - *Acción:* Iniciar sesión con un usuario recién creado desde la administración utilizando la clave alfanumérica de 6 caracteres.
  - *Resultado esperado:* Autenticación exitosa y redirección a la página de inicio.

---

## 🏦 2. Flujo de Reserva con Transferencia Bancaria

- [x] **Cálculo de Precios Dinámico (Paso 2)**
  - *Acción:* Seleccionar fechas de reserva y modificar la cantidad de acompañantes.
  - *Resultado esperado:* El total acumulado se actualiza en tiempo real según el rol (Socio tiene descuento, Externo paga tarifa base, los primeros 5 invitados de Socio a Piscina son gratis).
- [x] **Fechas Bloqueadas (Paso 1)**
  - *Acción:* Intentar seleccionar un rango de fechas que coincida con una reserva ya confirmada o en revisión para ese mismo espacio.
  - *Resultado esperado:* El sistema muestra una alerta roja "Las fechas no están disponibles" y bloquea el botón "Continuar".
- [x] **Adjuntar Comprobante y Enviar (Paso 3 y 4)**
  - *Acción:* Seleccionar la opción de Transferencia, subir un archivo JPG/PNG/PDF de prueba y hacer clic en **"Enviar reserva"**.
  - *Resultado esperado:* Botón muestra spinner de carga. Redirección a Paso 4 con el código único de reserva (ej. `ENP-2025-00004`).
- [x] **Visualización del Estado "En revisión"**
  - *Acción:* Ir a la sección **"Mis Reservas"**.
  - *Resultado esperado:* La reserva figura listada con la insignia azul de **"En revisión"**.
- [x] **Indicador de Carga (Spinner) en "Mis Reservas"**
  - *Acción:* Entrar a la sección **"Mis Reservas"** y observar la transición inicial.
  - *Resultado esperado:* Se despliega un spinner de carga centrado mientras los datos son recuperados del backend, previniendo el parpadeo de una lista vacía.
- [x] **Visualización de Fotos Reales del Centro**
  - *Acción:* Navegar por la Home y el catálogo de espacios.
  - *Resultado esperado:* Los recintos muestran imágenes reales del centro vacacional (`/images/*`) provistas por el cliente en lugar de las fotos de stock genéricas de Unsplash.

---

## 👥 3. Flujo de Reserva como Invitado (Usuario Anónimo)

- [x] **Persistencia en sessionStorage**
  - *Acción:* Sin loguearse, seleccionar espacio, fechas y acompañantes. Avanzar al paso de pago.
  - *Resultado esperado:* Redirección automática a la vista de login, guardando el objeto de reserva en la sesión del navegador.
- [x] **Identificación como Invitado**
  - *Acción:* En la pestaña *Invitado*, rellenar los datos personales e introducir una Ficha de Socio Patrocinador (ej: `ENP-0078`).
  - *Resultado esperado:* Inicio de sesión temporal exitoso, redirección directa de vuelta al Paso 3 de la reserva con los datos del Paso 1 y 2 restaurados.

---

## 🛠️ 4. Panel de Administración (Roles Especiales)

- [x] **Control de Acceso (Guards)**
  - *Acción:* Intentar ingresar a `/admin` de forma directa con un usuario de rol Socio o Externo.
  - *Resultado esperado:* Redirección de vuelta a la página principal por falta de permisos.
- [x] **Administración de Espacios (`/admin/espacios`)**
  - [x] Crear un nuevo espacio (ej: *Cabaña El Roble*) completando todos los campos de precios.
  - [x] Editar precios de un espacio existente y verificar cambios en el flujo de reserva.
  - [x] Eliminar un espacio sin reservas activas.
- [x] **Administración de Usuarios (`/admin/usuarios`)**
  - [x] Crear un usuario verificando la generación automática de la contraseña temporal de 6 caracteres, su exposición en el mensaje de éxito (toast) y envío ficticio por correo.
  - [x] Cambiar el estado de un usuario a **Inactivo** y verificar que no puede iniciar sesión en la app.
- [x] **Administración de Avisos (`/admin/avisos`)**
  - [x] Crear un aviso destacando la publicación (Pinned).
  - [x] Confirmar que aparece al inicio del muro de noticias en la Home (ordenado correctamente si hay más de un aviso fijo).
  - [x] Eliminar un aviso y confirmar que desaparece de la Home y del listado de admin.
- [x] **Aprobación de Comprobantes (`/admin/reservas`)**
  - [x] Visualizar el enlace `📄 Comprobante` del depósito y abrirlo en pestaña nueva.
  - [x] Aprobar una reserva y verificar que pasa a estado **Confirmada** (tanto para admin como para el cliente).
  - [x] Verificar la columna **"Tipo"** en el listado de reservas para comprobar si el solicitante es Socio o No Socio mediante etiquetas legibles.
- [x] **Rechazo de Comprobantes con Observaciones**
  - [x] Rechazar una reserva ingresando un comentario de retroalimentación.
  - [x] Verificar que el cliente ve la reserva en estado **"Sin pago"** y visualiza las notas del admin.
- [x] **Administración de Galería (`/admin/galeria`)**
  - [x] Agregar una nueva imagen utilizando presets del sistema o ingresando URL y título manuales.
  - [x] Eliminar una foto de la galería y validar que se quita de la base de datos de manera inmediata.

---

## 💳 5. Pasarela de Pago de Mercado Pago (Sandbox)

- [x] **Certificación Sandbox desde la Administración (`/admin/mercadopago`)**
  - *Acción:* Introducir monto, concepto y hacer clic en generar.
  - *Resultado esperado:* Retorna un ID de preferencia válido de los servidores de Mercado Pago Sandbox.
- [ ] **Checkout de Prueba Sandbox**
  - *Acción:* Pulsar en pagar en Sandbox, loguearse con la cuenta de comprador de prueba (`TESTUSER8015616000490342967` / `tBdnrZDT0m`) y pagar con tarjeta Visa aprobada.
  - *Resultado esperado:* Redirección de vuelta automática a la administración mostrando el banner verde **"¡Pago de Prueba Exitoso!"**.
- [ ] **Checkout desde el Flujo de Reserva del Usuario**
  - *Acción:* Realizar una reserva de usuario real eligiendo la pestaña **Mercado Pago** y completar el pago Sandbox.
  - *Resultado esperado:* Redirección a la sección de **Mis Reservas** del frontend, procesado en segundo plano de la confirmación en el backend y actualización instantánea a estado **Confirmada**.

---

## 🖼️ 6. Galería Pública "Conoce el Centro"

- [x] **Acceso y Visualización (`/conoce-el-centro`)**
  - *Acción:* Entrar a la sección de galería pública desde el menú principal.
  - *Resultado esperado:* Despliegue correcto de la cuadrícula de fotos con efectos de hover, zoom suave y títulos.
- [x] **Visualización en Lightbox**
  - *Acción:* Hacer clic en cualquier foto de la galería.
  - *Resultado esperado:* La imagen se abre en una pantalla completa oscura en alta definición, con controles para avanzar, retroceder o cerrar.
- [x] **Navegación mediante Teclado**
  - *Acción:* Usar las flechas direccionales izquierda y derecha para pasar de foto, y la tecla `ESC` para cerrar el visor.
  - *Resultado esperado:* Comportamiento interactivo de navegación por fotos y cierre de visor correcto.


## 6. Comentarios revision

# Primera revision

- El usuario invitado puede no tener codigo de socio
- En la pagina no existe como concepto el usuario externo, causa confusión con el usuario invitado.
- Para piscina, los 5 invitados gratis sale como -$17.500, pero el total sale $0. Puede causar confusion si el usuario tiene menos de 5 inivitados, o no invitados.
- En Identificación como Invitado el codigo de socio que se pide ingresar no queda claro que es un socio "patrocinador" pareciera que aun como invitado te pide codigo de socio.
- En el registro no usar terminos como Número de Ficha Sindical, cliente solo habla de "codigo de socio".
- Creacion de usuario en la administracion entrega el error: "QueryFailedError: Field 'full_name' doesn't have a default value".
- Cuando hay 2 avisos pinned, al parecer estar ordenados desde el mas antiguo primero.
- Al rechazar una reserva, podria verse el comentario de rechazo en la administracion tambien, para tener claridad.
- Cuando un usuario ve su reserva rechazada, no sale el motivo en el sitio web "Mis reservas".
- "Sin pago" al continuar una reserva sin pago, el sistema redirecciona a la seleccion de fechas, sin nada seleccionado, como si fuera una reserva desde cero para el espacio seleccionado.
- En la adminsitracion, al cambiar de seccion, o realizar una accion no hay indicadores visuales de que el sistema esta procesando, pareciera que está haciendo nada y puede confundir al usuario y hacer que haga click de nuevo generando posibles doble click y mala experiencia.
- Al registrar un usuario nuevo existosamente, el sistema redirecciona al home con el login ya activo, pero no se le muestra ningun indicador de exito al usuario, lo que puede generar confusión.
- Al hacer logout el usuario no ve ningun feedback visual, solo cambiar rápidamente la visibilidad de las opciones del menu, pero no es claro para el usuario.

## 6. Segunda revisión (Aseguramiento de Calidad)

- [x] **Columna Socio/No Socio en Reservas**: Verificada la columna "Tipo" en la administración de reservas que discrimina con badges de colores.
- [x] **Checkbox de Avisos Destacados**: Comprobado que al crear el aviso con el checkbox, se almacena como destacado en DB y se muestra primero en la Home.
- [x] **Contraseñas Temporales**: Se genera una clave aleatoria de 6 caracteres al crear un usuario desde administración, se notifica al administrador en el toast y se envía por correo al usuario.
- [x] **Spinner de Carga en Mis Reservas**: El spinner interactivo bloquea flashes de datos obsoletos o vacíos durante la obtención de las reservas.
- [x] **Galería de Imágenes Administrable**: Sección pública "Conoce el Centro" interactiva con Lightbox y panel CRUD en la administración.
- [x] **Integración de Imágenes Reales**: Integradas las fotos reales de la carpeta `/images/` en espacios, avisos y Home, con actualización en caliente de registros antiguos.