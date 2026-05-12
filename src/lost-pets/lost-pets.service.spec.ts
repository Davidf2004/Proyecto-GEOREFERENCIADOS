import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisCacheService } from '../cache/cache.service';
import { LostPet } from '../core/entities/lost-pet.entity';
import { LostPetsService } from './lost-pets.service';

describe('LostPetsService', () => {
  let service: LostPetsService;

  const lostPetsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    query: jest.fn(),
  };

  const cacheService = {
    getOrSet: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    cacheService.getOrSet.mockImplementation(async (_key: string, loader: () => Promise<unknown>) => loader());
    cacheService.del.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LostPetsService,
        {
          provide: getRepositoryToken(LostPet),
          useValue: lostPetsRepository,
        },
        {
          provide: RedisCacheService,
          useValue: cacheService,
        },
      ],
    }).compile();

    service = module.get<LostPetsService>(LostPetsService);
  });

  it('returns active lost pets using the cache wrapper', async () => {
    lostPetsRepository.query.mockResolvedValue([
      {
        id: 1,
        name: 'Firulais',
        species: 'perro',
        breed: 'labrador',
        color: 'negro',
        size: 'mediano',
        description: 'Collar rojo',
        photo_url: null,
        owner_name: 'Juan Perez',
        owner_email: 'juan@example.com',
        owner_phone: '5551234567',
        address: 'Parque central',
        lost_date: '2026-03-16T10:00:00.000Z',
        is_active: true,
        created_at: '2026-03-16T10:05:00.000Z',
        updated_at: '2026-03-16T10:06:00.000Z',
        lat: '19.4326',
        lon: '-99.1332',
      },
    ]);

    const result = await service.getActiveLostPets();

    expect(cacheService.getOrSet).toHaveBeenCalledWith('lost-pets:active:list', expect.any(Function));
    expect(lostPetsRepository.query).toHaveBeenCalledWith(expect.stringContaining('WHERE is_active = true'));
    expect(result).toEqual([
      {
        id: 1,
        name: 'Firulais',
        species: 'perro',
        breed: 'labrador',
        color: 'negro',
        size: 'mediano',
        description: 'Collar rojo',
        photo_url: null,
        owner_name: 'Juan Perez',
        owner_email: 'juan@example.com',
        owner_phone: '5551234567',
        address: 'Parque central',
        lost_date: new Date('2026-03-16T10:00:00.000Z'),
        is_active: true,
        created_at: new Date('2026-03-16T10:05:00.000Z'),
        updated_at: new Date('2026-03-16T10:06:00.000Z'),
        lat: 19.4326,
        lon: -99.1332,
      },
    ]);
  });

  it('invalidates the active list cache after creating a lost pet', async () => {
    const dto = {
      name: 'Firulais',
      species: 'perro',
      breed: 'labrador',
      color: 'negro',
      size: 'mediano',
      description: 'Collar rojo',
      photo_url: null,
      owner_name: 'Juan Perez',
      owner_email: 'juan@example.com',
      owner_phone: '5551234567',
      address: 'Parque central',
      lost_date: new Date('2026-03-16T10:00:00.000Z'),
      lat: 19.4326,
      lon: -99.1332,
    };

    const createdEntity = { id: 1 } as LostPet;

    lostPetsRepository.create.mockReturnValue(createdEntity);
    lostPetsRepository.save.mockResolvedValue(createdEntity);

    await service.createLostPet(dto);

    expect(lostPetsRepository.create).toHaveBeenCalled();
    expect(lostPetsRepository.save).toHaveBeenCalledWith(createdEntity);
    expect(cacheService.del).toHaveBeenCalledWith('lost-pets:active:list');
  });
});
