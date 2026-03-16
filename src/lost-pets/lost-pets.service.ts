import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostPet } from 'src/core/entities/lost-pet.entity';
import { LostPetCreateDto } from 'src/core/interfaces/lost-pet.interface';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetsRepository: Repository<LostPet>,
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

    return this.lostPetsRepository.save(lostPet);
  }
}

