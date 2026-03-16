import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPet } from 'src/core/entities/lost-pet.entity';
import { LostPetsService } from './lost-pets.service';
import { LostPetsController } from './lost-pets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LostPet])],
  controllers: [LostPetsController],
  providers: [LostPetsService],
  exports: [LostPetsService, TypeOrmModule],
})
export class LostPetsModule {}

