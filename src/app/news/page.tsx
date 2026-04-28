'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format, isToday, isTomorrow, isPast, addMinutes } from 'date-fns'
import { ro } from 'date-fns/locale'

interface NewsEvent {
  title: string
  country: string
  date: string
  impact: string
  forecast: string
  previous: string
  actual: string
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  CHF: '🇨🇭',
  NZD: '🇳🇿',
  CNY: '🇨🇳',
}

function getTimeLabel(dateStr: string): { label: string; color: string } {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMin = (date.getTime() - now.getTime()) / 60000

  if (isPast(date) && Math.abs(diffMin) > 60) {
    return { label: 'Trecut', color: '#6e7681' }
  }
  if (diffMin >= -60 && diffMin <= 0) {
    return { label: 'ACUM', color: '#f85149' }
  }
  if (diffMin > 0 && diffMin <= 60) {
    return { label: `în ${Math.round(diffMin)} min`, color: '#f0c040' }
  }
  if (isToday(date)) {
    return { label: 'Azi', color: '#00d4aa' }
  }
  if (isTomorrow(date)) {
    return { label: 'Mâine', color: '#58a6ff' }
  }
  return { label: format(date, 'EEE d MMM', { locale: ro }), color: '#8b949e' }
}

export default function NewsPage() {
  const [events, setEvents] = useState<NewsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('ALL')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  async function fetchNews() {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setEvents(data.events)
      setLastUpdate(new Date())
      setError(null)
    } catch (err: any) {
      setError('Nu s-au putut încărca știrile. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    // Auto-refresh la fiecare 5 minute
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const currencies = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'NZD']

  const filtered = filter === 'ALL'
    ? events
    : events.filter(e => e.country === filter)

  // Grupează după zi
  const grouped = filtered.reduce((acc: Record<string, NewsEvent[]>, event) => {
    const day = format(new Date(event.date), 'yyyy-MM-dd')
    if (!acc[day]) acc[day] = []
    acc[day].push(event)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[#8b949e] hover:text-white transition-colors">
            ← Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔴</span>
            <h1 className="font-bold text-lg">High Impact News</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6e7681]">
            Actualizat: {format(lastUpdate, 'HH:mm')}
          </span>
          <button
            onClick={fetchNews}
            className="text-sm text-[#8b949e] hover:text-white transition-colors bg-[#161b22] border border-[#21262d] px-3 py-1.5 rounded-lg"
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Subtitle */}
        <p className="text-[#8b949e] text-sm mb-6">
          Doar evenimentele <span className="text-[#f85149] font-semibold">High Impact</span> — NFP, CPI, FOMC, Fed, GDP și altele. Actualizare automată la 5 minute.
        </p>

        {/* Currency Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {currencies.map(currency => (
            <button
              key={currency}
              onClick={() => setFilter(currency)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border"
              style={{
                borderColor: filter === currency ? '#f85149' : '#21262d',
                background: filter === currency ? '#f8514920' : '#0d1117',
                color: filter === currency ? '#f85149' : '#8b949e',
              }}
            >
              {currency !== 'ALL' ? `${CURRENCY_FLAGS[currency] ?? ''} ` : ''}{currency}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">📰</div>
            <p className="text-[#8b949e]">Se încarcă știrile...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#f8514910] border border-[#f8514930] rounded-xl p-4 text-[#f85149] text-sm">
            {error}
          </div>
        )}

        {/* No events */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[#21262d] rounded-2xl">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-[#8b949e]">Niciun eveniment High Impact această săptămână pentru {filter}.</p>
          </div>
        )}

        {/* Events grouped by day */}
        {!loading && Object.entries(grouped).map(([day, dayEvents]) => {
          const dayDate = new Date(day)
          const isCurrentDay = isToday(dayDate)

          return (
            <div key={day} className="mb-8">
              {/* Day header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="text-sm font-bold px-3 py-1 rounded-lg"
                  style={{
                    background: isCurrentDay ? '#f8514920' : '#161b22',
                    color: isCurrentDay ? '#f85149' : '#8b949e',
                    border: `1px solid ${isCurrentDay ? '#f8514940' : '#21262d'}`,
                  }}
                >
                  {isToday(dayDate) ? '🔴 OGGI' : format(dayDate, 'EEEE, d MMMM yyyy', { locale: ro })}
                </div>
                <div className="flex-1 h-px bg-[#21262d]" />
                <span className="text-xs text-[#6e7681]">{dayEvents.length} evenimente</span>
              </div>

              {/* Events */}
              <div className="space-y-3">
                {dayEvents.map((event, index) => {
                  const timeLabel = getTimeLabel(event.date)
                  const isUpcoming = !isPast(new Date(event.date))
                  const isNow = timeLabel.label === 'ACUM'

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border px-5 py-4 transition-all"
                      style={{
                        background: isNow ? '#f8514908' : '#0d1117',
                        borderColor: isNow ? '#f8514950' : '#21262d',
                      }}
                    >
                      <div className="flex items-center gap-4 flex-wrap">

                        {/* Time */}
                        <div className="min-w-[80px]">
                          <div className="font-mono text-sm font-bold" style={{ color: timeLabel.color }}>
                            {timeLabel.label}
                          </div>
                          <div className="text-xs text-[#6e7681] font-mono">
                            {format(new Date(event.date), 'HH:mm')}
                          </div>
                        </div>

                        {/* Country */}
                        <div className="flex items-center gap-2 min-w-[60px]">
                          <span className="text-lg">
                            {CURRENCY_FLAGS[event.country] ?? '🌐'}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {event.country}
                          </span>
                        </div>

                        {/* Impact badge */}
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#f8514920] text-[#f85149] border border-[#f8514930]">
                          🔴 HIGH
                        </span>

                        {/* Title */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="font-semibold text-white">
                            {event.title}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 text-right">
                          {event.forecast && (
                            <div>
                              <div className="text-xs text-[#6e7681]">Forecast</div>
                              <div className="text-sm font-mono text-[#58a6ff]">{event.forecast}</div>
                            </div>
                          )}
                          {event.previous && (
                            <div>
                              <div className="text-xs text-[#6e7681]">Previous</div>
                              <div className="text-sm font-mono text-[#8b949e]">{event.previous}</div>
                            </div>
                          )}
                          {event.actual && (
                            <div>
                              <div className="text-xs text-[#6e7681]">Actual</div>
                              <div
                                className="text-sm font-mono font-bold"
                                style={{
                                  color: event.actual > event.forecast ? '#00d4aa' : '#f85149'
                                }}
                              >
                                {event.actual}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
