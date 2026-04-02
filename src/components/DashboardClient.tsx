"use client";

import { useState } from "react";
import { EventBarChart } from "@/components/DashboardCharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

interface EventStats {
  total: number;
  wins: number;
  losses: number;
  winRate: string;
}

interface ChartPoint {
  date: string;
  wins: number;
  losses: number;
}

interface TopPlayer {
  id: string;
  name: string;
  kills: number;
  damage: number;
}

interface DashboardClientProps {
  statsByType: {
    ALL: EventStats;
    KAPT: EventStats;
    MCL: EventStats;
    TOURNAMENT: EventStats;
  };
  chartDataByType: {
    ALL: ChartPoint[];
    KAPT: ChartPoint[];
    MCL: ChartPoint[];
    TOURNAMENT: ChartPoint[];
  };
  topKills: TopPlayer[];
  topDamage: TopPlayer[];
}

type TabKey = "ALL" | "KAPT" | "MCL" | "TOURNAMENT";

const TAB_LABELS: Record<TabKey, string> = {
  ALL: "ВСЕ",
  KAPT: "КАПТЫ",
  MCL: "МЦЛ",
  TOURNAMENT: "ТУРНИРЫ",
};

const STAT_TABS: TabKey[] = ["KAPT", "MCL", "TOURNAMENT"];
const CHART_FILTERS: TabKey[] = ["ALL", "KAPT", "MCL", "TOURNAMENT"];

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest border transition-all ${
        active
          ? "bg-white text-black border-white"
          : "bg-transparent text-white/50 border-white/20 hover:border-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatBlock({ label, stats }: { label: string; stats: EventStats }) {
  return (
    <div className="glass-card rounded-2xl p-6 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-4">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[9px] text-white/30 uppercase tracking-widest">Всего</p>
          <p className="font-bebas text-4xl leading-none">{stats.total}</p>
        </div>
        <div>
          <p className="text-[9px] text-white/30 uppercase tracking-widest">Винрейт</p>
          <p className="font-bebas text-4xl leading-none text-white">{stats.winRate}%</p>
        </div>
        <div>
          <p className="text-[9px] text-white/30 uppercase tracking-widest">Победы</p>
          <p className="font-bebas text-3xl leading-none text-green-400">{stats.wins}</p>
        </div>
        <div>
          <p className="text-[9px] text-white/30 uppercase tracking-widest">Поражения</p>
          <p className="font-bebas text-3xl leading-none text-red-400">{stats.losses}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({ statsByType, chartDataByType, topKills, topDamage }: DashboardClientProps) {
  const [chartFilter, setChartFilter] = useState<TabKey>("ALL");

  return (
    <div className="space-y-12">
      {/* ─── STATS BLOCKS ─── */}
      <div className="flex flex-col md:flex-row gap-4">
        {STAT_TABS.map((key) => (
          <StatBlock key={key} label={TAB_LABELS[key]} stats={statsByType[key]} />
        ))}
      </div>

      {/* ─── CHART ─── */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bebas uppercase">Результаты по дням</h2>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Последние 30 дней</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CHART_FILTERS.map((key) => (
              <FilterBtn key={key} active={chartFilter === key} onClick={() => setChartFilter(key)}>
                {TAB_LABELS[key]}
              </FilterBtn>
            ))}
          </div>
        </div>
        <div className="h-[260px]">
          <EventBarChart data={chartDataByType[chartFilter]} />
        </div>
      </div>

      {/* ─── TOP 5 TABLES ─── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top kills */}
        <div className="glass-card rounded-2xl">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bebas uppercase">Топ 5 по убийствам</h2>
          </div>
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[9px] font-bold uppercase tracking-widest text-white/40 w-10">#</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest text-white/40">Игрок</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest text-white/40 text-right">Убийства</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topKills.map((p, i) => (
                <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.03]">
                  <TableCell className="font-bebas text-lg text-white/30">{i + 1}</TableCell>
                  <TableCell>
                    <Link href={`/player/${p.id}`} className="text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-bebas text-xl text-white">+{p.kills}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Top damage */}
        <div className="glass-card rounded-2xl">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bebas uppercase">Топ 5 по урону</h2>
          </div>
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[9px] font-bold uppercase tracking-widest text-white/40 w-10">#</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest text-white/40">Игрок</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest text-white/40 text-right">Урон</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topDamage.map((p, i) => (
                <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.03]">
                  <TableCell className="font-bebas text-lg text-white/30">{i + 1}</TableCell>
                  <TableCell>
                    <Link href={`/player/${p.id}`} className="text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-bebas text-xl text-white">{p.damage.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
