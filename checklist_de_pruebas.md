# Checklist de Pruebas - Certificación de Entrega de Producción

Este documento sirve como bitácora y lista de verificación (checklist) de aseguramiento de calidad (QA) para certificar el correcto funcionamiento de toda la plataforma en producción.

---

## 🔐 1. Autenticación, Registro y Perfil

- [x] **Registro de Socio Sindical**
  - *Acción:* Registrarse en `/ingresar` con un RUT válido y un código de socio (ej: `ENP-0112`).
  - *Resultado:* Registro exitoso, redirección automática a Inicio con perfil de **Socio**.
- [x] **Registro de Usuario Externo**
  - *Acción:* Registrarse sin código de socio.
  - *Resultado:* Registro exitoso, redirección con perfil de **Externo** (tarifa base).
- [x] **Ingreso Directo (Login)**
  - *Acción:* Iniciar sesión con credenciales válidas.
  - *Resultado:* Redirección exitosa con JWT guardado en local.
- [x] **Acceso Rápido (Demos)**
  - *Acción:* Hacer clic en "Socio Demo" o "Admin Demo" en el Login.
  - *Resultado:* Login inmediato de prueba con un solo clic.
- [x] **Cierre de Sesión (Logout)**
  - *Acción:* Pulsar "Salir" en el menú.
  - *Resultado:* Cierre instantáneo, eliminación del token y actualización de Navbar/Footer.
- [x] **Gestión de Datos de Contacto (Perfil)**
  - *Acción:* Ir a `/perfil` y cambiar Correo y Teléfono.
  - *Resultado:* Validación estricta del formato telefónico chileno `^(\+56)?9\d{8}$` (ej: `912345678`), guardando los datos exitosamente.
- [x] **Actualización Segura de Contraseña**
  - *Acción:* Digitar contraseña actual, nueva contraseña y confirmarla en `/perfil`.
  - *Resultado:* Actualización exitosa en el backend con derivación criptográfica PBKDF2 hash.

---

## 🏦 2. Flujo de Reserva y Pagos

- [x] **Cálculo de Precios Dinámico (Paso 2)**
  - *Acción:* Elegir fechas de arriendo e invitados.
  - *Resultado:* Precios actualizados en tiempo real según rol (Socio descuento, Externo tarifa base, 5 invitados piscina gratis).
- [x] **Fechas Bloqueadas y Solapamientos (Paso 1)**
  - *Acción:* Intentar reservar un recinto en fechas previamente reservadas y confirmadas.
  - *Resultado:* Sistema alerta de colisión en color rojo y restringe el avance.
- [x] **Subir Comprobante a S3 (Paso 3 y 4)**
  - *Acción:* Elegir Transferencia, cargar archivo JPG/PNG/PDF y presionar "Enviar reserva".
  - *Resultado:* Archivo subido exitosamente a AWS S3. Código autogenerado único (ej: `ENP-2026-00004`) y redirección a mis reservas.
- [x] **Estado "En revisión" en Mis Reservas**
  - *Acción:* Verificar estado tras enviar comprobante.
  - *Resultado:* Reserva figura listada con la insignia azul de **"En revisión"**.
- [x] **Spinner de Carga en Mis Reservas**
  - *Acción:* Acceder a la pestaña de reservas.
  - *Resultado:* Se muestra spinner de carga, previniendo el parpadeo de tablas vacías.
- [x] **Visualización de Fotos Reales del Centro**
  - *Acción:* Comprobar que se muestran fotos del recinto (`/images/*`) en lugar de stock de Unsplash.
- [x] **Selector del Tipo de Visita (Paso 2)**
  - *Acción:* Reservar un espacio e interactuar con el selector triple de visita.
  - *Resultado:* Se calcula correctamente la tarifa (socio para uso personal/carga familiar, y general para familiares/amigos).
- [x] **Edad en Registro de Acompañantes (Paso 2)**
  - *Acción:* Añadir invitados ingresando Nombre, RUT y Edad.
  - *Resultado:* Se graba e integra la edad en el DTO de envío y se persiste en base de datos.
- [x] **Reglamento en Modal Flotante (Paso 3)**
  - *Acción:* Pulsar el enlace de "términos de arriendo" en el consentimiento.
  - *Resultado:* Se despliega el modal interactivo con las normas del centro vacacional.
- [x] **Aviso de Revisión en 48 Horas (Paso 4)**
  - *Acción:* Registrar una reserva con transferencia y revisar el Paso 4.
  - *Resultado:* Muestra el recordatorio explícito del plazo máximo de 48 horas de validación.
- [x] **Expiración Pasiva de Reservas Sin Actividad**
  - *Acción:* Consultar el catálogo o dashboard con reservas "sin pago" creadas hace más de 48 horas.
  - *Resultado:* Las reservas antiguas pasan automáticamente a estado "Expirado" (`expired`), liberando cupos.
- [x] **Cierre de Disponibilidad los Lunes**
  - *Acción:* Intentar seleccionar un día lunes del calendario o enviar una reserva con fecha lunes.
  - *Resultado:* Las fechas figuran deshabilitadas en gris y el backend impide la confirmación lanzando advertencia de mantención general.

---

## 👥 3. Flujo de Reserva como Invitado (Usuario Anónimo)

- [x] **Persistencia en sessionStorage**
  - *Acción:* Elegir espacio y fechas sin loguearse y avanzar al checkout.
  - *Resultado:* Redirección al Login conservando la reserva en sesión.
- [x] **Identificación como Invitado Patrocinado**
  - *Acción:* En pestaña Invitado, registrarse ingresando una ficha de socio patrocinador (ej. `ENP-0078`).
  - *Resultado:* Autenticación exitosa y devolución automática al Paso 3 de pago restaurando la reserva.

