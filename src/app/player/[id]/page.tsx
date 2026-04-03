export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EventFilter } from "@/components/EventFilter";
import { format } from "date-fns";
import * as motion from "framer-motion/client";
import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";
import { Suspense } from "react";
import { InGameNickForm } from "@/components/InGameNickForm";

const FILTER_OPTIONS = [
  { label: "ВСЕ",     value: "ALL" },
  { label: "КАПТЫ",   value: "KAPT" },
  { label: "ТУРНИРЫ", value: "TOURNAMENT" },
];

const EVENT_LABEL: Record<string, string> = {
  KAPT:       "Кап",
  MCL:        "МЦЛ",
  TOURNAMENT: "Турнир",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function PlayerProfilePage({ params, searchParams }: PageProps) {
  const [{ id }, { type = "ALL" }, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);

  if (!session) redirect('/api/auth/signin')

  const capStatWhere = type !== "ALL"
    ? ({ capture: { eventType: type } } as any)
    : {};

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      capStats: {
        where: capStatWhere,
        include: { capture: true },
        orderBy: { capture: { date: "desc" } },
      },
    },
  }) as any;

  if (!player) notFound();

  const stats = player.capStats as any[];

  const totalEvents = stats.length;
  const totalKills  = stats.reduce((s: number, x: any) => s + x.kills,  0);
  const totalDamage = stats.reduce((s: number, x: any) => s + x.damage, 0);
  const avgKills    = totalEvents > 0 ? (totalKills  / totalEvents).toFixed(1) : "0";
  const avgDamage   = totalEvents > 0 ? (totalDamage / totalEvents).toFixed(1) : "0";

  // "МОЯ СТАТИСТИКА" — all-time stats regardless of filter
  // session.user.id is now the Prisma player id (set in JWT callback)
  const isSelf = !!session?.user?.id && session.user.id === player.id;
  let selfStats: any = null;

  if (isSelf) {
    const allStats = await prisma.playerCapStat.findMany({
      where: { playerId: id },
      orderBy: { capture: { date: "desc" } },
      include: { capture: true },
    }) as any[];

    const last5  = allStats.slice(0, 5);
    const last10 = allStats.slice(0, 10);
    const allLen = allStats.length;

    const avg = (arr: any[], field: "kills" | "damage") =>
      arr.length > 0
        ? (arr.reduce((s: number, x: any) => s + x[field], 0) / arr.length).toFixed(1)
        : "0";

    const best = (arr: any[], field: "kills" | "damage") =>
      arr.length > 0 ? arr.reduce((b: any, x: any) => (x[field] > b[field] ? x : b)) : null;

    selfStats = {
      avgKillsLast5:   avg(last5,  "kills"),
      avgDamageLast5:  avg(last5,  "damage"),
      avgKillsLast10:  avg(last10, "kills"),
      avgDamageLast10: avg(last10, "damage"),
      avgKillsAll:     avg(allStats, "kills"),
      avgDamageAll:    avg(allStats, "damage"),
      bestKills:       best(allStats, "kills"),
      bestDamage:      best(allStats, "damage"),
      total:           allLen,
    };
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Back */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link href="/players">
          <Button variant="ghost" className="hover:bg-white hover:text-black rounded-none h-8 px-4 text-[10px] tracking-widest font-bold">
            <ChevronLeft className="h-3 w-3 mr-2" /> НАЗАД К СОСТАВУ
          </Button>
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-8 items-start pb-10 border-b border-white/10"
      >
        <Avatar className="h-28 w-28 border border-white/20 rounded-none">
          <AvatarImage src={player.discordAvatar ?? undefined} />
          <AvatarFallback className="bg-white/5 text-4xl font-bebas text-white/40 rounded-none">
            {player.discordName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">
            <Trophy className="h-3 w-3" />
            <span>ЛИЧНОЕ ДЕЛО // {totalEvents} СОБЫТИЙ</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-bebas leading-none tracking-tighter text-white">
            {player.inGameName || player.discordName}
          </h1>
          <p className="text-sm text-white/30 uppercase tracking-[0.3em] font-bold">
            @{player.discordName}
          </p>
        </div>
      </motion.div>

      {/* Bind in-game nick */}
      {isSelf && !player.inGameName && <InGameNickForm />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "УБИЙСТВА",    value: totalKills },
          { label: "УРОН",        value: totalDamage.toLocaleString() },
          { label: "СР. УБИЙСТВА", value: avgKills },
          { label: "СР. УРОН",    value: avgDamage },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card rounded-2xl p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40 mb-3">{label}</p>
            <p className="font-bebas text-5xl leading-none text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <Suspense>
        <EventFilter options={FILTER_OPTIONS} />
      </Suspense>

      {/* History table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl"
      >
        <div className="p-6 border-b border-white/5">
          <h2 className="text-2xl font-bebas uppercase">История событий</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">
            {type === "ALL" ? "Все типы" : EVENT_LABEL[type] ?? type}
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                {["ДАТА", "ТИП", "РЕЗУЛЬТАТ", "СЧЁТ", "УБИЙСТВА", "УРОН"].map((h) => (
                  <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-white/40 py-5">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-white/20 text-[10px] uppercase tracking-widest py-10">
                    Нет данных
                  </TableCell>
                </TableRow>
              )}
              {stats.map((stat: any) => (
                <TableRow key={stat.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                  <TableCell className="text-xs text-white/60 py-5">
                    {format(new Date(stat.capture.date), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {EVENT_LABEL[stat.capture.eventType] ?? stat.capture.eventType}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className={`text-[10px] font-bold uppercase py-0.5 px-2 tracking-widest ${
                      stat.capture.won ? "bg-white text-black" : "border border-white/20 text-white/40"
                    }`}>
                      {stat.capture.won ? "Победа" : "Поражение"}
                    </span>
                  </TableCell>
                  <TableCell className="font-bebas text-lg py-5">
                    {stat.capture.scoreOurs} — {stat.capture.scoreTheirs}
                  </TableCell>
                  <TableCell className="font-bebas text-lg text-white py-5">+{stat.kills}</TableCell>
                  <TableCell className="font-bebas text-lg py-5">{stat.damage.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* МОЯ СТАТИСТИКА — visible only to self */}
      {isSelf && selfStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl border border-white/20"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bebas uppercase">МОЯ СТАТИСТИКА</h2>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">
              За все {selfStats.total} событий
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Средние по периодам */}
            {[
              { label: "Последние 5",  kills: selfStats.avgKillsLast5,  damage: selfStats.avgDamageLast5  },
              { label: "Последние 10", kills: selfStats.avgKillsLast10, damage: selfStats.avgDamageLast10 },
              { label: "За всё время", kills: selfStats.avgKillsAll,    damage: selfStats.avgDamageAll    },
            ].map(({ label, kills, damage }) => (
              <div key={label} className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">{label}</p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Ср. убийства</p>
                    <p className="font-bebas text-3xl leading-none text-white">{kills}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Ср. урон</p>
                    <p className="font-bebas text-3xl leading-none">{damage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Лучшие события */}
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selfStats.bestKills && (
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40 mb-2">Рекорд убийств</p>
                <p className="font-bebas text-4xl text-white">+{selfStats.bestKills.kills}</p>
                <p className="text-[10px] text-white/30 mt-1">
                  {format(new Date(selfStats.bestKills.capture.date), "dd.MM.yyyy")}
                  {" — "}
                  {EVENT_LABEL[selfStats.bestKills.capture.eventType] ?? selfStats.bestKills.capture.eventType}
                </p>
              </div>
            )}
            {selfStats.bestDamage && (
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40 mb-2">Рекорд урона</p>
                <p className="font-bebas text-4xl text-white">{selfStats.bestDamage.damage.toLocaleString()}</p>
                <p className="text-[10px] text-white/30 mt-1">
                  {format(new Date(selfStats.bestDamage.capture.date), "dd.MM.yyyy")}
                  {" — "}
                  {EVENT_LABEL[selfStats.bestDamage.capture.eventType] ?? selfStats.bestDamage.capture.eventType}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
