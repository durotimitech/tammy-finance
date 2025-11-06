export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  user_id: string;
  votes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureRequestDto {
  title: string;
  description: string;
}
