import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { getGradientColor } from "../lib/colorUtils";

// Pearson correlation coefficient
function pearson(a, b) {
  const n = a.length;
  if (n === 0) return 0;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  const num = a.reduce((s, v, i) => s + (v - meanA) * (b[i] - meanB), 0);
  const dA = Math.sqrt(a.reduce((s, v) => s + (v - meanA) ** 2, 0));
  const dB = Math.sqrt(b.reduce((s, v) => s + (v - meanB) ** 2, 0));
  return dA && dB ? num / (dA * dB) : 0;
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-black/95 backdrop-blur-xl border border-white/15 rounded-sm p-3 shadow-2xl min-w-[140px]">
      <p className="text-[9px] font-mono text-white/40 tracking-wider mb-2">{d.date}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: getGradientColor(d.score) }}></div>
            <span className="text-[10px] font-mono text-neutral-400">PULSE</span>
          </div>
          <span className="text-sm font-bold font-mono" style={{ color: getGradientColor(d.score), fontFamily: "JetBrains Mono" }}>
            {d.score.toFixed(1)}
          </span>
        </div>
        {d.sp500 != null && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-0.5 bg-white/60 rounded"></div>
              <span className="text-[10px] font-mono text-neutral-400">S&P 500</span>
            </div>
            <span className="text-sm font-bold font-mono text-white/80" style={{ fontFamily: "JetBrains Mono" }}>
              ${d.sp500.toFixed(0)}
            </span>
          </div>
        )}
        {d.sp500Norm != null && (
          <div className="mt-1.5 pt-1.5 border-t border-white/5">
            <span className="text-[9px] font-mono text-white/25">
              S&P normalized: {d.sp500Norm.toFixed(1)}/10
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const MarketCorrelation = ({ history }) => {
  const raw = history.filter((item) => item.sp500 != null);

  if (raw.length === 0) {
    return (
      <div className="bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-white/10 rounded-sm flex items-center justify-center h-64">
        <p className="text-neutral-600 text-sm font-mono">Awaiting S&P 500 data</p>
      </div>
    );
  }

  // Normalize S&P 500 → 0-10 so both series share one axis
  const sp500Vals = raw.map((d) => d.sp500);
  const minSP = Math.min(...sp500Vals);
  const maxSP = Math.max(...sp500Vals);
  const spRange = maxSP - minSP || 1;

  const chartData = history.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: item.score,
    sp500: item.sp500 ?? null,
    sp500Norm: item.sp500 != null ? ((item.sp500 - minSP) / spRange) * 10 : null,
  }));

  const scores = chartData.map((d) => d.score);
  const sp500Norms = chartData.filter((d) => d.sp500Norm != null).map((d) => d.sp500Norm);
  const corr = pearson(scores.slice(-sp500Norms.length), sp500Norms);
  const corrLabel = corr > 0.3 ? "POSITIVE" : corr < -0.3 ? "INVERSE" : "NEUTRAL";
  const corrColor = corr > 0.3 ? "text-emerald-400" : corr < -0.3 ? "text-rose-400" : "text-neutral-400";

  const avgPulse = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const avgSP = sp500Vals.length
    ? "$" + (sp500Vals.reduce((a, b) => a + b, 0) / sp500Vals.length).toFixed(0)
    : "—";

  const tickInterval = Math.max(1, Math.floor(chartData.length / 8) - 1);

  return (
    <div className="bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-white/10 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4 bg-black/40 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-6">
          <h2 className="text-xs font-mono font-medium tracking-[0.3em] text-white/50 uppercase">
            Market Impact
          </h2>
          <div className="flex items-center gap-5 text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <div className="w-2 h-3 rounded-sm bg-emerald-500/70"></div>
                <div className="w-2 h-3 rounded-sm bg-amber-500/70"></div>
                <div className="w-2 h-3 rounded-sm bg-rose-500/70"></div>
              </div>
              <span className="text-white/40 tracking-wider">PULSE SCORE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-0.5 bg-white/60 rounded"></div>
              <span className="text-white/40 tracking-wider">S&P 500 (NORMALIZED)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-white/25 tracking-wider">CORRELATION</span>
          <span className={`text-[10px] font-mono font-bold tracking-widest ${corrColor}`}>
            {corrLabel} {Math.abs(corr).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-6 pb-2" style={{ height: "280px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 4, bottom: 4 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="2 8" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.06)"
              tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              interval={tickInterval}
              dy={6}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              width={20}
            />
            {/* Neutral midline */}
            <ReferenceLine y={5} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 6" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

            {/* Colored bars = pulse score */}
            <Bar dataKey="score" radius={[2, 2, 0, 0]} maxBarSize={24}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={getGradientColor(entry.score)}
                  fillOpacity={0.75}
                />
              ))}
            </Bar>

            {/* White line = normalized S&P 500 */}
            <Line
              type="monotone"
              dataKey="sp500Norm"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: "#fff", stroke: "#000", strokeWidth: 2 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="border-t border-white/5 px-6 py-3 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <div className="text-[9px] font-mono text-white/25 tracking-wider uppercase mb-0.5">Avg Pulse</div>
            <div className="text-base font-bold font-mono text-white/70" style={{ fontFamily: "JetBrains Mono" }}>
              {avgPulse}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/25 tracking-wider uppercase mb-0.5">Avg S&P 500</div>
            <div className="text-base font-bold font-mono text-white/70" style={{ fontFamily: "JetBrains Mono" }}>
              {avgSP}
            </div>
          </div>
        </div>
        <div className="text-[9px] font-mono text-white/20 tracking-wider">
          {chartData.length}D WINDOW
        </div>
      </div>
    </div>
  );
};

export default MarketCorrelation;
