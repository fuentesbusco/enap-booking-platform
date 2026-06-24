# [cite_start]PROPUESTA COMERCIAL [cite: 4]
## [cite_start]Sistema de Reservas y Arriendos Centro Vacacional Limache - Sindicato ENAP [cite: 5]

[cite_start]**Preparado por:** Atelier Busco [cite: 6, 7]
[cite_start]**Autor:** Daniel Fuentes Busco, Ingeniero de Software Senior [cite: 8]
**Lugar y Fecha:** Santiago, Chile | [cite_start]27 de marzo de 2026 [cite: 8]

| Campo | Detalle |
|---|---|
| **Preparado para** | [cite_start]Alfredo González - Administración Centro Vacacional Limache [cite: 9] |
| **Organización** | [cite_start]Sindicato de Trabajadores - ENAP Refinería [cite: 9] |
| **Fecha de propuesta** | [cite_start]27 de marzo de 2026 [cite: 9] |
| **Válida hasta** | [cite_start]6 de abril de 2026 (10 días corridos) [cite: 9] |
| **Versión** | [cite_start]1.0 [cite: 9] |

---

## [cite_start]1. Resumen Ejecutivo [cite: 14]

[cite_start]El Centro Vacacional Limache opera hoy con un sistema de formularios que, si bien ha funcionado, genera carga administrativa manual, no previene colisiones de reservas en tiempo real y carece de un flujo de pago integrado. [cite: 15] 

[cite_start]Atelier Busco propone el desarrollo de una plataforma web completa de reservas y arriendos, construida sobre tecnología probada en producción, que automatiza el ciclo completo: desde que el socio elige su espacio hasta que el administrador confirma el pago y genera un reporte mensual. [cite: 16] 

[cite_start]La plataforma estará disponible en 5 semanas desde el inicio del proyecto, con un valor de inversión de $1.500.000 + IVA, pagaderos en tres hitos. [cite: 17]

### [cite_start]Por qué Atelier Busco [cite: 18]
* [cite_start]Ingeniería con 15+ años de experiencia en sistemas de gestión empresarial (Komatsu, Walmart, Unitec, MINSAL). [cite: 19]
* [cite_start]Entrega en 5 semanas, no en 6 meses. [cite: 20]
* [cite_start]Soporte post-entrega incluido con mantención mensual opcional. [cite: 21]

---

## [cite_start]2. Diagnóstico de la Situación Actual [cite: 26]

[cite_start]Basado en el levantamiento de requerimientos de septiembre de 2025, se identificaron los siguientes puntos críticos en el flujo actual: [cite: 27]

| Problema actual | Impacto |
|---|---|
| [cite_start]Formulario Jotform sin control de disponibilidad en tiempo real [cite: 28] | [cite_start]Topes de arriendo y conflictos manuales [cite: 28] |
| [cite_start]Pago por transferencia sin verificación automática [cite: 28] | [cite_start]Reservas que expiran sin liberar el calendario [cite: 28] |
| [cite_start]Sin diferenciación de tarifas socio vs. externo automática [cite: 28] | [cite_start]Aplicación de tarifas dependiente del criterio humano [cite: 28] |
| [cite_start]Panel de administración inexistente [cite: 28] | [cite_start]Gestión por correo electrónico manual sin trazabilidad [cite: 28] |
| [cite_start]Sin registro histórico de arriendos y pagos [cite: 28] | [cite_start]Nula visibilidad de ingresos y ocupación por espacio [cite: 28] |

---

## [cite_start]3. Solución Propuesta [cite: 32]

[cite_start]Se desarrollará una solución compuesta por tres módulos: [cite: 33]

