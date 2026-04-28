'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BROKERS, PHASES } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function AccountSettingsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    broker: '',
    phase: '',
    balance: '',
    daily_drawdown: '',
    max_drawdown: '',
    profit_target: '',
    notes: '',
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setForm({
          name: data.name,
          broker: data.broker,
          phase: data.phase,
          balance: data.balance?.toString(),
          daily_drawdown: data.daily_drawdown?.toString(),
          max_drawdown: data.max_drawdown?.toString(),
          profit_target: data.profit_target?.toString(),
          notes: data.notes ?? '',
        })
      }
    }
    load()
  }, [id])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('accounts')
      .update({
        name: form.name,
        broker: form.broker,
        phase: form.phase,
        balance: parseFloat(form.balance),
        daily_drawdown: parseFloat(form.daily_drawdown),
        max_drawdown: parseFloat(form.max_drawdown),
        profit_target: parseFloat(form.profit_target),
        notes: form.notes,
      })
      .eq('id', id)

    if (error) {
      toast.error('Eroare: ' + error.message)
    } else {
      toast.success('Cont actualizat!')
      router.push(`/accounts/${id}`)
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Ești sigur? Vei șterge contul și TOATE trade-urile din el. Această acțiune nu poate fi anulată!')) return
    setDeleting(true)

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Eroare la ștergere')
      setDeleting(false)
    } else {
      toast.success('Cont șters')
      router.push('/dashboard')
    }
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
        <h1 className="font-bold text-lg">Setări cont</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-8">
        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-5">
          <h2 className="font-semibold text-lg">Editează contul</h2>

          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">Nume cont</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">Broker</label>
            <select
              name="broker"
              value={form.broker}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
            >
              {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">Faza</label>
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

          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">Balanță curentă (USD)</label>
            <input
              name="balance"
              type="number"
              value={form.balance}
              onChange={handleChange}
              required
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Daily DD %</label>
              <input
                name="daily_drawdown"
                type="number"
                step="0.1"
                value={form.daily_drawdown}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Max DD %</label>
              <input
                name="max_drawdown"
                type="number"
                step="0.1"
                value={form.max_drawdown}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">Target %</label>
              <input
                name="profit_target"
                type="number"
                step="0.1"
                value={form.profit_target}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">Note</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#00d4aa] rounded-xl px-4 py-3 text-white outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-[#080c10] font-bold py-4 rounded-xl transition-all"
          >
            {loading ? 'Se salvează...' : 'Salvează modificările'}
          </button>
        </form>

        {/* Danger Zone */}
        <div className="border border-[#f8514930] rounded-2xl p-5">
          <h2 className="font-semibold text-[#f85149] mb-2">Zonă periculoasă</h2>
          <p className="text-[#8b949e] text-sm mb-4">
            Ștergerea contului va șterge și toate trade-urile asociate. Această acțiune nu poate fi anulată.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-[#f8514920] hover:bg-[#f8514940] text-[#f85149] font-semibold py-3 px-6 rounded-xl transition-all text-sm disabled:opacity-50"
          >
            {deleting ? 'Se șterge...' : '🗑 Șterge contul'}
          </button>
        </div>
      </main>
    </div>
  )
}
