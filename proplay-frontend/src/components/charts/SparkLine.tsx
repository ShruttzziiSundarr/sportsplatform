"use client";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface SparkLineProps {
  data: number[];
  color?: string;
  height?: number;
  showAxes?: boolean;
  className?: string;
}

export function SparkLine({
  data,
  color = "#3b82f6",
  height = 80,
  showAxes = false,
  className,
}: SparkLineProps) {
  const chartData = data.map((v, i) => ({ i, value: v }));

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showAxes && <XAxis dataKey="i" hide />}
          {showAxes && <YAxis domain={[0, 100]} hide />}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color.replace("#", "")})`}
            dot={false}
          />
          {showAxes && (
            <Tooltip
              contentStyle={{
                background: "rgba(10,10,10,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#f0f0f0",
              }}
              formatter={(v: number | string | undefined) => [Number(v ?? 0).toFixed(1), "Score"]}
              labelFormatter={() => ""}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
