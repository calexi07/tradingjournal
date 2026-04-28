import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const supabaseUrl = 'https://ukqyrudisnvstdlzsqsq.supabase.co'
  const supabaseKey = 'sb_publishable_jw-BS8GquyOL2jIG_kvtYQ_G9kYqMng'

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ code }),
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const res = NextResponse.redirect(`${origin}/dashboard`)

  res.cookies.set('sb-access-token', data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })

  res.cookies.set('sb-refresh-token', data.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })

  return res
}
