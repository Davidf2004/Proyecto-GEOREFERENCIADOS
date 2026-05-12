import { Body, Controller, Get, Post } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import type { LostPetCreateDto } from 'src/core/interfaces/lost-pet.interface';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Get()
  async getActiveLostPets() {
    return this.lostPetsService.getActiveLostPets();
  }

  @Post()
  async createLostPet(@Body() body: LostPetCreateDto) {
    const pet = await this.lostPetsService.createLostPet(body);
    return pet;
  }
}

