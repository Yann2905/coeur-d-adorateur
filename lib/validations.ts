import { z } from "zod";
import { SEXE_OPTIONS, AGE_OPTIONS, SOURCE_OPTIONS, STATUSES } from "./constants";

const phoneRegex = /^\+?[0-9\s().-]{7,20}$/;

const sexeValues = SEXE_OPTIONS.map((o) => o.value) as [string, ...string[]];
const ageValues = AGE_OPTIONS.map((o) => o.value) as [string, ...string[]];
const sourceValues = SOURCE_OPTIONS.map((o) => o.value) as [string, ...string[]];

/** Schéma d'inscription publique. */
export const registrationSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(80, "Le nom est trop long."),
  prenom: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(80, "Le prénom est trop long."),
  whatsapp: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro WhatsApp invalide."),
  telephone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro de téléphone invalide."),
  ville: z.string().trim().min(2, "Ville requise.").max(80),
  quartier: z.string().trim().min(2, "Quartier requis.").max(80),
  email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .max(120)
    .optional()
    .or(z.literal("")),
  sexe: z.enum(sexeValues, { message: "Sélectionne ton sexe." }),
  age: z.enum(ageValues, { message: "Sélectionne ta tranche d'âge." }),
  eglise: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.enum(sourceValues).optional().or(z.literal("")),
  agape: z.boolean(),
  // Honeypot anti-spam : doit rester vide.
  website: z.string().max(0, "Spam détecté.").optional().or(z.literal("")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/** Schéma de mise à jour côté admin. */
export const updateParticipantSchema = z.object({
  id: z.string().uuid(),
  nom: z.string().trim().min(2).max(80),
  prenom: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().regex(phoneRegex, "Numéro WhatsApp invalide."),
  telephone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide."),
  ville: z.string().trim().min(2).max(80),
  quartier: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  sexe: z.string().optional().or(z.literal("")),
  age: z.string().optional().or(z.literal("")),
  eglise: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  agape: z.boolean(),
  status: z.enum(STATUSES),
  contacte: z.boolean(),
  notes_admin: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Adresse email invalide."),
  password: z.string().min(6, "Mot de passe trop court."),
});

/** Création d'un nouvel administrateur (par le super-admin). */
export const createAdminSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide.").max(120),
  prenom: z.string().trim().min(2, "Prénom requis.").max(80),
  nom: z.string().trim().min(2, "Nom requis.").max(80),
  genre: z.enum(["homme", "femme"], { message: "Sélectionne le genre." }),
  telephone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro de téléphone invalide."),
  role: z.enum(["admin", "super_admin"]).default("admin"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
