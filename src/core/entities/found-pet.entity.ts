import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Point } from 'typeorm';

@Entity('found_pets')
export class FoundPet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  species!: string;

  @Column({ type: 'varchar', nullable: true })
  breed?: string | null;

  @Column()
  color!: string;

  @Column()
  size!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  photo_url?: string | null;

  @Column()
  finder_name!: string;

  @Column()
  finder_email!: string;

  @Column()
  finder_phone!: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location!: Point;

  @Column()
  address!: string;

  @Column({ type: 'timestamp' })
  found_date!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}

