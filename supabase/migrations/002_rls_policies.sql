-- Activează RLS pe toate tabelele
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_tags ENABLE ROW LEVEL SECURITY;

-- ─── USERS ────────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ─── ACCOUNTS ─────────────────────────────────────────────
CREATE POLICY "Users can CRUD own accounts"
  ON public.accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── TRADES ───────────────────────────────────────────────
CREATE POLICY "Users can CRUD own trades"
  ON public.trades FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── TAGS ─────────────────────────────────────────────────
CREATE POLICY "Users can CRUD own tags"
  ON public.tags FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── TRADE_TAGS ───────────────────────────────────────────
CREATE POLICY "Users can manage own trade_tags"
  ON public.trade_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trades t
      WHERE t.id = trade_id AND t.user_id = auth.uid()
    )
  );

-- ─── LEADERBOARD VIEW ─────────────────────────────────────
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT
    u.username,
    u.avatar_url,
    COUNT(DISTINCT a.id)                                AS account_count,
    COUNT(t.id)                                         AS total_trades,
    ROUND(AVG(t.rr_ratio)::numeric, 2)                  AS avg_rr,
    ROUND(
      100.0 * SUM(CASE WHEN t.result = 'win' THEN 1 ELSE 0 END) /
      NULLIF(COUNT(t.id), 0), 1
    )                                                   AS win_rate_pct,
    SUM(t.pnl_usd)                                      AS total_pnl_usd
  FROM public.users u
  LEFT JOIN public.accounts a ON a.user_id = u.id
  LEFT JOIN public.trades t  ON t.user_id = u.id
  GROUP BY u.id, u.username, u.avatar_url
  ORDER BY total_pnl_usd DESC NULLS LAST;
