# `HANDOFF.md`

Voici le document complet. Sauvegarde-le à la racine de ton repo (`HANDOFF.md`), commit-le, et au prochain chat, colle son contenu en premier message. Le nouveau chat aura alors tout le contexte nécessaire.

---

```markdown
# DevInsight — Handoff Document

> Document de passation pour reprendre le projet dans un nouveau chat.
> Dernière mise à jour : 27 novembre 2026.

---

## 1. Contexte du projet

**Nom** : DevInsight
**Objectif** : Analyser un profil GitHub, calculer un score de 0 à 100 basé sur 5 critères, visualiser les langages, l'activité et les meilleurs repos. Permettre la comparaison de deux profils et l'export PNG.
**URL production** : https://devinsight-pi.vercel.app
**Repo GitHub** : https://github.com/samuelNjoya/devinsight
**Branche de travail actuelle** : `version_4` (refonte UI terminée, à merger dans `master`)

**État actuel** : MVP fonctionnel + refonte UI/UX professionnelle terminée. Le build passe en local et sur Vercel. L'auth GitHub OAuth fonctionne en production. Les profils sauvegardés s'affichent. La comparaison fonctionne (lien corrigé pour inclure `b`).

---

## 2. Stack technique

| Couche | Technologie |
|---|---|
| **Framework** | Next.js 16.4.6 (App Router, Turbopack) |
| **Langage** | TypeScript strict (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| **Style** | Tailwind CSS v4 + `next-themes` (dark mode) |
| **Animations** | Framer Motion |
| **Graphiques** | Recharts (Pie, Radar) |
| **Auth + DB** | Supabase (PostgreSQL + Auth OAuth GitHub) |
| **Cache** | Upstash Redis (HTTP-based) |
| **API externe** | GitHub REST API (token serveur + provider_token utilisateur) |
| **Export** | html-to-image |
| **Validation** | Zod |
| **Tests** | Vitest + MSW |
| **Déploiement** | Vercel |

---

## 3. Architecture des dossiers

```
app/
  page.tsx                      # Landing (Hero + Features + Preview + Testimonials)
  layout.tsx                    # Root layout (ThemeProvider + Header + Footer)
  globals.css                   # Variables CSS, shimmer, focus, scrollbar
  login/page.tsx                # Carte centrée + bouton GitHub OAuth
  auth/callback/route.ts        # Échange OAuth + stockage provider_token
  auth/signout/route.ts         # Déconnexion
  u/[username]/page.tsx         # Dashboard public (Suspense + ProfileContent)
  u/[username]/not-found.tsx    # 404 profil
  dashboard/page.tsx            # Dashboard connecté (cartes de navigation)
  dashboard/saved/page.tsx      # Profils sauvegardés
  dashboard/compare/page.tsx    # Comparaison 2 profils (radar)
  api/github/[username]/route.ts # API proxy GitHub + cache + score
  api/saved-profiles/route.ts   # CRUD profils sauvegardés
  not-found.tsx                 # 404 globale
  error.tsx                     # Error boundary globale

