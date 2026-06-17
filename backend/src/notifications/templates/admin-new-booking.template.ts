import { Booking } from '../../bookings/booking.entity';

export function getAdminNewBookingEmailTemplate(booking: Booking): string {
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

  const roleText = user.role === 'socio' ? 'Socio Sindicato' : user.role === 'external' ? 'Externo' : 'Administrador';

  // HTML Template with inline CSS using sindicato theme (Forest, Sage, Mist, Charcoal)
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Solicitud de Reserva - Sindicato ENAP</title>
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
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #A3B899; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace;">Panel Administrativo</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #E8F0FE; color: #1A73E8; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Nueva Reserva Registrada</span>
              </div>
              
              <h2 style="margin: 0 0 16px 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 20px; color: #1A1A2E; font-weight: normal;">Notificación de Administración:</h2>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #52796F; line-height: 1.6;">
                Se ha registrado una nueva solicitud de reserva en la plataforma. A continuación se detallan los datos del solicitante y de la estadía para su seguimiento y posterior aprobación del pago:
              </p>

              <!-- User Details Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(82, 121, 111, 0.15); background-color: #FAFCFA; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: bold; color: #1B4332; text-transform: uppercase; font-family: monospace; letter-spacing: 1.5px; padding-bottom: 12px; border-bottom: 1px solid rgba(27, 67, 50, 0.08);">Datos del Solicitante</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 5px 0; font-size: 14px; color: #52796F; width: 140px;">Nombre Solicitante:</td>
                  <td style="padding: 10px 0 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">${user.fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px; color: #52796F;">RUT:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; font-family: monospace; text-align: right;">${user.rut}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px; color: #52796F;">Tipo de Usuario:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">${roleText}</td>
                </tr>
                ${user.fichaNumber ? `
                <tr>
                  <td style="padding: 5px 0; font-size: 14px; color: #52796F;">Nº de Ficha:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; font-family: monospace; text-align: right;">${user.fichaNumber}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 5px 0 10px 0; font-size: 14px; color: #52796F;">Correo Electrónico:</td>
                  <td style="padding: 5px 0 10px 0; font-size: 14px; font-weight: bold; color: #1B4332; text-align: right;"><a href="mailto:${user.email}" style="color: #1B4332; text-decoration: none;">${user.email}</a></td>
                </tr>
              </table>
              
              <!-- Booking Summary Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0F4F1; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
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
                  <td style="padding: 6px 0; font-size: 14px; color: #52796F;">Acompañantes registrados:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A2E; text-align: right;">${booking.guests ? booking.guests.length : 0}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0 12px 0; font-size: 14px; color: #52796F;">Monto total a recaudar:</td>
                  <td style="padding: 6px 0 12px 0; font-size: 16px; font-weight: bold; color: #1B4332; text-align: right;">${formatCLP(breakdown.total)}</td>
                </tr>
              </table>

              <!-- Action Status Notification -->
              <p style="margin: 0 0 28px 0; font-size: 14px; color: #52796F; line-height: 1.5; text-align: center;">
                La reserva ha sido guardada con el estado <strong>Pendiente de Pago</strong>. El sistema notificará a este correo una vez que el usuario proceda a subir su comprobante de pago bancario para su respectiva <strong>revisión y aprobación</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:4200/admin/bookings" target="_blank" style="background-color: #1B4332; color: #FFFFFF; display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(27, 67, 50, 0.2);">Ver Reservas en Panel</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1A1A2E; padding: 24px 40px; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
              <p style="margin: 0; font-size: 12px; color: #A3B899;">Este es un correo automático enviado por la plataforma de reservas.</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #A3B899;">Sindicato ENAP Refinería Concón.</p>
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
