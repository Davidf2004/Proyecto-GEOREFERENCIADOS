import { Body, Controller, Get, Post } from '@nestjs/common';
import { FoundPetsService } from './found-pets.service';
import type { FoundPetCreateDto } from 'src/core/interfaces/found-pet.interface';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService) {}

  @Get()
  async getFoundPets() {
    return this.foundPetsService.getFoundPets();
  }

  @Post()
  async createFoundPet(@Body() body: FoundPetCreateDto) {
    const pet = await this.foundPetsService.createFoundPet(body);
    return pet;
  }
}