components/
  layout/
    Header.tsx                  # Client Component (nav, dark mode, auth, mobile)
    HeaderWrapper.tsx           # Server Component (Suspense + session)
    MobileMenu.tsx              # Drawer mobile animé
    Footer.tsx                  # Server Component statique
    AppShell.tsx                # Wrapper <main>
  ui/
    Card.tsx                    # Card + CardHeader + CardTitle + CardContent
    Button.tsx                  # Button (4 variants, 3 sizes) + ButtonLink
    Badge.tsx                   # 6 variants
    Skeleton.tsx                # Skeleton + SkeletonText (shimmer)
    Tooltip.tsx                 # Tooltip animé accessible
    EmptyState.tsx              # État vide réutilisable
    FadeIn.tsx                  # Scroll reveal Framer Motion
    ProgressBar.tsx             # Barre de progression gradient
    ThemeProvider.tsx           # Wrapper next-themes
    ThemeToggle.tsx             # Bouton soleil/lune animé
  landing/
    Hero.tsx                    # Client (input + CTA)
    Features.tsx                # Server (4 cartes)
    Preview.tsx                 # Server (aperçu statique)
    Testimonials.tsx            # Server (3 témoignages)
  Dashboard/
    ProfileHeader.tsx           # Server (avatar ring + bio + stats)
    ScoreCard.tsx               # Client (cercle animé + breakdown + tooltips)
    LanguagePie.tsx             # Client (donut + label central + légende)
    ActivityHeatmap.tsx         # Server (heatmap + labels jours + tooltips)
    TopRepos.tsx                # Server (3 cartes repos)
    DashboardView.tsx           # Client (assemblage + ref export + FadeIn)
    DashboardSkeleton.tsx       # Server (skeleton structuré)
    ComparisonRadar.tsx         # Client (Recharts radar)
    ComparisonRadarWrapper.tsx  # Client (dynamic import ssr:false)
    ExportButton.tsx            # Client (html-to-image)
  SaveProfileButton.tsx         # Client (insert Supabase)

lib/
  config.ts                     # Constantes + requireEnv (fail-fast)
  errors.ts                     # Erreurs typées (AppError + sous-classes)
  github/
    types.ts                    # Types domaine (GitHubUserSummary, ProfileData...)
    client.ts                   # Client GitHub (fetch + retry + mapping)
    aggregator.ts               # Agrégation (Promise.all + computeLanguages)
  score/
    types.ts                    # ScoreCriterion, ScoreBreakdown, ScoreResult
    calculate.ts                # calculateScore (pur, horloge injectable)
    criteria/
      communityImpact.ts        # 30% — log10(stars)
      recentActivity.ts         # 25% — events 90 jours (createRecentActivityCriterion)
      repoQuality.ts            # 20% — repos complets
      languageDiversity.ts      # 15% — langages distincts
      profileCompleteness.ts    # 10% — bio + blog + name (PAS avatar)
  cache/
    types.ts                    # CacheStore interface (DIP)
    redis.ts                    # RedisCacheStore + getCache() + cacheKeys
  supabase/
    client.ts                   # createClient (browser, 'use client')
    server.ts                   # createClient (server) + createAdminClient
  validation/
    username.ts                 # Zod + regex GitHub
  rate-limit.ts                 # Lazy init (getAnonymousLimiter, getAuthenticatedLimiter)
  export/
    exportElement.ts            # html-to-image toPng

types/
  github.ts                     # (si utilisé)

tests/
  msw/server.ts                 # Handlers MSW

