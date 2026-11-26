This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



npx create-next-app@latest devinsight --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack

Ce que fait cette commande :

create-next-app@latest : utilise la dernière version du CLI officiel Next.js 

--typescript : active TypeScript strict

--tailwind : installe et configure Tailwind CSS

--eslint : configure ESLint avec la config Next.js

--app : utilise l'App Router (obligatoire pour notre architecture)

--src-dir=false : pas de dossier src/, on garde app/, lib/, components/ à la racine (plus lisible pour ce projet)

--import-alias="@/*" : permet d'écrire import { x } from "@/lib/x" au lieu de chemins relatifs

--turbopack : active Turbopack pour le dev (plus rapide)

npm install @supabase/supabase-js @supabase/ssr @upstash/redis @upstash/ratelimit recharts framer-motion html-to-image zod
Ce que fait chaque package :

Package	Rôle
@supabase/supabase-js	Client Supabase (auth + DB)
@supabase/ssr	Gestion des cookies/sessions côté serveur (App Router) 
@upstash/redis	Client Redis HTTP (compatible Edge/serverless) 
@upstash/ratelimit	Rate limiting par IP/user
recharts	Graphiques (Pie, Radar)
framer-motion	Animations
html-to-image	Export PNG (meilleur que html2canvas pour SVG/Recharts) 
zod	Validation des entrées (username, payloads)


npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom msw
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom msw --legacy-peer-deps
Dev dependencies :

vitest : test runner rapide

@vitejs/plugin-react : support React dans Vitest

jsdom : environnement DOM pour les tests

@testing-library/react : tester les composants

@testing-library/jest-dom : matchers DOM

msw : Mock Service Worker pour mocker GitHub API

# 8nJDfwF&U9ut,Ys#

vider le cache
Remove-Item -Recurse -Force .next