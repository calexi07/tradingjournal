'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { computeAccountStats } from '@/lib/calculations'
import { PHASES } from '@/lib/constants'
import { EquityCurve } from '@/components/charts/EquityCurve'

export default function AccountPage() {
  const { id } = useParams()
  const router = useRouter()
  const [account, setAccount] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: acc } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single()

      const { data: tr } = await supabase
        .from('trades')
        .select('*')
        .eq('account_id', id)
        .order('opened_at', { ascending: true })

      setAccount(acc)
      setTrades(tr ?? [])
      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c10]">
        <div className="text-[#8b949e]">Se încarcă...</div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c10]">
        <div className="text-[#f85149]">Contul nu a fost găsit.</div>
      </div>
    )
  }

  const stats = computeAccountStats(trades, account.initial_balance)
  const phase = PHASES.find(p => p.value === account.phase)
  const progressPct = Math.min((stats.totalPnlPct / account.profit_target) * 100, 100)
  const ddUsedPct = Math.min((stats.maxDrawdownPct / account.max_drawdown) * 100, 100)

  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[#8b949e] hover:text-white transition-colors">
            ← Dashboard
          </Link>
          <div>
            <h1 className="font-bold text-lg">{account.name}</h1>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-lg"
              style={{ background: `${phase?.color}20`, color: phase?.color }}
            >
              {phase?.label} · {account.broker}
            </span>
          </div>
        </div>
        <Link
          href={`/accounts/${id}/trades/new`}
          className="bg-[#00d4aa] hover:bg-[#00b894] text-[#080c10] font-semibold py-2 px-5 rounded-xl transition-all text-sm"
        >
          + Trade nou
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <div className="text-xs text-[#8b949e] mb-1">Balanță curentă</div>
            <div className="text-2xl font-bold text-[#00d4aa]">
              ${stats.currentBalance.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <div className="text-xs text-[#8b949e] mb-1">Total PnL</div>
            <div className={`text-2xl font-bold ${stats.totalPnlUsd >= 0 ? 'text-[#00d4aa]' : 'text-[#f85149]'}`}>
              {stats.totalPnlUsd >= 0 ? '+' : ''}${stats.totalPnlUsd.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <div className="text-xs text-[#8b949e] mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
          </div>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <div className="text-xs text-[#8b949e] mb-1">Avg RR</div>
            <div className="text-2xl font-bold text-white">{stats.avgRR}R</div>
          </div>
        </div>

        {/* Second row stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <div className="text-xs text-[#8b949e] mb-1">Total Trades</div>
            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
          </div>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <div className="text-xs text-[#8b949e] mb-1">Profit Factor</div>
            <div className="text-2xl font-bold text-white">{stats.profitFactor}</div>
          </div>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <div className="text-xs text-[#8b949e] mb-1">Best Trade</div>
            <div className="text-2xl font-bold text-[#00d4aa]">+${stats.bestTrade}</div>
          </div>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <div className="text-xs text-[#8b949e] mb-1">Worst Trade</div>
            <div className="text-2xl font-bold text-[#f85149]">${stats.worstTrade}</div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profit progress */}
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-5">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#8b949e]">Progres spre target</span>
              <span className="text-[#00d4aa] font-semibold">
                {stats.totalPnlPct.toFixed(2)}% / {account.profit_target}%
              </span>
            </div>
            <div className="h-3 bg-[#161b22] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00d4aa] rounded-full transition-all"
                style={{ width: `${Math.max(progressPct, 0)}%` }}
              />
            </div>
          </div>

          {/* Drawdown */}
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-5">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#8b949e]">Drawdown utilizat</span>
              <span
                className="font-semibold"
                style={{ color: ddUsedPct > 75 ? '#f85149' : ddUsedPct > 50 ? '#f0c040' : '#00d4aa' }}
              >
                {stats.maxDrawdownPct.toFixed(2)}% / {account.max_drawdown}%
              </span>
            </div>
            <div className="h-3 bg-[#161b22] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${ddUsedPct}%`,
                  background: ddUsedPct > 75 ? '#f85149' : ddUsedPct > 50 ? '#f0c040' : '#00d4aa',
                }}
              />
            </div>
          </div>
        </div>

        {/* Equity Curve */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Equity Curve</h2>
          <EquityCurve
            trades={trades}
            initialBalance={account.initial_balance}
            maxDrawdown={account.max_drawdown}
          />
        </div>

        {/* Recent trades link */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Trade-uri recente</h2>
          <Link
            href={`/accounts/${id}/trades`}
            className="text-[#00d4aa] text-sm hover:underline"
          >
            Vezi toate →
          </Link>
        </div>

        {trades.slice(0, 5).map(trade => (
          <div
            key={trade.id}
            className="bg-[#0d1117] border border-[#21262d] rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                trade.direction === 'buy'
                  ? 'bg-[#00d4aa20] text-[#00d4aa]'
                  : 'bg-[#f8514920] text-[#f85149]'
              }`}>
                {trade.direction?.toUpperCase()}
              </span>
              <div>
                <div className="font-semibold">{trade.pair}</div>
                <div className="text-xs text-[#8b949e]">{trade.setup_type ?? '—'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${(trade.pnl_usd ?? 0) >= 0 ? 'text-[#00d4aa]' : 'text-[#f85149]'}`}>
                {(trade.pnl_usd ?? 0) >= 0 ? '+' : ''}${trade.pnl_usd ?? '—'}
              </div>
              <div className="text-xs text-[#8b949e]">{trade.rr_ratio ? `${trade.rr_ratio}R` : '—'}</div>
            </div>
          </div>
        ))}

        {trades.length === 0 && (
          <div className="text-center py-12 border border-dashed border-[#21262d] rounded-2xl">
            <div className="text-3xl mb-3">📝</div>
            <p className="text-[#8b949e]">Niciun trade încă. Adaugă primul tău trade!</p>
          </div>
        )}
      </main>
    </div>
  )
}
