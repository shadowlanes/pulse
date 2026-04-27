import { prisma } from "./lib/prisma";
import { PulseService } from "./services/pulse.service";

const FIELD_TO_SYMBOL: Record<"sp500" | "gold" | "qqq" | "bitcoin", string> = {
  sp500: "SPY",
  gold: "GLD",
  qqq: "QQQ",
  bitcoin: "BTC",
};

function pickClose(series: Record<string, { close: number }>, dateStr: string): number | null {
  if (series[dateStr]) return Math.round(series[dateStr].close);
  const dates = Object.keys(series).sort().reverse();
  const closest = dates.find(d => d <= dateStr);
  return closest ? Math.round(series[closest].close) : null;
}

async function backfillMarket() {
  const service = new PulseService();
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 90);
  startDate.setHours(0, 0, 0, 0);

  const rows = await prisma.pulse.findMany({
    where: {
      date: { gte: startDate },
      OR: [
        { sp500: null },
        { gold: null },
        { qqq: null },
        { bitcoin: null },
      ],
    },
    orderBy: { date: "asc" },
  });

  if (rows.length === 0) {
    console.log("Backfill: no missing market data in the last 90 days.");
    return;
  }

  console.log(`Backfill: ${rows.length} rows have missing market data. Fetching series...`);

  const seriesByField: Partial<Record<keyof typeof FIELD_TO_SYMBOL, Record<string, { close: number }>>> = {};
  for (const field of Object.keys(FIELD_TO_SYMBOL) as (keyof typeof FIELD_TO_SYMBOL)[]) {
    const needed = rows.some(r => r[field] === null);
    if (!needed) continue;
    const series = await service.fetchAlphaVantageDailySeries(FIELD_TO_SYMBOL[field]);
    if (series && Object.keys(series).length > 0) {
      seriesByField[field] = series;
      console.log(`  ${field} (${FIELD_TO_SYMBOL[field]}): ${Object.keys(series).length} days fetched`);
    } else {
      console.warn(`  ${field} (${FIELD_TO_SYMBOL[field]}): no data — skipping`);
    }
  }

  let updatedCount = 0;
  for (const row of rows) {
    const dateStr = row.date.toISOString().split("T")[0];
    const updates: Record<string, number> = {};
    for (const field of Object.keys(FIELD_TO_SYMBOL) as (keyof typeof FIELD_TO_SYMBOL)[]) {
      if (row[field] !== null) continue;
      const series = seriesByField[field];
      if (!series) continue;
      const close = pickClose(series, dateStr);
      if (close !== null) updates[field] = close;
    }
    if (Object.keys(updates).length > 0) {
      await prisma.pulse.update({ where: { date: row.date }, data: updates });
      updatedCount++;
      console.log(`  ${dateStr}: ${JSON.stringify(updates)}`);
    }
  }

  console.log(`Backfill complete: updated ${updatedCount} rows.`);
}

backfillMarket()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
