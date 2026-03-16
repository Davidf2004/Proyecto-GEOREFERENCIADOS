import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Point } from 'typeorm';

@Entity('lost_pets')
export class LostPet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  species!: string;

  @Column()
  breed!: string;

  @Column()
  color!: string;

  @Column()
  size!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  photo_url?: string | null;

  @Column()
  owner_name!: string;

  @Column()
  owner_email!: string;

  @Column()
  owner_phone!: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location!: Point;

  @Column()
  address!: string;

  @Column({ type: 'timestamp' })
  lost_date!: Date;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}

