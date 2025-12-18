# 📋 Instructions Complètes - Call Tracking CRM

## 🎯 Vue d'ensemble du projet

Application CRM de suivi d'appels téléphoniques pour la prospection commerciale. Le système permet d'importer des prospects, de suivre les appels effectués, de gérer les rappels et de générer des rapports de performance.

**Stack technique :**
- **Backend** : Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend** : Next.js 16 (App Router) + TypeScript + Tailwind CSS + React 19
- **Authentification** : JWT (access + refresh tokens) avec cookies httpOnly
- **Base de données** : PostgreSQL avec Prisma ORM

---

## 🏗️ Architecture Backend

### Structure des dossiers

```
call-tracking-backend/
├── src/
│   ├── modules/          # Modules métier (auth, calls, reminders, etc.)
│   ├── middlewares/       # Middlewares Express (auth, CSRF, error handling)
│   ├── jobs/             # Jobs cron (notifications, cleanup)
│   ├── utils/            # Utilitaires (JWT, logger)
│   ├── config/           # Configuration (env, Prisma, Swagger)
│   ├── routes/           # Routes principales
│   ├── tests/            # Tests unitaires et e2e
│   └── server.ts         # Point d'entrée
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   └── migrations/       # Migrations Prisma
└── package.json
```

### Modèles de données (Prisma)

#### User
- `id`, `email`, `password`, `firstName`, `lastName`, `role` (USER/ADMIN)
- Relations : sessions, calls, reminders, notifications, settings, auditLogs

#### Call
- `id`, `userId`, `direction` (INBOUND/OUTBOUND), `type` (PROSPECTION/SUPPORT/FOLLOW_UP/OTHER)
- `status` : 11 statuts possibles (voir ci-dessous)
- `waveNumber` : Numéro de vague d'import (immuable, pour suivre les lots)
- `fromNumber`, `toNumber`, `durationSec`, `notes`
- `occurredAt` : Date réelle de l'appel
- `firstName`, `lastName`, `email` : Informations contact depuis l'import Excel
- `recallDate`, `recallTimeSlot` : Informations de rappel
- Relations : owner (User), statusHistory, reminders

**Statuts d'appel disponibles :**
- `A_CONTACTER` : Statut neutre par défaut à l'import (prospects jamais appelés)
- `NE_REPOND_PAS` : Ne répond pas
- `RAPPEL` : Rappel programmé
- `NE_TRAVAILLE_PAS_EN_SUISSE` : Ne travaille pas en Suisse
- `RENDEZ_VOUS_FIXE` : Rendez-vous fixé
- `RENDEZ_VOUS_REFIXE` : Rendez-vous refixé
- `MAUVAIS_NUMERO` : Mauvais numéro
- `PAS_INTERESSE` : Pas intéressé
- `FAIRE_MAIL` : Faire mail
- `DOUBLONS` : Doublons
- `DEJA_CLIENT` : Déjà client

#### Reminder
- `id`, `userId`, `callId` (optionnel), `title`, `description`
- `dueAt` : Date/heure du rappel
- `status` : PENDING/DONE/CANCELED
- Relations : user, call

#### Notification
- `id`, `userId`, `type` (REMINDER_DUE/CALL_ASSIGNED/DAILY_DIGEST/SYSTEM)
- `title`, `body`, `readAt`, `meta` (JSON)
- Relations : user

#### Setting
- `id`, `userId`, `key`, `value` (JSON)
- Système key-value pour les préférences utilisateur

#### AuditLog
- `id`, `userId`, `action`, `entity`, `entityId`
- `ipAddress`, `userAgent`, `meta` (JSON)
- Journalisation de toutes les actions critiques

#### Session
- `id`, `userId`, `refreshToken`, `expiresAt`, `revokedAt`
- Gestion des sessions JWT refresh tokens

### Routes API principales

#### Authentification (`/api/auth`)
- `POST /login` : Connexion (retourne accessToken + refreshToken en cookie)
- `POST /refresh` : Rafraîchir le token d'accès
- `POST /logout` : Déconnexion (révoque la session)

#### Utilisateurs (`/api/me`)
- `GET /me` : Récupérer les infos de l'utilisateur connecté
- `PATCH /me` : Mettre à jour le profil

#### Appels (`/api/calls`)
- `GET /calls` : Liste des appels (filtres : search, status, type, from, to)
- `GET /calls/:id` : Détails d'un appel (avec historique de statut)
- `POST /calls` : Créer un appel
- `PATCH /calls/:id` : Modifier un appel (gestion automatique des rappels)
- `DELETE /calls/:id` : Supprimer un appel (avec audit)

