export interface LostPetListItem {
  id: number;
  name: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  description: string;
  photo_url?: string | null;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  address: string;
  lost_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  lat: number;
  lon: number;
}

export interface FoundPetListItem {
  id: number;
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
  created_at: Date;
  updated_at: Date;
  lat: number;
  lon: number;
}
