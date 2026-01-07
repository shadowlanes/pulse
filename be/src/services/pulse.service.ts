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
      instructions: `You are a Global Analyst evaluating the net impact of the day's events on human well-being.
      Analyze the provided headlines and determine if the day was "Good" or "Bad" for humanity.
      Also provide a numerical score from 0.0 to 10.0, where:
      0-1.9: Chaos/Catastrophe
      2-3.9: Major setbacks
      4-5.9: Mixed/Neutral
      6-7.9: Steady progress
      8-10.0: Peak humanity (Scientific breakthroughs, global peace, etc.)
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
