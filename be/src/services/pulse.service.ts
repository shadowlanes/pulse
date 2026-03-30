import axios from "axios";
import { Agent } from "@mastra/core/agent";
import { prisma } from "../lib/prisma";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export class PulseService {
  constructor() {}

  async extractTodayNews(): Promise<any[]> {
    if (!NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY is not defined");
    }

    try {
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          language: "en",
          pageSize: 20,
          apiKey: NEWS_API_KEY,
          category: "general"
        },
      });
      return response.data.articles;
    } catch (error) {
      console.error("Error fetching today's news:", error);
      throw error;
    }
  }

  async extractHistoricalNews(date: Date): Promise<any[]> {
    if (!GNEWS_API_KEY) {
      throw new Error("GNEWS_API_KEY is not defined");
    }

    // Set from/to to the target date (start and end of day)
    const dateStr = date.toISOString().split("T")[0];
    const from = `${dateStr}T00:00:00Z`;
    const to = `${dateStr}T23:59:59Z`;

    try {
      const response = await axios.get("https://gnews.io/api/v4/search", {
        params: {
          q: "world OR news OR humanity OR progress",
          token: GNEWS_API_KEY,
          from,
          to,
          lang: "en",
          max: 20,
          sortby: "relevance"
        },
      });

      // GNews returns 'articles' with structure: { title, description, url, source: { name, url } }
      // This matches the NewsAPI structure closely enough for our template/analysis
      return response.data.articles || [];
    } catch (error) {
      console.error("Error fetching historical news from GNews:", error);
      throw error;
    }
  }

  async extractNews(date: Date): Promise<any[]> {
    const today = new Date();
    const isToday = date.toISOString().split("T")[0] === today.toISOString().split("T")[0];

    if (isToday) {
      return this.extractTodayNews();
    } else {
      return this.extractHistoricalNews(date);
    }
  }

  async fetchSP500(date: Date): Promise<number | null> {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn("ALPHA_VANTAGE_API_KEY is not defined, skipping S&P 500 fetch");
      return null;
    }

    try {
      // Using Alpha Vantage TIME_SERIES_DAILY for SPY (S&P 500 ETF)
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: "SPY",
          apikey: ALPHA_VANTAGE_API_KEY,
          outputsize: "compact"
        },
      });

      const timeSeries = response.data["Time Series (Daily)"];
      if (!timeSeries) {
        console.error("No time series data found in Alpha Vantage response");
        return null;
      }

      const dateStr = date.toISOString().split("T")[0];
      const dayData = timeSeries[dateStr];

      if (dayData) {
        // Return the closing price rounded to nearest integer
        return Math.round(parseFloat(dayData["4. close"]));
      } else {
        // If exact date not found, try to find the most recent available date
        const dates = Object.keys(timeSeries).sort().reverse();
        const closestDate = dates.find(d => d <= dateStr);
        if (closestDate) {
          console.log(`S&P 500 data for ${dateStr} not found, using ${closestDate}`);
          return Math.round(parseFloat(timeSeries[closestDate]["4. close"]));
        }
        console.error(`No S&P 500 data found for ${dateStr}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching S&P 500 data:", error);
      return null;
    }
  }

  async analyzePulse(headlines: any[]): Promise<{ status: "Good" | "Bad"; score: number; rationale: string }> {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined");
    }


    const agent = new Agent({
      name: "Global Analyst",
      instructions: `You are a provocative, opinionated Global Analyst who takes strong stances on humanity's trajectory. You do NOT hedge or gravitate toward the middle. You react with conviction.

      Analyze the provided headlines and determine if the day was "Good" or "Bad" for humanity.
      Provide a numerical score from 0.0 to 10.0. USE THE FULL RANGE aggressively:

      0.0-1.0: Existential-level threats, wars escalating, mass casualties, democratic collapse, climate disasters
      1.1-2.5: Severe crises dominating — major conflicts, authoritarian crackdowns, economic crashes, humanitarian disasters
      2.6-4.0: Clearly bad day — significant violence, political instability, rights erosion, major scandals
      4.1-5.9: Genuinely mixed — real good AND real bad in roughly equal measure. Do NOT default here out of indecision.
      6.0-7.5: Clearly good day — meaningful diplomatic wins, scientific advances, justice served, rights expanded
      7.6-9.0: Exceptional day — historic peace deals, breakthrough discoveries, major policy wins for humanity
      9.1-10.0: Once-in-a-decade triumph — end of a major war, cure for a disease, transformative global cooperation

      CRITICAL SCORING RULES:
      - If headlines are dominated by conflict, death, or instability, score BELOW 3.0. Do not soften it.
      - If headlines show genuine breakthroughs or peace, score ABOVE 7.0. Do not downplay it.
      - A score between 4.0-6.0 should be RARE — only when the day is truly split between significant good and bad.
      - Never round toward the center. If in doubt, go MORE extreme, not less.
      - Your score should vary by at least 1-2 points day to day unless headlines are remarkably similar.

      Provide the result in a structured JSON format: { "status": "Good" | "Bad", "score": number, "rationale": "Detailed explanation" }.`,
      
      model: {
        id: "google/gemini-flash-lite-latest",
        apiKey: process.env.GEMINI_API_KEY,
      },
    });

    const prompt = `Analyze these 20 headlines from today:\n${headlines
      .map((h, i) => `${i + 1}. ${h.title}: ${h.description}`)
      .join("\n")}`;

    try {
      const result = await agent.generate(prompt);
      // Mastra's structured output depends on how it's configured, 
      // but for now we'll assume a text response that we can parse or a simple structured result.
      // Adjusting based on standard Gemini integration:
      const text = result.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if not JSON
      const isGood = text.toLowerCase().includes("good");
      return {
        status: isGood ? "Good" : "Bad",
        score: isGood ? 7.0 : 3.0,
        rationale: text,
      };
    } catch (error) {
      console.error("Error analyzing pulse:", error);
      throw error;
    }
  }

  async savePulse(date: Date, status: "Good" | "Bad", score: number, headlines: any[], rationale: string, sp500?: number | null) {
    const pulse = await prisma.pulse.upsert({
      where: { date },
      update: { status, score, headlines, rationale, sp500 },
      create: { date, status, score, headlines, rationale, sp500 },
    });
    return pulse;
  }

  async runDailyCheck(date: Date = new Date()) {
    const normalizedDate = new Date(date.toISOString().split("T")[0]);

    const existing = await prisma.pulse.findUnique({
      where: { date: normalizedDate }
    });

    if (existing) {
      // If S&P 500 data is missing, fetch and update it
      if (existing.sp500 === null) {
        console.log(`Updating S&P 500 data for ${normalizedDate.toISOString().split("T")[0]}`);
        const sp500 = await this.fetchSP500(normalizedDate);
        if (sp500 !== null) {
          await prisma.pulse.update({
            where: { date: normalizedDate },
            data: { sp500 }
          });
          console.log(`Updated S&P 500 value: ${sp500}`);
        }
      }
      console.log(`Pulse entry exists for ${normalizedDate.toISOString().split("T")[0]}.`);
      return {
        status: existing.status,
        score: existing.score,
        message: "Entry already exists"
      };
    }

    console.log(`Running Daily Pulse Check for ${normalizedDate.toISOString()}...`);

    // Fetch news headlines and S&P 500 data in parallel
    const [headlines, sp500] = await Promise.all([
      this.extractNews(normalizedDate),
      this.fetchSP500(normalizedDate)
    ]);

    console.log(`Extracted ${headlines.length} headlines...`);
    if (sp500 !== null) {
      console.log(`Fetched S&P 500 value: ${sp500}`);
    }

    const { status, score, rationale } = await this.analyzePulse(headlines);
    console.log(`Analyzed pulse: ${status} (${score})`);
    await this.savePulse(normalizedDate, status, score, headlines, rationale, sp500);
    console.log(`Saved pulse...`);

    console.log(`Pulse Check Complete: ${status} (${score})`);
    return { status, score };
  }
}
