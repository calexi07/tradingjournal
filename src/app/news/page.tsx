'use client'

import React from 'react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { ro } from 'date-fns/locale'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { ro } from 'date-fns/locale'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  category: string
}

interface CalendarEvent {
  title: string
  country: string
  date: string
  impact: string
  forecast: string
  previous: string
  actual: string
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭', NZD: '🇳🇿', CNY: '🇨🇳',
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (diffMin < 1) return 'acum'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return format(date, 'd MMM', { locale: ro })
}

function getTimeLabel(dateStr: string): { label: string; color: string } {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMin = (date.getTime() - now.getTime()) / 60000
  if (isPast(date) && Math.abs(diffMin) > 60) return { label: 'Trecut', color: '#6e7681' }
  if (diffMin >= -60 && diffMin <= 0) return { label: 'ACUM', color: '#f85149' }
  if (diffMin > 0 && diffMin <= 60) return { label: `în ${Math.round(diffMin)} min`, color: '#f0c040' }
  if (isToday(date)) return { label: 'Azi', color: '#00d4aa' }
  if (isTomorrow(date)) return { label: 'Mâine', color: '#58a6ff' }
  return { label: format(date, 'EEE d MMM', { locale: ro }), color: '#8b949e' }
}

// Detectează impactul știrii din titlu/descriere
function getNewsImpact(item: NewsItem): 'red' | 'orange' | 'none' {
  const text = (item.title + ' ' + item.description + ' ' + item.category).toLowerCase()
  const redKeywords = [
    'fomc', 'fed', 'federal reserve', 'powell', 'trump', 'nfp', 'non-farm',
    'cpi', 'inflation', 'gdp', 'rate decision', 'interest rate', 'recession',
    'war', 'crisis', 'emergency', 'breaking', 'urgent', 'flash', 'shock',
    'ecb', 'boe', 'bank of england', 'lagarde', 'bailey', 'jobs report',
    'unemployment', 'default', 'sanctions', 'tariff', 'trade war',
  ]
  const orangeKeywords = [
    'pmi', 'retail sales', 'housing', 'manufacturing', 'services',
    'consumer confidence', 'trade balance', 'current account',
    'earnings', 'revenue', 'forecast', 'outlook', 'guidance',
    'oil', 'gold', 'commodities', 'opec', 'energy',
  ]
  for (const kw of redKeywords) {
    if (text.includes(kw)) return 'red'
  }
  for (const kw of orangeKeywords) {
    if (text.includes(kw)) return 'orange'
  }
  return 'none'
}

