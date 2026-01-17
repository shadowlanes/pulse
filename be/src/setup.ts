import { prisma } from "./lib/prisma";

async function generateMockData() {
  console.log("Generating mock data for the last 60 days...");

  const today = new Date();
  const mockData = [];

  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0); // Set to start of day

    const status = Math.random() > 0.5 ? "Good" : "Bad";
    const score = Math.round((Math.random() * 10) * 10) / 10; // 0.0 to 10.0
    
    const headlineTitles = [
      `Market shows ${status.toLowerCase()} sentiment`,
      `Economic indicators point to ${status} conditions`,
      `Investor confidence ${status === "Good" ? "rising" : "falling"}`,
      `Global events impact market pulse`,
      `Technical analysis suggests ${status} outlook`,
      `Fed policy influences market direction`,
      `Corporate earnings beat expectations`
    ];

    const sources = [
      { name: "Bloomberg", url: "https://bloomberg.com" },
      { name: "Reuters", url: "https://reuters.com" },
      { name: "CNBC", url: "https://cnbc.com" },
      { name: "MarketWatch", url: "https://marketwatch.com" },
      { name: "Wall Street Journal", url: "https://wsj.com" }
    ];

    const descriptions = [
      "Market analysts weigh in on today's trading activity and economic data.",
      "Latest financial news and market insights from top analysts.",
      "Breaking news affecting stock market performance today.",
      "Economic indicators show signs of market momentum.",
      "Investment professionals discuss market outlook and opportunities."
    ];

    const headlines = [];
    const numHeadlines = Math.floor(Math.random() * 2) + 3; // 3-4 headlines
    for (let j = 0; j < numHeadlines; j++) {
      headlines.push({
        title: headlineTitles[j % headlineTitles.length],
        description: descriptions[j % descriptions.length],
        url: sources[j % sources.length].url,
        source: sources[j % sources.length]
      });
    }

    const rationale = `Mock rationale: The market pulse for ${date.toDateString()} is ${status} with a score of ${score}. This is based on simulated economic indicators and news sentiment analysis.`;

    const sp500 = Math.round((4000 + Math.random() * 1000) * 100) / 100; // 4000-5000

    mockData.push({
      date,
      status,
      score,
      headlines,
      rationale,
      sp500
    });
  }

  // Insert data using upsert to avoid duplicates
  for (const data of mockData) {
    try {
      await prisma.pulse.upsert({
        where: { date: data.date },
        update: {},
        create: data
      });
      console.log(`Inserted/Updated data for ${data.date.toDateString()}`);
    } catch (error) {
      console.error(`Error inserting data for ${data.date.toDateString()}:`, error);
    }
  }

  console.log("Mock data generation complete!");
}

generateMockData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });