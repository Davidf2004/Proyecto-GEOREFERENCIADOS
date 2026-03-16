import { FoundPetCreateDto } from 'src/core/interfaces/found-pet.interface';
import { generateMapboxImage } from 'src/core/utils/utils';

export const generateFoundPetReceivedEmailTemplate = (
  found: FoundPetCreateDto,
): string => {
  const imageUrl = generateMapboxImage(found.lat, found.lon);

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Registro de mascota encontrada</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:24px 32px;color:#eff6ff;">
                <h1 style="margin:0;font-size:22px;font-weight:700;">PetRadar - Registro recibido</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                  Recibimos el registro de una mascota encontrada y por ahora no hay coincidencias dentro de 500 metros.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Datos de la mascota encontrada</h2>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Especie:</strong> ${found.species}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Raza:</strong> ${found.breed ?? 'No especificada'}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Color:</strong> ${found.color}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Tamaño:</strong> ${found.size}</p>
                <p style="margin:8px 0 4px;font-size:14px;color:#374151;"><strong>Descripción:</strong> ${found.description}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Dirección aproximada:</strong> ${found.address}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Datos de contacto de quien la encontró</h2>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Nombre:</strong> ${found.finder_name}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Correo:</strong> ${found.finder_email}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Teléfono:</strong> ${found.finder_phone}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 24px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Mapa de referencia</h2>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                  Este mapa muestra el punto donde se registró la mascota encontrada.
                </p>
                <img src="${imageUrl}" alt="Mapa de la mascota encontrada" width="556" style="width:100%;max-width:556px;border-radius:12px;display:block;" />
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 24px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  Este es un correo automático de PetRadar. Por favor, no respondas a este mensaje.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
