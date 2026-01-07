import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
      >
        <h3
          className="text-2xl font-black tracking-tighter uppercase mb-4"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Market Correlation
        </h3>
        <p className="text-neutral-500 text-sm">
          No S&P 500 data available yet. Data will appear once market information is collected.
        </p>
      </motion.div>
    );
  }

  // Normalize data for dual-axis visualization
  const maxScore = Math.max(...chartData.map((d) => d.score));
  const minScore = Math.min(...chartData.map((d) => d.score));
  const maxSP500 = Math.max(...chartData.map((d) => d.sp500));
  const minSP500 = Math.min(...chartData.map((d) => d.sp500));

  // Calculate nice Y-axis ranges
  const scoreRange = maxScore - minScore;
  const scorePadding = scoreRange * 0.1 || 1;
  const sp500Range = maxSP500 - minSP500;
  const sp500Padding = sp500Range * 0.1 || 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-2xl font-black tracking-tighter uppercase"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Market Correlation
        </h3>
        <div className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
          Last {chartData.length} Days
        </div>
      </div>

      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              stroke="rgba(52, 211, 153, 0.8)"
              style={{ fontSize: "10px", fontWeight: "bold" }}
              tick={{ fill: "rgba(52, 211, 153, 0.8)" }}
              label={{
                value: "Pulse Score",
                angle: -90,
                position: "insideLeft",
                style: { fill: "rgba(52, 211, 153, 0.8)", fontSize: "11px", fontWeight: "bold" },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[minSP500 - sp500Padding, maxSP500 + sp500Padding]}
              stroke="rgba(96, 165, 250, 0.8)"
              style={{ fontSize: "10px", fontWeight: "bold" }}
              tick={{ fill: "rgba(96, 165, 250, 0.8)" }}
              label={{
                value: "S&P 500",
                angle: 90,
                position: "insideRight",
                style: { fill: "rgba(96, 165, 250, 0.8)", fontSize: "11px", fontWeight: "bold" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="score"
              stroke="rgb(52, 211, 153)"
              strokeWidth={3}
              dot={{ fill: "rgb(52, 211, 153)", r: 5 }}
              activeDot={{ r: 7 }}
              name="Pulse Score"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sp500"
              stroke="rgb(96, 165, 250)"
              strokeWidth={3}
              dot={{ fill: "rgb(96, 165, 250)", r: 5 }}
              activeDot={{ r: 7 }}
              name="S&P 500"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default MarketCorrelation;
