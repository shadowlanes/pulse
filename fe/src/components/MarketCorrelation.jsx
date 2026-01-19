import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/95 backdrop-blur-xl border border-cyan-400/30 rounded-sm p-4 shadow-2xl">
        <p className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider mb-3">
          {data.date}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-mono text-neutral-500">PULSE</span>
            <span className="text-sm font-bold font-mono text-cyan-400" style={{ fontFamily: 'JetBrains Mono' }}>
              {data.score.toFixed(1)}
            </span>
          </div>
          {data.sp500 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-mono text-neutral-500">S&P500</span>
              <span className="text-sm font-bold font-mono text-magenta-400" style={{ fontFamily: 'JetBrains Mono' }}>
                ${data.sp500.toFixed(2)}
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
  // Prepare data for the chart
  const chartData = history
    .filter((item) => item.sp500 != null)
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: item.date,
      score: item.score,
      sp500: item.sp500,
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-magenta-400/20 rounded-sm flex flex-col overflow-hidden">
        <div className="border-b border-magenta-400/20 px-6 py-4 bg-black/40">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-medium tracking-[0.3em] text-magenta-400/70 uppercase">
              Market Impact
            </h2>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-magenta-400/50"></div>
              <div className="w-1 h-1 rounded-full bg-magenta-400/30"></div>
              <div className="w-1 h-1 rounded-full bg-magenta-400/10"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-magenta-400/30 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-t-magenta-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-neutral-600 text-sm font-mono">
              Awaiting S&P 500 data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Y-axis domains with padding
  const scores = chartData.map((d) => d.score);
  const sp500Values = chartData.map((d) => d.sp500);

  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore;
  const scorePadding = scoreRange * 0.15 || 0.5;

  const minSP500 = Math.min(...sp500Values);
  const maxSP500 = Math.max(...sp500Values);
  const sp500Range = maxSP500 - minSP500;
  const sp500Padding = sp500Range * 0.15 || 5;

  return (
    <div className="h-full bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-magenta-400/20 rounded-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-magenta-400/20 px-6 py-4 bg-black/40">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono font-medium tracking-[0.3em] text-magenta-400/70 uppercase">
            Market Impact
          </h2>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-magenta-400/50"></div>
            <div className="w-1 h-1 rounded-full bg-magenta-400/30"></div>
            <div className="w-1 h-1 rounded-full bg-magenta-400/10"></div>
          </div>
        </div>
        <div className="flex gap-6 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-cyan-400"></div>
            <span className="text-cyan-400/70">PULSE SCORE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-magenta-400"></div>
            <span className="text-magenta-400/70">S&P 500</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-6 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(0, 255, 255)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(0, 255, 255)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(255, 0, 255)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(255, 0, 255)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(0, 255, 255, 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="rgba(0, 255, 255, 0.3)"
              style={{ fontSize: "9px", fontFamily: 'JetBrains Mono, monospace' }}
              tick={{ fill: "rgba(0, 255, 255, 0.5)" }}
              axisLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }}
              tickLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }}
            />
            <YAxis
              yAxisId="left"
              domain={[minScore - scorePadding, maxScore + scorePadding]}
              hide
            />
            <YAxis
              yAxisId="right"
              domain={[minSP500 - sp500Padding, maxSP500 + sp500Padding]}
              hide
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(0, 255, 255, 0.2)", strokeWidth: 1 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="score"
              stroke="rgb(0, 255, 255)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "rgb(0, 255, 255)", stroke: "rgb(0, 255, 255)", strokeWidth: 2 }}
              fill="url(#pulseGradient)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sp500"
              stroke="rgb(255, 0, 255)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "rgb(255, 0, 255)", stroke: "rgb(255, 0, 255)", strokeWidth: 2 }}
              fill="url(#sp500Gradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="border-t border-white/5 px-6 py-4 bg-black/20">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-[9px] font-mono text-cyan-400/50 tracking-wider uppercase mb-1">
              Avg Pulse
            </div>
            <div className="text-lg font-bold font-mono text-cyan-400" style={{ fontFamily: 'JetBrains Mono' }}>
              {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-magenta-400/50 tracking-wider uppercase mb-1">
              Avg S&P500
            </div>
            <div className="text-lg font-bold font-mono text-magenta-400" style={{ fontFamily: 'JetBrains Mono' }}>
              ${(sp500Values.reduce((a, b) => a + b, 0) / sp500Values.length).toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCorrelation;
