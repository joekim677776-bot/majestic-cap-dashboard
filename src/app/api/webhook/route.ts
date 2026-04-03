import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: Request) {
  const prisma = new PrismaClient()

  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    console.log('Webhook received, players:', data.players?.length)

    const capture = await prisma.capture.create({
      data: {
        won: data.won ?? false,
        scoreOurs: data.score_ours ?? 0,
        scoreTheirs: data.score_theirs ?? 0,
        eventType: data.eventType ?? 'KAPT',
        notes: data.eventTime ?? null,
      }
    })

    console.log('Capture created:', capture.id)

    let savedCount = 0

    for (const p of data.players) {
      try {
        const player = await prisma.player.findFirst({
          where: {
            OR: [
              { inGameName: { equals: p.name, mode: 'insensitive' } },
              { inGameName: { contains: p.name, mode: 'insensitive' } },
              {
                inGameName: {
                  startsWith: p.name.split(' ')[0],
                  mode: 'insensitive'
                }
              }
            ]
          }
        })

        if (player) {
          await prisma.playerCapStat.create({
            data: {
              playerId: player.id,
              captureId: capture.id,
              kills: p.kills ?? 0,
              deaths: p.deaths ?? 0,
              damage: p.damage ?? 0,
            }
          })
          savedCount++
          console.log(`Saved: ${p.name}`)
        } else {
          console.log(`Not found: ${p.name}`)
        }
      } catch (playerError) {
        console.error(`Error saving ${p.name}:`, playerError)
      }
    }

    console.log(`Done: ${savedCount}/${data.players.length}`)

    return NextResponse.json({
      success: true,
      captureId: capture.id,
      savedPlayers: savedCount,
      totalPlayers: data.players.length
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
