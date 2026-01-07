import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const getScoreColor = (score) => {
  if (score >= 8) return "rgb(52, 211, 153)"; // emerald-400
  if (score >= 6) return "rgb(134, 239, 172)"; // green-300
  if (score >= 4) return "rgb(250, 204, 21)"; // yellow-400
  if (score >= 2) return "rgb(251, 146, 60)"; // orange-400
  return "rgb(248, 113, 113)"; // red-400
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-xl">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
          {data.date}
        </p>
        <div className="space-y-1">
          <p className="text-sm font-bold text-neutral-100">
            Pulse Score: <span style={{ color: getScoreColor(data.score) }}>{data.score.toFixed(1)}</span>
          </p>
          {data.sp500 && (
            <p className="text-sm font-bold text-neutral-100">
              S&P 500: <span className="text-blue-400">${data.sp500.toFixed(2)}</span>
            </p>
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
    .filter((item) => item.sp500 != null) // Only include items with S&P 500 data
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: item.date,
      score: item.score,
      sp500: item.sp500,
    }));

  if (chartData.length === 0) {
    return (
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">Impact</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-neutral-500 text-sm">
            No S&P 500 data available yet. Data will appear once market information is collected.
          </p>
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
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">Impact</h2>
      </div>

      <div className="flex-1 flex items-center min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: "10px", fontWeight: "bold" }}
              tick={{ fill: "rgba(255,255,255,0.5)" }}
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
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="score"
              stroke="rgb(52, 211, 153)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "rgb(52, 211, 153)" }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sp500"
              stroke="rgb(96, 165, 250)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "rgb(96, 165, 250)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketCorrelation;
