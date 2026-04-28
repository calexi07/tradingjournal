-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────
CREATE TABLE public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id   TEXT UNIQUE,
  username     TEXT NOT NULL,
  avatar_url   TEXT,
  email        TEXT,
  display_name TEXT,
  timezone     TEXT DEFAULT 'UTC',
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── ACCOUNTS ─────────────────────────────────────────────
CREATE TABLE public.accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  broker          TEXT NOT NULL,
  phase           TEXT NOT NULL CHECK (phase IN ('challenge', 'verification', 'funded')),
  balance         NUMERIC(15,2) NOT NULL,
  initial_balance NUMERIC(15,2) NOT NULL,
  daily_drawdown  NUMERIC(5,2) NOT NULL DEFAULT 5.0,
  max_drawdown    NUMERIC(5,2) NOT NULL DEFAULT 10.0,
  profit_target   NUMERIC(5,2) NOT NULL DEFAULT 8.0,
  currency        TEXT NOT NULL DEFAULT 'USD',
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,
  color           TEXT DEFAULT '#00d4aa',
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── TRADES ───────────────────────────────────────────────
CREATE TABLE public.trades (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id       UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pair             TEXT NOT NULL,
  direction        TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
  session          TEXT CHECK (session IN ('asia', 'london', 'new_york', 'overlap')),
  lot_size         NUMERIC(10,4) NOT NULL,
  entry_price      NUMERIC(15,5) NOT NULL,
  stop_loss        NUMERIC(15,5),
  take_profit      NUMERIC(15,5),
  exit_price       NUMERIC(15,5),
  pnl_usd          NUMERIC(12,2),
  pnl_pct          NUMERIC(8,4),
  rr_ratio         NUMERIC(6,2),
  planned_rr       NUMERIC(6,2),
  result           TEXT CHECK (result IN ('win', 'loss', 'breakeven', 'partial')),
  opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at        TIMESTAMPTZ,
  duration_minutes INTEGER,
  setup_type       TEXT,
  emotion_before   TEXT CHECK (emotion_before IN ('calm','confident','anxious','fomo','revenge','bored','disciplined')),
  emotion_after    TEXT CHECK (emotion_after IN ('satisfied','frustrated','neutral','excited','regretful','confident')),
  notes            TEXT,
  screenshot_url   TEXT,
  is_aplus         BOOLEAN NOT NULL DEFAULT FALSE,
  is_mistake       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── TAGS ─────────────────────────────────────────────────
CREATE TABLE public.tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#58a6ff',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, name)
);

-- ─── TRADE_TAGS ───────────────────────────────────────────
CREATE TABLE public.trade_tags (
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  tag_id   UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (trade_id, tag_id)
);

-- ─── INDEXES ──────────────────────────────────────────────
CREATE INDEX idx_accounts_user_id  ON public.accounts (user_id);
CREATE INDEX idx_trades_account_id ON public.trades   (account_id);
CREATE INDEX idx_trades_user_id    ON public.trades   (user_id);
CREATE INDEX idx_trades_opened_at  ON public.trades   (opened_at DESC);
CREATE INDEX idx_trades_pair       ON public.trades   (pair);
CREATE INDEX idx_trades_result     ON public.trades   (result);
CREATE INDEX idx_tags_user_id      ON public.tags     (user_id);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── AUTO-CREATE USER PROFILE PE SIGNUP ───────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url, email, discord_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'trader'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
