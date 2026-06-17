import { Booking } from '../../bookings/booking.entity';

export function getBookingPaymentRejectedEmailTemplate(booking: Booking): string {
  const user = booking.user;
  const space = booking.space;
  const breakdown = booking.priceBreakdown;
  const adminNotes = booking.adminNotes || 'No se especificó un motivo detallado.';

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formatCLP = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  // HTML Template with inline CSS using sindicato theme (Forest, Sage, Mist, Charcoal) and warning accents
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Observación en tu Comprobante de Pago - Sindicato ENAP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F0F4F1; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0F4F1; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(27, 67, 50, 0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1B4332; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 28px; color: #FFFFFF; font-weight: normal; letter-spacing: 0.5px;">Sindicato ENAP</h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #A3B899; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace;">Plataforma de Reservas</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #FCE8E6; color: #C5221F; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Requiere Acción • Comprobante Rechazado</span>
              </div>
              
              <h2 style="margin: 0 0 16px 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; color: #1A1A2E; font-weight: normal; text-align: center;">Estimado(a) ${user.fullName},</h2>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #52796F; line-height: 1.6; text-align: center;">
                Te informamos que tu comprobante de pago cargado para la reserva ha sido **rechazado** por la administración debido a observaciones que requieren tu atención.
              </p>

              <!-- Rejection Reason Highlight Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(197, 34, 31, 0.2); border-left: 4px solid #C5221F; background-color: #FFF5F5; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 11px; font-weight: bold; color: #C5221F; text-transform: uppercase; font-family: monospace; letter-spacing: 1.5px; padding-bottom: 8px; border-bottom: 1px solid rgba(197, 34, 31, 0.08);">Motivo de Rechazo indicado por Administración</td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 15px; color: #1A1A2E; line-height: 1.5; font-style: italic;">
                    "${adminNotes}"
                  </td>
                </tr>
              </table>
              
              <!-- Booking Summary Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0F4F1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: bold; color: #52796F; text-transform: uppercase; font-family: monospace; letter-spacing: 1px; padding-bottom: 12px; border-bottom: 1px solid rgba(27, 67, 50, 0.15);">Detalle de Reserva</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 6px 0; font-size: 14px; color: #52796F;">Código de Reserva:</td>
                  <td style="padding: 12px 0 6px 0; font-size: 14px; font-weight: bold; color: #1B4332; font-family: monospace; text-align: right;">${booking.bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #52796F;">Recinto / Espacio:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">${space.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #52796F;">Fechas solicitadas:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; font-family: monospace; text-align: right;">${formatDate(booking.checkIn)} al ${formatDate(booking.checkOut)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #52796F;">Días totales:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">${breakdown.days}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #52796F;">Monto total a transferir:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1B4332; text-align: right;">${formatCLP(breakdown.total)}</td>
                </tr>
              </table>

              <!-- Next Steps / Instructions -->
              <h3 style="margin: 28px 0 12px 0; font-size: 14px; color: #1B4332; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">¿Cómo proceder?</h3>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #52796F; line-height: 1.5;">
                Por favor, sigue estas instrucciones para solucionar el problema con tu reserva:
              </p>
              <ol style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; color: #1A1A2E; line-height: 1.6;">
                <li style="margin-bottom: 8px;">Revisa las observaciones indicadas anteriormente y realiza una nueva transferencia si el monto o los datos eran incorrectos.</li>
                <li style="margin-bottom: 8px;">Ingresa a la sección de <strong>"Mis Reservas"</strong> en la plataforma del Sindicato ENAP.</li>
                <li style="margin-bottom: 8px;">Busca la reserva con el código <strong>${booking.bookingCode}</strong> y presiona el botón para subir un nuevo comprobante de pago.</li>
                <li>Una vez cargado el nuevo archivo, el administrador revisará nuevamente tu solicitud.</li>
              </ol>

              <!-- Bank details box for quick reference -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(82, 121, 111, 0.15); background-color: #FAFCFA; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: bold; color: #52796F; text-transform: uppercase; font-family: monospace; letter-spacing: 1px; padding-bottom: 12px; border-bottom: 1px solid rgba(27, 67, 50, 0.08);">Datos para Transferencia</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 5px 0; font-size: 13px; color: #52796F;">Banco / Tipo Cuenta:</td>
                  <td style="padding: 10px 0 5px 0; font-size: 13px; font-weight: bold; color: #1A1A2E; text-align: right;">Banco Estado / Cuenta Corriente</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">Número de Cuenta:</td>
                  <td style="padding: 5px 0; font-family: monospace; font-weight: bold; text-align: right;">12345678-9</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">Titular / RUT:</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right;">Sindicato ENAP Refinería (71.234.567-8)</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0 10px 0; font-size: 13px; color: #52796F;">Monto exacto:</td>
                  <td style="padding: 5px 0 10px 0; font-size: 14px; font-weight: bold; color: #1B4332; text-align: right;">${formatCLP(breakdown.total)}</td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 14px; color: #52796F; line-height: 1.5; text-align: center;">
                Si consideras que esto es un error o tienes alguna duda, por favor contáctate directamente con la administración del Sindicato.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1A1A2E; padding: 24px 40px; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
              <p style="margin: 0; font-size: 12px; color: #A3B899;">Este es un correo automático enviado por el Sindicato ENAP.</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #A3B899;">Por favor, no respondas directamente a este mensaje.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
