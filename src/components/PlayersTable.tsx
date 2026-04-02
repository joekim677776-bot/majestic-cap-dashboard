"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface PlayerRow {
  id: string;
  inGameName: string | null;
  discordName: string;
  discordAvatar: string | null;
  events: number;
  kills: number;
  damage: number;
  avgKills: number;
  avgDamage: number;
}

type SortKey = "events" | "kills" | "damage" | "avgKills" | "avgDamage";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "events",   label: "СОБЫТИЙ" },
  { key: "kills",    label: "УБИЙСТВА" },
  { key: "damage",   label: "УРОН" },
  { key: "avgKills", label: "СР. УБИЙСТВА" },
  { key: "avgDamage",label: "СР. УРОН" },
];

export function PlayersTable({ players }: { players: PlayerRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("kills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...players].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortDir === "desc" ? -diff : diff;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === "desc"
      ? <ChevronDown className="h-3 w-3 text-white" />
      : <ChevronUp className="h-3 w-3 text-white" />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/40 w-10 py-5">#</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/40 py-5">ИГРОК</TableHead>
            {COLUMNS.map(({ key, label }) => (
              <TableHead
                key={key}
                className="text-[10px] font-bold uppercase tracking-widest text-white/40 py-5 text-right cursor-pointer select-none hover:text-white transition-colors"
                onClick={() => handleSort(key)}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  {label} <SortIcon col={key} />
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((player, idx) => (
            <TableRow key={player.id} className="border-white/5 hover:bg-white/[0.03] transition-all group cursor-pointer">
              <TableCell className="font-bebas text-xl text-white/20 py-6">{idx + 1}</TableCell>
              <TableCell className="py-6">
                <Link href={`/player/${player.id}`} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-white/20 rounded-none grayscale group-hover:grayscale-0 transition-all">
                    <AvatarImage src={player.discordAvatar ?? undefined} />
                    <AvatarFallback className="bg-white/5 text-[10px] font-bold text-white/40 rounded-none">
                      {player.discordName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                      {player.inGameName || player.discordName}
                    </div>
                    <div className="text-[10px] text-white/20 uppercase tracking-tighter">
                      @{player.discordName}
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-right font-bebas text-xl py-6">{player.events}</TableCell>
              <TableCell className="text-right font-bebas text-xl py-6 text-white">+{player.kills}</TableCell>
              <TableCell className="text-right font-bebas text-xl py-6">{player.damage.toLocaleString()}</TableCell>
              <TableCell className="text-right font-bebas text-xl py-6">{player.avgKills.toFixed(1)}</TableCell>
              <TableCell className="text-right font-bebas text-xl py-6">{player.avgDamage.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
