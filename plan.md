## Vue d’ensemble du produit actuel (front mock)
- App Next.js (App Router), TypeScript, Tailwind, thème clair/sombre via `AppShell` + `useTheme`, layout Sidebar + Header sticky.
- Pages clés : `dashboard` (KPI + graphiques mockés), `calls` (table filtrable, modales détail/édition/import mock), `today` (appels effectués aujourd’hui), `reminders` (rappels du jour avec priorisation), `settings` (nouvelle page complète), bouton notifications global dans la top bar.
- Données 100% mock côté front, aucune persistance ; navigation via liens statiques.
- Palette dominante violet (#dd7fff / #7264ff) + dégradés, cartes arrondies, badges et toggles Tailwind.

## Workflow et parcours utilisateur
- Connexion (mock) → accès au dashboard via `AppShell` (sidebar + header).
- Sidebar : navigation vers Overview, Tous les appels, Appels du jour, Rappels, Paramètres. Header : cloche notifications (dropdown interactif), switch thème, avatar.
- Dashboard : cartes KPI (`StatCard`), courbe, donut, tableaux “Appels du jour” et “Rappels du jour”.
- Tous les appels : filtre multi-critères (`FilterBar`), table `CallsTable`, modale détail/édition, import mock CSV.
- Appels du jour : liste des appels réellement effectués (mock), focus exécution, modale détail.
- Rappels : liste des rappels à traiter aujourd’hui, marquage “appelé” (supprime du mock), mise en avant des créneaux imminents.
- Paramètres (nouveau) : sections en cartes éditables, bouton “Enregistrer” sticky (mock) prêt à brancher sur API.
- Notifications (nouveau) : cloche globale avec badge non lus, dropdown typé (rappel du jour, rappels à faire, appel effectué, faux numéro) avec actions “tout marquer comme lu” et navigation vers pages concernées.

## Design / composants transverses
- Layout : `AppShell` gère thème (localStorage), sidebar fixe 64px, header sticky.
- Tonalité UI : cartes arrondies, ombres douces, badges, dégradé violet pour boutons primaires, fonds gris clair en light et bleu nuit en dark.
- Nouveaux composants : `NotificationBell`, `NotificationDropdown`, `SettingsSection`, `SettingsCard`, toggles/Selects stylés inline.

## Plan backend (cible)
### Domaines & tables principales
- users(id, email, password_hash, name, role, language, timezone, date_format, time_format, created_at, updated_at)
- sessions/id_tokens (pour auth / refresh)
- calls(id, user_id, contact_first_name, contact_last_name, phone, status, type, last_call_at, next_reminder_at, description, created_at, updated_at)
- call_status_history(id, call_id, status, note, occurred_at, created_by)
- reminders(id, call_id, scheduled_at, previous_status, done, priority, created_at, updated_at)
- notifications(id, user_id, type, title, body, link, read_at, created_at, meta JSON)
- settings(id, user_id, work_hours, default_reminder_slot, default_status_after_call, confirm_before_delete, reminders_order, pre_reminder_delay, enable_reminders, enable_notifications, notif_reminder, notif_calls, notif_fraud, notif_frequency, urgent_highlight, created_at, updated_at)
- audits(id, user_id, action, resource, meta JSON, created_at)

### API REST (mock → prod)
- Auth : POST /auth/login, POST /auth/refresh, POST /auth/logout.
- User : GET /me, PATCH /me (profil), PATCH /me/settings (généraux), GET /me/notifications?read=false, POST /me/notifications/mark-all-read, PATCH /me/notifications/:id/read.
- Calls : GET /calls (filtres search/status/type/date range), GET /calls/:id, POST /calls, PATCH /calls/:id, DELETE /calls/:id (avec confirmation).
- Reminders : GET /reminders?date=today, POST /reminders, PATCH /reminders/:id (mark done, reschedule), DELETE /reminders/:id.
- Reporting : GET /reports/kpi?range=… (pour dashboard), GET /reports/today (appels effectués, rappels du jour).

### Temps réel / jobs
- Webhooks ou WS pour push notifications (rappels imminents, appels marqués, faux numéro).
- Cron jobs : génération des notifications “rappels du jour”, digest, détection faux numéros, nettoyage des tokens expirés.

### Sécurité & garde-fous
- Auth JWT + refresh, cookies httpOnly + CSRF token.
- RBAC simple (user, admin). Vérifs d’appartenance user_id sur calls/reminders/notifications.
- Rate limiting sur import / notifications.
- Audit log sur actions sensibles (delete, security).

## Plan d’intégration front ↔ backend
- Remplacer les mocks par des hooks de data fetching (SWR/React Query) et services typed (OpenAPI).
- Injecter dans `AppShell` un provider `NotificationContext` consommant `/me/notifications`.
- Dans `SettingsPage`, persister via `/me/settings` + toast de succès/erreur.
- Tables et modales existantes (`CallsTable`, `DetailModal`, `EditModal`) à brancher sur mutations PATCH/POST/DELETE avec pessimistic updates puis revalidation.

## Prompt pour un agent IA backend
« Tu es un ingénieur backend. Tu dois brancher le front Next.js Call Tracking (pages dashboard/calls/today/reminders/settings) sur une API. Stack conseillée : Node + Nest/Fastify/Express, Postgres, Prisma. Livrables attendus :
- Schéma SQL/Prisma couvrant users, sessions, calls, call_status_history, reminders, notifications, settings, audits.
- Endpoints REST : auth (login/refresh/logout), /me, /me/settings, /me/notifications (list, mark read, mark all), /calls (CRUD + filtres), /reminders (CRUD + filtres date/today), /reports (kpi, today).
- Middlewares : auth JWT httpOnly, RBAC basique, rate limiting.
- Jobs : cron génération rappels du jour + notifications, digest daily/weekly, cleanup tokens.
- Tests : unit (services), e2e (routes), seed de données mock.
- Documentation OpenAPI/Swagger + fichier env.sample. Branche le front en priorisant les hooks pour remplacer les mocks. »


