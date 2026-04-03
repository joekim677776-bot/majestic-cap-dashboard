'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function InGameNickForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !tag.trim()) {
      setError('Заполни все поля')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/player/update-nick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inGameName: name.trim(), inGameTag: tag.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Ошибка сервера')
        return
      }
      router.refresh()
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl border border-white/20 p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bebas uppercase">Привяжи свой игровой ник</h2>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-1">
          Укажи свой игровой ник из Majestic RP
        </p>
      </div>

      <p className="text-xs text-white/40">
        Например: <span className="text-white/60">Vibe Nocap #37417</span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vibe Nocap"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-none focus-visible:ring-white/30 w-full sm:w-64"
          disabled={loading}
        />
        <div className="flex items-center gap-1">
          <span className="text-white/40 font-bold">#</span>
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value.replace(/\D/g, ''))}
            placeholder="37417"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-none focus-visible:ring-white/30 w-28"
            disabled={loading}
            maxLength={10}
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="rounded-none font-bold tracking-widest text-[10px] bg-white text-black hover:bg-white/90 h-10 px-6"
        >
          {loading ? '...' : 'СОХРАНИТЬ'}
        </Button>
      </form>

      {error && (
        <p className="text-[11px] text-red-400 uppercase tracking-widest">{error}</p>
      )}
    </div>
  )
}