export default function NewsPage() {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [calFilter, setCalFilter] = useState('ALL')
  const [countdown, setCountdown] = useState(120)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setLatestNews(data.latestNews ?? [])
      setCalendarEvents(data.calendarEvents ?? [])
      setLastUpdate(new Date())
      setCountdown(120)
    } catch (e) {
      console.error('Fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const refreshInterval = setInterval(fetchData, 120 * 1000)
    return () => clearInterval(refreshInterval)
  }, [fetchData])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev <= 1 ? 120 : prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Filtrează știrile — doar roșu și portocaliu
  const filteredNews = latestNews.filter(item => {
    const impact = getNewsImpact(item)
    return impact === 'red' || impact === 'orange'
  })

  const currencies = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF']
  const filteredCalendar = calFilter === 'ALL'
    ? calendarEvents
    : calendarEvents.filter(e => e.country === calFilter)

  // Grupează calendarul după zi
  const grouped = filteredCalendar.reduce((acc: Record<string, CalendarEvent[]>, event) => {
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
          <h1 className="font-bold text-lg">📰 Market News</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6e7681] font-mono">
            Refresh în {countdown}s
          </span>
          <span className="text-xs text-[#6e7681]">
            {format(lastUpdate, 'HH:mm:ss')}
          </span>
          <button
            onClick={fetchData}
            className="text-sm text-[#8b949e] hover:text-white bg-[#161b22] border border-[#21262d] px-3 py-1.5 rounded-lg transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">📰</div>
            <p className="text-[#8b949e]">Se încarcă știrile...</p>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── STÂNGA: Latest News ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg">Latest News</h2>
                  <span className="text-xs bg-[#161b22] border border-[#21262d] px-2 py-0.5 rounded-full text-[#8b949e]">
                    Financial Juice
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6e7681]">
                  <span className="w-2 h-2 rounded-full bg-[#f85149] inline-block"></span> High
                  <span className="w-2 h-2 rounded-full bg-[#f0a050] inline-block ml-2"></span> Medium
                </div>
              </div>

              {filteredNews.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-[#21262d] rounded-2xl">
                  <div className="text-3xl mb-3">📭</div>
                  <p className="text-[#8b949e] text-sm">Nicio știre importantă momentan.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNews.map((item, index) => {
                    const impact = getNewsImpact(item)
                    const isRed = impact === 'red'
                    const borderColor = isRed ? '#f8514940' : '#f0a05040'
                    const dotColor = isRed ? '#f85149' : '#f0a050'

                    return (
                      
                        key={index}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border px-4 py-3 transition-all hover:border-[#30363d] group"
                        style={{
                          background: '#0d1117',
                          borderColor: borderColor,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Impact dot */}
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: dotColor }}
                          />

                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <div className="text-sm font-medium text-white group-hover:text-[#00d4aa] transition-colors leading-snug">
                              {item.title}
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[#6e7681]">
                                Financial Juice
                              </span>
                              <span className="text-[#30363d]">·</span>
                              <span className="text-xs font-mono" style={{ color: dotColor }}>
                                {item.pubDate ? timeAgo(item.pubDate) : ''}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <span className="text-[#6e7681] group-hover:text-[#00d4aa] transition-colors text-sm flex-shrink-0">
                            →
                          </span>
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── DREAPTA: Calendar Economic ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg">🔴 High Impact Calendar</h2>
                </div>
              </div>

              {/* Currency filter */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {currencies.map(currency => (
                  <button
                    key={currency}
                    onClick={() => setCalFilter(currency)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                    style={{
                      borderColor: calFilter === currency ? '#f85149' : '#21262d',
                      background: calFilter === currency ? '#f8514920' : '#0d1117',
                      color: calFilter === currency ? '#f85149' : '#8b949e',
                    }}
                  >
                    {currency !== 'ALL' ? `${CURRENCY_FLAGS[currency] ?? ''} ` : ''}{currency}
                  </button>
                ))}
              </div>

              {/* Calendar events */}
              {filteredCalendar.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-[#21262d] rounded-2xl">
                  <div className="text-3xl mb-3">✅</div>
                  <p className="text-[#8b949e] text-sm">Niciun eveniment High Impact.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([day, dayEvents]) => {
                    const dayDate = new Date(day)
                    const isCurrentDay = isToday(dayDate)

                    return (
                      <div key={day}>
                        {/* Day label */}
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="text-xs font-bold px-2.5 py-1 rounded-lg"
                            style={{
                              background: isCurrentDay ? '#f8514920' : '#161b22',
                              color: isCurrentDay ? '#f85149' : '#8b949e',
                              border: `1px solid ${isCurrentDay ? '#f8514940' : '#21262d'}`,
                            }}
                          >
                            {isToday(dayDate)
                              ? '🔴 AZI'
                              : isTomorrow(dayDate)
                              ? '🟡 MÂINE'
                              : format(dayDate, 'EEEE, d MMM', { locale: ro }).toUpperCase()}
                          </div>
                          <div className="flex-1 h-px bg-[#21262d]" />
                        </div>

                        <div className="space-y-2">
                          {dayEvents.map((event, index) => {
                            const timeLabel = getTimeLabel(event.date)
                            const isNow = timeLabel.label === 'ACUM'
                            const isPastEvent = isPast(new Date(event.date))

                            return (
                              <div
                                key={index}
                                className="rounded-xl border px-4 py-3"
                                style={{
                                  background: isNow ? '#f8514908' : '#0d1117',
                                  borderColor: isNow ? '#f8514950' : '#21262d',
                                  opacity: isPastEvent && !isNow ? 0.6 : 1,
                                }}
                              >
                                <div className="flex items-center gap-3 flex-wrap">
                                  {/* Time */}
                                  <div className="min-w-[65px]">
                                    <div className="text-xs font-bold font-mono" style={{ color: timeLabel.color }}>
                                      {timeLabel.label}
                                    </div>
                                    <div className="text-xs text-[#6e7681] font-mono">
                                      {format(new Date(event.date), 'HH:mm')}
                                    </div>
                                  </div>

                                  {/* Flag + Currency */}
                                  <div className="flex items-center gap-1 min-w-[45px]">
                                    <span>{CURRENCY_FLAGS[event.country] ?? '🌐'}</span>
                                    <span className="text-xs font-bold">{event.country}</span>
                                  </div>

                                  {/* Title */}
                                  <div className="flex-1 min-w-[100px]">
                                    <div className="text-sm font-medium text-white leading-snug">
                                      {event.title}
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="flex gap-3 text-right">
                                    {event.forecast && (
                                      <div>
                                        <div className="text-xs text-[#6e7681]">Fcst</div>
                                        <div className="text-xs font-mono text-[#58a6ff]">{event.forecast}</div>
                                      </div>
                                    )}
                                    {event.previous && (
                                      <div>
                                        <div className="text-xs text-[#6e7681]">Prev</div>
                                        <div className="text-xs font-mono text-[#8b949e]">{event.previous}</div>
                                      </div>
                                    )}
                                    {event.actual && (
                                      <div>
                                        <div className="text-xs text-[#6e7681]">Act</div>
                                        <div
                                          className="text-xs font-mono font-bold"
                                          style={{
                                            color: parseFloat(event.actual) >= parseFloat(event.forecast)
                                              ? '#00d4aa'
                                              : '#f85149'
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
                </div>
              )}
            </div>

          </div>
        </main>
      )}
    </div>
  )
}
