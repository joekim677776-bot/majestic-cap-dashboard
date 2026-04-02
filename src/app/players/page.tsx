import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import * as motion from "framer-motion/client";
import { EventFilter } from "@/components/EventFilter";
import { PlayersTable, type PlayerRow } from "@/components/PlayersTable";
import { Suspense } from "react";

const FILTER_OPTIONS = [
  { label: "ВСЕ",     value: "ALL" },
  { label: "КАПТЫ",   value: "KAPT" },
  { label: "ТУРНИРЫ", value: "TOURNAMENT" },
];

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function PlayersPage({ searchParams }: PageProps) {
  const { type = "ALL" } = await searchParams;

  const capStatWhere = type !== "ALL"
    ? ({ capture: { eventType: type } } as any)
    : {};

  const players = await prisma.player.findMany({
    include: { capStats: { where: capStatWhere } },
  }) as any[];

  const rows: PlayerRow[] = players.map((p: any) => {
    const events    = p.capStats.length;
    const kills     = p.capStats.reduce((s: number, x: any) => s + x.kills,  0);
    const damage    = p.capStats.reduce((s: number, x: any) => s + x.damage, 0);
    const avgKills  = events > 0 ? kills  / events : 0;
    const avgDamage = events > 0 ? damage / events : 0;
    return {
      id:           p.id,
      inGameName:   p.inGameName,
      discordName:  p.discordName,
      discordAvatar: p.discordAvatar,
      events,
      kills,
      damage,
      avgKills,
      avgDamage,
    };
  });

  const visible = type === "ALL" ? rows : rows.filter((r) => r.events > 0);

  return (
    <div className="space-y-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-7xl font-bebas tracking-tighter">СОСТАВ</h1>
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">
          <Users className="h-3 w-3" />
          <span>ЗАРЕГИСТРИРОВАННЫЕ БОЙЦЫ // {players.length} ВСЕГО</span>
        </div>
      </motion.div>

      <Suspense>
        <EventFilter options={FILTER_OPTIONS} />
      </Suspense>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl"
      >
        <PlayersTable players={visible} />
      </motion.div>
    </div>
  );
}