### [cite_start]Módulo 1 - Portal de Reservas para Socios [cite: 35]
* [cite_start]Landing con información general, horarios y condiciones de arriendo. [cite: 36]
* [cite_start]Aceptación de términos con registro de consentimiento. [cite: 36]
* [cite_start]Selector de espacio por Categorías consolidadas (Cabañas Familiares, Quinchos Familiares, Piscina General, Club House) sin tener que elegir un recinto físico individual (modelo estilo hotelero). [cite: 37]
* [cite_start]Calendario de disponibilidad en tiempo real calculado dinámicamente según la cantidad de unidades totales de la categoría y reservas simultáneas. [cite: 38]
* [cite_start]Formulario de datos del socio: nombre, RUT, N° ficha (autogenerado), teléfono, correo ENAP. [cite: 39]
* [cite_start]Declaración de tipo de visita: uso personal, carga familiar, familiares o amigos. [cite: 39]
* [cite_start]Registro de invitados con nombre, RUT y edad (tabla dinámica). [cite: 40]
* [cite_start]Flujo de pago: transferencia bancaria con subida de comprobante, o pago con tarjeta vía Mercado Pago. [cite: 41]
* [cite_start]Confirmación inmediata y aviso de revisión en 48 horas. [cite: 42]

### [cite_start]Módulo 2 - Panel de Administración [cite: 43]
* [cite_start]Bandeja de reservas pendientes con aprobación o rechazo en un clic. [cite: 44]
* [cite_start]Calendario de ocupación visual por categoría con renderizado de la unidad física específica asignada a cada reserva. [cite: 45]
* [cite_start]Bloqueo manual de fechas con motivo (mantención, eventos, fuerza mayor). [cite: 46]
* [cite_start]Reasignación validada de unidades físicas específicas (ej: Cabaña 1 a 6, Quincho 1 a 10) desde el panel de control de reservas, previniendo solapamientos accidentales.
* [cite_start]Gestión de socios: registro, edición y activación/desactivación. [cite: 46]
* [cite_start]Configuración de precios y cantidad de unidades físicas disponibles (totalUnits) por categoría desde el panel. [cite: 47]
* [cite_start]Reportes: reservas por período, ingresos por espacio, ocupación mensual. [cite: 48]

### [cite_start]Módulo 3 - Infraestructura y Automatización [cite: 49]
* [cite_start]Notificación automática al socio al reservar (confirmación pendiente). [cite: 50]
* [cite_start]Notificación automática al administrador con todos los datos de la reserva. [cite: 50]
* [cite_start]Notificación al socio al aprobar o rechazar. [cite: 50]
* [cite_start]Expiración automática de reservas sin pago al cumplir 48 horas. [cite: 51]
* [cite_start]Cierre automático de disponibilidad los lunes (mantención general). [cite: 51]
* [cite_start]Diferenciación automática de tarifas según tipo de usuario. [cite: 51]

---

## [cite_start]4. Alcance y Restricciones [cite: 56]

| Incluido en esta propuesta | No incluido (disponible como Fase 2) |
|---|---|
| [cite_start]Portal de reservas web, adaptado para celular [cite: 57] | [cite_start]Aplicación móvil nativa (iOS / Android) [cite: 57] |
| [cite_start]Calendario de disponibilidad en tiempo real [cite: 57] | [cite_start]Integración con Google Calendar [cite: 57] |
| [cite_start]Registro de invitados con RUT y edad [cite: 57] | [cite_start]Encuestas de satisfacción automatizadas [cite: 57] |
| [cite_start]Panel de administración completo [cite: 57] | [cite_start]Exportación de reportes a Excel [cite: 57] |
| [cite_start]Pago con tarjeta vía Mercado Pago [cite: 57] | [cite_start]Módulo de contabilidad integrada [cite: 57] |
| [cite_start]Transferencia bancaria con comprobante [cite: 57] | [cite_start]Integración con sistemas ENAP [cite: 57] |
| [cite_start]Notificaciones por correo electrónico [cite: 57] | |
| [cite_start]Servidor administrado - primer año incluido [cite: 57] | |
| [cite_start]Subdominio de acceso por defecto [cite: 57] | |

---

## [cite_start]5. Plan de Trabajo [cite: 62]

[cite_start]El proyecto se ejecuta en 5 semanas desde la recepción del primer pago. [cite: 63] [cite_start]Cada semana el cliente recibe un resumen de avance con lo que puede ver y probar en ese momento. [cite: 64]

