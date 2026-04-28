'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthErrorPage() {
  const router = useRouter()

  useEffect(() => {
    // Verifică dacă există token în URL hash (implicit flow)
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      // Supabase va procesa automat hash-ul
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.push('/dashboard')
        }
      })
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
      <h1 style={{ color: '#00d4aa' }}>Se procesează login-ul...</h1>
      <p style={{ color: '#8b949e' }}>Te redirectăm automat.</p>
    </div>
  )
}
