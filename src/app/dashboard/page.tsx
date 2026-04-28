'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PHASES } from '@/lib/constants'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)

      const { data } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })
      setAccounts(data ?? [])
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

  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⬡</span>
          <span className="font-bold text-lg">Trading<span className="text-[#00d4aa]">Journal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e] text-sm">
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
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-[#8b949e] mt-1">Conturile tale de trading</p>
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
              return (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className="bg-[#0d1117] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-5 transition-all group"
                >
                  {/* Phase badge */}
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

                  {/* Account name */}
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-[#00d4aa] transition-colors">
                    {account.name}
                  </h3>

                  {/* Balance */}
                  <div className="text-2xl font-bold text-[#00d4aa] mb-4">
                    ${account.balance?.toLocaleString()}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#161b22] rounded-lg p-2">
                      <div className="text-xs text-[#8b949e]">Daily DD</div>
                      <div className="text-sm font-semibold text-[#f0c040]">{account.daily_drawdown}%</div>
                    </div>
                    <div className="bg-[#161b22] rounded-lg p-2">
                      <div className="text-xs text-[#8b949e]">Max DD</div>
                      <div className="text-sm font-semibold text-[#f85149]">{account.max_drawdown}%</div>
                    </div>
                    <div className="bg-[#161b22] rounded-lg p-2">
                      <div className="text-xs text-[#8b949e]">Target</div>
                      <div className="text-sm font-semibold text-[#00d4aa]">{account.profit_target}%</div>
                    </div>
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
