import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_EVENT_TYPES = ["KAPT", "MCL", "TOURNAMENT"] as const;
type EventTypeStr = (typeof VALID_EVENT_TYPES)[number];

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (
      data.won === undefined ||
      data.score_ours === undefined ||
      data.score_theirs === undefined ||
      !Array.isArray(data.players)
    ) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const rawType = (data.eventType as string)?.toUpperCase();
    const eventType: EventTypeStr = VALID_EVENT_TYPES.includes(rawType as EventTypeStr)
      ? (rawType as EventTypeStr)
      : "KAPT";

    const capture = await prisma.$transaction(async (txRaw) => {
      const tx = txRaw as any;
      const newCapture = await tx.capture.create({
        data: {
          eventType,
          won: data.won === "victory" || data.won === true || data.won === "Победа",
          scoreOurs: parseInt(data.score_ours),
          scoreTheirs: parseInt(data.score_theirs),
          date: new Date(),
          notes: data.eventTime ? `Время: ${data.eventTime}` : "Automatically processed via Discord Bot",
        } as any,
      });

      for (const p of data.players) {
        const player = await tx.player.findFirst({
          where: {
            OR: [
              { inGameName: { equals: p.name, mode: 'insensitive' } },
              { inGameName: { contains: p.name, mode: 'insensitive' } },
              { inGameName: { startsWith: p.name.split('#')[0].trim(), mode: 'insensitive' } },
              { discordName: { equals: p.name, mode: 'insensitive' } },
            ],
          },
        });

        if (player) {
          await tx.playerCapStat.create({
            data: {
              playerId:  player.id,
              captureId: newCapture.id,
              kills:  parseInt(p.kills)  || 0,
              deaths: parseInt(p.deaths) || 0,
              damage: parseInt(p.damage) || 0,
            },
          });
          await tx.captureRoster.create({
            data: { playerId: player.id, captureId: newCapture.id },
          });
        }
      }

      return newCapture;
    });

    return NextResponse.json({ success: true, captureId: capture.id });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
