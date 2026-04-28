'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function TradeDetailPage() {
  const { id, tradeId } = useParams()
  const router = useRouter()
  const [trade, setTrade] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single()
      setTrade(data)
      setLoading(false)
    }
    load()
  }, [tradeId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c10]">
        <div className="text-[#8b949e]">Se încarcă...</div>
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c10]">
        <div className="text-[#f85149]">Trade-ul nu a fost găsit.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080c10]">
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center gap-4">
        <Link
          href={`/accounts/${id}/trades`}
          className="text-[#8b949e] hover:text-white transition-colors"
        >
          ← Înapoi
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg">{trade.pair}</h1>
          <span
            className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{
              background: trade.direction === 'buy' ? '#00d4aa20' : '#f8514920',
              color: trade.direction === 'buy' ? '#00d4aa' : '#f85149',
            }}
          >
            {trade.direction?.toUpperCase()}
          </span>
          {trade.is_aplus && <span>⭐ A+</span>}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-4">

        {/* PnL */}
        <div
          className="rounded-2xl border p-6 text-center"
          style={{
            borderColor: (trade.pnl_usd ?? 0) >= 0 ? '#00d4aa40' : '#f8514940',
            background: (trade.pnl_usd ?? 0) >= 0 ? '#00d4aa10' : '#f8514910',
          }}
        >
          <div className="text-[#8b949e] text-sm mb-1">PnL Realizat</div>
          <div
            className="text-4xl font-bold"
            style={{ color: (trade.pnl_usd ?? 0) >= 0 ? '#00d4aa' : '#f85149' }}
          >
            {(trade.pnl_usd ?? 0) >= 0 ? '+' : ''}${trade.pnl_usd ?? '—'}
          </div>
          {trade.rr_ratio && (
            <div className="text-[#8b949e] mt-1">{trade.rr_ratio}R</div>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Entry', value: trade.entry_price },
            { label: 'Exit', value: trade.exit_price ?? '—' },
            { label: 'Stop Loss', value: trade.stop_loss ?? '—' },
            { label: 'Take Profit', value: trade.take_profit ?? '—' },
            { label: 'Lot Size', value: trade.lot_size },
            { label: 'Durată', value: trade.duration_minutes ? `${trade.duration_minutes} min` : '—' },
            { label: 'Sesiune', value: trade.session ?? '—' },
            { label: 'Setup', value: trade.setup_type ?? '—' },
            { label: 'Emoție înainte', value: trade.emotion_before ?? '—' },
            { label: 'Emoție după', value: trade.emotion_after ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
              <div className="text-xs text-[#8b949e] mb-1">{label}</div>
              <div className="font-semibold">{value}</div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {trade.notes && (
          <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
            <div className="text-xs text-[#8b949e] mb-2">Note</div>
            <div className="text-sm leading-relaxed">{trade.notes}</div>
          </div>
        )}

        {/* Screenshot */}
        {trade.screenshot_url && (
          <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
            <div className="text-xs text-[#8b949e] mb-2">Screenshot</div>
            <img
              src={trade.screenshot_url}
              alt="Trade screenshot"
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Delete */}
        <button
          onClick={async () => {
            if (!confirm('Ștergi acest trade?')) return
            await supabase.from('trades').delete().eq('id', tradeId)
            router.push(`/accounts/${id}/trades`)
          }}
          className="w-full bg-[#f8514920] hover:bg-[#f8514940] text-[#f85149] font-semibold py-3 rounded-xl transition-all text-sm"
        >
          🗑 Șterge trade-ul
        </button>
      </main>
    </div>
  )
}
