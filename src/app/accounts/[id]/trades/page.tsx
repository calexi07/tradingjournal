'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PAIRS, SESSIONS } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function TradesPage() {
  const { id } = useParams()
  const router = useRouter()
  const [account, setAccount] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPair, setFilterPair] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const [filterSession, setFilterSession] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: acc } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single()
      setAccount(acc)

      await fetchTrades()
      setLoading(false)
    }
    load()
  }, [id])

  async function fetchTrades() {
    let query = supabase
      .from('trades')
      .select('*')
      .eq('account_id', id)
      .order('opened_at', { ascending: false })

    if (filterPair) query = query.eq('pair', filterPair)
    if (filterResult) query = query.eq('result', filterResult)
    if (filterSession) query = query.eq('session', filterSession)

    const { data } = await query
    setTrades(data ?? [])
  }

  useEffect(() => {
    fetchTrades()
  }, [filterPair, filterResult, filterSession])

  async function deleteTrade(tradeId: string) {
    if (!confirm('Ștergi acest trade?')) return
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)
    if (error) {
      toast.error('Eroare la ștergere')
    } else {
      toast.success('Trade șters')
      fetchTrades()
    }
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
        <div className="flex items-center gap-4">
          <Link
            href={`/accounts/${id}`}
            className="text-[#8b949e] hover:text-white transition-colors"
          >
            ← Înapoi
          </Link>
          <div>
            <h1 className="font-bold text-lg">Trade-uri</h1>
            <p className="text-[#8b949e] text-sm">{account?.name}</p>
          </div>
        </div>
        <Link
          href={`/accounts/${id}/trades/new`}
          className="bg-[#00d4aa] hover:bg-[#00b894] text-[#080c10] font-semibold py-2 px-5 rounded-xl transition-all text-sm"
        >
          + Trade nou
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterPair}
            onChange={e => setFilterPair(e.target.value)}
            className="bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-2 text-sm text-white outline-none"
          >
            <option value="">Toate perechile</option>
            {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={filterResult}
            onChange={e => setFilterResult(e.target.value)}
            className="bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-2 text-sm text-white outline-none"
          >
            <option value="">Toate rezultatele</option>
            <option value="win">✅ Win</option>
            <option value="loss">❌ Loss</option>
            <option value="breakeven">➖ Breakeven</option>
          </select>

          <select
            value={filterSession}
            onChange={e => setFilterSession(e.target.value)}
            className="bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-2 text-sm text-white outline-none"
          >
            <option value="">Toate sesiunile</option>
            {SESSIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {(filterPair || filterResult || filterSession) && (
            <button
              onClick={() => {
                setFilterPair('')
                setFilterResult('')
                setFilterSession('')
              }}
              className="text-sm text-[#f85149] hover:underline"
            >
              ✕ Resetează filtre
            </button>
          )}
        </div>

        {/* Trades count */}
        <p className="text-[#8b949e] text-sm mb-4">
          {trades.length} trade-uri găsite
        </p>

        {/* Trades Table */}
        {trades.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#21262d] rounded-2xl">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-[#8b949e]">Niciun trade găsit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map(trade => (
              <div
                key={trade.id}
                className="bg-[#0d1117] border border-[#21262d] hover:border-[#30363d] rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4 transition-all"
              >
                {/* Direction */}
                <span
                  className="text-xs font-bold px-2 py-1 rounded-lg w-14 text-center"
                  style={{
                    background: trade.direction === 'buy' ? '#00d4aa20' : '#f8514920',
                    color: trade.direction === 'buy' ? '#00d4aa' : '#f85149',
                  }}
                >
                  {trade.direction?.toUpperCase()}
                </span>

                {/* Pair */}
                <div className="min-w-[80px]">
                  <div className="font-semibold">{trade.pair}</div>
                  <div className="text-xs text-[#8b949e]">
                    {trade.lot_size} lots
                  </div>
                </div>

                {/* Setup */}
                <div className="flex-1 min-w-[120px]">
                  <div className="text-sm text-[#8b949e]">
                    {trade.setup_type ?? '—'}
                  </div>
                  <div className="text-xs text-[#6e7681]">
                    {trade.session ?? '—'}
                  </div>
                </div>

                {/* Entry / Exit */}
                <div className="min-w-[100px]">
                  <div className="text-xs text-[#8b949e]">
                    Entry: <span className="text-white">{trade.entry_price}</span>
                  </div>
                  <div className="text-xs text-[#8b949e]">
                    Exit: <span className="text-white">{trade.exit_price ?? '—'}</span>
                  </div>
                </div>

                {/* Result */}
                <div className="min-w-[60px] text-center">
                  {trade.result === 'win' && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#00d4aa20] text-[#00d4aa]">WIN</span>
                  )}
                  {trade.result === 'loss' && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#f8514920] text-[#f85149]">LOSS</span>
                  )}
                  {trade.result === 'breakeven' && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#f0c04020] text-[#f0c040]">BE</span>
                  )}
                  {!trade.result && (
                    <span className="text-xs text-[#6e7681]">Deschis</span>
                  )}
                </div>

                {/* PnL */}
                <div className="min-w-[80px] text-right">
                  <div
                    className="font-bold"
                    style={{
                      color: (trade.pnl_usd ?? 0) >= 0 ? '#00d4aa' : '#f85149',
                    }}
                  >
                    {trade.pnl_usd !== null
                      ? `${trade.pnl_usd >= 0 ? '+' : ''}$${trade.pnl_usd}`
                      : '—'}
                  </div>
                  <div className="text-xs text-[#8b949e]">
                    {trade.rr_ratio ? `${trade.rr_ratio}R` : '—'}
                  </div>
                </div>

                {/* A+ badge */}
                {trade.is_aplus && (
                  <span className="text-xs">⭐</span>
                )}

                {/* Delete */}
                <button
                  onClick={() => deleteTrade(trade.id)}
                  className="text-[#6e7681] hover:text-[#f85149] transition-colors text-sm ml-auto"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