| Semana | Qué se hace | Qué ve el cliente |
|---|---|---|
| [cite_start]1-2 [cite: 65] | [cite_start]Se construye la base del sistema: espacios, cabañas, quinchos, reglas de precios, usuarios y calendario [cite: 65] | [cite_start]La lógica de disponibilidad funcionando: qué fechas están libres, cuánto vale cada espacio según quién reserva [cite: 65] |
| [cite_start]3-4 [cite: 65] | [cite_start]Se construye el portal para socios: elegir espacio, ver disponibilidad, ingresar invitados y pagar [cite: 65] | [cite_start]El flujo completo de reserva navegable desde el celular, incluyendo el pago con tarjeta [cite: 65] |
| [cite_start]5 [cite: 65] | [cite_start]Panel del administrador, pruebas finales y lanzamiento [cite: 65] | [cite_start]El sistema en línea, listo para recibir la primera reserva real [cite: 65] |

---

## [cite_start]6. Inversión [cite: 69]

| Servicio | Valor |
|---|---|
| [cite_start]Desarrollo del Sistema de Reservas y Arriendos - Fase 1 completa [cite: 70] | [cite_start]$1.400.000 + IVA [cite: 70] |
| [cite_start]Servidor administrado - primer año incluido [cite: 70] | [cite_start]$100.000 + IVA [cite: 70] |
| [cite_start]**TOTAL PROYECTO** [cite: 70] | [cite_start]**$1.500.000 + IVA** [cite: 70] |

### [cite_start]Estructura de Pago [cite: 72]

| # | Condición de pago | % | Monto |
|---|---|---|---|
| [cite_start]1 [cite: 73] | [cite_start]Al firmar la propuesta e iniciar el proyecto [cite: 73] | [cite_start]40% [cite: 73] | [cite_start]$600.000 + IVA [cite: 73] |
| [cite_start]2 [cite: 73] | [cite_start]Al aprobar el sistema de pruebas (semana 4) [cite: 73] | [cite_start]35% [cite: 73] | [cite_start]$525.000 + IVA [cite: 73] |
| [cite_start]3 [cite: 73] | [cite_start]Al salir a producción (semana 5) [cite: 73] | [cite_start]25% [cite: 73] | [cite_start]$375.000 + IVA [cite: 73] |

### [cite_start]Mantención Mensual Post-Entrega (Opcional) [cite: 74]
[cite_start]Incluye servidor administrado, soporte técnico y hasta 2 ajustes menores por mes. [cite: 75]

| Servicio | Valor |
|---|---|
| [cite_start]Mantención mensual - Plan Base [cite: 76] | [cite_start]$80.000 + IVA/mes [cite: 76] |

---

## [cite_start]7. Condiciones Comerciales [cite: 81]

* [cite_start]Esta propuesta tiene validez de 10 días corridos desde su emisión (hasta el 6 de abril de 2026). [cite: 82]
* [cite_start]El inicio formal del proyecto queda condicionado a la recepción del primer pago ($600.000 CLP + IVA). [cite: 83]
* [cite_start]El pago se realiza por transferencia bancaria o Mercado Pago a nombre de Veraz SpA (razón social de Atelier Busco). [cite: 84]
* [cite_start]Los datos de pago se entregan al confirmar la propuesta. [cite: 85]
* [cite_start]Cualquier funcionalidad fuera del alcance descrito en la sección 4 será cotizada por separado. [cite: 86]
* [cite_start]El cliente se compromete a entregar retroalimentación de revisión dentro de 48 horas en cada hito. [cite: 87]
* [cite_start]Los precios indicados son en pesos chilenos y no incluyen IVA. [cite: 88] [cite_start]Se emite factura o boleta según corresponda. [cite: 88]

---

## [cite_start]8. Próximos Pasos [cite: 89]

[cite_start]Para iniciar el proyecto en abril de 2026, el proceso es simple: [cite: 90]

1. [cite_start]**01:** Confirmar la propuesta vía correo o WhatsApp antes del 6 de abril de 2026. [cite: 91, 94]
2. [cite_start]**02:** Realizar el primer pago de $600.000 + IVA para formalizar el inicio. [cite: 92, 95]
3. [cite_start]**03:** En 5 semanas, su sistema estará en producción. [cite: 93, 96]

---

**Sistemas que trabajan por ti. [cite_start]No es magia, es ingeniería.** [cite: 99]
[cite_start]*Contacto: hola@atelierbusco.com | atelierbusco.com* [cite: 98]