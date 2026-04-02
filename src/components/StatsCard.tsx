"use client";

import { Card } from "@/components/ui/card";
import { 
  Trophy, 
  Target, 
  Flame, 
  Activity,
  Sword,
  Shield,
  Zap,
  Calendar,
  Users,
  Search,
  History,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { Counter } from "@/components/Counter";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  trophy: Trophy,
  target: Target,
  flame: Flame,
  activity: Activity,
  sword: Sword,
  shield: Shield,
  zap: Zap,
  calendar: Calendar,
  users: Users,
  search: Search,
  history: History,
  trending: TrendingUp,
  dashboard: LayoutDashboard,
} as const;

export type IconName = keyof typeof ICON_MAP;

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: IconName;
  iconClassName?: string;
}

export function StatsCard({ title, value, description, icon, iconClassName }: StatsCardProps) {
  const isNumber = typeof value === "number";
  const Icon = ICON_MAP[icon] || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255,255,255,0.05)" }}
      className="group relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 border-l-[2px] border-l-white/30 hover:border-l-white transition-all duration-300 min-h-[140px] flex flex-col"
    >
      <Card className="bg-transparent border-none shadow-none flex-1 flex flex-col p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">
            {title}
          </span>
          <Icon className={cn("h-4 w-4 text-white/20 group-hover:text-white transition-colors duration-300", iconClassName)} />
        </div>
        
        <div className="flex-1 flex flex-col items-start justify-center py-4">
          <div className="text-5xl font-bebas tracking-tighter text-white leading-none">
            {isNumber ? <Counter to={value} /> : value}
          </div>
          {description && (
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">
              {description}
            </p>
          )}
        </div>
      </Card>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/5 group-hover:border-white/20 transition-colors" />
    </motion.div>
  );
}
