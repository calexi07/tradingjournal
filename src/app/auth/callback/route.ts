import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Dacă vine cu eroare de la Supabase, redirectează la pagina de procesare
  if (error || !code) {
    return NextResponse.redirect(`${origin}/auth/processing${new URL(request.url).hash}`)
  }

  // Dacă vine cu cod, redirectează la pagina de procesare cu codul
  return NextResponse.redirect(`${origin}/auth/processing?code=${code}`)
}
