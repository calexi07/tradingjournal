'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthErrorPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Se proceseaza...')

  useEffect(() => {
    async function processAuth() {
      const hash = window.location.hash
      console.log('Hash:', hash)
      
      if (!hash || !hash.includes('access_token')) {
        setStatus('Eroare: nu exista token in URL')
        return
      }

      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      
      console.log('Access token exists:', !!accessToken)
      console.log('Refresh token exists:', !!refreshToken)

      if (!accessToken || !refreshToken) {
        setStatus('Eroare: token lipsa')
        return
      }

      setStatus('Setez sesiunea...')
      
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      console.log('setSession result:', { user: data?.user?.email, error: error?.message })

      if (error) {
        setStatus('Eroare sesiune: ' + error.message)
        return
      }

      if (data?.session) {
        setStatus('Succes! Te redirectam...')
        setTimeout(() => router.push('/dashboard'), 500)
      } else {
        setStatus('Eroare: sesiune nula')
      }
    }

    processAuth()
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
      textAlign: 'center',
      padding: '20px',
    }}>
      <div style={{ fontSize: '48px' }}>⏳</div>
      <h1 style={{ color: '#00d4aa' }}>{status}</h1>
    </div>
  )
}
