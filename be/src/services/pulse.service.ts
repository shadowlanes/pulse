import axios from "axios";
import { Agent } from "@mastra/core/agent";
import { prisma } from "../lib/prisma";
import * as fs from "fs";
import * as path from "path";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class PulseService {
  private static STATIC_DIR = path.join(process.cwd(), "static", "pulse");

  constructor() {
    if (!fs.existsSync(PulseService.STATIC_DIR)) {
      fs.mkdirSync(PulseService.STATIC_DIR, { recursive: true });
    }
  }

  async extractNews(): Promise<any[]> {
    if (!NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY is not defined");
    }

    try {
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          language: "en",
          pageSize: 20,
          apiKey: NEWS_API_KEY,
        },
      });
      return response.data.articles;
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
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
    const dateStr = date.toISOString().split("T")[0];
    const fileName = `${dateStr}.html`;
    const filePath = path.join(PulseService.STATIC_DIR, fileName);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pulse - ${dateStr}</title>
    <style>
        :root {
            --bg: #0a0a0a;
            --text: #ededed;
            --good: #22c55e;
            --bad: #ef4444;
            --card: #171717;
        }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Inter', -apple-system, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 2rem;
            display: flex;
            justify-content: center;
        }
        .container {
            max-width: 800px;
            width: 100%;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .verdict {
            font-size: 3rem;
            font-weight: 800;
            margin-top: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .verdict.good { color: var(--good); }
        .verdict.bad { color: var(--bad); }
        .rationale {
            background: var(--card);
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 3rem;
            border: 1px solid #333;
        }
        .headlines-list {
            list-style: none;
            padding: 0;
        }
        .headline-item {
            background: var(--card);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid #333;
        }
        .headline-item span {
            display: block;
            font-size: 0.8rem;
            color: #888;
            margin-bottom: 0.5rem;
        }
        a { color: var(--good); text-decoration: none; font-size: 0.9rem; }
        .back-link { margin-bottom: 2rem; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Pulse Dashboard</a>
        <div class="header">
            <span>THE PULSE OF HUMANITY</span>
            <h1>${dateStr}</h1>
            <div class="verdict ${status.toLowerCase()}">${status}</div>
        </div>
        
        <div class="section">
            <h2>The Pulse Analysis</h2>
            <div class="rationale">
                ${rationale.replace(/\n/g, '<br>')}
            </div>
        </div>

        <div class="section">
            <h2>Headlines Ledger</h2>
            <ul class="headlines-list">
                ${headlines.map(h => `
                    <li class="headline-item">
                        <span>${h.source.name}</span>
                        <strong>${h.title}</strong>
                        <p>${h.description || ""}</p>
                        <a href="${h.url}" target="_blank">Read more</a>
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>
</body>
</html>
    `;

    fs.writeFileSync(filePath, htmlContent);
    return `/pulse/${fileName}`;
  }

  async runDailyCheck(date: Date = new Date()) {
    // Set to 23:50 UTC or similar as per PRD if needed, but for manual triggers it's flexible
    const normalizedDate = new Date(date.toISOString().split("T")[0]);
    
    console.log(`Running Daily Pulse Check for ${normalizedDate.toISOString()}...`);
    
    const headlines = await this.extractNews();
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