middleware.ts → proxy.ts        # Next.js 16 : renommé proxy.ts
next.config.ts                  # images.remotePatterns (avatars.githubusercontent.com)
vitest.config.mts               # ESM, fileURLToPath
```

---

## 4. Décisions techniques clés (NE PAS CHANGER)

### 4.1 Supabase Auth + OAuth GitHub
- `provider_token` GitHub **expire après 60 min** et Supabase ne le rafraîchit pas. Il est stocké en DB dans `user_tokens` dès le callback (`app/auth/callback/route.ts`) via `createAdminClient()` (service_role).
- Le `provider_token` est utilisé dans la route API pour analyser les dépôts privés. Fallback sur `GITHUB_TOKEN` serveur si absent/expiré.
- RLS activé sur `user_tokens` et `saved_profiles`. Grants explicites nécessaires (`GRANT ... TO service_role/authenticated`).

### 4.2 Cache Redis
- **Initialisation paresseuse obligatoire** : ne jamais instancier `new Redis(...)` au niveau module. Utiliser `getCache()` et les getters de `lib/rate-limit.ts`.
- Graceful degradation : si Redis down, on log et on continue (fallback GitHub direct).
- Clés typées via `cacheKeys` (pas de string magic).

### 4.3 Next.js 16 — Règles strictes
- **Tout accès dynamique** (`cookies()`, `headers()`, `params`, `searchParams`, `connection()`) doit être **dans un `<Suspense>`** avec fallback **déterministe** (pas de `Date.now()`, pas de `Math.random()`).
- **`ssr: false` avec `dynamic()`** est interdit dans un Server Component. Créer un wrapper `'use client'` (ex : `ComparisonRadarWrapper.tsx`).
- **`createClient()` (browser)** ne doit jamais être appelé au niveau du composant. L'appeler dans un event handler (`onClick`) ou `useEffect`.
- **`instant = false`** ne résout PAS les erreurs de prerender. Utiliser `<Suspense>` ou `loading.tsx`.
- Le fichier `middleware.ts` est renommé `proxy.ts` (Next.js 16). Garder `export const config` pour le matcher.
- `next.config.ts` doit autoriser `avatars.githubusercontent.com` dans `images.remotePatterns`.

### 4.4 Logique métier pure
- `lib/score/` ne dépend de RIEN (pas de React, pas de Redis, pas de fetch). Testable à 100%.
- `recentActivity` accepte une horloge injectable (`createRecentActivityCriterion(now?)`) pour le déterminisme.
- `calculateScore(data, now?)` accepte une horloge optionnelle.

### 4.5 Sécurité
- `GITHUB_TOKEN` et `provider_token` restent côté serveur. Jamais exposés au client.
- Validation Zod sur toutes les entrées (`usernameSchema`, `saveProfileSchema`).
- Rate limiting Upstash (anonyme 20/min par IP, authentifié 60/min par user).
- RLS sur toutes les tables Supabase.

---

## 5. Problèmes résolus (NE PAS REPRODUIRE)

| Problème | Cause | Correction |
|---|---|---|
| `Invalid supabaseUrl` | URL sans `https://` | `NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co` |
| `NEXT_PUBLIC_*` manquant côté client | `process.env[name]` dynamique | Accès statique `process.env.NEXT_PUBLIC_SUPABASE_URL` dans `lib/supabase/client.ts` |
| `createClient()` client appelé côté serveur | Import `@/lib/supabase/client` dans Server Component | Import `@/lib/supabase/server` |
| `uncached data during prerendering` | `cookies()`/`params`/`searchParams` hors `<Suspense>` | Envelopper dans `<Suspense>` + fallback déterministe |
| `Date.now()` au prerender | `recentActivity` non déterministe | `createRecentActivityCriterion(now?)` + `() => 0` au prerender |
| `ssr: false` interdit en Server Component | `dynamic()` avec `ssr:false` dans page serveur | Wrapper `'use client'` (ex : `ComparisonRadarWrapper`) |
| `permission denied for table user_tokens` | Grants manquants (rollout Supabase 2026) | `GRANT SELECT, INSERT, UPDATE ON public.user_tokens TO service_role` |
| `new row violates RLS` sur `saved_profiles` | `user_id` non envoyé | `user_id: user.id` dans l'insert |
| Vercel build échoue `npm install` | Conflit `vitest@5` / `@types/node@20` | `@types/node@^22` ou `--legacy-peer-deps` |
| Vercel build échoue `UPSTASH_REDIS_REST_URL` | Instanciation Redis au niveau module | `getRedis()` paresseux dans `lib/rate-limit.ts` |
| Vercel build échoue `createBrowserClient` | `createClient()` au niveau composant `login` | Instancier dans `signInWithGitHub()` (event handler) |
| OAuth redirige vers localhost en prod | Site URL Supabase = localhost | `https://devinsight-pi.vercel.app` + Redirect URLs `/auth/callback` |
| Lien "Comparer" ne fait rien | URL sans `b` | `href={`/dashboard/compare?a=${p.github_username}&b=${githubUsername ?? 'octocat'}`}` |
| `avatars.githubusercontent.com` non configuré | `next/image` refuse les domaines inconnus | `images.remotePatterns` dans `next.config.ts` |
| Next.js 16 déprécie `middleware.ts` | Nouveau nom `proxy.ts` | Renommer + `export async function proxy` |
| Vitest warning `__dirname` | ESM natif | `fileURLToPath(import.meta.url)` dans `vitest.config.mts` |

