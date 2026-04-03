export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { DashboardClient } from "@/components/DashboardClient";
import { format, subDays, startOfDay } from "date-fns";
import * as motion from "framer-motion/client";

type EventTypeStr = "KAPT" | "MCL" | "TOURNAMENT";
type CaptureBasic = { won: boolean; eventType: EventTypeStr };
type CaptureWithDate = { date: Date; won: boolean; eventType: EventTypeStr };

function computeStats(captures: { won: boolean }[]) {
  const total = captures.length;
  const wins = captures.filter((c) => c.won).length;
  const losses = total - wins;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(0) : "0";
  return { total, wins, losses, winRate };
}

function buildChartData(captures: { date: Date; won: boolean }[]) {
  const days: Record<string, { wins: number; losses: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const key = format(subDays(new Date(), i), "dd.MM");
    days[key] = { wins: 0, losses: 0 };
  }
  for (const cap of captures) {
    const key = format(new Date(cap.date), "dd.MM");
    if (days[key]) {
      if (cap.won) days[key].wins++;
      else days[key].losses++;
    }
  }
  return Object.entries(days).map(([date, { wins, losses }]) => ({ date, wins, losses }));
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/api/auth/signin')

  const thirtyDaysAgo = startOfDay(subDays(new Date(), 29));

  const allCaptures = (await prisma.capture.findMany({
    select: { won: true, eventType: true },
  })) as CaptureBasic[];

  const recentCaptures = (await prisma.capture.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    select: { date: true, won: true, eventType: true },
    orderBy: { date: "asc" },
  })) as CaptureWithDate[];

  const allPlayerStats = await prisma.playerCapStat.findMany({
    select: {
      playerId: true,
      kills: true,
      damage: true,
      player: { select: { id: true, inGameName: true, discordName: true } },
    },
  });

  // Stats per type
  const statsByType = {
    ALL: computeStats(allCaptures),
    KAPT: computeStats(allCaptures.filter((c) => c.eventType === "KAPT")),
    MCL: computeStats(allCaptures.filter((c) => c.eventType === "MCL")),
    TOURNAMENT: computeStats(allCaptures.filter((c) => c.eventType === "TOURNAMENT")),
  };

  // Chart data per filter
  const chartDataByType = {
    ALL: buildChartData(recentCaptures),
    KAPT: buildChartData(recentCaptures.filter((c) => c.eventType === "KAPT")),
    MCL: buildChartData(recentCaptures.filter((c) => c.eventType === "MCL")),
    TOURNAMENT: buildChartData(recentCaptures.filter((c) => c.eventType === "TOURNAMENT")),
  };

  // Aggregate per player
  const playerMap: Record<string, { id: string; name: string; kills: number; damage: number }> = {};
  for (const stat of allPlayerStats) {
    const { playerId, kills, damage, player } = stat;
    if (!playerMap[playerId]) {
      playerMap[playerId] = {
        id: playerId,
        name: player.inGameName || player.discordName,
        kills: 0,
        damage: 0,
      };
    }
    playerMap[playerId].kills += kills;
    playerMap[playerId].damage += damage;
  }

  const allPlayers = Object.values(playerMap);
  const topKills = [...allPlayers].sort((a, b) => b.kills - a.kills).slice(0, 5);
  const topDamage = [...allPlayers].sort((a, b) => b.damage - a.damage).slice(0, 5);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative pb-12 border-b border-white/5"
      >
        <section style={{ display: "flex", alignItems: "center", gap: "48px", padding: "40px 0 0" }}>
          <div style={{ width: "260px", height: "260px", position: "relative", flexShrink: 0 }}>
            <Image
              src="/nocap-animated.gif"
              alt="NoCap"
              fill
              style={{ objectFit: "contain" }}
              unoptimized
            />
          </div>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "96px",
              color: "white",
              lineHeight: 1,
              letterSpacing: "4px",
              fontWeight: "bold",
            }}
          >
            СТАТИСТИКА
            <br />
            КАПТОВ
          </h1>
        </section>
      </motion.div>

      {/* Interactive dashboard */}
      <DashboardClient
        statsByType={statsByType}
        chartDataByType={chartDataByType}
        topKills={topKills}
        topDamage={topDamage}
      />
    </div>
  );
}
