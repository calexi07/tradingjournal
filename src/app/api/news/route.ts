import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      'https://nfs.faireconomy.media/ff_calendar_thisweek.json?version=1',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.forexfactory.com/',
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()

    const highImpact = data
      .filter((event: any) => event.impact === 'High')
      .sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

    return NextResponse.json({ events: highImpact })
  } catch (error: any) {
    console.error('News fetch error:', error.message)

    // Returnează date mock dacă API-ul nu merge
    return NextResponse.json({
      events: [
        {
          title: 'Non-Farm Payrolls',
          country: 'USD',
          date: new Date(Date.now() + 86400000).toISOString(),
          impact: 'High',
          forecast: '180K',
          previous: '175K',
          actual: '',
        },
        {
          title: 'FOMC Meeting Minutes',
          country: 'USD',
          date: new Date(Date.now() + 172800000).toISOString(),
          impact: 'High',
          forecast: '',
          previous: '',
          actual: '',
        },
        {
          title: 'CPI m/m',
          country: 'USD',
          date: new Date(Date.now() + 259200000).toISOString(),
          impact: 'High',
          forecast: '0.3%',
          previous: '0.4%',
          actual: '',
        },
      ],
      source: 'mock',
    })
  }
}
