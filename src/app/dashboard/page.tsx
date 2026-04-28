'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PHASES } from '@/lib/constants'
import { computeAccountStats } from '@/lib/calculations'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)

      const { data: accs } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: trs } = await supabase
        .from('trades')
        .select('*')

      setAccounts(accs ?? [])
      setTrades(trs ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c10]">
        <div className="text-[#8b949e]">Se încarcă...</div>
      </div>
    )
  }

  // Global stats across all accounts
  const globalStats = computeAccountStats(trades, accounts.reduce((sum, a) => sum + a.initial_balance, 0))

  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⬡</span>
          <span className="font-bold text-lg">Trading<span className="text-[#00d4aa]">Journal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="text-sm text-[#8b949e] hover:text-white transition-colors">
            🏆 Leaderboard
          </Link>
          <span className="text-[#8b949e] text-sm hidden md:block">
            {user?.user_metadata?.full_name ?? user?.email}
          </span>
          <button
            onClick={signOut}
            className="text-sm text-[#8b949e] hover:text-white transition-colors"
          >
            Ieși
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Global Stats */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
              <div className="text-xs text-[#8b949e] mb-1">Total PnL</div>
              <div className={`text-xl font-bold ${globalStats.totalPnlUsd >= 0 ? 'text-[#00d4aa]' : 'text-[#f85149]'}`}>
                {globalStats.totalPnlUsd >= 0 ? '+' : ''}${globalStats.totalPnlUsd.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
              <div className="text-xs text-[#8b949e] mb-1">Total Trades</div>
              <div className="text-xl font-bold">{globalStats.totalTrades}</div>
            </div>
            <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
              <div className="text-xs text-[#8b949e] mb-1">Win Rate Global</div>
              <div className="text-xl font-bold">{globalStats.winRate}%</div>
            </div>
            <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
              <div className="text-xs text-[#8b949e] mb-1">Avg RR Global</div>
              <div className="text-xl font-bold">{globalStats.avgRR}R</div>
            </div>
          </div>
        )}

        {/* Accounts header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Conturile mele</h1>
            <p className="text-[#8b949e] mt-1 text-sm">{accounts.length} cont{accounts.length !== 1 ? 'uri' : ''} active</p>
          </div>
          <Link
            href="/accounts/new"
            className="bg-[#00d4aa] hover:bg-[#00b894] text-[#080c10] font-semibold py-2 px-5 rounded-xl transition-all text-sm"
          >
            + Cont nou
          </Link>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#21262d] rounded-2xl">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-lg font-semibold mb-2">Niciun cont încă</h2>
            <p className="text-[#8b949e] mb-6">Adaugă primul tău cont de prop trading</p>
            <Link
              href="/accounts/new"
              className="bg-[#00d4aa] hover:bg-[#00b894] text-[#080c10] font-semibold py-2 px-6 rounded-xl transition-all"
            >
              + Adaugă cont
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const phase = PHASES.find(p => p.value === account.phase)
              const accountTrades = trades.filter(t => t.account_id === account.id)
              const stats = computeAccountStats(accountTrades, account.initial_balance)
              const progressPct = Math.min(Math.max((stats.totalPnlPct / account.profit_target) * 100, 0), 100)

              return (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className="bg-[#0d1117] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-5 transition-all group block"
                >
                  {/* Phase + Broker */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{
                        background: `${phase?.color}20`,
                        color: phase?.color,
                      }}
                    >
                      {phase?.label}
                    </span>
                    <span className="text-[#8b949e] text-xs">{account.broker}</span>
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-[#00d4aa] transition-colors">
                    {account.name}
                  </h3>

                  {/* Balance */}
                  <div className="text-2xl font-bold text-[#00d4aa] mb-3">
                    ${stats.currentBalance.toLocaleString()}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-[#8b949e] mb-1">
                      <span>Progres target</span>
                      <span>{stats.totalPnlPct.toFixed(2)}% / {account.profit_target}%</span>
                    </div>
                    <div className="h-1.5 bg-[#161b22] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00d4aa] rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#161b22] rounded-lg p-2">
                      <div className="text-xs text-[#8b949e]">Trades</div>
                      <div className="text-sm font-semibold">{stats.totalTrades}</div>
                    </div>
                    <div className="bg-[#161b22] rounded-lg p-2">
                      <div className="text-xs text-[#8b949e]">Win%</div>
                      <div className="text-sm font-semibold">{stats.winRate}%</div>
                    </div>
                    <div className="bg-[#161b22] rounded-lg p-2">
                      <div className="text-xs text-[#8b949e]">Avg RR</div>
                      <div className="text-sm font-semibold">{stats.avgRR}R</div>
                    </div>
                  </div>

                  {/* Settings link */}
                  <div className="mt-3 text-right">
                    <span
                      onClick={e => { e.preventDefault(); window.location.href = `/accounts/${account.id}/settings` }}
                      className="text-xs text-[#6e7681] hover:text-[#8b949e] transition-colors"
                    >
                      ⚙️ Setări
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
