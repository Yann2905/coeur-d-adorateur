-- ═══════════════════════════════════════════════════════════════════
--  Cœur d'Adorateur — Schéma de base de données Supabase (PostgreSQL)
--  À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════

-- Extensions ---------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()

-- ───────────────────────────────────────────────────────────────────
--  ENUM statut participant
-- ───────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'participant_status') then
    create type participant_status as enum (
      'nouveau', 'contacte', 'confirme', 'present', 'absent'
    );
  end if;
end$$;

-- ───────────────────────────────────────────────────────────────────
--  TABLE : participants
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.participants (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz,

  nom          text not null,
  prenom       text not null,

  whatsapp     text not null,
  telephone    text not null,

  ville        text not null,
  quartier     text not null,

  email        text,

  sexe         text,
  age          text,

  eglise       text,
  source       text,

  agape        boolean not null default false,

  status       participant_status not null default 'nouveau',
  contacte     boolean not null default false,

  notes_admin  text
);

-- Index de recherche / filtre
create index if not exists idx_participants_created_at on public.participants (created_at desc);
create index if not exists idx_participants_status     on public.participants (status);
create index if not exists idx_participants_ville      on public.participants (lower(ville));
create index if not exists idx_participants_agape      on public.participants (agape);
create index if not exists idx_participants_nom        on public.participants (lower(nom));
create index if not exists idx_participants_prenom     on public.participants (lower(prenom));

-- Anti-doublon : un même numéro WhatsApp ne peut s'inscrire qu'une fois.
create unique index if not exists uidx_participants_whatsapp
  on public.participants (regexp_replace(whatsapp, '\D', '', 'g'));

-- ───────────────────────────────────────────────────────────────────
--  TABLE : admins
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  nom         text,
  prenom      text,
  genre       text,
  telephone   text,
  role        text not null default 'admin',
  must_change_password boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Ajout des colonnes si la table existe déjà (mise à jour d'un schéma antérieur).
alter table public.admins add column if not exists nom        text;
alter table public.admins add column if not exists prenom     text;
alter table public.admins add column if not exists genre      text;
alter table public.admins add column if not exists telephone  text;
alter table public.admins add column if not exists must_change_password boolean not null default false;

-- ───────────────────────────────────────────────────────────────────
--  TABLE : participant_history (bonus — historique des modifications)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.participant_history (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references public.participants(id) on delete cascade,
  admin_email     text,
  action          text not null,
  details         text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_history_participant on public.participant_history (participant_id, created_at desc);

-- ───────────────────────────────────────────────────────────────────
--  Fonction : mise à jour automatique de updated_at
-- ───────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_participants_updated_at on public.participants;
create trigger trg_participants_updated_at
  before update on public.participants
  for each row execute function public.set_updated_at();

-- ───────────────────────────────────────────────────────────────────
--  Fonction utilitaire : l'utilisateur courant est-il admin ?
-- ───────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ═══════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════
alter table public.participants        enable row level security;
alter table public.admins              enable row level security;
alter table public.participant_history enable row level security;

-- ── participants ──────────────────────────────────────────────────
-- INSERT public (formulaire d'inscription) : autorisé à tous (anon + auth).
drop policy if exists "participants_insert_public" on public.participants;
create policy "participants_insert_public"
  on public.participants for insert
  to anon, authenticated
  with check (true);

-- SELECT réservé aux admins.
drop policy if exists "participants_select_admin" on public.participants;
create policy "participants_select_admin"
  on public.participants for select
  to authenticated
  using (public.is_admin());

-- UPDATE réservé aux admins.
drop policy if exists "participants_update_admin" on public.participants;
create policy "participants_update_admin"
  on public.participants for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE réservé aux admins.
drop policy if exists "participants_delete_admin" on public.participants;
create policy "participants_delete_admin"
  on public.participants for delete
  to authenticated
  using (public.is_admin());

-- ── admins ────────────────────────────────────────────────────────
-- Un admin peut lire la liste des admins.
drop policy if exists "admins_select_admin" on public.admins;
create policy "admins_select_admin"
  on public.admins for select
  to authenticated
  using (public.is_admin());

-- ── participant_history ───────────────────────────────────────────
drop policy if exists "history_select_admin" on public.participant_history;
create policy "history_select_admin"
  on public.participant_history for select
  to authenticated
  using (public.is_admin());

drop policy if exists "history_insert_admin" on public.participant_history;
create policy "history_insert_admin"
  on public.participant_history for insert
  to authenticated
  with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  VUE / RPC : compteur public d'inscrits (bonus)
--  Expose UNIQUEMENT le nombre total, sans données personnelles.
-- ═══════════════════════════════════════════════════════════════════
create or replace function public.public_participant_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.participants;
$$;

grant execute on function public.public_participant_count() to anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════
--  ADMINISTRATEURS INITIAUX
--  ⚠️ Remplace l'email ci-dessous par le tien, puis crée le compte
--     correspondant dans Supabase → Authentication → Users.
-- ═══════════════════════════════════════════════════════════════════
insert into public.admins (email, role)
values ('ton-email-admin@exemple.com', 'super_admin')
on conflict (email) do nothing;
