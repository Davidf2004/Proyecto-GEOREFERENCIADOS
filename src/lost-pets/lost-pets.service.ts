import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostPet } from 'src/core/entities/lost-pet.entity';
import { LostPetCreateDto } from 'src/core/interfaces/lost-pet.interface';
import { RedisCacheService } from 'src/cache/cache.service';
import { LostPetListItem } from 'src/core/interfaces/pet-list-item.interface';

const ACTIVE_LOST_PETS_CACHE_KEY = 'lost-pets:active:list';

type LostPetListRow = Omit<LostPetListItem, 'lat' | 'lon' | 'lost_date' | 'created_at' | 'updated_at'> & {
  lat: number | string;
  lon: number | string;
  lost_date: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
};

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetsRepository: Repository<LostPet>,
    private readonly cacheService: RedisCacheService,
  ) {}

  async createLostPet(data: LostPetCreateDto): Promise<LostPet> {
    const lostPet = this.lostPetsRepository.create({
      name: data.name,
      species: data.species,
      breed: data.breed,
      color: data.color,
      size: data.size,
      description: data.description,
      photo_url: data.photo_url,
      owner_name: data.owner_name,
      owner_email: data.owner_email,
      owner_phone: data.owner_phone,
      address: data.address,
      lost_date: data.lost_date ?? new Date(),
      location: {
        type: 'Point',
        coordinates: [data.lon, data.lat],
      } as any,
    });

    const savedLostPet = await this.lostPetsRepository.save(lostPet);
    await this.cacheService.del(ACTIVE_LOST_PETS_CACHE_KEY);

    return savedLostPet;
  }

  async getActiveLostPets(): Promise<LostPetListItem[]> {
    return this.cacheService.getOrSet(ACTIVE_LOST_PETS_CACHE_KEY, async () => {
      const lostPets = await this.lostPetsRepository.query(`
        SELECT
          id,
          name,
          species,
          breed,
          color,
          size,
          description,
          photo_url,
          owner_name,
          owner_email,
          owner_phone,
          address,
          lost_date,
          is_active,
          created_at,
          updated_at,
          ST_Y(location::geometry) AS lat,
          ST_X(location::geometry) AS lon
        FROM lost_pets
        WHERE is_active = true
        ORDER BY lost_date DESC, id DESC;
      `);

      return lostPets.map((lostPet: LostPetListRow) => this.mapLostPetListItem(lostPet));
    });
  }

  private mapLostPetListItem(lostPet: LostPetListRow): LostPetListItem {
    return {
      ...lostPet,
      photo_url: lostPet.photo_url ?? null,
      lat: Number(lostPet.lat),
      lon: Number(lostPet.lon),
      lost_date: new Date(lostPet.lost_date),
      created_at: new Date(lostPet.created_at),
      updated_at: new Date(lostPet.updated_at),
    };
  }
}

