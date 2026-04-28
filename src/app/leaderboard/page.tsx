'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(50)
      setLeaders(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[#8b949e] hover:text-white transition-colors">
            ← Dashboard
          </Link>
          <h1 className="font-bold text-lg">🏆 Leaderboard</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-[#8b949e] mb-6 text-sm">
          Top traderi după PnL total. Datele sunt actualizate în timp real.
        </p>

        {loading ? (
          <div className="text-center py-20 text-[#8b949e]">Se încarcă...</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#21262d] rounded-2xl">
            <div className="text-4xl mb-4">🏆</div>
            <p className="text-[#8b949e]">Nimeni pe leaderboard încă. Fii primul!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, index) => (
              <div
                key={leader.username}
                className="bg-[#0d1117] border border-[#21262d] rounded-2xl px-5 py-4 flex items-center gap-4"
              >
                {/* Rank */}
                <div
                  className="text-lg font-bold w-8 text-center flex-shrink-0"
                  style={{
                    color: index === 0 ? '#f0c040' : index === 1 ? '#8b949e' : index === 2 ? '#cd7f32' : '#6e7681'
                  }}
                >
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>

                {/* Avatar */}
                {leader.avatar_url ? (
                  <img
                    src={leader.avatar_url}
                    alt={leader.username}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#161b22] flex items-center justify-center text-lg flex-shrink-0">
                    👤
                  </div>
                )}

                {/* Username */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{leader.username}</div>
                  <div className="text-xs text-[#8b949e]">
                    {leader.total_trades} trades · {leader.account_count} conturi
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-[#8b949e] text-xs mb-1">Win Rate</div>
                    <div className="font-semibold">{leader.win_rate_pct ?? 0}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#8b949e] text-xs mb-1">Avg RR</div>
                    <div className="font-semibold">{leader.avg_rr ?? 0}R</div>
                  </div>
                </div>

                {/* PnL */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-bold text-lg"
                    style={{
                      color: (leader.total_pnl_usd ?? 0) >= 0 ? '#00d4aa' : '#f85149'
                    }}
                  >
                    {(leader.total_pnl_usd ?? 0) >= 0 ? '+' : ''}
                    ${Number(leader.total_pnl_usd ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-[#8b949e]">Total PnL</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
