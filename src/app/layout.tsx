import type { Metadata } from 'next'
import { Sora, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Trading Journal — Prop Trader',
  description: 'Jurnalul profesional pentru traderi prop firm',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className="dark">
      <body
        className={`${sora.variable} ${jetbrainsMono.variable} font-sans bg-[#080c10] text-[#e6edf3] antialiased`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0d1117',
              color: '#e6edf3',
              border: '1px solid #21262d',
            },
          }}
        />
      </body>
    </html>
  )
}
