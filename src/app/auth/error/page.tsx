'use client'
import React from 'react'

export default function AuthErrorPage() {
  const goHome = () => { window.location.href = '/' }
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080c10',
      color: '#e6edf3',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'sans-serif',
    }
  },
    React.createElement('h1', { style: { color: '#f85149' } }, 'Eroare la autentificare'),
    React.createElement('p', { style: { color: '#8b949e' } }, 'Ceva nu a mers cu Discord login.'),
    React.createElement('button', {
      onClick: goHome,
      style: {
        background: '#00d4aa',
        color: '#080c10',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }
    }, 'Inapoi acasa')
  )
}