#### Import (`/api/calls/import`)
- `POST /import` : Importer des appels depuis CSV/Excel
  - Mapping automatique des colonnes (insensible à la casse/accents)
  - Validation : téléphone obligatoire (min 6 chiffres), email optionnel
  - Attribution automatique de `waveNumber` (vague immuable par lot)
  - Statut par défaut : `A_CONTACTER`
  - **Traitement par batch** : Traitement par lots de 100 appels pour optimiser les performances
  - **Timeout étendu** : Transaction avec timeout de 120 secondes pour gérer les gros fichiers (1000+ lignes)

#### Rappels (`/api/reminders`)
- `GET /reminders?date=today` : Liste des rappels (filtre par date)
- `POST /reminders` : Créer un rappel
- `PATCH /reminders/:id` : Modifier un rappel (mark done, reschedule)
- `DELETE /reminders/:id` : Supprimer un rappel

#### Notifications (`/api/me/notifications`)
- `GET /me/notifications?read=false` : Liste des notifications
- `PATCH /me/notifications/:id/read` : Marquer comme lu
- `POST /me/notifications/mark-all-read` : Tout marquer comme lu

#### Rapports (`/api/reports`)
- `GET /reports/kpi?range=month` : KPI (totalCalls, appointmentsThisMonth)
- `GET /reports/today` : Appels et rappels du jour
- `GET /reports/status-stats?range=month` : Statistiques par statut

#### Paramètres (`/api/me/settings`)
- `GET /me/settings` : Récupérer les paramètres utilisateur
- `PATCH /me/settings` : Mettre à jour les paramètres (key-value JSON)

### Middlewares

#### `authRequired`
- Vérifie le token JWT dans le header `Authorization: Bearer <token>`
- Ajoute `req.user` avec `id` et `role`
- Retourne 401 si token invalide/expiré

#### `csrfMiddleware`
- Protection CSRF en production uniquement
- Token dans cookie `csrf_token` + header `x-csrf-token`
- Désactivé en développement pour simplifier

#### `errorHandler`
- Gestion centralisée des erreurs
- Support spécial pour erreurs Prisma (P2022, etc.)
- Logging structuré avec Winston

#### `rateLimiter`
- Rate limiting sur toutes les routes

### Jobs Cron (`src/jobs/scheduler.ts`)

1. **Tous les jours à 00:05** : Génération des notifications pour les rappels du jour
2. **Tous les jours à 08:00** : Digest quotidien (résumé des appels et rappels)
3. **Toutes les heures** : Nettoyage des sessions expirées

### Logique métier importante

#### Système de vagues (`waveNumber`)
- Chaque import CSV/Excel crée une nouvelle vague pour l'utilisateur
- La vague est immuable : tous les appels d'un même import ont le même `waveNumber`
- Permet de suivre la performance par lot d'import
- Tri dans "Tous les appels" : vague ASC, puis nom/prénom alphabétique

#### Gestion des rappels automatique
- Lorsqu'un appel passe à `RAPPEL` ou `NE_REPOND_PAS` avec `recallDate` :
  - Création automatique d'un `Reminder`
  - Suppression des anciens rappels pour cet appel
- Si le statut change vers autre chose : suppression des rappels associés

#### Date d'appel (`occurredAt`)
- Par défaut : date de création
- Si statut passe de `A_CONTACTER` à autre chose : `occurredAt` = maintenant (appel effectué)
- Sinon : conserve la valeur existante ou celle fournie explicitement

#### "Tous les appels" vs "Appels du jour"
- **Tous les appels** : Uniquement les prospects avec statut `A_CONTACTER` (jamais appelés)
- **Appels du jour** : Appels effectués aujourd'hui (statut ≠ `A_CONTACTER`)

---

## 🎨 Architecture Frontend

### Structure des dossiers

