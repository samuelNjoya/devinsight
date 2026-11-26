-- Table pour stocker le provider_token GitHub
CREATE TABLE user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'github',
  access_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Table pour les profils sauvegardés
CREATE TABLE saved_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  github_username TEXT NOT NULL,
  score INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active RLS sur les deux tables
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;

-- Policy : un user ne voit QUE ses propres tokens
CREATE POLICY "Users can view own tokens"
  ON user_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
  ON user_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON user_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy : un user ne voit QUE ses propres profils sauvegardés
CREATE POLICY "Users can view own saved profiles"
  ON saved_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved profiles"
  ON saved_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved profiles"
  ON saved_profiles FOR DELETE
  USING (auth.uid() = user_id);




Étape 4 — Étapes Supabase (détaillées)
4.1 Créer le projet Supabase
Va sur supabase.com → Sign in with GitHub

Clique "New project"

Remplis :

Name : devinsight

Database Password : génère un mot de passe fort (note-le)

Region : choisir la plus proche (ex : eu-west-3 pour l'Europe)

Attends ~2 minutes que le projet soit provisionné

4.2 Récupérer les clés API
Dashboard Supabase → Settings → API :

Clé	Où la trouver	Usage
Project URL	En haut	NEXT_PUBLIC_SUPABASE_URL
anon public	Dans "Project API keys"	NEXT_PUBLIC_SUPABASE_ANON_KEY (client)
service_role	Dans "Project API keys" (cliquer "Reveal")	SUPABASE_SERVICE_ROLE_KEY (serveur uniquement, jamais côté client)
4.3 Créer la GitHub OAuth App
GitHub → Settings → Developer settings → OAuth Apps → New OAuth App

Remplis :

Application name : DevInsight

Homepage URL : http://localhost:3000 (pour le dev ; changeras en prod)

Authorization callback URL : https://<TON_PROJECT_REF>.supabase.co/auth/v1/callback

⚠️ Important : c'est l'URL Supabase, pas ton URL Vercel 

Clique Register application

Note le Client ID

Clique Generate a new client secret → note le Client Secret

4.4 Configurer le provider GitHub dans Supabase
Dashboard Supabase → Authentication → Providers → GitHub :

Active le toggle

Colle le Client ID et Client Secret de l'étape 4.3

Clique Save

4.5 Configurer les Redirect URLs
Dashboard Supabase → Authentication → URL Configuration :

Site URL : http://localhost:3000

Redirect URLs : ajoute http://localhost:3000/auth/callback

En production, tu ajouteras https://ton-projet.vercel.app/auth/callback.

4.6 Créer les tables SQL (avec RLS)

# clienID
Client ID
Ov23liZyFGQWPf2fiFi2
client secret
a81e58ed27a27438fc16807d79ce35b7004f170f

-- ============================================
-- TABLE : user_tokens (stockage provider_token)
-- ============================================
CREATE TABLE user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'github',
  access_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- Un user ne voit QUE ses tokens
CREATE POLICY "Users can view own tokens"
  ON user_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Un user peut insérer SON token
CREATE POLICY "Users can insert own tokens"
  ON user_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Un user peut mettre à jour SON token
CREATE POLICY "Users can update own tokens"
  ON user_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- NOTE : le client admin (service_role) contourne RLS.
-- C'est utilisé dans le callback pour stocker le token
-- avant que la session ne soit pleinement active.

-- ============================================
-- TABLE : saved_profiles (profils sauvegardés)
-- ============================================
CREATE TABLE saved_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  github_username TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;

-- Un user ne voit QUE ses profils sauvegardés
CREATE POLICY "Users can view own saved profiles"
  ON saved_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved profiles"
  ON saved_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved profiles"
  ON saved_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_saved_profiles_user_id ON saved_profiles(user_id);
CREATE INDEX idx_saved_profiles_created_at ON saved_profiles(created_at DESC);