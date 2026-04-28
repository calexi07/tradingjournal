'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PAIRS, SESSIONS, SETUP_TYPES, EMOTIONS } from '@/lib/constants'
import { calculatePnlUsd, calculateRR, determineResult } from '@/lib/calculations'
import toast from 'react-hot-toast'

export default function NewTradePage() {
  const { id } = useParams()
  const router = useRouter()
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    pair: 'XAUUSD',
    direction: 'buy',
    lot_size: '',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    exit_price: '',
    session: '',
    setup_type: '',
    emotion_before: '',
    emotion_after: '',
    notes: '',
    opened_at: new Date().toISOString().slice(0, 16),
    closed_at: '',
    is_aplus: false,
  })

  useEffect(() => {
    async function loadAccount() {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single()
      setAccount(data)
    }
    loadAccount()
  }, [id])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Live PnL preview
  const entry = parseFloat(form.entry_price)
  const exit = parseFloat(form.exit_price)
  const sl = parseFloat(form.stop_loss)
  const lot = parseFloat(form.lot_size)
  const dir = form.direction as 'buy' | 'sell'

  const previewPnl =
    entry && exit && lot && account
      ? calculatePnlUsd({
          entryPrice: entry,
          exitPrice: exit,
          direction: dir,
          lotSize: lot,
          accountBalance: account.balance,
        })
      : null

  const previewRR =
    entry && exit && sl
      ? calculateRR({
          entryPrice: entry,
          exitPrice: exit,
          stopLoss: sl,
          direction: dir,
          lotSize: lot || 0.01,
          accountBalance: account?.balance ?? 0,
        })
      : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const pnlUsd = previewPnl
    const pnlPct = pnlUsd && account ? (pnlUsd / account.balance) * 100 : null
    const rrRatio = previewRR
    const result = pnlUsd !== null ? determineResult(pnlUsd) : null
    const duration =
      form.opened_at && form.closed_at
        ? Math.round(
            (new Date(form.closed_at).getTime() - new Date(form.opened_at).getTime()) / 60000
          )
        : null

    const { error } = await supabase.from('trades').insert({
      account_id: id,
      user_id: user.id,
      pair: form.pair,
      direction: form.direction,
      lot_size: parseFloat(form.lot_size),
      entry_price: parseFloat(form.entry_price),
      stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
      take_profit: form.take_profit ? parseFloat(form.take_profit) : null,
      exit_price: form.exit_price ? parseFloat(form.exit_price) : null,
      session: form.session || null,
      setup_type: form.setup_type || null,
      emotion_before: form.emotion_before || null,
      emotion_after: form.emotion_after || null,
      notes: form.notes || null,
      opened_at: form.opened_at,
      closed_at: form.closed_at || null,
      pnl_usd: pnlUsd,
      pnl_pct: pnlPct,
      rr_ratio: rrRatio,
      result,
      duration_minutes: duration,
      is_aplus: form.is_aplus,
    })

    if (error) {
      toast.error('Eroare: ' + error.message)
    } else {
      toast.success('Trade salvat!')
      router.push(`/accounts/${id}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center gap-4">
        <Link
          href={`/accounts/${id}`}
          className="text-[#8b949e] hover:text-white transition-colors"
        >
          ← Înapoi
        </Link>
        <h1 className="font-bold text-lg">Trade nou</h1>
        {account && (
          <span className="text-[#8b949e] text-sm">· {account.name}</span>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Pair + Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Pereche *</label>
              <select
                name="pair"
                value={form.pair}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              >
                {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Direcție *</label>
              <div className="grid grid-cols-2 gap-2">
                {['buy', 'sell'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, direction: d }))}
                    className="py-3 rounded-xl border font-semibold text-sm transition-all"
                    style={{
                      borderColor: form.direction === d
                        ? d === 'buy' ? '#00d4aa' : '#f85149'
                        : '#21262d',
                      background: form.direction === d
                        ? d === 'buy' ? '#00d4aa20' : '#f8514920'
                        : '#0d1117',
                      color: form.direction === d
                        ? d === 'buy' ? '#00d4aa' : '#f85149'
                        : '#8b949e',
                    }}
                  >
                    {d === 'buy' ? '▲ BUY' : '▼ SELL'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lot size */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">Lot Size *</label>
            <input
              name="lot_size"
              type="number"
              step="0.01"
              value={form.lot_size}
              onChange={handleChange}
              placeholder="ex: 0.10"
              required
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
            />
          </div>

          {/* Price levels */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Entry *</label>
              <input
                name="entry_price"
                type="number"
                step="0.00001"
                value={form.entry_price}
                onChange={handleChange}
                required
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Stop Loss</label>
              <input
                name="stop_loss"
                type="number"
                step="0.00001"
                value={form.stop_loss}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#f85149] rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Take Profit</label>
              <input
                name="take_profit"
                type="number"
                step="0.00001"
                value={form.take_profit}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          {/* Exit price */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Exit Price <span className="text-[#6e7681]">(lasă gol dacă tradeul e deschis)</span>
            </label>
            <input
              name="exit_price"
              type="number"
              step="0.00001"
              value={form.exit_price}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
            />
          </div>

          {/* PnL Preview */}
          {previewPnl !== null && (
            <div
              className="rounded-xl border p-4 flex items-center justify-between"
              style={{
                borderColor: previewPnl >= 0 ? '#00d4aa40' : '#f8514940',
                background: previewPnl >= 0 ? '#00d4aa10' : '#f8514910',
              }}
            >
              <span className="text-sm text-[#8b949e]">PnL estimat</span>
              <div className="text-right">
                <div
                  className="text-xl font-bold"
                  style={{ color: previewPnl >= 0 ? '#00d4aa' : '#f85149' }}
                >
                  {previewPnl >= 0 ? '+' : ''}${previewPnl}
                </div>
                {previewRR !== null && (
                  <div className="text-sm text-[#8b949e]">{previewRR}R</div>
                )}
              </div>
            </div>
          )}

          {/* Session + Setup */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Sesiune</label>
              <select
                name="session"
                value={form.session}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              >
                <option value="">— Selectează —</option>
                {SESSIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Setup</label>
              <select
                name="setup_type"
                value={form.setup_type}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              >
                <option value="">— Selectează —</option>
                {SETUP_TYPES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Emotions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Emoție înainte</label>
              <select
                name="emotion_before"
                value={form.emotion_before}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              >
                <option value="">— Selectează —</option>
                {EMOTIONS.before.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Emoție după</label>
              <select
                name="emotion_after"
                value={form.emotion_after}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              >
                <option value="">— Selectează —</option>
                {EMOTIONS.after.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Deschis la *</label>
              <input
                name="opened_at"
                type="datetime-local"
                value={form.opened_at}
                onChange={handleChange}
                required
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Închis la</label>
              <input
                name="closed_at"
                type="datetime-local"
                value={form.closed_at}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">Note</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Ce ai observat? De ce ai intrat? Ce ai greșit?"
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none resize-none"
            />
          </div>

          {/* A+ Trade */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_aplus"
              checked={form.is_aplus}
              onChange={handleChange}
              className="w-5 h-5 accent-[#00d4aa]"
            />
            <span className="text-sm font-medium">
              ⭐ Marchează ca trade A+
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-[#080c10] font-bold py-4 rounded-xl transition-all text-lg"
          >
            {loading ? 'Se salvează...' : 'Salvează trade'}
          </button>
        </form>
      </main>
    </div>
  )
}
