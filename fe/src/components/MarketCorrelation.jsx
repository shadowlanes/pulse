import React, { useState } from "react";
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

const ASSETS = [
  { key: "sp500", label: "S&P 500", stroke: "rgba(255,255,255,0.75)", swatch: "bg-white/70" },
  { key: "gold", label: "GOLD", stroke: "rgba(251,191,36,0.85)", swatch: "bg-amber-400/80" },
  { key: "qqq", label: "QQQ", stroke: "rgba(167,139,250,0.85)", swatch: "bg-violet-400/80" },
  { key: "bitcoin", label: "BTC", stroke: "rgba(244,114,182,0.85)", swatch: "bg-pink-400/80" },
];

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

function formatPrice(key, value) {
  if (value == null) return "—";
  if (key === "bitcoin") return "$" + Math.round(value).toLocaleString();
  return "$" + Math.round(value).toLocaleString();
}

const CustomTooltip = ({ active, payload, visibleKeys }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const visibleAssets = ASSETS.filter((a) => visibleKeys.includes(a.key));
  return (
    <div className="bg-black/95 backdrop-blur-xl border border-white/15 rounded-sm p-3 shadow-2xl min-w-[180px]">
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
        {visibleAssets.map((a) =>
          d[a.key] != null ? (
            <div key={a.key} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-0.5 rounded" style={{ background: a.stroke }}></div>
                <span className="text-[10px] font-mono text-neutral-400">{a.label}</span>
              </div>
              <span className="text-sm font-bold font-mono text-white/80" style={{ fontFamily: "JetBrains Mono" }}>
                {formatPrice(a.key, d[a.key])}
              </span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

const DEFAULT_SELECTED = ["sp500", "gold"];

const MarketCorrelation = ({ history }) => {
  const [selected, setSelected] = useState(() => new Set(DEFAULT_SELECTED));

  const toggleAsset = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const visibleAssets = ASSETS.filter((a) => selected.has(a.key));

  // Per-asset min/max for normalization
  const ranges = {};
  for (const a of ASSETS) {
    const vals = history.map((h) => h[a.key]).filter((v) => v != null);
    if (vals.length > 0) {
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      ranges[a.key] = { min, max, range: max - min || 1 };
    }
  }

  const hasAny = visibleAssets.some((a) => ranges[a.key]);

  if (!hasAny) {
    return (
      <div className="bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-white/10 rounded-sm flex items-center justify-center h-64">
        <p className="text-neutral-600 text-sm font-mono">Awaiting market data</p>
      </div>
    );
  }

  const chartData = history.map((item) => {
    const row = {
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: item.score,
    };
    for (const a of ASSETS) {
      const v = item[a.key];
      row[a.key] = v ?? null;
      const r = ranges[a.key];
      row[`${a.key}Norm`] = v != null && r ? ((v - r.min) / r.range) * 10 : null;
    }
    return row;
  });

  // Per-asset correlation vs pulse score (using only days with both values)
  const correlations = visibleAssets.map((a) => {
    const pairs = chartData.filter((d) => d[`${a.key}Norm`] != null);
    const corr = pearson(pairs.map((d) => d.score), pairs.map((d) => d[`${a.key}Norm`]));
    return { ...a, corr };
  });

  // Per-asset averages
  const averages = visibleAssets.map((a) => {
    const vals = history.map((h) => h[a.key]).filter((v) => v != null);
    return {
      ...a,
      avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null,
    };
  });

  const tickInterval = Math.max(1, Math.floor(chartData.length / 8) - 1);

  return (
    <div className="bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-white/10 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4 bg-black/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xs font-mono font-medium tracking-[0.3em] text-white/50 uppercase">
            Market Impact
          </h2>
          <div className="flex items-center gap-4 text-[10px] font-mono flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <div className="w-2 h-3 rounded-sm bg-emerald-500/70"></div>
                <div className="w-2 h-3 rounded-sm bg-amber-500/70"></div>
                <div className="w-2 h-3 rounded-sm bg-rose-500/70"></div>
              </div>
              <span className="text-white/40 tracking-wider">PULSE</span>
            </div>
            {ASSETS.map((a) => {
              const isOn = selected.has(a.key);
              return (
                <button
                  key={a.key}
                  onClick={() => toggleAsset(a.key)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border transition-all duration-200 ${
                    isOn
                      ? "border-white/20 bg-white/5"
                      : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.06]"
                  }`}
                  title={isOn ? `Hide ${a.label}` : `Show ${a.label}`}
                >
                  <div
                    className="w-4 h-0.5 rounded"
                    style={{ background: a.stroke, opacity: isOn ? 1 : 0.85 }}
                  ></div>
                  <span className={`tracking-wider ${isOn ? "text-white/80" : "text-white/55"}`}>
                    {a.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Per-asset correlations */}
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <span className="text-[9px] font-mono text-white/25 tracking-wider">CORRELATION</span>
          {correlations.map(({ key, label, corr }) => {
            const color = corr > 0.3 ? "text-emerald-400" : corr < -0.3 ? "text-rose-400" : "text-neutral-400";
            const tag = corr > 0.3 ? "+" : corr < -0.3 ? "−" : "·";
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-white/40">{label}</span>
                <span className={`text-[10px] font-mono font-bold tracking-widest ${color}`}>
                  {tag} {Math.abs(corr).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-6 pb-2" style={{ height: "300px" }}>
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
            <ReferenceLine y={5} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 6" />
            <Tooltip
              content={<CustomTooltip visibleKeys={visibleAssets.map((a) => a.key)} />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />

            <Bar dataKey="score" radius={[2, 2, 0, 0]} maxBarSize={24}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getGradientColor(entry.score)} fillOpacity={0.7} />
              ))}
            </Bar>

            {visibleAssets.map((a) => (
              <Line
                key={a.key}
                type="monotone"
                dataKey={`${a.key}Norm`}
                stroke={a.stroke}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: a.stroke, stroke: "#000", strokeWidth: 2 }}
                connectNulls={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="border-t border-white/5 px-6 py-3 bg-black/20 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-6 flex-wrap">
          {averages.map(({ key, label, avg, swatch }) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${swatch}`}></div>
              <div>
                <div className="text-[9px] font-mono text-white/25 tracking-wider uppercase">Avg {label}</div>
                <div className="text-sm font-bold font-mono text-white/70" style={{ fontFamily: "JetBrains Mono" }}>
                  {avg != null ? formatPrice(key, avg) : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-[9px] font-mono text-white/20 tracking-wider">
          {chartData.length}D WINDOW
        </div>
      </div>
    </div>
  );
};

export default MarketCorrelation;
