import type { Status } from "./constants";

export interface Participant {
  id: string;
  created_at: string;
  updated_at: string | null;
  nom: string;
  prenom: string;
  whatsapp: string;
  telephone: string;
  ville: string;
  quartier: string;
  email: string | null;
  sexe: string | null;
  age: string | null;
  eglise: string | null;
  source: string | null;
  agape: boolean;
  status: Status;
  contacte: boolean;
  notes_admin: string | null;
}

export interface Admin {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  genre: string | null;
  telephone: string | null;
  role: string;
  must_change_password: boolean;
  created_at: string;
}

export interface ParticipantHistory {
  id: string;
  participant_id: string;
  admin_email: string | null;
  action: string;
  details: string | null;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  nouveaux: number;
  contactes: number;
  confirmes: number;
  presents: number;
  agape: number;
}
