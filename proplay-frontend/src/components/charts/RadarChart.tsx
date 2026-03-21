"use client";
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface MetricsData {
  speed: number;
  strength: number;
  stamina: number;
  tactical: number;
}

interface AthleteRadarChartProps {
  metrics: MetricsData;
  height?: number;
}

export function AthleteRadarChart({ metrics, height = 280 }: AthleteRadarChartProps) {
  const data = [
    { metric: "Speed",    value: metrics.speed },
    { metric: "Strength", value: metrics.strength },
    { metric: "Stamina",  value: metrics.stamina },
    { metric: "Tactical", value: metrics.tactical },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadar data={data} outerRadius="75%">
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "inherit" }}
        />
        <Radar
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.18}
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 3 }}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(10,10,10,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#f0f0f0",
          }}
          formatter={(value: number | string | undefined) => [Number(value ?? 0).toFixed(1), "Score"]}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
