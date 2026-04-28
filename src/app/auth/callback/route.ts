import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `https://tradingjournal-dzr5.vercel.app/auth/error`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `https://tradingjournal-dzr5.vercel.app/auth/error`
    )
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    'https://ukqyrudisnvstdlzsqsq.supabase.co',
    'sb_publishable_jw-BS8GquyOL2jIG_kvtYQ_G9kYqMng',
    {
      cookieOptions: {
        domain: 'tradingjournal-dzr5.vercel.app',
        path: '/',
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24 * 365,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (e) {
            console.error('Cookie error:', e)
          }
        },
      },
    }
  )

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  
  console.log('Exchange result:', JSON.stringify({ 
    user: data?.user?.email, 
    error: exchangeError?.message 
  }))

  if (exchangeError) {
    console.error('Exchange error:', exchangeError)
    return NextResponse.redirect(
      `https://tradingjournal-dzr5.vercel.app/auth/error`
    )
  }

  return NextResponse.redirect(
    `https://tradingjournal-dzr5.vercel.app/dashboard`
  )
}
