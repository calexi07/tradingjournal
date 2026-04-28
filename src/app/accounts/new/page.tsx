'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BROKERS, PHASES } from '@/lib/constants'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function NewAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    broker: 'The5ers',
    phase: 'challenge',
    balance: '',
    daily_drawdown: '5',
    max_drawdown: '10',
    profit_target: '8',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { error } = await supabase.from('accounts').insert({
      user_id: user.id,
      name: form.name,
      broker: form.broker,
      phase: form.phase,
      balance: parseFloat(form.balance),
      initial_balance: parseFloat(form.balance),
      daily_drawdown: parseFloat(form.daily_drawdown),
      max_drawdown: parseFloat(form.max_drawdown),
      profit_target: parseFloat(form.profit_target),
      start_date: form.start_date,
      notes: form.notes,
    })

    if (error) {
      toast.error('Eroare: ' + error.message)
    } else {
      toast.success('Cont creat cu succes!')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-[#8b949e] hover:text-white transition-colors">
          ← Înapoi
        </Link>
        <h1 className="font-bold text-lg">Cont nou de trading</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nume cont */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Nume cont *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ex: The5ers Challenge #1"
              required
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none transition-colors"
            />
          </div>

          {/* Broker */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Broker / Firmă *
            </label>
            <select
              name="broker"
              value={form.broker}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none transition-colors"
            >
              {BROKERS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Faza */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Faza *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PHASES.map(phase => (
                <button
                  key={phase.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, phase: phase.value }))}
                  className="py-3 px-2 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    borderColor: form.phase === phase.value ? phase.color : '#21262d',
                    background: form.phase === phase.value ? `${phase.color}15` : '#0d1117',
                    color: form.phase === phase.value ? phase.color : '#8b949e',
                  }}
                >
                  {phase.label}
                </button>
              ))}
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Balanță cont (USD) *
            </label>
            <input
              name="balance"
              type="number"
              value={form.balance}
              onChange={handleChange}
              placeholder="ex: 100000"
              required
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none transition-colors"
            />
          </div>

          {/* Drawdown & Target */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">
                Daily DD %
              </label>
              <input
                name="daily_drawdown"
                type="number"
                step="0.1"
                value={form.daily_drawdown}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">
                Max DD %
              </label>
              <input
                name="max_drawdown"
                type="number"
                step="0.1"
                value={form.max_drawdown}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">
                Target %
              </label>
              <input
                name="profit_target"
                type="number"
                step="0.1"
                value={form.profit_target}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none transition-colors"
              />
            </div>
          </div>

          {/* Data start */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Data start
            </label>
            <input
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none transition-colors"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Note (opțional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Observații despre acest cont..."
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-[#080c10] font-bold py-4 rounded-xl transition-all text-lg"
          >
            {loading ? 'Se salvează...' : 'Creează contul'}
          </button>
        </form>
      </main>
    </div>
  )
}
