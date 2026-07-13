# ❤️ Cœur d'Adorateur

Plateforme professionnelle d'inscription au **programme d'adoration du 31 Octobre 2026**.

Elle permet :

- **L'inscription anticipée** des participants (page publique `/inscription`) ;
- **L'estimation** du nombre total de personnes attendues ;
- **La préparation de l'agapé** (repas de communion après le programme) ;
- **La gestion complète** des participants par l'équipe organisatrice (back-office `/admin`).

Conçue pour tenir **plusieurs centaines à plusieurs milliers** d'inscrits.

---

## 🧱 Stack technique

| Domaine        | Technologie                                   |
| -------------- | --------------------------------------------- |
| Frontend       | Next.js 15 (App Router), TypeScript, React 19 |
| UI             | Tailwind CSS, composants shadcn/ui, lucide    |
| Backend        | Server Actions + API Routes Next.js           |
| Base de données| Supabase (PostgreSQL + RLS)                   |
| Auth           | Supabase Auth (email / mot de passe)          |
| Emails         | Brevo (API transactionnelle)                  |
| PWA            | Manifest + Service Worker + icônes            |
| Déploiement    | Vercel (+ Cron Jobs)                          |

---

## 🎨 Identité visuelle

Thème **améthyste & or** — un violet royal spirituel rehaussé d'un or précieux,
avec **mode sombre** complet pour l'espace admin. Police d'affichage : *Playfair
Display* ; corps de texte : *Inter*.

---

## 🚀 Mise en route (local)

### 1. Installer les dépendances

```bash
npm install
```

### 2. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Ouvre **SQL Editor** → **New query**, colle le contenu de
   [`supabase/schema.sql`](supabase/schema.sql) et exécute-le.
   Cela crée les tables `participants`, `admins`, `participant_history`,
   les index, les politiques **RLS** et les fonctions utilitaires.
3. Dans **Project Settings → API**, récupère :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secret)

### 3. Créer un administrateur

1. **Authentication → Users → Add user** : crée un compte (email + mot de passe).
2. Dans **SQL Editor**, ajoute cet email à la table `admins` :

   ```sql
   insert into public.admins (email, role)
   values ('ton-email-admin@exemple.com', 'super_admin')
   on conflict (email) do nothing;
   ```

   > Seuls les emails présents dans `admins` peuvent accéder à `/admin`.

### 4. Configurer Brevo (emails)

