# ⬡ Trading Journal — Prop Trader Platform

Un jurnal profesional de trading pentru traderii de prop firm (The5ers, FTMO, etc.)

## Stack
- **Frontend:** Next.js 14 (App Router) + TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Auth:** Discord OAuth
- **Hosting:** Vercel

## Funcționalități
- ✅ Login cu Discord
- ✅ Multiple conturi de trading
- ✅ Log trades cu PnL auto-calculat
- ✅ Equity Curve per cont
- ✅ Win Rate, Avg RR, Profit Factor
- ✅ Drawdown tracking
- ✅ Filtre pe pereche, sesiune, rezultat
- ✅ Marcare trades A+
- ✅ Dark mode by default

## Setup

### 1. Clonează repo-ul
```bash
git clone https://github.com/username/tradingjournal.git
cd tradingjournal
npm install
```

### 2. Configurează Supabase
- Creează un proiect pe supabase.com
- Rulează cele 3 fișiere SQL din `supabase/migrations/` în SQL Editor
- Activează Discord OAuth în Authentication → Providers

### 3. Variabile de mediu
```bash
cp .env.example .env.local
# Completează cu valorile din Supabase Dashboard
```

### 4. Rulează local
```bash
npm run dev
```

### 5. Deploy pe Vercel
- Importă repo-ul pe vercel.com
- Adaugă variabilele de mediu
- Deploy automat la fiecare push pe main

## Structură
