# `EXPLAIN.md` — Documentation complète du projet DevInsight

Voici le fichier complet. Sauvegarde-le à la racine de ton repo (`EXPLAIN.md`), commit-le, et il servira de référence à toute personne (ou à toi-même dans 6 mois) qui veut comprendre le projet.

---

```markdown
# DevInsight — Documentation technique complète

> Ce document explique **chaque partie du projet**, **chaque fichier**, et **les choix techniques** qui les sous-tendent.
> Dernière mise à jour : 28 novembre 2026.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture en couches](#2-architecture-en-couches)
3. [Flux de données](#3-flux-de-données)
4. [Structure des dossiers](#4-structure-des-dossiers)
5. [Explication fichier par fichier](#5-explication-fichier-par-fichier)
6. [Système de score](#6-système-de-score)
7. [Authentification et sécurité](#7-authentification-et-sécurité)
8. [Cache et performance](#8-cache-et-performance)
9. [Gestion des erreurs](#9-gestion-des-erreurs)
10. [Patterns Next.js 16](#10-patterns-nextjs-16)
11. [Tests](#11-tests)
12. [Déploiement](#12-déploiement)
13. [Variables d'environnement](#13-variables-denvironnement)
14. [Commandes utiles](#14-commandes-utiles)
15. [Décisions techniques notables](#15-décisions-techniques-notables)

---

## 1. Vue d'ensemble

**DevInsight** est une application web qui analyse un profil GitHub et produit :

- Un **score de 0 à 100** basé sur 5 critères pondérés (impact, activité, qualité, diversité, complétude)
- Un **dashboard visuel** : avatar, bio, stats, répartition des langages, heatmap d'activité, top 3 repos
- La **comparaison** de deux profils avec un radar chart
- L'**export PNG** du dashboard
- La **sauvegarde** de profils analysés (utilisateurs connectés)

**Public cible :** développeurs qui veulent évaluer leur profil GitHub, le partager sur LinkedIn, ou se comparer à d'autres.

**Stack :** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase (Auth + PostgreSQL), Upstash Redis, GitHub REST + GraphQL API, Recharts, Framer Motion.

---

## 2. Architecture en couches

Le projet suit une **Clean Architecture** adaptée à Next.js. Les dépendances pointent **vers le bas uniquement** :

```
┌─────────────────────────────────────────────┐
│  UI (app/, components/)                      │  ← React, ne connaît que les props
├─────────────────────────────────────────────┤
│  Application (app/api/, app/auth/)           │  ← HTTP, validation, orchestration
├─────────────────────────────────────────────┤
│  Domaine (lib/score/, lib/github/types.ts)   │  ← logique métier PURE, zéro dépendance
├─────────────────────────────────────────────┤
│  Infrastructure (lib/github/client,          │  ← Redis, Supabase, fetch GitHub
│  lib/cache, lib/supabase)                    │
└─────────────────────────────────────────────┘
```

**Règle d'or :** le domaine ne connaît ni React, ni Redis, ni Supabase. C'est ce qui rend `lib/score/` testable à 100% sans mock.

**Exemple concret :** `lib/score/calculate.ts` importe uniquement des types (`ProfileData`, `ScoreCriterion`). Il ne sait pas que les données viennent de GitHub ou d'ailleurs. On pourrait remplacer GitHub par GitLab sans toucher au calculateur.

---

## 3. Flux de données

### Analyse d'un profil public (visiteur non connecté)

```
1. Utilisateur tape "octocat" dans l'input (app/page.tsx)
2. Redirection vers /u/octocat
3. app/u/[username]/page.tsx (Server Component)
   └─> <Suspense> → ProfileContent
       ├─> validateUsername("octocat")         [lib/validation/username.ts]
       ├─> cache.getOrSet(cacheKey, ...)       [lib/cache/redis.ts]
       │   ├─> SI cache HIT → retourne le ProfileData
       │   └─> SI cache MISS :
       │       ├─> GitHubClient (sans token user → GITHUB_TOKEN serveur)
       │       ├─> aggregateProfile()          [lib/github/aggregator.ts]
       │       │   ├─> getUser()               [lib/github/client.ts]
       │       │   ├─> getRepos()              [lib/github/client.ts]
       │       │   └─> getContributionCalendar() [lib/github/client.ts — GraphQL]
       │       ├─> calculateScore(profile)     [lib/score/calculate.ts]
       │       └─> cache.set(cacheKey, result, TTL 1h)
       └─> <DashboardView profile score isAuthenticated={false} />
           ├─> ProfileHeader
           ├─> ScoreCard (cercle animé + breakdown)
           ├─> LanguagePie (donut)
           ├─> ActivityHeatmap (52×7)
           └─> TopRepos (3 cartes)
