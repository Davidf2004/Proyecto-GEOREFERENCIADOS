import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { RedisCacheService } from '../cache/cache.service';
import { FoundPet } from '../core/entities/found-pet.entity';
import { LostPet } from '../core/entities/lost-pet.entity';
import { EmailService } from '../email/email.service';
import { FoundPetsService } from './found-pets.service';

describe('FoundPetsService', () => {
  let service: FoundPetsService;

  const foundPetsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    query: jest.fn(),
  };

  const lostPetsRepository = {
    query: jest.fn(),
  };

  const emailService = {
    sendEmail: jest.fn(),
  };

  const cacheService = {
    getOrSet: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    cacheService.getOrSet.mockImplementation(async (_key: string, loader: () => Promise<unknown>) => loader());
    cacheService.del.mockResolvedValue(undefined);
    emailService.sendEmail.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoundPetsService,
        {
          provide: getRepositoryToken(FoundPet),
          useValue: foundPetsRepository,
        },
        {
          provide: getRepositoryToken(LostPet),
          useValue: lostPetsRepository,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: RedisCacheService,
          useValue: cacheService,
        },
      ],
    }).compile();

    service = module.get<FoundPetsService>(FoundPetsService);
  });

  it('returns found pets using the cache wrapper', async () => {
    foundPetsRepository.query.mockResolvedValue([
      {
        id: 4,
        species: 'perro',
        breed: null,
        color: 'negro',
        size: 'mediano',
        description: 'Encontrado en el parque',
        photo_url: null,
        finder_name: 'Maria',
        finder_email: 'maria@example.com',
        finder_phone: '5559876543',
        address: 'Parque central',
        found_date: '2026-03-16T12:30:00.000Z',
        created_at: '2026-03-16T12:31:00.000Z',
        updated_at: '2026-03-16T12:32:00.000Z',
        lat: '19.4327',
        lon: '-99.1331',
      },
    ]);

    const result = await service.getFoundPets();

    expect(cacheService.getOrSet).toHaveBeenCalledWith('found-pets:list', expect.any(Function));
    expect(foundPetsRepository.query).toHaveBeenCalledWith(expect.stringContaining('FROM found_pets'));
    expect(result).toEqual([
      {
        id: 4,
        species: 'perro',
        breed: null,
        color: 'negro',
        size: 'mediano',
        description: 'Encontrado en el parque',
        photo_url: null,
        finder_name: 'Maria',
        finder_email: 'maria@example.com',
        finder_phone: '5559876543',
        address: 'Parque central',
        found_date: new Date('2026-03-16T12:30:00.000Z'),
        created_at: new Date('2026-03-16T12:31:00.000Z'),
        updated_at: new Date('2026-03-16T12:32:00.000Z'),
        lat: 19.4327,
        lon: -99.1331,
      },
    ]);
  });

  it('invalidates cache and keeps the 500m geography query when creating a found pet', async () => {
    const dto = {
      species: 'perro',
      breed: 'labrador',
      color: 'negro',
      size: 'mediano',
      description: 'Parece asustado pero sano',
      photo_url: null,
      finder_name: 'Maria',
      finder_email: 'maria@example.com',
      finder_phone: '5559876543',
      address: 'Parque central, zona norte',
      found_date: new Date('2026-03-16T12:30:00.000Z'),
      lat: 19.4327,
      lon: -99.1331,
    };

    const createdEntity = { id: 9 } as FoundPet;

    foundPetsRepository.create.mockReturnValue(createdEntity);
    foundPetsRepository.save.mockResolvedValue(createdEntity);
    lostPetsRepository.query.mockResolvedValue([
      {
        id: 2,
        name: 'Firulais',
        owner_email: 'juan@example.com',
        lost_lat: 19.4326,
        lost_lon: -99.1332,
      },
    ]);

    await service.createFoundPet(dto);

    expect(cacheService.del).toHaveBeenCalledWith('found-pets:list');
    expect(lostPetsRepository.query).toHaveBeenCalledTimes(1);

    const [sql, params] = lostPetsRepository.query.mock.calls[0];

    expect(sql).toContain('ST_DWithin');
    expect(sql).toContain('location::geography');
    expect(sql).toContain('ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography');
    expect(params).toEqual([dto.lon, dto.lat, 500]);
    expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('rejects incomplete create payloads before saving or notifying', async () => {
    await expect(
      service.createFoundPet({
        species: 'dog',
      } as any),
    ).rejects.toThrow(BadRequestException);

    expect(foundPetsRepository.create).not.toHaveBeenCalled();
    expect(foundPetsRepository.save).not.toHaveBeenCalled();
    expect(cacheService.del).not.toHaveBeenCalled();
    expect(lostPetsRepository.query).not.toHaveBeenCalled();
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });
});
