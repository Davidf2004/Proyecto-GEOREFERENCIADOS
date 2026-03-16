import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoundPet } from 'src/core/entities/found-pet.entity';
import { LostPet } from 'src/core/entities/lost-pet.entity';
import { FoundPetCreateDto } from 'src/core/interfaces/found-pet.interface';
import { EmailService } from 'src/email/email.service';
import { EmailOptions } from 'src/core/interfaces/mail-options.interface';
import { envs } from 'src/config/envs';
import { generatePetMatchEmailTemplate } from './templates/pet-match-email.template';
import { generateFoundPetReceivedEmailTemplate } from './templates/found-pet-received-email.template';

@Injectable()
export class FoundPetsService {
  private readonly searchRadiusInMeters = 500;
  private readonly logger = new Logger(FoundPetsService.name);

  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetsRepository: Repository<FoundPet>,
    @InjectRepository(LostPet)
    private readonly lostPetsRepository: Repository<LostPet>,
    private readonly emailService: EmailService,
  ) {}

  async createFoundPet(data: FoundPetCreateDto): Promise<FoundPet> {
    const foundPet = this.foundPetsRepository.create({
      species: data.species,
      breed: data.breed,
      color: data.color,
      size: data.size,
      description: data.description,
      photo_url: data.photo_url,
      finder_name: data.finder_name,
      finder_email: data.finder_email,
      finder_phone: data.finder_phone,
      address: data.address,
      found_date: data.found_date ?? new Date(),
      location: {
        type: 'Point',
        coordinates: [data.lon, data.lat],
      } as any,
    });

    const savedFound = await this.foundPetsRepository.save(foundPet);

    await this.notifyMatches(savedFound, data);

    return savedFound;
  }

  private async notifyMatches(foundEntity: FoundPet, originalDto: FoundPetCreateDto): Promise<void> {
    const lon = originalDto.lon;
    const lat = originalDto.lat;

    const lostPets = await this.lostPetsRepository.query(
      `
      SELECT *,
        ST_Y(location::geometry) AS lost_lat,
        ST_X(location::geometry) AS lost_lon,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) AS distance
      FROM lost_pets
      WHERE is_active = true
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY distance ASC;
      `,
      [lon, lat, this.searchRadiusInMeters],
    );

    if (!lostPets.length) {
      this.logger.log(
        `No active lost pets found within ${this.searchRadiusInMeters}m for found pet at (${lat}, ${lon})`,
      );
      await this.sendNoMatchNotification(originalDto);
      return;
    }

    this.logger.log(`Found ${lostPets.length} possible match(es) within ${this.searchRadiusInMeters}m`);

    for (const lost of lostPets) {
      const template = generatePetMatchEmailTemplate(
        originalDto,
        lost as LostPet & { lost_lat: number; lost_lon: number },
      );
      const options: EmailOptions = {
        to: lost.owner_email,
        cc: envs.GENERIC_NOTIFICATION_EMAIL || undefined,
        subject: `PetRadar - Posible coincidencia para ${lost.name}`,
        html: template,
      };

      const emailSent = await this.emailService.sendEmail(options);

      if (!emailSent) {
        this.logger.warn(`Notification email could not be sent for lost pet ${lost.id}`);
      }
    }
  }

  private async sendNoMatchNotification(found: FoundPetCreateDto): Promise<void> {
    const genericEmail = envs.GENERIC_NOTIFICATION_EMAIL || undefined;
    const options: EmailOptions = {
      to: found.finder_email,
      cc: genericEmail && genericEmail !== found.finder_email ? genericEmail : undefined,
      subject: 'PetRadar - Registro recibido sin coincidencias cercanas',
      html: generateFoundPetReceivedEmailTemplate(found),
    };

    const emailSent = await this.emailService.sendEmail(options);

    if (!emailSent) {
      this.logger.warn(`No-match notification email could not be sent for finder ${found.finder_email}`);
    }
  }
}
