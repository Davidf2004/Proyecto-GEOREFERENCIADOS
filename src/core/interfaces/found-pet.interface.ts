export interface FoundPetCreateDto {
  species: string;
  breed?: string | null;
  color: string;
  size: string;
  description: string;
  photo_url?: string | null;
  finder_name: string;
  finder_email: string;
  finder_phone: string;
  address: string;
  found_date: Date;
  lat: number;
  lon: number;
}

