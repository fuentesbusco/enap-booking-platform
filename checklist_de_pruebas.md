# Checklist de Pruebas - Certificación de Entrega

Este documento sirve como bitácora y lista de verificación (checklist) de aseguramiento de calidad (QA) para validar el correcto funcionamiento de la plataforma en su totalidad antes del envío final al cliente.

---

## 🔐 1. Autenticación y Registro

- [ ] **Registro de Socio Sindical**
  - *Acción:* Ir a `/ingresar` ➔ Registro, completar datos y un RUT válido, con un número de Ficha Sindical (ej: `ENP-0112`).
  - *Resultado esperado:* Registro exitoso, redirección automática al inicio con sesión activa y rol de **Socio**.
- [ ] **Registro de Usuario Externo**
  - *Acción:* Registrarse sin ingresar número de ficha.
  - *Resultado esperado:* Registro exitoso, redirección con sesión activa y rol de **Externo** (tarifa base).
- [ ] **Ingreso Directo (Login)**
  - *Acción:* Iniciar sesión con un correo y contraseña registrados.
  - *Resultado esperado:* Redirección a la página de inicio o a la última página de reserva intentada.
- [ ] **Acceso Rápido (Demos)**
  - *Acción:* Hacer clic en "Socio Demo" o "Admin Demo" en la pantalla de ingreso.
  - *Resultado esperado:* Inicio de sesión instantáneo con las credenciales preconfiguradas.
- [ ] **Cierre de Sesión**
  - *Acción:* Pulsar el botón **"Salir"** en el navbar o sidebar.
  - *Resultado esperado:* Sesión destruida en el cliente, redirección al inicio y ocultamiento de opciones privadas.

---

## 🏦 2. Flujo de Reserva con Transferencia Bancaria

- [ ] **Cálculo de Precios Dinámico (Paso 2)**
  - *Acción:* Seleccionar fechas de reserva y modificar la cantidad de acompañantes.
  - *Resultado esperado:* El total acumulado se actualiza en tiempo real según el rol (Socio tiene descuento, Externo paga tarifa base, los primeros 5 invitados de Socio a Piscina son gratis).
- [ ] **Fechas Bloqueadas (Paso 1)**
  - *Acción:* Intentar seleccionar un rango de fechas que coincida con una reserva ya confirmada o en revisión para ese mismo espacio.
  - *Resultado esperado:* El sistema muestra una alerta roja "Las fechas no están disponibles" y bloquea el botón "Continuar".
- [ ] **Adjuntar Comprobante y Enviar (Paso 3 y 4)**
  - *Acción:* Seleccionar la opción de Transferencia, subir un archivo JPG/PNG/PDF de prueba y hacer clic en **"Enviar reserva"**.
  - *Resultado esperado:* Botón muestra spinner de carga. Redirección a Paso 4 con el código único de reserva (ej. `ENP-2025-00004`).
- [ ] **Visualización del Estado "En revisión"**
  - *Acción:* Ir a la sección **"Mis Reservas"**.
  - *Resultado esperado:* La reserva figura listada con la insignia azul de **"En revisión"**.

---

## 👥 3. Flujo de Reserva como Invitado (Usuario Anónimo)

- [ ] **Persistencia en sessionStorage**
  - *Acción:* Sin loguearse, seleccionar espacio, fechas y acompañantes. Avanzar al paso de pago.
  - *Resultado esperado:* Redirección automática a la vista de login, guardando el objeto de reserva en la sesión del navegador.
- [ ] **Identificación como Invitado**
  - *Acción:* En la pestaña *Invitado*, rellenar los datos personales e introducir una Ficha de Socio Patrocinador (ej: `ENP-0078`).
  - *Resultado esperado:* Inicio de sesión temporal exitoso, redirección directa de vuelta al Paso 3 de la reserva con los datos del Paso 1 y 2 restaurados.

---

## 🛠️ 4. Panel de Administración (Roles Especiales)

- [ ] **Control de Acceso (Guards)**
  - *Acción:* Intentar ingresar a `/admin` de forma directa con un usuario de rol Socio o Externo.
  - *Resultado esperado:* Redirección de vuelta a la página principal por falta de permisos.
- [ ] **Administración de Espacios (`/admin/espacios`)**
  - [ ] Crear un nuevo espacio (ej: *Cabaña El Roble*) completando todos los campos de precios.
  - [ ] Editar precios de un espacio existente y verificar cambios en el flujo de reserva.
  - [ ] Eliminar un espacio sin reservas activas.
- [ ] **Administración de Usuarios (`/admin/usuarios`)**
  - [ ] Crear un usuario con contraseña por defecto (`password123`) desde el panel.
  - [ ] Cambiar el estado de un usuario a **Inactivo** y verificar que no puede iniciar sesión en la app.
- [ ] **Administración de Avisos (`/admin/avisos`)**
  - [ ] Crear un aviso destacando la publicación (Pinned).
  - [ ] Confirmar que aparece al inicio del muro de noticias en la Home.
  - [ ] Eliminar un aviso y confirmar que desaparece de la Home y del listado de admin.
- [ ] **Aprobación de Comprobantes (`/admin/reservas`)**
  - [ ] Visualizar el enlace `📄 Comprobante` del depósito y abrirlo en pestaña nueva.
  - [ ] Aprobar una reserva y verificar que pasa a estado **Confirmada** (tanto para admin como para el cliente).
- [ ] **Rechazo de Comprobantes con Observaciones**
  - [ ] Rechazar una reserva ingresando un comentario de retroalimentación.
  - [ ] Verificar que el cliente ve la reserva en estado **"Sin pago"** y visualiza las notas del admin.

---

## 💳 5. Pasarela de Pago de Mercado Pago (Sandbox)

- [ ] **Certificación Sandbox desde la Administración (`/admin/mercadopago`)**
  - *Acción:* Introducir monto, concepto y hacer clic en generar.
  - *Resultado esperado:* Retorna un ID de preferencia válido de los servidores de Mercado Pago Sandbox.
- [ ] **Checkout de Prueba Sandbox**
  - *Acción:* Pulsar en pagar en Sandbox, loguearse con la cuenta de comprador de prueba (`TESTUSER8015616000490342967` / `tBdnrZDT0m`) y pagar con tarjeta Visa aprobada.
  - *Resultado esperado:* Redirección de vuelta automática a la administración mostrando el banner verde **"¡Pago de Prueba Exitoso!"**.
- [ ] **Checkout desde el Flujo de Reserva del Usuario**
  - *Acción:* Realizar una reserva de usuario real eligiendo la pestaña **Mercado Pago** y completar el pago Sandbox.
  - *Resultado esperado:* Redirección a la sección de **Mis Reservas** del frontend, procesado en segundo plano de la confirmación en el backend y actualización instantánea a estado **Confirmada**.
