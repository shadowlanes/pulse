import axios from "axios";
import { Agent } from "@mastra/core/agent";
import { prisma } from "../lib/prisma";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

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

  async savePulse(date: Date, status: "Good" | "Bad", score: number, headlines: any[], rationale: string) {
    const pulse = await prisma.pulse.upsert({
      where: { date },
      update: { status, score, headlines, rationale },
      create: { date, status, score, headlines, rationale },
    });
    return pulse;
  }

  async runDailyCheck(date: Date = new Date()) {
    const normalizedDate = new Date(date.toISOString().split("T")[0]);

    const existing = await prisma.pulse.findUnique({
      where: { date: normalizedDate }
    });

    if (existing) {
      console.log(`Pulse entry exists for ${normalizedDate.toISOString().split("T")[0]}.`);
      return {
        status: existing.status,
        score: existing.score,
        message: "Entry already exists"
      };
    }

    console.log(`Running Daily Pulse Check for ${normalizedDate.toISOString()}...`);

    const headlines = await this.extractNews(normalizedDate);
    console.log(`Extracted ${headlines.length} headlines...`);
    const { status, score, rationale } = await this.analyzePulse(headlines);
    console.log(`Analyzed pulse: ${status} (${score})`);
    await this.savePulse(normalizedDate, status, score, headlines, rationale);
    console.log(`Saved pulse...`);

    console.log(`Pulse Check Complete: ${status} (${score})`);
    return { status, score };
  }
}
