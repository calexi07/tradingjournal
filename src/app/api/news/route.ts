import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch săptămâna curentă
    const thisWeek = await fetch(
      'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
      { next: { revalidate: 300 } } // Cache 5 minute
    )

    // Fetch săptămâna viitoare
    const nextWeek = await fetch(
      'https://nfs.faireconomy.media/ff_calendar_nextweek.json',
      { next: { revalidate: 300 } }
    )

    const thisWeekData = await thisWeek.json()
    const nextWeekData = await nextWeek.json()

    // Combinăm și filtrăm doar High Impact
    const allEvents = [...thisWeekData, ...nextWeekData]
    const highImpact = allEvents.filter(
      (event: any) => event.impact === 'High'
    )

    // Sortăm după dată
    highImpact.sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json({ events: highImpact })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
