export interface AppUser {
  id: number;
  image: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  gender: "Male" | "Female";
  profile?: string;
  created_by?: number | null;
  creator?: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  creator_name?: string; // optional UI helper
  created_at: string;
}
