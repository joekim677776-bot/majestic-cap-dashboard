import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { inGameName, inGameTag } = await req.json()

  if (!inGameName || !inGameTag) {
    return NextResponse.json({ error: 'Заполни все поля' }, { status: 400 })
  }

  const fullNick = `${inGameName} #${inGameTag.replace('#', '')}`

  await prisma.player.update({
    where: { id: session.user.id },
    data: { inGameName: fullNick },
  })

  return NextResponse.json({ success: true, inGameName: fullNick })
}
