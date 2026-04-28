'use client'
import React, { useEffect, useState, useCallback } from 'react'
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

const FLAGS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭', NZD: '🇳🇿',
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 1) return 'acum'
  if (diff < 60) return `${diff} min ago`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h}h ago`
  return format(new Date(dateStr), 'd MMM', { locale: ro })
}

function getTimeLabel(dateStr: string): { label: string; color: string } {
  const date = new Date(dateStr)
  const diffMin = (date.getTime() - Date.now()) / 60000
  if (isPast(date) && Math.abs(diffMin) > 60) return { label: 'Trecut', color: '#6e7681' }
  if (diffMin >= -60 && diffMin <= 0) return { label: 'ACUM', color: '#f85149' }
  if (diffMin > 0 && diffMin <= 60) return { label: `in ${Math.round(diffMin)} min`, color: '#f0c040' }
  if (isToday(date)) return { label: 'Azi', color: '#00d4aa' }
  if (isTomorrow(date)) return { label: 'Maine', color: '#58a6ff' }
  return { label: format(date, 'EEE d MMM', { locale: ro }), color: '#8b949e' }
}

function getImpact(item: NewsItem): 'red' | 'orange' | 'none' {
  const text = (item.title + ' ' + item.description).toLowerCase()
  const red = ['fomc','fed','federal reserve','powell','trump','nfp','non-farm','cpi','inflation','gdp','rate decision','interest rate','recession','war','crisis','breaking','flash','shock','ecb','boe','lagarde','bailey','unemployment','default','sanctions','tariff']
  const orange = ['pmi','retail sales','housing','manufacturing','consumer confidence','trade balance','earnings','oil','gold','opec']
  for (const k of red) if (text.includes(k)) return 'red'
  for (const k of orange) if (text.includes(k)) return 'orange'
  return 'none'
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [calendar, setCalendar] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [calFilter, setCalFilter] = useState('ALL')
  const [countdown, setCountdown] = useState(120)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setNews(data.latestNews ?? [])
      setCalendar(data.calendarEvents ?? [])
      setLastUpdate(new Date())
      setCountdown(120)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const r = setInterval(fetchData, 120000)
    return () => clearInterval(r)
  }, [fetchData])

  useEffect(() => {
    const t = setInterval(() => setCountdown(p => p <= 1 ? 120 : p - 1), 1000)
    return () => clearInterval(t)
  }, [])

  const filteredNews = news.filter(i => {
    const imp = getImpact(i)
    return imp === 'red' || imp === 'orange'
  })

  const currencies = ['ALL','USD','EUR','GBP','JPY','CAD','AUD','CHF']
  const filteredCal = calFilter === 'ALL' ? calendar : calendar.filter(e => e.country === calFilter)

  const grouped = filteredCal.reduce((acc: Record<string, CalendarEvent[]>, e) => {
    const day = format(new Date(e.date), 'yyyy-MM-dd')
    if (!acc[day]) acc[day] = []
    acc[day].push(e)
    return acc
  }, {})

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>📰</div>
        <p style={{ color: '#8b949e' }}>Se incarca stirile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080c10]">
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[#8b949e] hover:text-white transition-colors">
            Dashboard
          </Link>
          <h1 className="font-bold text-lg">📰 Market News</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6e7681] font-mono">Refresh in {countdown}s</span>
          <span className="text-xs text-[#6e7681]">{format(lastUpdate, 'HH:mm:ss')}</span>
          <button onClick={fetchData} className="text-sm text-[#8b949e] hover:text-white bg-[#161b22] border border-[#21262d] px-3 py-1.5 rounded-lg">
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-lg">Latest News</h2>
            <span className="text-xs bg-[#161b22] border border-[#21262d] px-2 py-0.5 rounded-full text-[#8b949e]">Financial Juice</span>
          </div>
          {filteredNews.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#21262d] rounded-2xl">
              <p className="text-[#8b949e] text-sm">Nicio stire importanta momentan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNews.map((item, i) => {
                const imp = getImpact(item)
                const dot = imp === 'red' ? '#f85149' : '#f0a050'
                const border = imp === 'red' ? '#f8514940' : '#f0a05040'
                return (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="block rounded-xl border px-4 py-3 hover:border-[#30363d] group transition-all"
                    style={{ background: '#0d1117', borderColor: border }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: dot }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white group-hover:text-[#00d4aa] transition-colors leading-snug">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#6e7681]">Financial Juice</span>
                          <span className="text-[#30363d]">·</span>
                          <span className="text-xs font-mono" style={{ color: dot }}>
                            {item.pubDate ? timeAgo(item.pubDate) : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-[#6e7681] group-hover:text-[#00d4aa] transition-colors text-sm">→</span>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-lg">🔴 High Impact Calendar</h2>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {currencies.map(c => (
              <button key={c} onClick={() => setCalFilter(c)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                style={{
                  borderColor: calFilter === c ? '#f85149' : '#21262d',
                  background: calFilter === c ? '#f8514920' : '#0d1117',
                  color: calFilter === c ? '#f85149' : '#8b949e',
                }}
              >
                {c !== 'ALL' ? `${FLAGS[c] ?? ''} ` : ''}{c}
              </button>
            ))}
          </div>

          {filteredCal.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#21262d] rounded-2xl">
              <p className="text-[#8b949e] text-sm">Niciun eveniment High Impact.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([day, events]) => {
                const dayDate = new Date(day)
                const today = isToday(dayDate)
                return (
                  <div key={day}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{
                          background: today ? '#f8514920' : '#161b22',
                          color: today ? '#f85149' : '#8b949e',
                          border: `1px solid ${today ? '#f8514940' : '#21262d'}`,
                        }}
                      >
                        {today ? '🔴 AZI' : isTomorrow(dayDate) ? '🟡 MAINE' : format(dayDate, 'EEEE, d MMM', { locale: ro }).toUpperCase()}
                      </div>
                      <div className="flex-1 h-px bg-[#21262d]" />
                    </div>
                    <div className="space-y-2">
                      {events.map((event, i) => {
                        const tl = getTimeLabel(event.date)
                        const isNow = tl.label === 'ACUM'
                        return (
                          <div key={i} className="rounded-xl border px-4 py-3"
                            style={{
                              background: isNow ? '#f8514908' : '#0d1117',
                              borderColor: isNow ? '#f8514950' : '#21262d',
                              opacity: isPast(new Date(event.date)) && !isNow ? 0.6 : 1,
                            }}
                          >
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="min-w-[65px]">
                                <div className="text-xs font-bold font-mono" style={{ color: tl.color }}>{tl.label}</div>
                                <div className="text-xs text-[#6e7681] font-mono">{format(new Date(event.date), 'HH:mm')}</div>
                              </div>
                              <div className="flex items-center gap-1 min-w-[45px]">
                                <span>{FLAGS[event.country] ?? '🌐'}</span>
                                <span className="text-xs font-bold">{event.country}</span>
                              </div>
                              <div className="flex-1 min-w-[100px]">
                                <div className="text-sm font-medium text-white leading-snug">{event.title}</div>
                              </div>
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
                                    <div className="text-xs font-mono font-bold"
                                      style={{ color: parseFloat(event.actual) >= parseFloat(event.forecast) ? '#00d4aa' : '#f85149' }}
                                    >{event.actual}</div>
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

      </main>
    </div>
  )
}
