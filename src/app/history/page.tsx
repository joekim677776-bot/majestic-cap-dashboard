import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { History, Sword, Trophy, Flame, ChevronRight } from "lucide-react";
import * as motion from "framer-motion/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HistoryPage() {
  const captures = await prisma.capture.findMany({
    orderBy: {
      date: "desc",
    },
    include: {
      roster: {
        include: {
          player: true,
        },
      },
    },
  });

  // Group by date
  const groupedCaptures = captures.reduce((groups: any, capture) => {
    const date = format(new Date(capture.date), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(capture);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedCaptures).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-16 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-7xl font-bebas tracking-tighter">ИСТОРИЯ КАП</h1>
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">
          <History className="h-3 w-3" />
          <span>ЛОГИ СРАЖЕНИЙ // АРХИВ ДАННЫХ</span>
        </div>
      </motion.div>

      <div className="space-y-12">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <motion.div 
              key={date}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-white/10" />
                 <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-white/40">{format(new Date(date), "dd.MM.yyyy")}</h2>
                 <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid gap-4">
                {groupedCaptures[date].map((cap: any) => (
                  <div 
                    key={cap.id} 
                    className="glass-card flex flex-col md:flex-row items-center justify-between p-6 gap-6 group hover:border-white/40"
                  >
                    <div className="flex items-center gap-8 w-full md:w-auto">
                       <div className={`p-4 font-bebas text-2xl ${cap.won ? "bg-white text-black" : "border border-white/20 text-white/20"}`}>
                          {cap.won ? "V" : "L"}
                       </div>
                       <div className="space-y-1">
                          <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">ВРЕМЯ</div>
                          <div className="text-sm font-bold tracking-widest">{format(new Date(cap.date), "HH:mm")}</div>
                       </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-12 font-bebas text-5xl">
                       <div className="flex flex-col items-center">
                          <span className="text-xs text-white/20 tracking-tighter mb-1 uppercase">НАШИ</span>
                          <span>{cap.scoreOurs}</span>
                       </div>
                       <div className="text-white/10 text-2xl">VS</div>
                       <div className="flex flex-col items-center">
                          <span className="text-xs text-white/20 tracking-tighter mb-1 uppercase">ВРАГИ</span>
                          <span className="text-white/40">{cap.scoreTheirs}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-end">
                       <div className="text-right">
                          <p className="text-[10px] text-white/20 uppercase tracking-widest">ИГРОКОВ</p>
                          <p className="font-bebas text-xl">{cap.roster.length}</p>
                       </div>
                       <Link href={`/history/${cap.id}`}>
                         <Button variant="ghost" size="icon" className="rounded-none border border-transparent group-hover:border-white group-hover:bg-white group-hover:text-black transition-all">
                            <ChevronRight className="h-4 w-4" />
                         </Button>
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center glass-card border-dashed">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.5em]">В БАЗЕ ДАННЫХ НЕТ ЗАПИСЕЙ О СРАЖЕНИЯХ</p>
          </div>
        )}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
         <div className="flex items-center gap-6">
            <Trophy className="h-8 w-8 text-white/20" />
            <div>
               <h3 className="text-xl font-bebas uppercase">КОЭФФИЦИЕНТ ДОМИНИРОВАНИЯ</h3>
               <p className="text-[10px] text-white/40 uppercase tracking-widest text-wrap">Всего побед за всё время</p>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <Flame className="h-8 w-8 text-white/20" />
            <div>
               <h3 className="text-xl font-bebas">ЛОГИ СРАЖЕНИЙ</h3>
               <p className="text-[10px] text-white/40 uppercase tracking-widest">Всего записей в архиве</p>
            </div>
         </div>
      </div>
    </div>
  );
}
