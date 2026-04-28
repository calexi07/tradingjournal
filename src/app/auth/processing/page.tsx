'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

function ProcessingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Se proceseaza login-ul...')

  useEffect(() => {
    async function processAuth() {
      // Incearca mai intai cu hash (implicit flow)
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (data?.session) {
            router.push('/dashboard')
            return
          }
          setStatus('Eroare: ' + error?.message)
          return
        }
      }

      // Incearca cu code (PKCE flow)
      const code = searchParams.get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (data?.session) {
          router.push('/dashboard')
          return
        }
        setStatus('Eroare exchange: ' + error?.message)
        return
      }

      // Verifica daca exista deja o sesiune activa
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
        return
      }

      setStatus('Eroare: nu s-a putut autentifica')
    }

    processAuth()
  }, [router, searchParams])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080c10',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ fontSize: '48px' }}>⏳</div>
      <h1 style={{ color: '#00d4aa', fontSize: '18px' }}>{status}</h1>
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div style={{ background: '#080c10', minHeight: '100vh' }} />}>
      <ProcessingContent />
    </Suspense>
  )
}
