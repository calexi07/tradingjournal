import { NextResponse } from 'next/server'

// Parsează RSS XML manual fără librării externe
function parseRSS(xml: string) {
  const items: any[] = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

  for (const match of itemMatches) {
    const content = match[1]

    const title = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? content.match(/<title>(.*?)<\/title>/)?.[1]
      ?? ''

    const link = content.match(/<link>(.*?)<\/link>/)?.[1]
      ?? content.match(/<guid>(.*?)<\/guid>/)?.[1]
      ?? ''

    const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''

    const description = content.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
      ?? content.match(/<description>(.*?)<\/description>/)?.[1]
      ?? ''

    // Financial Juice folosește categorii pentru impact
    const category = content.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/)?.[1]
      ?? content.match(/<category>(.*?)<\/category>/)?.[1]
      ?? ''

    if (title) {
      items.push({ title, link, pubDate, description, category })
    }
  }

  return items
}

export async function GET() {
  try {
    // Financial Juice RSS feed
    const response = await fetch(
      'https://www.financialjuice.com/feed.ashx?xy=rss',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        next: { revalidate: 120 }, // Cache 2 minute
      }
    )

    let latestNews: any[] = []

    if (response.ok) {
      const xml = await response.text()
      const items = parseRSS(xml)
      latestNews = items.slice(0, 30) // Ultimele 30 știri
    }

    // Calendar economic Forex Factory
    let calendarEvents: any[] = []
    try {
      const calThis = await fetch(
        'https://nfs.faireconomy.media/ff_calendar_thisweek.json?version=1',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.forexfactory.com/',
          },
          next: { revalidate: 300 },
        }
      )
      const calNext = await fetch(
        'https://nfs.faireconomy.media/ff_calendar_nextweek.json?version=1',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.forexfactory.com/',
          },
          next: { revalidate: 300 },
        }
      )

      if (calThis.ok && calNext.ok) {
        const thisWeek = await calThis.json()
        const nextWeek = await calNext.json()
        const all = [...thisWeek, ...nextWeek]
        calendarEvents = all
          .filter((e: any) => e.impact === 'High')
          .sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
      }
    } catch (e) {
      console.error('Calendar fetch error:', e)
    }

    return NextResponse.json({
      latestNews,
      calendarEvents,
    })
  } catch (error: any) {
    console.error('News API error:', error.message)
    return NextResponse.json({
      latestNews: [],
      calendarEvents: [],
      error: error.message,
    })
  }
}
