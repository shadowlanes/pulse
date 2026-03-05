import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-sm p-3 shadow-2xl">
        <p className="text-[9px] font-mono text-white/50 uppercase tracking-wider mb-2">
          {data.date}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-0.5 bg-cyan-400"></div>
              <span className="text-[10px] font-mono text-neutral-500">PULSE</span>
            </div>
            <span
              className="text-sm font-bold font-mono text-cyan-400"
              style={{ fontFamily: "JetBrains Mono" }}
            >
              {data.score.toFixed(1)}
            </span>
          </div>
          {data.sp500 != null && (
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-0.5 bg-fuchsia-400"></div>
                <span className="text-[10px] font-mono text-neutral-500">S&P 500</span>
              </div>
              <span
                className="text-sm font-bold font-mono text-fuchsia-400"
                style={{ fontFamily: "JetBrains Mono" }}
              >
                ${data.sp500.toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const MarketCorrelation = ({ history }) => {
  const chartData = history
    .filter((item) => item.sp500 != null)
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: item.date,
      score: item.score,
      sp500: item.sp500,
    }));

  const allData = history.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    fullDate: item.date,
    score: item.score,
    sp500: item.sp500 ?? null,
  }));

  const displayData = allData;

  if (chartData.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-fuchsia-400/20 rounded-sm flex flex-col overflow-hidden">
        <div className="border-b border-fuchsia-400/20 px-6 py-4 bg-black/40">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-medium tracking-[0.3em] text-fuchsia-400/70 uppercase">
              Market Impact
            </h2>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-fuchsia-400/50"></div>
              <div className="w-1 h-1 rounded-full bg-fuchsia-400/30"></div>
              <div className="w-1 h-1 rounded-full bg-fuchsia-400/10"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-fuchsia-400/30 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-t-fuchsia-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-neutral-600 text-sm font-mono">Awaiting S&P 500 data</p>
          </div>
        </div>
      </div>
    );
  }

  const scores = chartData.map((d) => d.score);
  const sp500Values = chartData.map((d) => d.sp500);

  const minSP500 = Math.min(...sp500Values);
  const maxSP500 = Math.max(...sp500Values);
  const sp500Range = maxSP500 - minSP500;
  const sp500Padding = sp500Range * 0.12 || 50;

  // Show ~7 labels regardless of dataset size
  const tickInterval = Math.max(1, Math.floor(displayData.length / 7) - 1);

  const avgPulse = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const avgSP500 = (sp500Values.reduce((a, b) => a + b, 0) / sp500Values.length).toFixed(0);

  return (
    <div className="h-full bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-fuchsia-400/20 rounded-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-fuchsia-400/20 px-6 py-4 bg-black/40">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono font-medium tracking-[0.3em] text-fuchsia-400/70 uppercase">
            Market Impact
          </h2>
          <span className="text-[9px] font-mono text-neutral-600 tracking-widest">
            {displayData.length}D WINDOW
          </span>
        </div>
        <div className="flex gap-6 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-cyan-400 rounded-full"></div>
            <span className="text-cyan-400/80 tracking-wider">PULSE SCORE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-fuchsia-400 rounded-full"></div>
            <span className="text-fuchsia-400/80 tracking-wider">S&P 500</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2 pt-4 pb-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 8, right: 60, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="pulseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sp500AreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(232,121,249)" stopOpacity={0.14} />
                <stop offset="100%" stopColor="rgb(232,121,249)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Subtle horizontal grid only */}
            <CartesianGrid
              strokeDasharray="3 8"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            {/* X-Axis: dates, reduced ticks */}
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.08)"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              interval={tickInterval}
              dy={6}
            />

            {/* Left Y-Axis: Pulse score 0–10 */}
            <YAxis
              yAxisId="pulse"
              orientation="left"
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fill: "rgba(34,211,238,0.6)", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              width={24}
            />

            {/* Right Y-Axis: S&P 500 */}
            <YAxis
              yAxisId="sp500"
              orientation="right"
              domain={[minSP500 - sp500Padding, maxSP500 + sp500Padding]}
              tick={{ fill: "rgba(232,121,249,0.6)", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              width={38}
            />

            {/* Neutral reference at pulse 5 */}
            <ReferenceLine
              yAxisId="pulse"
              y={5}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="4 6"
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
            />

            {/* S&P 500 area (drawn first = behind) */}
            <Area
              yAxisId="sp500"
              type="monotone"
              dataKey="sp500"
              stroke="rgb(232,121,249)"
              strokeWidth={2}
              fill="url(#sp500AreaGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "rgb(232,121,249)", stroke: "#000", strokeWidth: 2 }}
              connectNulls={false}
            />

            {/* Pulse score line (drawn on top) */}
            <Area
              yAxisId="pulse"
              type="monotone"
              dataKey="score"
              stroke="rgb(34,211,238)"
              strokeWidth={2.5}
              fill="url(#pulseAreaGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "rgb(34,211,238)", stroke: "#000", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="border-t border-white/5 px-6 py-3 bg-black/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[9px] font-mono text-cyan-400/50 tracking-wider uppercase mb-1">
              Avg Pulse
            </div>
            <div
              className="text-base font-bold font-mono text-cyan-400"
              style={{ fontFamily: "JetBrains Mono" }}
            >
              {avgPulse}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/20 tracking-wider uppercase mb-1">
              Days
            </div>
            <div
              className="text-base font-bold font-mono text-white/40"
              style={{ fontFamily: "JetBrains Mono" }}
            >
              {displayData.length}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-fuchsia-400/50 tracking-wider uppercase mb-1">
              Avg S&P500
            </div>
            <div
              className="text-base font-bold font-mono text-fuchsia-400"
              style={{ fontFamily: "JetBrains Mono" }}
            >
              ${avgSP500}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCorrelation;