```

### Analyse d'un profil connecté (avec dépôts privés)

```
1. Utilisateur clique "Sign in with GitHub" (app/login/page.tsx)
2. OAuth GitHub → Supabase callback (app/auth/callback/route.ts)
   ├─> exchangeCodeForSession(code)
   └─> stocke provider_token dans user_tokens (via admin client)
3. Redirection vers /dashboard
4. Utilisateur clique "Analyser mon profil"
5. /u/[username] → ProfileContent
   ├─> createClient() (server) → getUser()
   ├─> lit user_tokens.access_token depuis Supabase
   ├─> GitHubClient({ token: providerToken })
   └─> aggregateProfile(client, username, { includePrivate: true })
       └─> getRepos(includePrivate: true) → type=all → inclut dépôts privés
```

**Différence clé :** le `providerToken` est passé au `GitHubClient`, ce qui permet à l'API GitHub de voir les dépôts privés. Sans token utilisateur, on retombe sur `GITHUB_TOKEN` serveur (publics uniquement).

---

## 4. Structure des dossiers

```
devinsight/
├── app/                          # Routes Next.js (App Router)
│   ├── layout.tsx                # Root layout (ThemeProvider + Header + Footer)
│   ├── page.tsx                  # Landing (Hero + Features + Preview + Testimonials)
│   ├── globals.css               # Variables CSS, shimmer, focus, scrollbar
│   ├── error.tsx                 # Error boundary globale
│   ├── not-found.tsx             # 404 globale
│   ├── login/page.tsx            # Page de connexion GitHub OAuth
│   ├── auth/
│   │   ├── callback/route.ts     # Échange OAuth + stockage provider_token
│   │   └── signout/route.ts      # Déconnexion
│   ├── u/[username]/
│   │   ├── page.tsx              # Dashboard public
│   │   └── not-found.tsx         # 404 profil
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard connecté (cartes navigation)
│   │   ├── saved/page.tsx        # Profils sauvegardés
│   │   └── compare/page.tsx      # Comparaison 2 profils
│   └── api/
│       ├── github/[username]/route.ts  # API proxy GitHub + cache + score
│       └── saved-profiles/route.ts     # CRUD profils sauvegardés
│
├── components/                   # Composants React
│   ├── layout/                   # Header, Footer, AppShell, MobileMenu
│   ├── ui/                       # Primitives (Card, Button, Badge, Skeleton...)
│   ├── landing/                  # Sections de la landing (Hero, Features...)
│   ├── Dashboard/                # Composants du dashboard
│   └── SaveProfileButton.tsx     # Bouton "Sauvegarder ce profil"
│
├── lib/                          # Logique métier (zéro dépendance UI)
│   ├── config.ts                 # Constantes + requireEnv (fail-fast)
│   ├── errors.ts                 # Erreurs typées (AppError + sous-classes)
│   ├── github/
│   │   ├── types.ts              # Types domaine (ProfileData, GitHubUserSummary...)
│   │   ├── client.ts             # Client GitHub (REST + GraphQL)
│   │   └── aggregator.ts         # Agrégation (Promise.all + computeLanguages)
│   ├── score/
│   │   ├── types.ts              # ScoreCriterion, ScoreBreakdown, ScoreResult
│   │   ├── calculate.ts          # calculateScore (pur)
│   │   └── criteria/             # 5 critères (un fichier par critère)
│   ├── cache/
│   │   ├── types.ts              # CacheStore interface (DIP)
│   │   └── redis.ts              # RedisCacheStore + getCache() + cacheKeys
│   ├── supabase/
│   │   ├── client.ts             # createClient (browser, 'use client')
│   │   └── server.ts             # createClient (server) + createAdminClient
│   ├── validation/
│   │   └── username.ts           # Zod + regex GitHub
│   ├── rate-limit.ts             # Lazy init (getAnonymousLimiter, getAuthenticatedLimiter)
│   └── export/
│       └── exportElement.ts      # html-to-image toPng
│
├── tests/
│   └── msw/server.ts             # Handlers MSW (mock GitHub API)
│
├── proxy.ts                      # Next.js 16 : middleware renommé
├── next.config.ts                # images.remotePatterns (avatars.githubusercontent.com)
├── vitest.config.mts             # Config Vitest (ESM)
└── package.json
```

---

## 5. Explication fichier par fichier

### 5.1 Racine

| Fichier | Rôle |
|---|---|
| `next.config.ts` | Configuration Next.js. Autorise `avatars.githubusercontent.com` dans `images.remotePatterns` (sinon `next/image` refuse les avatars GitHub). |
| `proxy.ts` | Middleware Next.js 16 (anciennement `middleware.ts`). Rafraîchit la session Supabase à chaque requête et protège `/dashboard/*` (redirige vers `/login` si non connecté). Le nom `config` est réservé par Next.js pour le matcher. |
| `vitest.config.mts` | Configuration Vitest. Utilise `fileURLToPath(import.meta.url)` pour `__dirname` (ESM natif). |
| `tsconfig.json` | TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. |
| `package.json` | Dépendances + scripts (`dev`, `build`, `typecheck`, `test:run`). |

### 5.2 `app/`

| Fichier | Type | Rôle |
|---|---|---|
| `layout.tsx` | Server | Root layout. Enveloppe l'app dans `ThemeProvider` (dark mode), `HeaderWrapper` (session dans `<Suspense>`), `AppShell` (`<main>`), et `Footer`. |
| `page.tsx` | Server | Landing. Assemble `Hero`, `Features`, `Preview`, `Testimonials`. |
| `globals.css` | — | Variables CSS (`--background`, `--foreground`...), animation `shimmer`, focus visible, scrollbar custom, `prefers-reduced-motion`. |
| `error.tsx` | Client | Error boundary globale. Affiche un `EmptyState` avec bouton "Réessayer". |
| `not-found.tsx` | Server | 404 globale. `EmptyState` avec lien vers l'accueil. |
| `login/page.tsx` | Client | Carte centrée avec bouton "Continuer avec GitHub". `createClient()` est appelé **dans le event handler** (pas au niveau composant) pour éviter le crash au prerender. |
| `auth/callback/route.ts` | Route | Échange le `code` OAuth contre une session Supabase. Stocke le `provider_token` dans `user_tokens` via `createAdminClient()` (service_role, car RLS bloque l'insertion sans session active). Redirige vers `/dashboard`. |
| `auth/signout/route.ts` | Route | `supabase.auth.signOut()` puis redirection vers `/login`. |
| `u/[username]/page.tsx` | Server | Dashboard public. `<Suspense>` + `ProfileContent` (async) qui lit `params`, valide le username, appelle `cache.getOrSet`, et rend `<DashboardView>`. |
| `u/[username]/not-found.tsx` | Server | 404 profil (username inexistant). |
| `dashboard/page.tsx` | Server | Dashboard connecté. `<Suspense>` + `DashboardContent` qui lit la session et affiche les cartes de navigation. |
| `dashboard/saved/page.tsx` | Server | Liste des profils sauvegardés. `<Suspense>` + `SavedProfilesContent`. Affiche `EmptyState` si vide. |
| `dashboard/compare/page.tsx` | Server | Comparaison 2 profils. `<Suspense>` + `CompareContent`. Lit `searchParams` (`a`, `b`), fetch les 2 profils en parallèle, rend `ComparisonRadarWrapper`. |
| `api/github/[username]/route.ts` | Route | API proxy. Valide le username, rate limit, lit la session, récupère le `provider_token` si connecté, cache Redis, appelle `aggregateProfile` + `calculateScore`, retourne JSON. |
| `api/saved-profiles/route.ts` | Route | CRUD profils sauvegardés. `GET` liste, `POST` insère (RLS exige `user_id = auth.uid()`). |

### 5.3 `components/layout/`

| Fichier | Type | Rôle |
|---|---|---|
| `Header.tsx` | Client | Header sticky. Logo animé (rotation au hover), nav centrale avec indicateur actif (`layoutId` Framer Motion), toggle dark mode, avatar/menu si connecté, bouton hamburger mobile. Devient opaque avec `backdrop-blur` après 10px de scroll. |
| `HeaderWrapper.tsx` | Server | `<Suspense>` + `HeaderWithSession` (async) qui lit la session via `createClient()` server. Isole la lecture de `cookies()` pour éviter l'erreur de prerender. |
| `MobileMenu.tsx` | Client | Drawer mobile animé (`AnimatePresence` + `motion.aside`). Overlay + panel qui slide depuis la droite. |
| `Footer.tsx` | Server | Footer minimal. Copyright + liens (GitHub, Docs, "Built with Next.js + Supabase"). |
| `AppShell.tsx` | Server | Wrapper `<main>` avec `min-h-[calc(100vh-4rem-5rem)]` (hauteur viewport - header - footer). |

### 5.4 `components/ui/`

| Fichier | Type | Rôle |
|---|---|---|
| `Card.tsx` | Server | `Card`, `CardHeader`, `CardTitle`, `CardContent`. Style unifié : `rounded-xl border border-zinc-200 bg-white shadow-sm`. `interactive` prop pour hover. |
| `Button.tsx` | Client | `Button` (4 variants : primary gradient, secondary, ghost, danger ; 3 sizes ; loading spinner) + `ButtonLink` (pour `<Link>`). |
| `Badge.tsx` | Server | 6 variants : default, success, warning, danger, info, private. |
| `Skeleton.tsx` | Server | `Skeleton` (shimmer) + `SkeletonText` (multi-lignes). |
| `Tooltip.tsx` | Client | Tooltip animé (`AnimatePresence`). `role="tooltip"`, accessible au focus. |
| `EmptyState.tsx` | Server | Icône + titre + description + action. Utilisé pour les états vides et les 404. |
| `FadeIn.tsx` | Client | Wrapper Framer Motion : fade + translate au scroll (`whileInView`, `once: true`). |
| `ProgressBar.tsx` | Server | Barre de progression gradient (`from-blue-500 to-violet-500`). |
| `ThemeProvider.tsx` | Client | Wrapper `next-themes` (`attribute="class"`, `defaultTheme="system"`). |
| `ThemeToggle.tsx` | Client | Bouton soleil/lune animé (rotation + scale). Évite le flash d'hydratation avec `mounted`. |

### 5.5 `components/landing/`

| Fichier | Type | Rôle |
|---|---|---|
| `Hero.tsx` | Client | Titre gradient, input `github.com/username`, bouton "Analyser", CTA login. Validation regex côté client (la vraie validation est serveur). |
| `Features.tsx` | Server | 4 cartes features (Score, Langages, Comparaison, Export) avec icônes gradient. |
| `Preview.tsx` | Server | Aperçu statique du dashboard (faux header, faux score, faux pie, faux heatmap). Aucun appel réseau. |
| `Testimonials.tsx` | Server | 3 témoignages avec avatars à initiales. |

### 5.6 `components/Dashboard/`

| Fichier | Type | Rôle |
|---|---|---|
| `ProfileHeader.tsx` | Server | Avatar ring, nom, `@username`, bio, stats (repos, followers, following), badge "Inclut dépôts privés". |
| `ScoreCard.tsx` | Client | Cercle de progression SVG + chiffre animé (0 → total en 1.2s via `useMotionValue` + `animate`). Breakdown par critère avec `ProgressBar` + `Tooltip` explicatif. |
| `LanguagePie.tsx` | Client | Donut chart Recharts (`innerRadius={56}`), label central (top langage + %), légende custom à droite. |
| `ActivityHeatmap.tsx` | Server | Grille 52×7 (CSS grid). Labels de jours (Lun, Mer, Ven, Dim). Tooltip natif `title`. Scroll horizontal sur mobile. Légende "Moins → Plus". |
| `TopRepos.tsx` | Server | 3 cartes repos (tri par stars). Pastille colorée par langage (couleurs GitHub officielles). Badge "Privé" si applicable. Hover : bordure bleue + ombre. |
| `DashboardView.tsx` | Client | Assemblage. `useRef` pour l'export PNG. `FadeIn` sur chaque section. Boutons Sauvegarder + Exporter. |
| `DashboardSkeleton.tsx` | Server | Skeleton structuré (avatar, stats, grid, heatmap, repos). |
| `ComparisonRadar.tsx` | Client | Radar chart Recharts (5 critères, 2 profils). |
| `ComparisonRadarWrapper.tsx` | Client | Wrapper `'use client'` qui fait `dynamic(() => import(...), { ssr: false })`. Nécessaire car `ssr: false` est interdit en Server Component. |
| `ExportButton.tsx` | Client | Bouton "Exporter PNG". Appelle `exportElementToPng` (html-to-image). |

### 5.7 `lib/`

| Fichier | Rôle |
|---|---|
| `config.ts` | Constantes centralisées (`cacheTtlSeconds`, `maxRetries`, `rateLimit`...). `requireEnv` throw si une variable manque (fail-fast). Getters pour lire `process.env` au moment de l'accès. |
| `errors.ts` | `AppError` (base) + `GitHubNotFoundError`, `GitHubRateLimitError`, `GitHubAuthError`, `GitHubServerError`, `InvalidUsernameError`, `CacheError`. Chaque erreur porte un `code` et un `statusCode`. |
| `github/types.ts` | `GitHubUserSummary`, `GitHubRepoSummary`, `GitHubEventSummary`, `ContributionDay`, `ContributionCalendar`, `ProfileData`. Types **découplés** de l'API GitHub (pas de `snake_case`). |
| `github/client.ts` | `GitHubClient` : fetch avec timeout, retry exponentiel, mapping erreurs HTTP → `AppError`, mapping types bruts → types domaine. Méthodes : `getUser`, `getRepos`, `getEvents`, `getContributionCalendar` (GraphQL). |
| `github/aggregator.ts` | `aggregateProfile` : `Promise.all([getUser, getRepos, getContributionCalendar])` + `computeLanguages` (fonction pure). |
| `score/types.ts` | `ScoreCriterion` (interface : `id`, `weight`, `compute`), `ScoreBreakdown`, `ScoreResult`. |
| `score/calculate.ts` | `calculateScore(data, now?)` : fonction pure, injecte l'horloge, calcule le breakdown et le total. |
| `score/criteria/*.ts` | 5 critères : `communityImpact` (log10 stars), `recentActivity` (contributions 90j, horloge injectable), `repoQuality` (tolérant : compte les éléments présents sur 4), `languageDiversity` (langages distincts / 8), `profileCompleteness` (bio + blog + name, PAS avatar). |
| `cache/types.ts` | `CacheStore` interface (`get`, `set`, `delete`, `getOrSet`). Dependency Inversion. |
| `cache/redis.ts` | `RedisCacheStore` (implémentation Upstash). Graceful degradation : si Redis down, log + continue. `getCache()` singleton. `cacheKeys` (clés typées). |
| `supabase/client.ts` | `createClient()` (browser, `'use client'`). Lit `process.env.NEXT_PUBLIC_*` **statiquement** (pas de `process.env[name]` dynamique). |
| `supabase/server.ts` | `createClient()` (server, `cookies()`) + `createAdminClient()` (service_role, contourne RLS). |
| `validation/username.ts` | `usernameSchema` (Zod + regex GitHub). `validateUsername` retourne un Result (`{ ok: true, value }` ou `{ ok: false, error }`). |
| `rate-limit.ts` | `getAnonymousLimiter()` + `getAuthenticatedLimiter()` (lazy init). `getClientIp()` (lit `x-forwarded-for`). |
| `export/exportElement.ts` | `exportElementToPng(element, fileName)` : `html-to-image` `toPng` avec `pixelRatio: 2`. |

---

## 6. Système de score

Le score final est la **somme pondérée** de 5 critères, chacun noté de 0 à 100.

| Critère | Poids | Calcul |
|---|---|---|
| **Impact communautaire** (`communityImpact`) | 30% | `log10(1 + totalStars) / 4 × 100`. Le log évite qu'un repo viral (10k stars) écrase tout. 0 stars = 0, 10 000 stars = 100. |
| **Activité récente** (`recentActivity`) | 25% | Somme des contributions sur les 90 derniers jours, plafonnée à 100. 100+ contributions = 100. Horloge injectable pour le déterminisme. |
| **Qualité des repos** (`repoQuality`) | 20% | Sur les 10 derniers repos, moyenne du nombre d'éléments présents sur 4 (description, README, license, topics). Un repo avec 2/4 vaut 50. |
| **Diversité technique** (`languageDiversity`) | 15% | Nombre de langages distincts / 8, plafonné à 100. 8+ langages = 100. |
| **Complétude du profil** (`profileCompleteness`) | 10% | Bio (33%), site web (33%), nom affiché (33%). L'avatar est **exclu** car GitHub en fournit toujours un. |

**Score final** = `Σ (critère.score × critère.weight)`, arrondi à l'entier.

**Transparence :** le `ScoreCard` affiche le breakdown par critère (barres + tooltips). L'utilisateur voit **pourquoi** il a ce score. C'est ce qui différencie DevInsight d'une boîte noire.

**Extensibilité (Open/Closed) :** ajouter un critère = créer un fichier dans `lib/score/criteria/` qui implémente `ScoreCriterion`, et l'ajouter au tableau dans `calculate.ts`. Aucune modification du calculateur.

---

## 7. Authentification et sécurité

### Flux OAuth GitHub

1. Utilisateur clique "Sign in with GitHub" → `supabase.auth.signInWithOAuth({ provider: 'github', scopes: 'read:user repo' })`
2. Redirection vers GitHub → autorisation → callback vers `https://<project>.supabase.co/auth/v1/callback`
3. Supabase échange le code → redirige vers `/auth/callback` de l'app
4. `app/auth/callback/route.ts` :
   - `exchangeCodeForSession(code)` → session JWT
   - Stocke `provider_token` dans `user_tokens` (via `createAdminClient()`)
   - Redirige vers `/dashboard`

### Pourquoi stocker le `provider_token` en DB

Le `provider_token` GitHub **expire après 60 minutes** et Supabase ne le rafraîchit pas. Si on ne le stocke pas immédiatement dans le callback, on le perd définitivement. C'est le pattern officiel recommandé.

### RLS (Row Level Security)

Toutes les tables Supabase ont RLS activé. Un utilisateur ne voit que **ses propres** données :

```sql
-- user_tokens
CREATE POLICY "Users can view own tokens" ON user_tokens FOR SELECT USING (auth.uid() = user_id);

-- saved_profiles
CREATE POLICY "Users can insert own saved profiles" ON saved_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Grants explicites** nécessaires (rollout Supabase 2026) :
```sql
GRANT SELECT, INSERT, UPDATE ON public.user_tokens TO service_role;
GRANT SELECT, INSERT, DELETE ON public.saved_profiles TO authenticated;
```

### Rate limiting

Deux limiteurs Upstash (sliding window) :
- **Anonyme** : 20 req/min par IP (`getClientIp()` lit `x-forwarded-for`)
- **Authentifié** : 60 req/min par user ID

### Validation

- `validateUsername` : regex GitHub `^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$`
- `saveProfileSchema` (Zod) : `githubUsername` (1-39 chars), `score` (0-100 int), `snapshot` (record)

---

## 8. Cache et performance

### Cache Redis (Upstash)

- **Clé** : `devinsight:profile:{username}:{public|all}` (inclut `includePrivate` pour ne pas mélanger public et privé)
- **TTL** : 3600s (1h)
- **Pattern cache-aside** : `getOrSet(key, ttl, fetcher)` → si HIT, retourne ; si MISS, appelle `fetcher`, stocke, retourne
- **Graceful degradation** : si Redis down, log + continue (fallback GitHub direct)

### Pourquoi Upstash et pas Redis classique

Upstash est **HTTP-based** (REST API), compatible avec les fonctions serverless Vercel. Un Redis classique nécessite une connexion TCP permanente, impossible en serverless.

### Optimisations

- **`Promise.all`** dans `aggregateProfile` : les 3 appels GitHub (user, repos, contributions) sont parallèles → ~3x plus rapide
- **Server Components par défaut** : `ProfileHeader`, `ScoreCard`, `ActivityHeatmap`, `TopRepos` n'envoient **aucun JS** au client
- **Client Components ciblés** : `LanguagePie` (Recharts), `ScoreCard` (animation), `Header` (menu, scroll)
- **`dynamic import`** pour Recharts (`ComparisonRadarWrapper`) : chargé uniquement quand la page compare est visitée
- **`next/image`** pour les avatars : WebP, lazy loading, dimensions optimisées

---

## 9. Gestion des erreurs

Toutes les erreurs métier héritent de `AppError` :

```ts
class AppError extends Error {
  constructor(message, public code, public statusCode) { ... }
}
```

| Erreur | Code | Status HTTP | Quand |
|---|---|---|---|
| `GitHubNotFoundError` | `GITHUB_NOT_FOUND` | 404 | User inexistant |
| `GitHubRateLimitError` | `GITHUB_RATE_LIMIT` | 429 | Quota GitHub dépassé (avec `retryAfterSeconds`) |
| `GitHubAuthError` | `GITHUB_AUTH` | 401 | Token invalide/expiré |
| `GitHubServerError` | `GITHUB_SERVER` | 502 | Erreur 5xx GitHub |
| `InvalidUsernameError` | `INVALID_USERNAME` | 400 | Username invalide |
| `CacheError` | `CACHE_ERROR` | 503 | Redis indisponible |

**Dans les routes API :** un seul `instanceof AppError` suffit pour renvoyer le bon status HTTP + code machine.

**Dans l'UI :** `app/error.tsx` (error boundary globale) + `app/u/[username]/not-found.tsx` (404 profil).

---

## 10. Patterns Next.js 16

### `<Suspense>` obligatoire pour le dynamique

Next.js 16 avec Cache Components exige que **tout accès dynamique** (`cookies()`, `headers()`, `params`, `searchParams`, `connection()`) soit dans un `<Suspense>` avec fallback **déterministe** (pas de `Date.now()`, pas de `Math.random()`).

```tsx
// ✅ Correct
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <DynamicContent />
    </Suspense>
  )
}

async function DynamicContent() {
  const { username } = await params
  const supabase = await createClient()  // lit cookies()
  // ...
}
```

### `ssr: false` interdit en Server Component

```tsx
// ❌ Crash au build
const Chart = dynamic(() => import('./Chart'), { ssr: false })

// ✅ Wrapper 'use client'
// components/ChartWrapper.tsx
'use client'
const Chart = dynamic(() => import('./Chart'), { ssr: false })
export function ChartWrapper(props) { return <Chart {...props} /> }
```

### `createClient()` browser dans event handler

```tsx
// ❌ Crash au prerender
export default function LoginPage() {
  const supabase = createClient()  // au niveau composant
}

// ✅ Correct
export default function LoginPage() {
  async function signIn() {
    const supabase = createClient()  // dans l'event handler
  }
}
```

### `proxy.ts` (anciennement `middleware.ts`)

Next.js 16 renomme `middleware.ts` → `proxy.ts`. La fonction `middleware` → `proxy`. Garder `export const config` pour le matcher. Le nom `config` est **réservé** par Next.js — ne jamais importer autre chose sous ce nom.

### Redis lazy init

```ts
// ❌ Crash au build (UPSTASH_REDIS_REST_URL absent)
const redis = new Redis({ url: config.redis.url, ... })

// ✅ Lazy
let instance: Redis | null = null
function getRedis(): Redis {
  if (!instance) instance = new Redis({ ... })
  return instance
}
```

---

## 11. Tests

### Vitest (unitaires)

- `lib/score/criteria/__tests__/` : tests des 5 critères
- `lib/score/__tests__/calculate.test.ts` : poids = 1.0, breakdown, score 0-100
- `lib/validation/__tests__/username.test.ts` : 13 tests (valides, invalides, trim)
- `lib/github/__tests__/client.test.ts` : MSW mock GitHub (succès, 404)
- `lib/github/__tests__/aggregator.test.ts` : `computeLanguages`
- `app/auth/__tests__/callback.test.ts` : échange OAuth + stockage token
- `app/api/github/__tests__/route.test.ts` : validation username

**Total : 28 tests verts.**

### MSW (Mock Service Worker)

`tests/msw/server.ts` mocke les endpoints GitHub :
- `GET /users/:username` → user ou 404
- `GET /users/:username/repos` → repos
- `GET /users/:username/events/public` → events

### Commandes

```bash
npm run test          # watch mode
npm run test:run      # une fois
npm run typecheck     # tsc --noEmit
```

---

## 12. Déploiement

### Vercel

1. Push sur GitHub → Vercel détecte Next.js automatiquement
2. Build : `npm run build`
3. Variables d'environnement configurées dans **Settings → Environment Variables**
4. **Redéployer** après tout changement de variable (les changements ne s'appliquent pas aux déploiements existants)

### Supabase

- **Site URL** : `https://devinsight-pi.vercel.app`
- **Redirect URLs** : `https://devinsight-pi.vercel.app/auth/callback` + `http://localhost:3000/auth/callback`

### GitHub OAuth App

- **Homepage URL** : `https://devinsight-pi.vercel.app`
- **Authorization callback URL** : `https://<project-ref>.supabase.co/auth/v1/callback` (URL Supabase, **pas** Vercel)

---

## 13. Variables d'environnement

| Variable | Où | Usage |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Clé publique (protégée par RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server uniquement** | Clé admin (contourne RLS) |
| `UPSTASH_REDIS_REST_URL` | Server | URL Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Server | Token Redis |
| `GITHUB_TOKEN` | Server | Personal Access Token (quota 5000/h) |

**Fichiers :** `.env.local` (local, non versionné) + `.env.example` (versionné, valeurs vides) + Vercel Dashboard (prod).

---

## 14. Commandes utiles

```bash
# Développement
npm run dev                    # http://localhost:3000

# Vérifications
npm run typecheck              # tsc --noEmit
npm run test:run               # vitest run
npm run lint                   # eslint

# Build
Remove-Item -Recurse -Force .next   # Windows : vider le cache
npm run build

# Git
git checkout -b version_5
git add . && git commit -m "feat: ..."
git push origin version_5      # puis PR sur GitHub
```

---

## 15. Décisions techniques notables

| Décision | Pourquoi |
|---|---|
| **Next.js App Router** | Server Components par défaut, streaming, layouts imbriqués |
| **Supabase** | Auth OAuth + PostgreSQL managé + RLS, tout en un, free tier généreux |
| **Upstash Redis** | HTTP-based, compatible serverless Vercel, free tier 500k commandes/mois |
| **GitHub REST + GraphQL** | REST pour user/repos, GraphQL pour `contributionsCollection` (12 mois sans limite 90j) |
| **Log10 pour communityImpact** | Évite qu'un repo viral écrase tout le score |
| **Horloge injectable** | `recentActivity` est déterministe en test et compatible prerender |
| **`repoQuality` tolérant** | Compte les éléments présents sur 4 au lieu d'exiger les 4 (sinon 0 partout) |
| **`profileCompleteness` sans avatar** | GitHub fournit toujours un avatar → ne discrimine rien |
| **`provider_token` en DB** | Expire après 60 min, Supabase ne le rafraîchit pas |
| **Lazy init Redis** | Évite le crash au build Vercel (env non disponible pendant la collecte) |
| **`<Suspense>` partout** | Next.js 16 Cache Components l'exige pour le dynamique |
| **`ssr: false` dans wrapper** | Interdit dans les Server Components |
| **`createClient()` dans event handler** | Évite le crash au prerender (env non disponible) |
| **Tailwind + next-themes** | Dark mode sans flash, `attribute="class"` |
| **Framer Motion** | Animations déclaratives, `whileInView`, `AnimatePresence` |
| **Recharts** | Léger, déclaratif, bon rendu SVG |
| **html-to-image** | Meilleur que html2canvas pour SVG (Recharts), bundle plus léger |
| **Zod** | Validation runtime + typage inféré |
| **MSW** | Mock GitHub sans toucher au code de production |

---

*Fin de la documentation. Pour toute question, se référer au `HANDOFF.md` pour l'état du projet et les prochaines étapes.*
```

---

## Comment l'utiliser

1. **Sauvegarde** ce contenu dans `EXPLAIN.md` à la racine de ton repo.
2. **Commit-le** : `git add EXPLAIN.md && git commit -m "docs: add complete technical documentation"`.
3. **Push** sur ta branche, puis merge dans `master`.

Ce document est **exhaustif** : il couvre l'architecture, chaque fichier, le système de score, la sécurité, les patterns Next.js 16, les tests, le déploiement, et les décisions techniques. Il complète le `HANDOFF.md` (qui est plus orienté "passation" et "prochaines étapes").

**Différence entre les deux :**
- `HANDOFF.md` : pour reprendre le projet dans un nouveau chat (contexte, problèmes résolus, prochaines étapes)
- `EXPLAIN.md` : pour comprendre le projet en profondeur (architecture, chaque fichier, chaque décision)

Les deux sont complémentaires. Garde-les tous les deux.