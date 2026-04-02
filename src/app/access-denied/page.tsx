'use client'

import Link from 'next/link'

export default function AccessDenied() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px'
    }}>
      <h1 style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '72px',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: '4px'
      }}>
        ДОСТУП ЗАПРЕЩЁН
      </h1>

      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '16px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        Этот сайт только для членов NoCap Crew.
        Убедись что ты на сервере фамы и имеешь нужную роль.
      </p>

      <Link href="/api/auth/signin" style={{
        border: '1px solid white',
        color: 'white',
        padding: '12px 32px',
        fontSize: '14px',
        letterSpacing: '2px',
        textDecoration: 'none',
        fontFamily: 'Bebas Neue, sans-serif'
      }}>
        ВОЙТИ ЧЕРЕЗ DISCORD
      </Link>
    </div>
  )
}