---

## 6. Règles à respecter

1. **NE PAS toucher à la logique métier** (`lib/score/`, `lib/github/`, `lib/cache/`, `lib/supabase/`, `lib/rate-limit.ts`, routes API). Elle fonctionne. Si un changement est nécessaire, demander confirmation.
2. **Toujours envelopper le dynamique dans `<Suspense>`** avec fallback déterministe.
3. **Toujours initialiser Redis/Supabase browser de manière paresseuse** (getter ou event handler).
4. **`createClient()` browser** uniquement dans un event handler ou `useEffect`.
5. **`ssr: false`** uniquement dans un wrapper `'use client'`.
6. **Server Components par défaut**, Client Components ciblés (`'use client'` seulement si état/event/Recharts/Framer Motion).
7. **Immutabilité** : `readonly` partout dans les types.
8. **Fonctions pures** dans `lib/score/` et `lib/github/aggregator.ts`.
9. **Erreurs typées** : `AppError` + sous-classes, jamais `throw new Error("...")` générique.
10. **Validation Zod** sur toutes les entrées utilisateur.
11. **Accessibilité** : `aria-label`, `role`, `alt`, focus visible, `prefers-reduced-motion`.
12. **Dark mode** : toutes les couleurs en paires `light / dark` via Tailwind.
13. **Nommage explicite** : `fetchUserReposWithCache()` pas `getData()`.
14. **Pas de magic numbers** : constantes dans `lib/config.ts`.
15. **Tests** : chaque fonction pure de `lib/` a un test Vitest.

---

## 7. Commandes utiles

```bash
# Développement
npm run dev                    # http://localhost:3000

# Vérifications
npm run typecheck              # tsc --noEmit
npm run test:run               # vitest run
npm run lint                   # eslint

# Build production
Remove-Item -Recurse -Force .next   # Windows : vider le cache
npm run build

# Git
git checkout -b version_5      # nouvelle branche de travail
git add . && git commit -m "feat: ..."
git push origin version_5      # puis PR sur GitHub
```

**Variables d'environnement** (`.env.local` en local, Vercel Dashboard en prod) :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAA...
GITHUB_TOKEN=ghp_...
```

**Supabase Dashboard** → Authentication → URL Configuration :
- Site URL : `https://devinsight-pi.vercel.app`
- Redirect URLs : `https://devinsight-pi.vercel.app/auth/callback` + `http://localhost:3000/auth/callback`

---

## 8. État des tests

- **Vitest** : 28 tests verts (critères de score, calculateur, validation username, client GitHub, aggregator, callback auth, route API).
- **Build** : passe en local et sur Vercel.
- **Tests manuels validés** : landing, login OAuth, dashboard public (`/u/octocat`), sauvegarde de profil, liste saved, comparaison, export PNG, dark mode, mobile.

---

## 9. Prochaines étapes possibles

### Priorité haute
- [ ] **Merger `version_4` dans `master`** via Pull Request GitHub.
- [ ] **Corriger le lien "Comparer"** dans `app/dashboard/saved/page.tsx` pour inclure `b` (voir section 5).
- [ ] **Tester le parcours complet en production** après merge.

### Priorité moyenne
- [ ] **Tests Playwright** sur les parcours critiques (login, analyse, sauvegarde, comparaison, export).
- [ ] **Lighthouse audit** (objectif > 90 partout).
- [ ] **Corriger les problèmes de la Réponse 2** :
  - `hasReadme` approximé par `Boolean(description)` → appel `/repos/{owner}/{repo}/readme` (coûteux, à cacher).
  - `profileCompleteness` : déjà corrigé (avatar retiré).
  - `recentActivity` : déjà corrigé (horloge injectable).