---

## 🛠️ 4. Panel de Administración (Roles Especiales)

- [x] **Control de Acceso (Guards)**
  - *Acción:* Intentar entrar a `/admin` con perfil de Socio o Externo.
  - *Resultado:* Acceso denegado, redirección al Inicio.
- [x] **Administración de Espacios (`/admin/espacios`)**
  - [x] Crear un espacio subiendo múltiples fotos de prueba a AWS S3.
  - [x] Editar tarifas del espacio y validar en el checkout.
  - [x] Eliminar un espacio libre de reservas.
- [x] **Administración de Usuarios (`/admin/usuarios`)**
  - [x] Crear un usuario en admin y comprobar generación de contraseña temporal alfanumérica de 6 caracteres.
  - [x] Crear un usuario socio dejando vacía la Ficha/Código, y validar que se le asigna un código autogenerado `ENP-XXXX`.
  - [x] Activar/Desactivar un usuario impidiendo su ingreso de forma instantánea.
- [x] **Administración de Avisos (`/admin/avisos`)**
  - [x] Crear un aviso subiendo la imagen a AWS S3 y marcarlo como destacado.
  - [x] Validar que aparece al inicio del muro en el Home con su foto correspondiente.
- [x] **Aprobación de Comprobantes (`/admin/reservas`)**
  - [x] Comprobar enlace `📄 Comprobante` del depósito abriéndose en pestaña nueva.
  - [x] Aprobar una reserva (estado pasa a **Confirmada**).
  - [x] Comprobar columna "Tipo" que diferencia si el solicitante es Socio o Externo.
- [x] **Rechazo de Comprobantes con Comentario**
  - [x] Rechazar reserva ingresando comentarios de retroalimentación.
  - [x] Verificar que el cliente ve la reserva en estado "Sin pago" con el motivo expuesto.
- [x] **Administración de Galería (`/admin/galeria`)**
  - [x] Subir una foto a la galería asociándola directamente a AWS S3.
  - [x] Eliminar una foto de la galería del centro.

---

## 🖼️ 5. Galería Pública "Conoce el Centro"

- [x] **Acceso e Interfaz (`/conoce-el-centro`)**
  - *Acción:* Entrar al carrusel público.
  - *Resultado:* Despliegue de cuadrícula moderna.
- [x] **Visualización en Lightbox**
  - *Acción:* Hacer clic en una imagen.
  - *Resultado:* Imagen se abre en pantalla completa con controles de avanzar/retroceder.
- [x] **Navegación mediante Teclado**
  - *Acción:* Usar flechas derechas/izquierdas y tecla `ESC`.
  - *Resultado:* Comportamiento correcto de cambio y cierre de Lightbox.

---

## 🌦️ 6. Integración Meteorológica (Open-Meteo & Alertas)

- [x] **Pill de Clima en Home**
  - *Acción:* Cargar página de inicio.
  - *Resultado:* Badge translúcido junto a "Limache, Chile" muestra la temperatura en vivo.
- [x] **Pill de Clima en Catálogo**
  - *Acción:* Cargar catálogo `/espacios`.
  - *Resultado:* Muestra pill con temperatura y cielo de Limache al lado del título.
- [x] **Pronóstico a 3 Días (Paso 1)**
  - *Acción:* Cargar el Paso 1 de reserva y comprobar widget al lado del calendario.
- [x] **Alerta Climatológica por Fecha Seleccionada**
  - *Acción:* Reservar Quincho o Piscina y seleccionar un día con lluvia pronosticada.
  - *Resultado:* Se gatilla el banner preventivo color ámbar recomendando reprogramar por mal clima.

---

## 🧼 7. Guía de Estadía & FAQ Interactivo

- [x] **Sección Informativa en Home**
  - *Acción:* Verificar columna de Equipaje/Normas y el Acordeón FAQ.
- [x] **Poblamiento de Datos Semilla (Seeder)**
  - *Acción:* Revisar logs del backend al bootear.
  - *Resultado:* Se insertan 6 FAQs turísticas y sindicales en MySQL de forma automática e independiente si no existen.
- [x] **Panel CRUD FAQs (`/admin/faqs`)**
  - *Acción:* Agregar y reordenar FAQs desde la administración.
  - *Resultado:* Visualización instantánea con el orden correcto en el home del socio.

---

## 💳 8. Pasarela de Pago de Mercado Pago (Sandbox)

- [x] **Test de Credenciales (`/admin/mercadopago`)**
  - *Acción:* Generar preferencia de prueba y pagar en Sandbox.
  - *Resultado:* Transacción exitosa reflejada en el banner verde.
- [x] **Pago de Reservas del Socio**
  - *Acción:* Pagar una reserva real y comprobar redirecciones a `/mercadopago/success`, `/mercadopago/failure` o `/mercadopago/pending`.
  - *Resultado:* Acreditación inmediata de la reserva a "Confirmada" por parte de los webhooks del backend en producción.

---

## 🚀 9. Certificación de Despliegue en Producción

- [x] **Frontend Desplegado en Vercel**
  - URL Producción: `https://enap-front-web.vercel.app`
- [x] **Backend Desplegado en AWS Lambda**
  - URL Base API: `https://odru0vr5a5.execute-api.us-east-1.amazonaws.com/`
- [x] **AWS RDS MySQL & S3 Storage**
  - Base de datos conectada en la nube y subida de archivos real a S3 operativa en producción.
- [x] **AWS SES Emailing**
  - Envío automático de notificaciones a socios y administradores operativo desde el servidor de producción.
