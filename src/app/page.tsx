'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthErrorPage() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    
    if (hash && hash.includes('access_token')) {
      // Extrage token-urile din hash manual
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (data.session) {
            router.push('/dashboard')
          } else {
            console.error('Session error:', error)
          }
        })
      }
    }
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080c10',
      color: '#e6edf3',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ fontSize: '48px' }}>⏳</div>
      <h1 style={{ color: '#00d4aa' }}>Se proceseaza login-ul...</h1>
      <p style={{ color: '#8b949e' }}>Te redirectam automat.</p>
    </div>
  )
}