```
call-tracking-frontend/
├── app/                   # Pages Next.js (App Router)
│   ├── dashboard/         # Page dashboard
│   ├── calls/             # Page "Tous les appels"
│   ├── today/             # Page "Appels du jour"
│   ├── reminders/         # Page "Rappels"
│   ├── settings/          # Page "Paramètres"
│   ├── notifications/     # Page "Notifications"
│   └── layout.tsx         # Layout racine
├── components/            # Composants React
│   ├── calls/            # Composants liés aux appels
│   ├── dashboard/        # Composants dashboard
│   ├── layout/           # AppShell, Header, Sidebar
│   ├── notifications/    # NotificationBell, NotificationDropdown
│   ├── settings/         # Composants paramètres
│   └── ui/               # Composants UI génériques
├── lib/                   # Utilitaires et hooks
│   ├── api.ts            # Client API typé
│   ├── auth.tsx          # Context et hooks d'authentification
│   ├── hooks.ts          # Hooks de data fetching
│   └── statusMapping.ts  # Mapping API ↔ UI pour les statuts
├── types/                 # Types TypeScript
│   └── api.ts            # Types API
└── package.json
```

### Pages principales

#### Dashboard (`app/dashboard/DasboardPage.tsx`)
- **KPI Cards** : Appels aujourd'hui, Rappels à faire, Rendez-vous aujourd'hui, Rendez-vous ce mois
- **Graphique** : Total des appels par mois (courbe)
- **Donut Chart** : Répartition par statut
- **Tableaux** : "Appels effectués aujourd'hui" et "Rappels du jour" (3 premiers)
- **Sélecteur de période** : Jour/Semaine/Mois

#### Tous les appels (`app/calls/CallPage.tsx`)
- **Filtres** : Recherche, statut, type (nouveau/rappel), plage de dates
- **Tableau** : Liste des prospects avec statut `A_CONTACTER`
- **Tri** : Vague ASC, puis nom/prénom alphabétique
- **Actions** : Voir détails, Modifier, Supprimer, Importer CSV/Excel
- **Import Modal** : Upload de fichier avec prévisualisation

#### Appels du jour (`app/today/TodayPage.tsx`)
- **Liste** : Appels effectués aujourd'hui (statut ≠ `A_CONTACTER`)
- **Filtres** : Recherche, statut (avec dropdown)
- **Chips closables** : Affichage des filtres actifs sous la barre de filtres avec possibilité de les retirer individuellement
- **Design** : Effet zebre (alternance de couleurs), pas de bordures entre les lignes
- **Affichage** : Nom, téléphone, statut (avec date de rappel dans le badge si applicable), heure
- **Pagination** : 9 appels par page avec style cohérent avec CallsTable
- **Actions** : Voir détails, Modifier

#### Rappels (`app/reminders/ReminderPage.tsx`)
- **Liste** : Rappels du jour avec statut PENDING
- **Priorisation** : Mise en avant des créneaux imminents (15 min avant à 30 min après)
- **Actions** : Marquer comme fait, Voir détails, Supprimer
- **Design** : Thème rouge pour l'urgence

#### Paramètres (`app/settings/SettingsPage.tsx`)
- **Sections** : Général, Notifications, Rappels, Affichage
- **Sauvegarde** : Bouton sticky "Enregistrer" en bas
- **Format** : Cartes éditables avec toggles, selects, inputs

### Composants clés

#### `AppShell` (`components/layout/AppShell.tsx`)
- Layout principal avec sidebar + header
- Gestion du thème clair/sombre (localStorage)
- Provider de contexte Theme
- Wrapper ToastProvider

#### `StatusBadge` (`components/calls/StatusBadge.tsx`)
- Badge coloré selon le statut
- Support thème clair/sombre
- Prop optionnelle `recallDate` (format "DD/MM") : affiche la date dans le badge pour les statuts "Ne répond pas" et "Rappel"
- Format : `{statut} (DD/MM)` quand `recallDate` est fourni

#### `CallsTable` (`components/calls/CallsTable.tsx`)
- Tableau réutilisable pour afficher les appels
- Colonnes : Nom & Prénom, Téléphone (avec bouton copier), Statut, Dernier appel, Actions

#### `DetailModal` / `EditModal` (`components/calls/`)
- Modales pour voir/modifier les détails d'un appel
- Formulaire complet avec tous les champs

