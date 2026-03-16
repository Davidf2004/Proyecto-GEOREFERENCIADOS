import { FoundPetCreateDto } from 'src/core/interfaces/found-pet.interface';
import { LostPet } from 'src/core/entities/lost-pet.entity';
import { generateTwoPointsMapboxImage } from 'src/core/utils/utils';

export const generatePetMatchEmailTemplate = (
  found: FoundPetCreateDto,
  lost: LostPet & { lost_lat: number; lost_lon: number },
): string => {
  const imageUrl = generateTwoPointsMapboxImage(
    lost.lost_lat,
    lost.lost_lon,
    found.lat,
    found.lon,
  );

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Posible coincidencia de mascota</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#10b981,#059669);padding:24px 32px;color:#ecfdf5;">
                <h1 style="margin:0;font-size:22px;font-weight:700;">PetRadar - ¡Se ha encontrado una mascota!</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                  Hemos detectado una posible coincidencia entre una mascota perdida y una mascota encontrada.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Detalles de la mascota encontrada</h2>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Especie:</strong> ${found.species}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Raza:</strong> ${found.breed ?? 'No especificada'}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Color:</strong> ${found.color}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Tamaño:</strong> ${found.size}
                </p>
                <p style="margin:8px 0 4px;font-size:14px;color:#374151;">
                  <strong>Descripción:</strong> ${found.description}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Dirección aproximada:</strong> ${found.address}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Datos de contacto de quien la encontró</h2>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Nombre:</strong> ${found.finder_name}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Correo:</strong> ${found.finder_email}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Teléfono:</strong> ${found.finder_phone}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Datos de la mascota perdida coincidente</h2>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Nombre:</strong> ${lost.name}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Especie:</strong> ${lost.species}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Raza:</strong> ${lost.breed}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Color:</strong> ${lost.color}
                </p>
                <p style="margin:8px 0 4px;font-size:14px;color:#374151;">
                  <strong>Descripción:</strong> ${lost.description}
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#374151;">
                  <strong>Dirección donde se perdió:</strong> ${lost.address}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 24px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Mapa de referencia</h2>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                  El mapa muestra la ubicación donde se perdió la mascota (marcador negro) y donde fue encontrada (marcador rojo).
                </p>
                <img src="${imageUrl}" alt="Mapa de la mascota perdida y encontrada" width="556" style="width:100%;max-width:556px;border-radius:12px;display:block;" />
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

