import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const supabaseUrl = 'https://ukqyrudisnvstdlzsqsq.supabase.co'
  const supabaseKey = 'sb_publishable_jw-BS8GquyOL2jIG_kvtYQ_G9kYqMng'

  // PKCE exchange
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ 
      auth_code: code,
    }),
  })

  const data = await response.json()
  console.log('Supabase response:', JSON.stringify(data))

  if (!response.ok || data.error) {
    console.error('Error:', data)
    return NextResponse.redirect(`${origin}/auth/error?reason=${data.error ?? 'unknown'}`)
  }

  const res = NextResponse.redirect(`${origin}/dashboard`)

  const cookieName = `sb-ukqyrudisnvstdlzsqsq-auth-token`
  
  res.cookies.set(cookieName, JSON.stringify({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    expires_in: data.expires_in,
    token_type: 'bearer',
    user: data.user,
  }), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return res
}