#### `FilterBar` (`components/calls/FilterBar.tsx`)
- Barre de filtres réutilisable
- **Recherche** : Champ de recherche avec icône
- **Statuts** : Dropdown avec tous les statuts disponibles (11 statuts), sélection multiple possible
- **Date** : Dropdown avec options (Toutes les dates, Aujourd'hui, Cette semaine, Ce mois, Plage personnalisée)
- **Type** : Dropdown avec options (Tous, Nouveaux, Rappels)
- **Chips closables** : Section affichant les filtres actifs sous la barre de filtres
  - Chaque filtre actif apparaît comme un chip avec bouton X pour le retirer
  - Bouton "Tout réinitialiser" pour retirer tous les filtres
- **Fermeture automatique** : Les dropdowns se ferment automatiquement au clic extérieur

### Hooks personnalisés (`lib/hooks.ts`)

- `useCalls(filters?)` : Récupérer la liste des appels
- `useCall(id)` : Récupérer un appel spécifique
- `useReminders(date?)` : Récupérer les rappels
- `useTodayReminders()` : Rappels du jour
- `useNotifications(readFilter?)` : Notifications
- `useUnreadNotifications()` : Notifications non lues
- `useKPI(range)` : KPI du dashboard
- `useTodayReport()` : Rapport du jour (appels + rappels)
- `useStatusStats(range)` : Statistiques par statut
- `useSettings()` : Paramètres utilisateur

### Client API (`lib/api.ts`)

- Gestion automatique des tokens (localStorage)
- Refresh token automatique en cas de 401
- Gestion CSRF (token depuis cookie)
- Redirection vers `/login` si session expirée
- Types TypeScript complets

**Fonctions principales :**
- `authApi` : login, logout, refresh, me
- `callsApi` : getAll, getById, create, update, delete, import
- `remindersApi` : getAll, getToday, create, update, markDone, delete
- `notificationsApi` : getAll, getUnread, markAsRead, markAllAsRead
- `reportsApi` : getKPI, getToday, getStatusStats
- `settingsApi` : get, update

### Mapping des statuts (`lib/statusMapping.ts`)

- `mapApiStatusToUI(status)` : Convertir statut API → UI
- `mapUIStatusToApi(status)` : Convertir statut UI → API
- `ALL_UI_STATUSES` : Liste de tous les statuts UI
- `STATUSES_REQUIRING_RECALL` : Statuts nécessitant une date de rappel

### Authentification (`lib/auth.tsx`)

- `AuthProvider` : Context React pour l'authentification
- `useAuth()` : Hook pour accéder au contexte
- `useRequireAuth()` : Hook pour protéger les routes (redirection si non authentifié)
- Vérification automatique au chargement
- Refresh token automatique

### Design System

#### Palette de couleurs
- **Primaire** : Violet (`#dd7fff`, `#7264ff`, `#54d4ef`)
- **Fond clair** : `#F5F7FB`
- **Fond sombre** : `#0f172a`
- **Badges** : Couleurs différentes selon le statut (emerald, amber, blue, red, etc.)

#### Thème clair/sombre
- Gestion via localStorage (`theme` : "light" | "dark")
- Application automatique au chargement (script dans `layout.tsx`)
- Toggle dans le Header

#### Composants UI
- Cartes arrondies (`rounded-2xl`)
- Badges avec ring (`ring-1`)
- Boutons avec dégradés pour les actions primaires
- Ombres douces (`shadow-sm`, `shadow-lg`)

---

## 🔄 Flux métier principaux

### 1. Import de prospects

1. Utilisateur clique sur "Importer" dans "Tous les appels"
2. Upload d'un fichier CSV ou Excel
3. Backend parse le fichier :
   - Mapping automatique des colonnes (Nom, Prénom, Téléphone, Email)
   - Validation : téléphone obligatoire (min 6 chiffres)
   - Création d'une nouvelle vague (`waveNumber`)
4. Création des `Call` avec :
   - Statut : `A_CONTACTER`
   - `waveNumber` : Numéro de vague attribué
   - `fromNumber` : Numéro par défaut de l'utilisateur
   - `toNumber` : Téléphone du prospect
   - `occurredAt` : Date actuelle (sera mise à jour lors du premier appel)
5. Affichage dans "Tous les appels" trié par vague puis alphabétique

### 2. Classification d'un appel

1. Utilisateur ouvre "Tous les appels"
2. Clique sur l'icône 👁️ pour voir les détails
3. Clique sur "Modifier"
4. Change le statut (ex: "Rendez-vous fixé")
5. Si statut = "Rappel" ou "Ne répond pas" :
   - Saisie de la date de rappel (`recallDate`)
   - Optionnel : créneau horaire (`recallTimeSlot`)
   - Création automatique d'un `Reminder`
6. Sauvegarde :
   - Mise à jour du `Call`
   - Si passage de `A_CONTACTER` à autre chose : `occurredAt` = maintenant
   - Création d'une entrée dans `CallStatusHistory`
   - Création d'un `Reminder` si nécessaire
   - Audit log
7. L'appel disparaît de "Tous les appels" et apparaît dans "Appels du jour"

### 3. Gestion des rappels

1. Les rappels sont créés automatiquement lors du changement de statut
2. Affichage dans "Rappels" : liste des rappels du jour avec statut PENDING
3. Priorisation visuelle : créneaux imminents mis en avant (15 min avant à 30 min après)
4. Actions possibles :
   - Marquer comme fait → `status` = DONE
   - Voir détails → ouvre la modale avec les infos de l'appel
   - Supprimer → suppression du rappel
5. Jobs cron génèrent des notifications pour les rappels du jour

### 4. Dashboard et KPI

1. Chargement des données :
   - KPI : `GET /reports/kpi?range=month`
   - Rapport du jour : `GET /reports/today`
2. Calculs :
   - **Appels aujourd'hui** : Nombre d'appels avec `occurredAt` = aujourd'hui et statut ≠ `A_CONTACTER`
   - **Rappels à faire** : Nombre de rappels avec `dueAt` = aujourd'hui et `status` = PENDING
   - **Rendez-vous aujourd'hui** : Nombre d'appels avec statut `RENDEZ_VOUS_FIXE` et `occurredAt` = aujourd'hui
   - **Rendez-vous ce mois** : Nombre d'appels avec statut `RENDEZ_VOUS_FIXE` dans le mois
3. Affichage :
   - Cartes KPI avec valeurs et tendances
   - Graphique courbe (données historiques)
   - Donut chart (répartition par statut)
   - Tableaux "Appels du jour" et "Rappels du jour"

---

## 🔐 Sécurité

### Authentification
- JWT avec access token (15 min) et refresh token (7 jours)
- Refresh token stocké dans cookie httpOnly
- Access token dans localStorage (frontend)
- Rotation automatique des refresh tokens

### Protection CSRF
- Token CSRF dans cookie (non httpOnly pour lecture JS)
- Header `x-csrf-token` requis pour les mutations
- Désactivé en développement

### Autorisation
- Vérification d'appartenance : tous les appels/rappels/notifications sont filtrés par `userId`
- Admins peuvent voir tous les appels (logique dans `buildOwnershipWhere`)
- Audit logging pour toutes les actions critiques

### Rate Limiting
- Limitation du nombre de requêtes par IP
- Protection contre les attaques par force brute

---

## 🧪 Tests

### Backend
- Tests unitaires : `vitest` dans chaque module (`*.test.ts`)
- Tests e2e : `src/tests/e2e/*.e2e.test.ts`
- Configuration : `vitest.config.ts` et `vitest.config.e2e.ts`

### Frontend
- Pas de tests configurés actuellement
- Recommandation : Ajouter Vitest + React Testing Library

---

## 📝 Variables d'environnement

### Backend (`.env`)
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/call_tracking?schema=public
DATABASE_URL_TEST=postgresql://user:password@localhost:5432/call_tracking_test?schema=public
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_DOMAIN=localhost
CSRF_SECRET=your-csrf-secret-change-in-production
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🚀 Démarrage

### Backend
```bash
cd call-tracking-backend
npm install
cp env.sample .env
# Éditer .env avec vos valeurs
npx prisma migrate dev
npm run prisma:generate
npm run dev  # Port 4000
```

### Frontend
```bash
cd call-tracking-frontend
npm install
npm run dev  # Port 3000
```

### Base de données
- PostgreSQL requis
- Migrations Prisma appliquées automatiquement avec `prisma migrate dev`
- Seed disponible : `npm run prisma:seed`

---

## 📚 Documentation API

- Swagger UI disponible sur : `http://localhost:4000/api/docs`
- Spécification OpenAPI : `http://localhost:4000/api/docs.json`
- Documentation YAML dans `src/docs/`

---

## 🐛 Dépannage courant

### Erreur 500 sur `/api/calls` ou `/api/reports/today`
- Vérifier que les migrations Prisma sont appliquées
- Vérifier que le client Prisma est régénéré (`npm run prisma:generate`)
- Redémarrer le serveur backend

### Erreur P2022 (colonne manquante)
- Appliquer les migrations manuellement si nécessaire
- Voir `MIGRATION_FIX.md` pour les instructions détaillées

### Token expiré / 401
- Le frontend devrait automatiquement rafraîchir le token
- Si problème persistant : vérifier les cookies (refresh_token)
- Vérifier que `COOKIE_DOMAIN` correspond au domaine du frontend

### Import CSV/Excel échoue
- Vérifier le format : première ligne = en-têtes
- Téléphone obligatoire (min 6 chiffres)
- Taille max : 10 Mo
- **Timeout de transaction** : Pour les fichiers très volumineux (1000+ lignes), le système traite par batch de 100 appels avec un timeout de 120 secondes
- Les lignes sans téléphone seront automatiquement ignorées avec un message d'erreur dans le résumé

---

## 🎯 Points d'attention pour développement

### Backend
- Toujours utiliser `authRequired` pour les routes protégées
- Vérifier l'appartenance avec `buildOwnershipWhere` (sauf admins)
- Créer des entrées `AuditLog` pour les actions critiques
- Gérer les rappels automatiquement lors des changements de statut
- Utiliser des transactions Prisma pour les opérations complexes
- **Transactions longues** : Pour les imports volumineux, augmenter le timeout (`maxWait: 60000, timeout: 120000`) et traiter par batch
- **Performance** : Traiter les gros volumes par lots de 100 éléments pour éviter les timeouts et surcharger la base de données

### Frontend
- Utiliser les hooks personnalisés (`useCalls`, `useKPI`, etc.) plutôt que d'appeler directement l'API
- Toujours gérer les états de chargement et d'erreur
- Utiliser `useRequireAuth` pour protéger les pages
- Respecter le mapping des statuts (`mapApiStatusToUI` / `mapUIStatusToApi`)
- Gérer le thème clair/sombre via `useTheme()`
- **Filtres** : Toujours afficher les filtres actifs en chips closables sous la barre de filtres
- **Dropdowns** : Implémenter la fermeture automatique au clic extérieur avec `useRef` et `useEffect`
- **Curseur** : Ajouter `cursor-pointer` sur tous les éléments cliquables (boutons, lignes de tableau, etc.)

### Base de données
- Ne jamais modifier directement les migrations appliquées
- Créer une nouvelle migration pour les changements de schéma
- Tester les migrations sur une base de test avant production
- Le `waveNumber` est immuable : ne jamais le modifier après création

---

## 📖 Conventions de code

### Backend
- TypeScript strict mode
- Express avec types
- Prisma pour toutes les requêtes DB
- Winston pour le logging
- Erreurs structurées avec `ApiError`

### Frontend
- React 19 avec hooks
- TypeScript strict
- Tailwind CSS pour le styling
- Composants fonctionnels uniquement
- Props typées avec TypeScript

### Nommage
- Composants : PascalCase (`CallPage`, `StatusBadge`)
- Fichiers : PascalCase pour composants, camelCase pour utilitaires
- Variables : camelCase
- Constantes : UPPER_SNAKE_CASE
- Types : PascalCase avec préfixe si nécessaire (`CallStatus`, `UICallStatus`)

---

## 🔄 Workflow Git recommandé

1. Créer une branche pour chaque feature
2. Commits atomiques avec messages clairs
3. Tests avant merge
4. Code review si possible
5. Merge dans `main` après validation

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation dans les fichiers `.md`
2. Consulter les logs backend (Winston)
3. Vérifier la console navigateur (F12)
4. Consulter les tests pour comprendre le comportement attendu

---

---

## 🔄 Modifications récentes (Décembre 2024)

### Frontend - Améliorations UX

#### FilterBar (`components/calls/FilterBar.tsx`)
- ✅ Ajout de chips closables pour afficher les filtres actifs
- ✅ Conversion des boutons Date et Type en dropdowns (comme Statut)
- ✅ Fermeture automatique des dropdowns au clic extérieur
- ✅ Bouton "Tout réinitialiser" dans la section des chips

#### TodayPage (`app/today/TodayPage.tsx`)
- ✅ Design amélioré : effet zebre (alternance de couleurs), suppression des bordures
- ✅ Chips closables pour les filtres actifs (recherche, statuts)
- ✅ Pagination améliorée avec style cohérent avec CallsTable
- ✅ Curseur pointer sur tous les éléments cliquables

#### StatusBadge (`components/calls/StatusBadge.tsx`)
- ✅ Ajout de la prop `recallDate` pour afficher la date dans le badge
- ✅ Format : `{statut} (DD/MM)` pour les statuts "Ne répond pas" et "Rappel"

### Backend - Optimisation import

#### Import CSV/Excel (`src/modules/calls/import.ts`)
- ✅ Augmentation du timeout de transaction : 120 secondes (au lieu de 5 secondes par défaut)
- ✅ Traitement par batch : lots de 100 appels au lieu de tout en parallèle
- ✅ Gestion des fichiers volumineux (1000+ lignes) sans erreur de timeout

---

**Dernière mise à jour** : Décembre 2024

