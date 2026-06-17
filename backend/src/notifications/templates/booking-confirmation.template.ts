import { Booking } from '../../bookings/booking.entity';

export function getBookingConfirmationEmailTemplate(booking: Booking): string {
  const user = booking.user;
  const space = booking.space;
  const breakdown = booking.priceBreakdown;

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

  const guestsListHtml =
    booking.guests && booking.guests.length > 0
      ? booking.guests
          .map(
            (g, idx) => `
        <tr style="border-bottom: 1px solid #EAEAEA;">
          <td style="padding: 10px 0; font-size: 14px; color: #1A1A2E;">${idx + 1}. ${g.fullName}</td>
          <td style="padding: 10px 0; font-size: 14px; color: #1A1A2E; font-family: monospace; text-align: right;">${g.rut}</td>
        </tr>
      `,
          )
          .join('')
      : `<tr><td colspan="2" style="padding: 10px 0; font-size: 14px; color: #1A1A2E; font-style: italic; text-align: center;">Sin invitados adicionales registrados</td></tr>`;

  // HTML Template with inline CSS using sindicato theme (Forest, Sage, Mist, Charcoal)
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva - Sindicato ENAP</title>
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
              <h2 style="margin: 0 0 16px 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; color: #1A1A2E; font-weight: normal;">¡Hola ${user.fullName}!</h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #52796F; line-height: 1.6;">
                Hemos registrado tu solicitud de reserva en la plataforma. Para asegurar tu estadía en el recinto seleccionado, es necesario realizar una transferencia bancaria y cargar el comprobante en el sistema dentro de un plazo de <strong>24 horas</strong>.
              </p>
              
              <!-- Booking Summary Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0F4F1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: bold; color: #52796F; text-transform: uppercase; font-family: monospace; letter-spacing: 1px; padding-bottom: 12px; border-bottom: 1px solid rgba(27, 67, 50, 0.15);">Detalle General</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 6px 0; font-size: 14px; color: #52796F;">Código de Reserva:</td>
                  <td style="padding: 12px 0 6px 0; font-size: 14px; font-weight: bold; color: #1B4332; font-family: monospace; text-align: right;">${booking.bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #52796F;">Espacio Solicitado:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">${space.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #52796F;">Fechas:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; font-family: monospace; text-align: right;">${formatDate(booking.checkIn)} al ${formatDate(booking.checkOut)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #52796F;">Días totales:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">${breakdown.days}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0 12px 0; font-size: 14px; color: #52796F;">Acompañantes registrados:</td>
                  <td style="padding: 6px 0 12px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">${booking.guests ? booking.guests.length : 0}</td>
                </tr>
              </table>

              <!-- Detailed breakdown -->
              <h3 style="margin: 28px 0 12px 0; font-size: 14px; color: #1B4332; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">Desglose de Valores</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #EAEAEA;">
                  <td style="padding: 12px 0; font-size: 14px; color: #52796F;">Costo base espacio:</td>
                  <td style="padding: 12px 0; font-size: 14px; color: #1A1A2E; text-align: right; font-weight: 500;">${formatCLP(breakdown.base)}</td>
                </tr>
                ${
                  breakdown.guests_total > 0
                    ? `
                <tr style="border-bottom: 1px solid #EAEAEA;">
                  <td style="padding: 12px 0; font-size: 14px; color: #52796F;">Adicionales (${breakdown.guests_count} invitado(s)):</td>
                  <td style="padding: 12px 0; font-size: 14px; color: #1A1A2E; text-align: right; font-weight: 500;">${formatCLP(breakdown.guests_total)}</td>
                </tr>
                `
                    : ''
                }
                ${
                  breakdown.discount > 0
                    ? `
                <tr style="border-bottom: 1px solid #EAEAEA;">
                  <td style="padding: 12px 0; font-size: 14px; color: #40916C; font-weight: 500;">Descuento aplicado (beneficio socio):</td>
                  <td style="padding: 12px 0; font-size: 14px; color: #40916C; text-align: right; font-weight: 600;">-${formatCLP(breakdown.discount)}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 16px 0; color: #1B4332; font-size: 16px; font-weight: bold;">Monto total a transferir:</td>
                  <td style="padding: 16px 0; color: #1B4332; text-align: right; font-size: 20px; font-weight: bold;">${formatCLP(breakdown.total)}</td>
                </tr>
              </table>

              <!-- Guests Section -->
              <h3 style="margin: 24px 0 12px 0; font-size: 14px; color: #1B4332; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">Acompañantes</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px; border-collapse: collapse;">
                ${guestsListHtml}
              </table>

              <!-- Bank details highlight box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(82, 121, 111, 0.2); border-left: 4px solid #1B4332; background-color: #FAFCFA; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: bold; color: #1B4332; text-transform: uppercase; font-family: monospace; letter-spacing: 1.5px; padding-bottom: 12px; border-bottom: 1px solid rgba(27, 67, 50, 0.08);">Datos para Transferencia</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 5px 0; font-size: 14px; color: #52796F;">Banco:</td>
                  <td style="padding: 10px 0 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">Banco Estado</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px; color: #52796F;">Tipo de Cuenta:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">Cuenta Corriente</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px; color: #52796F;">Número de Cuenta:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; font-family: monospace; text-align: right;">12345678-9</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px; color: #52796F;">Titular:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">Sindicato ENAP Refinería</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px; color: #52796F;">RUT:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; font-family: monospace; text-align: right;">71.234.567-8</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0 10px 0; font-size: 14px; color: #52796F;">Monto exacto:</td>
                  <td style="padding: 5px 0 10px 0; font-size: 16px; font-weight: bold; color: #1B4332; text-align: right;">${formatCLP(breakdown.total)}</td>
                </tr>
              </table>

              <!-- CTA / Instructions -->
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #52796F; line-height: 1.5; text-align: center;">
                Recuerda que una vez realizada la transferencia, debes ingresar a la sección de <strong>"Mis Reservas"</strong> en la plataforma para cargar tu comprobante y finalizar el proceso.
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
