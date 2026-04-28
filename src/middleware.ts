import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Lasă auth callback să treacă ÎNTOTDEAUNA
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Protejează rutele principale
  const protectedPaths = ['/dashboard', '/accounts', '/trades', '/leaderboard']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected) {
    // Verifică cookie-ul de sesiune Supabase
    const hasSession = request.cookies.getAll().some(c => 
      c.name.includes('auth-token') || 
      c.name.includes('sb-') ||
      c.name.startsWith('sb-ukqyrudisnvstdlzsqsq')
    )

    if (!hasSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)).*)'],
}