- [ ] **Ajouter des toasts** (Sonner) pour "Profil sauvegardé", "Export réussi".
- [ ] **Page transitions** avec Framer Motion (`AnimatePresence` dans le layout).

### Priorité basse (post-MVP)
- [ ] **Comparaison de 3+ profils** (actuellement limité à 2).
- [ ] **Historique des scores** pour un profil sauvegardé (graphique d'évolution).
- [ ] **i18n FR/EN** avec `next-intl` (actuellement FR uniquement).
- [ ] **PWA** (manifest, service worker).
- [ ] **SEO** : metadata dynamique par profil, OG image (`@vercel/og`).
- [ ] **Analytics** : Vercel Analytics + events custom.

---

## 10. Points d'attention pour le nouveau chat

1. **Toujours demander confirmation avant de modifier `lib/`** (logique métier).
2. **Toujours proposer la correction minimale** avant la refonte (l'utilisateur préfère les corrections ciblées).
3. **Toujours expliquer la cause racine** d'une erreur avant de corriger (pas juste "change ça").
4. **Toujours mentionner les patterns Next.js 16** quand ils s'appliquent (`<Suspense>`, `ssr: false`, `proxy.ts`).
5. **Toujours fournir le code complet** du fichier modifié (pas juste un extrait), pour éviter les erreurs de copier-coller.
6. **Toujours vérifier `npm run typecheck` et `npm run build`** après chaque modification majeure.
7. **L'utilisateur est sur Windows** (PowerShell) — utiliser `Remove-Item` au lieu de `rm -rf`.
8. **L'utilisateur travaille sur des branches** (`version_4`, `version_5`...) et merge via Pull Request GitHub.
9. **La production est sur Vercel** — les variables d'env doivent être configurées dans le dashboard Vercel, pas seulement dans `.env.local`.
10. **Le projet est un portfolio** — l'objectif est de crédibiliser un titre "Full Stack Engineer". Les bonnes pratiques (SOLID, DRY, tests, accessibilité) sont aussi importantes que la fonctionnalité.

---

## 11. Contacts et ressources

- **Supabase Dashboard** : https://supabase.com/dashboard
- **Upstash Console** : https://console.upstash.com
- **Vercel Dashboard** : https://vercel.com/dashboard
- **GitHub OAuth App** : https://github.com/settings/developers
- **Documentation Next.js 16** : https://nextjs.org/docs
- **Documentation Supabase SSR** : https://supabase.com/docs/guides/auth/server-side/nextjs

---

*Fin du document de passation. Bon courage pour la suite !*
```

---

## Comment l'utiliser

1. **Sauvegarde** ce contenu dans un fichier `HANDOFF.md` à la racine de ton repo.
2. **Commit-le** : `git add HANDOFF.md && git commit -m "docs: add handoff document"`.
3. **Au prochain chat**, colle son contenu en premier message, avec une phrase du type :
   > "Voici le contexte de mon projet DevInsight. Lis ce HANDOFF.md et dis-moi quand tu es prêt à continuer."
4. Le nouveau chat aura alors **tout le contexte** : architecture, décisions, problèmes résolus, règles, prochaines étapes.

---

## Ce que ce document garantit

- ✅ Tu ne perds **aucune décision technique** (les 17 problèmes résolus sont documentés)
- ✅ Tu ne reproduis **aucune erreur** (les pièges Next.js 16 sont listés)
- ✅ Le nouveau chat sait **exactement où en est le projet** (MVP + refonte UI terminée)
- ✅ Le nouveau chat connaît **les règles à respecter** (ne pas toucher à `lib/`, `<Suspense>` partout, etc.)
- ✅ Tu as une **feuille de route** pour la suite (prochaines étapes priorisées)

C'est un investissement de 5 minutes qui te fera gagner des heures. 🚀