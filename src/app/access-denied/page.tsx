import { buttonVariants } from "@/components/ui/button";
import { ShieldX, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

export default function AccessDenied() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center text-center px-4">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 relative"
      >
        <div className="w-24 h-24 border-2 border-white/10 flex items-center justify-center text-white/20">
          <ShieldX className="h-12 w-12" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white text-black p-1">
          <Lock className="h-4 w-4" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h1 className="text-6xl md:text-8xl font-bebas tracking-tighter text-white">ДОСТУП ЗАПРЕЩЁН</h1>
        
        <div className="space-y-2">
          <p className="text-xl font-bold uppercase tracking-widest text-white">Этот сайт только для членов NoCap Crew.</p>
          <p className="text-sm text-white/40 uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
            УБЕДИСЬ ЧТО ТЫ НА СЕРВЕРЕ ФАМЫ И ИМЕЕШЬ НУЖНУЮ РОЛЬ ДЛЯ ПРОСМОТРА СТАТИСТИКИ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/" className={cn(buttonVariants(), "bg-white text-black hover:bg-white/90 rounded-none h-12 px-8 font-bold uppercase tracking-widest")}>
            ПОПРОБОВАТЬ СНОВА
          </Link>
          <a
            href="https://discord.gg/majestic-rp"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "border-white/20 text-white hover:bg-white hover:text-black rounded-none h-12 px-8 font-bold uppercase tracking-widest transition-all")}
          >
            КАНАЛ DISCORD
          </a>
        </div>

        <p className="pt-12 text-[10px] text-white/20 uppercase tracking-[0.3em] italic">
          ЕСЛИ ТЫ СЧИТАЕШЬ ЧТО ЭТО ОШИБКА — СВЯЖИСЬ СО СВОИМ ХАЕРОМ ИЛИ ЛИДЕРОМ.
        </p>
      </motion.div>
    </div>
  );
}