1. Crée un compte sur [brevo.com](https://www.brevo.com).
2. **SMTP & API → API Keys** → génère une clé → `BREVO_API_KEY`.
3. **Senders** → ajoute et **vérifie** un expéditeur → `BREVO_SENDER_EMAIL`.

### 5. Variables d'environnement

Copie `.env.example` en `.env.local` et remplis les valeurs :

```bash
cp .env.example .env.local
```

| Variable                        | Rôle                                              |
| ------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL du projet Supabase                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon                                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clé service role (serveur uniquement)             |
| `BREVO_API_KEY`                 | Clé API Brevo                                     |
| `BREVO_SENDER_EMAIL`            | Expéditeur vérifié des emails                     |
| `BREVO_SENDER_NAME`             | Nom affiché de l'expéditeur                       |
| `ADMIN_EMAILS`                  | Emails notifiés (séparés par des virgules)        |
| `NEXT_PUBLIC_APP_URL`           | URL publique de l'app (sans slash final)          |
| `CRON_SECRET`                   | Secret protégeant `/api/cron/ping`                |

### 6. Lancer

```bash
npm run dev
```

- Accueil public : http://localhost:3000
- Inscription : http://localhost:3000/inscription
- Admin : http://localhost:3000/admin

---

## 📁 Structure du projet

```
app/
  page.tsx                 Landing public (compteur + compte à rebours)
  inscription/             Formulaire d'inscription public
  confirmation/            Page de remerciement spirituelle
  offline/                 Page hors-ligne (PWA)
  manifest.ts              Manifest PWA
  icon-image/              Icônes PNG générées à la volée
  actions.ts               Server Action d'inscription
  admin/
    login/                 Connexion administrateur
    actions.ts             Server Actions admin (statut, note, édition…)
    (app)/                 Espace protégé (layout + auth)
      page.tsx             Tableau de bord (statistiques)
      nouveaux/            Derniers inscrits + actions Appeler / WhatsApp
      participants/        Liste, recherche, filtres, pagination, export
      participant/[id]/    Fiche détaillée + édition + historique
      partager/            QR code + lien d'inscription
  api/
    inscription/           Endpoint JSON d'inscription
    cron/ping/             Ping quotidien anti-pause Supabase
    count/                 Compteur public d'inscrits
components/                UI (shadcn) + composants métier
lib/                       Supabase, validations (Zod), Brevo, données
supabase/schema.sql        Schéma SQL complet (tables, RLS, policies)
public/                    Service Worker, icône SVG
```

---

## 🔒 Sécurité

- **Validation serveur** systématique via **Zod** (`lib/validations.ts`).
- **RLS Supabase** : lecture/écriture des participants réservée aux admins ;
  insertion publique contrôlée pour le formulaire.
- **Middleware Next.js** protège toutes les routes `/admin`.
- **Anti-spam** : honeypot invisible sur le formulaire.
- **Anti-doublon** : index unique sur le numéro WhatsApp + vérification serveur.
- La clé `service_role` n'est **jamais** exposée au navigateur.

---

## ☁️ Déploiement sur Vercel

1. Pousse le code sur GitHub, puis **Import Project** sur
   [vercel.com](https://vercel.com).
2. **Settings → Environment Variables** : ajoute toutes les variables de
   `.env.example` (Production + Preview).
3. Déploie. Le fichier [`vercel.json`](vercel.json) configure automatiquement le
   **Cron Job** quotidien (`/api/cron/ping` à 06:00 UTC).
   > Vercel envoie automatiquement `Authorization: Bearer $CRON_SECRET`.
4. Renseigne `NEXT_PUBLIC_APP_URL` avec ton domaine final, puis redéploie.
5. (Option) **Settings → Domains** : ajoute ton domaine personnalisé.

### Maintenir Supabase actif

Le plan gratuit Supabase se met en pause après ~7 jours d'inactivité.
La route `/api/cron/ping` effectue une petite requête chaque jour pour l'éviter.
Tu peux la tester manuellement :

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://TON-APP.vercel.app/api/cron/ping
```

---

## 📱 PWA (application installable)

- **Manifest** : `/manifest.webmanifest` (mode `standalone`, thème, raccourcis).
- **Icônes** : générées dynamiquement (`/icon-image?size=…`) + `public/icon.svg`.
- **Service Worker** : `public/sw.js` (cache + page hors-ligne), enregistré en
  production.

Sur **Android (Chrome)** : menu → *Ajouter à l'écran d'accueil*.
Sur **iOS (Safari)** : Partager → *Sur l'écran d'accueil*.

> Le Service Worker ne s'active qu'en **production** (`npm run build && npm start`
> ou sur Vercel).

---

## ✨ Fonctionnalités bonus incluses

- 📊 Export **Excel** de tous les inscrits (`.xlsx`).
- 🔳 **QR code** vers le formulaire d'inscription (page *Partager*).
- 🔢 **Compteur public** d'inscrits + **compte à rebours** vers le 1er Nov. 2026.
- 🌙 **Mode sombre** dans l'espace admin.
- 📄 **Pagination** et filtres avancés (statut, ville, agapé, recherche).
- 🕓 **Historique** des modifications par participant.

---

## 👥 Gestion des administrateurs (page « Administrateurs »)

Un **super-administrateur** peut ajouter d'autres admins directement depuis
`/admin/admins` (le menu n'apparaît que pour les super-admins) :

1. Il saisit **email, prénom, nom, genre, numéro** et le rôle.
2. Le compte **Supabase Auth** est créé automatiquement avec un **mot de passe
   généré**.
3. Le nouvel admin reçoit un **email Brevo** contenant son **identifiant + mot de
   passe** et un bouton de connexion. Le mot de passe s'affiche aussi **une fois**
   dans l'interface (secours si l'email n'est pas envoyé).
4. À sa **première connexion**, il est **obligatoirement redirigé** vers une page
   de changement de mot de passe (champs *nouveau mot de passe* + *confirmation*,
   avec bouton œil pour afficher/masquer). Il ne peut pas accéder au reste de la
   plateforme tant qu'il n'a pas défini son propre mot de passe (min. 8
   caractères).

> Toutes les validations et confirmations de la plateforme utilisent
> **SweetAlert2** (alertes et boîtes de confirmation élégantes, compatibles mode
> sombre).

> ⚙️ **Pré-requis** : ton propre compte doit avoir le rôle `super_admin`.
> Si tu as créé la base avant cette fonctionnalité, exécute
> [`supabase/admins-migration.sql`](supabase/admins-migration.sql) puis :
>
> ```sql
> update public.admins set role = 'super_admin' where email = 'ton-email@exemple.com';
> ```

---

## 🧾 Statuts d'un participant

`Nouveau` → `Contacté` → `Confirmé` → `Présent` / `Absent`

---

## 📜 Scripts

```bash
npm run dev        # développement
npm run build      # build de production
npm run start      # serveur de production
npm run typecheck  # vérification TypeScript
npm run lint       # ESLint
```

---

*« Que tout ce qui respire loue l'Éternel ! » — Psaume 150.6*
