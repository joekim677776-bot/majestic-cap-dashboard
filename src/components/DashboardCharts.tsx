"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface ChartData {
  name: string;
  wins?: number;
  losses?: number;
  kills?: number;
}

export function WinLossChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="name" 
          stroke="rgba(255,255,255,0.3)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          className="uppercase tracking-widest font-bold"
        />
        <YAxis 
          stroke="rgba(255,255,255,0.3)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "#000000", 
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "0px",
            fontSize: "10px",
            textTransform: "uppercase",
            fontFamily: "var(--font-space-grotesk)"
          }}
          itemStyle={{ color: "#FFFFFF" }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="wins" fill="#FFFFFF" radius={[0, 0, 0, 0]} />
        <Bar dataKey="losses" fill="rgba(255,255,255,0.2)" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface EventChartData {
  date: string;
  wins: number;
  losses: number;
}

export function EventBarChart({ data }: { data: EventChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.3)"
          fontSize={9}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="rgba(255,255,255,0.3)"
          fontSize={9}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#000",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "0px",
            fontSize: "10px",
            textTransform: "uppercase",
            fontFamily: "var(--font-space-grotesk)",
          }}
          itemStyle={{ color: "#fff" }}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="wins" name="Победы" fill="#22c55e" radius={[2, 2, 0, 0]} maxBarSize={20} />
        <Bar dataKey="losses" name="Поражения" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PlayerPerformanceChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="name" 
          stroke="rgba(255,255,255,0.3)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          className="uppercase tracking-widest font-bold"
        />
        <YAxis 
          stroke="rgba(255,255,255,0.3)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "#000000", 
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "0px",
            fontSize: "10px",
            textTransform: "uppercase",
            fontFamily: "var(--font-space-grotesk)"
          }}
          itemStyle={{ color: "#FFFFFF" }}
        />
        <Line 
          type="monotone" 
          dataKey="kills" 
          stroke="#FFFFFF" 
          strokeWidth={3}
          dot={{ r: 4, fill: "#FFFFFF", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#FFFFFF", stroke: "#000000", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
