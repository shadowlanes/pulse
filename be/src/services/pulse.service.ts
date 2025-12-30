import axios from "axios";
import { Agent } from "@mastra/core/agent";
import { prisma } from "../lib/prisma";
import * as fs from "fs";
import * as path from "path";
import Handlebars from "handlebars";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class PulseService {
  private static STATIC_DIR = path.join(process.cwd(), "..", "fe", "public", "pulse");
  private static TEMPLATE_PATH = path.join(process.cwd(), "..", "fe", "src", "templates", "pulse-report.hbs");

  constructor() {
    if (!fs.existsSync(PulseService.STATIC_DIR)) {
      fs.mkdirSync(PulseService.STATIC_DIR, { recursive: true });
    }
  }

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
    throw new Error(`Historical news extraction for ${date.toISOString().split("T")[0]} is not supported with the current provider.`);
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

  async analyzePulse(headlines: any[]): Promise<{ status: "Good" | "Bad"; rationale: string }> {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined");
    }


    const agent = new Agent({
      name: "Global Analyst",
      instructions: `You are a Global Analyst evaluating the net impact of the day's events on human well-being.
      Analyze the provided headlines and determine if the day was "Good" or "Bad" for humanity.
      "Good" (Steady): Progress, peace, stability, scientific breakthroughs, or positive economic news.
      "Bad" (Arrythmia): Conflict, crisis, natural disasters, major economic downturns, or humanitarian setbacks.
      Provide the result in a structured format: { "status": "Good" | "Bad", "rationale": "Detailed explanation" }.`,
      
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
      return {
        status: text.toLowerCase().includes("good") ? "Good" : "Bad",
        rationale: text,
      };
    } catch (error) {
      console.error("Error analyzing pulse:", error);
      throw error;
    }
  }

  async savePulse(date: Date, status: "Good" | "Bad", headlines: any[], rationale: string) {
    const pulse = await prisma.pulse.upsert({
      where: { date },
      update: { status, headlines, rationale },
      create: { date, status, headlines, rationale },
    });
    return pulse;
  }

  async generateStaticPage(date: Date, status: "Good" | "Bad", headlines: any[], rationale: string) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const dateStr = date.toISOString().split("T")[0];
    const fileName = `${dateStr}.html`;
    
    const targetDir = path.join(PulseService.STATIC_DIR, year, month);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const filePath = path.join(targetDir, fileName);

    // Read and compile template
    if (!fs.existsSync(PulseService.TEMPLATE_PATH)) {
      throw new Error(`Template not found at ${PulseService.TEMPLATE_PATH}`);
    }
    
    const templateSource = fs.readFileSync(PulseService.TEMPLATE_PATH, "utf-8");
    const template = Handlebars.compile(templateSource);
    
    const htmlContent = template({
      dateStr,
      year,
      status,
      isGood: status === "Good",
      rationale,
      headlines
    });

    fs.writeFileSync(filePath, htmlContent);
    return `/pulse/${year}/${month}/${fileName}`;
  }

  async runDailyCheck(date: Date = new Date()) {
    // Set to 23:50 UTC or similar as per PRD if needed, but for manual triggers it's flexible
    const normalizedDate = new Date(date.toISOString().split("T")[0]);
    
    const existing = await prisma.pulse.findUnique({
      where: { date: normalizedDate }
    });

    if (existing) {
      console.log(`Pulse entry exists for ${normalizedDate.toISOString().split("T")[0]}. Re-generating static page...`);
      const staticPath = await this.generateStaticPage(
        normalizedDate, 
        existing.status as "Good" | "Bad", 
        existing.headlines as any[], 
        existing.rationale
      );
      
      return { 
        status: existing.status, 
        staticPath,
        message: "Entry already exists, static page regenerated"
      };
    }

    console.log(`Running Daily Pulse Check for ${normalizedDate.toISOString()}...`);
    
    const headlines = await this.extractNews(normalizedDate);
    console.log(`Extracted ${headlines.length} headlines...`);  
    const { status, rationale } = await this.analyzePulse(headlines);
    console.log(`Analyzed pulse...`);  
    await this.savePulse(normalizedDate, status, headlines, rationale);
    console.log(`Saved pulse...`);  
    const staticPath = await this.generateStaticPage(normalizedDate, status, headlines, rationale);
    
    console.log(`Pulse Check Complete: ${status}. Static page at ${staticPath}`);
    return { status, staticPath };
  }
}
