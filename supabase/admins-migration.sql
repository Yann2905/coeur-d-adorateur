-- ═══════════════════════════════════════════════════════════════════
--  MIGRATION — Gestion des administrateurs
--  À exécuter dans Supabase → SQL Editor SI tu as déjà lancé schema.sql
--  avant l'ajout de la section "Administrateurs".
--  (Sans risque : les colonnes ne sont ajoutées que si elles manquent.)
-- ═══════════════════════════════════════════════════════════════════

alter table public.admins add column if not exists nom        text;
alter table public.admins add column if not exists prenom     text;
alter table public.admins add column if not exists genre      text;
alter table public.admins add column if not exists telephone  text;
alter table public.admins add column if not exists must_change_password boolean not null default false;

-- (Optionnel) Promouvoir ton compte en super_admin pour pouvoir gérer les admins.
-- Remplace l'email par le tien :
-- update public.admins set role = 'super_admin' where email = 'ton-email@exemple.com';
