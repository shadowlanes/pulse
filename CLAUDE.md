# Pulse - Daily Humanity Health Monitor

A full-stack application that analyzes global news headlines daily using AI to generate a "pulse score" representing humanity's overall well-being. Shows the last 7 days of data with beautiful visualizations.

## Architecture Overview

### Tech Stack

**Frontend (`/fe`)**
- React 19 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI components
- Fetches data from API endpoints

**Backend (`/be`)**
- Node.js + Express.js + TypeScript
- Prisma ORM with PostgreSQL
- Mastra AI framework with Google Gemini Flash
- Node-cron for scheduled tasks
- Swagger/OpenAPI documentation

### Database Schema

```prisma
model Pulse {
  id        String   @id @default(cuid())
  date      DateTime @unique
  status    String   // "Good" or "Bad"
  score     Float    @default(5.0)  // 0.0 - 10.0
  headlines Json     // Array of 20 news headlines
  rationale String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Score Scale:**
- 0-1.9: Chaos/Catastrophe
- 2-3.9: Major setbacks
- 4-5.9: Mixed/Neutral
- 6-7.9: Steady progress
- 8-10.0: Peak humanity

## How It Works

### Daily Workflow (Automated)

1. **Cron Job** runs at 23:50 UTC daily (`be/src/cron/pulse.cron.ts`)
2. **News Extraction** (`PulseService.extractNews()`)
   - Today: NewsAPI top headlines (20 articles)
   - Historical: GNews API with date range query
3. **AI Analysis** (`PulseService.analyzePulse()`)
   - Google Gemini Flash analyzes headlines
   - Returns: status ("Good"/"Bad"), score (0-10), rationale
4. **Database Save** (`PulseService.savePulse()`)
   - Upserts to PostgreSQL via Prisma
5. **Frontend Display**
   - Fetches last 7 days via API
   - Shows calendar view with scores
   - Displays detailed analysis on selection

### API Endpoints

**Public Endpoints:**
- `GET /api/pulse/last-7-days` - Complete data for last 7 days (used by frontend)
- `GET /api/pulse/history?start=YYYY-MM-DD&end=YYYY-MM-DD` - Date-filtered history (basic fields only)
- `GET /api/pulse/details/:date` - Full details for specific date
- `GET /api/pulse/metrics` - Weekly/monthly statistics
- `GET /api/health` - Health check

**Localhost-Only Endpoints:**
- `POST /api/pulse/trigger-check` - Manually trigger pulse check
  - Validates IP is localhost (127.0.0.1, ::1, ::ffff:127.0.0.1)
  - Body: `{ date?: "YYYY-MM-DD" }` (optional, defaults to today)
  - Returns: `{ status, score, message? }`

**Documentation:**
- Swagger UI available at `/api-docs`

## Project Structure

```
pulse/
├── be/                          # Backend
│   ├── src/
│   │   ├── index.ts            # Express server setup
│   │   ├── routes/
│   │   │   └── pulse.routes.ts # API endpoints
│   │   ├── services/
│   │   │   └── pulse.service.ts # Core business logic
│   │   ├── cron/
│   │   │   └── pulse.cron.ts   # Scheduled tasks
│   │   └── lib/
│   │       └── prisma.ts       # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Migration history
│   ├── package.json
│   └── .env                    # Environment variables
│
├── fe/                         # Frontend
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── components/
│   │   │   ├── PulseCalendar.jsx  # 7-day grid view
│   │   │   ├── PulseMetrics.jsx   # Score display
│   │   │   └── Atmosphere.jsx     # Background effects
│   │   └── index.css          # Tailwind + custom styles
│   ├── public/                # Static assets
│   ├── package.json
│   └── .env                   # VITE_API_URL
│
├── pulse-insert.sql           # SQL for migrating local data to production
└── CLAUDE.md                  # This file
```

## Environment Variables

**Backend (`/be/.env`):**
```bash
DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
PORT=3001
FRONTEND_URL="http://localhost:8100"
NEWS_API_KEY="your_newsapi_key"
GEMINI_API_KEY="your_gemini_key"
GNEWS_API_KEY="your_gnews_key"
```

**Frontend (`/fe/.env`):**
```bash
VITE_API_URL="http://localhost:3001"
```

## Setup & Development

### Backend Setup

```bash
cd be

# Install dependencies
npm install

# Setup database (first time)
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Development
npm run dev

# Build for production
npm run build
npm start

# Run migrations in production
npm run migrate
```

### Frontend Setup

```bash
cd fe

# Install dependencies
npm install

# Development
npm run dev  # Runs on http://localhost:8100

# Build for production
npm run build
npm run preview
```

### Docker Database (Local Development)

```bash
docker run -d \
  --name pulse-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=pulse_db \
  -p 5432:5432 \
  postgres:17-alpine
```

## Key Implementation Details

### Frontend Data Flow

1. **App.jsx** fetches from `/api/pulse/last-7-days` on mount
2. Stores data in `history` state
3. **PulseCalendar** generates last 7 calendar days (even if no data)
4. User clicks date → updates `selectedDate`
5. **App.jsx** finds matching data from `history`
6. Displays in detail panel with:
   - Score + status (Steady/Arrythmia)
   - Rationale quote
   - 20 clickable headline cards
   - Archive ID

### Backend Service Logic

**PulseService.runDailyCheck(date):**
1. Normalize date to midnight UTC
2. Check if entry exists in database
3. If exists: return existing data
4. If not:
   - Extract 20 headlines from news API
   - Analyze with Gemini AI
   - Save to database
   - Return result

**News Sources:**
- **Current day**: NewsAPI top headlines (English, general category)
- **Historical**: GNews search API (query: "world OR news OR humanity OR progress")

### CORS Configuration

Backend has CORS enabled for `FRONTEND_URL` environment variable:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Security Features

- Localhost-only trigger endpoint with IP validation
- Environment-based CORS configuration
- Prisma prepared statements (SQL injection protection)
- No static file generation (removed for security/simplicity)

## Recent Changes (Migration from Static to API)

### What Was Removed
- ❌ Static HTML page generation (`generateStaticPage()`)
- ❌ Static JSON file generation (`generatePulseDataJson()`)
- ❌ Handlebars templating engine
- ❌ File system operations for static content
- ❌ "View Full Report" button linking to static HTML

### What Was Added
- ✅ New API endpoint: `GET /api/pulse/last-7-days`
- ✅ Frontend fetches from API instead of static JSON
- ✅ Localhost-only security for trigger endpoint
- ✅ Enhanced error handling with loading/error states
- ✅ Cleaner service code (database-only operations)

### Migration Benefits
- No manual JSON file updates needed
- Real-time data from database
- Simpler deployment (no static file sync)
- Better scalability
- Single source of truth (PostgreSQL)

## Database Migration

To migrate local database data to production:

```bash
# 1. Export data from local database (already done in pulse-insert.sql)
# 2. Connect to production database
psql <production-database-url>

# 3. Run the insert script
\i /path/to/pulse-insert.sql

# 4. Verify
SELECT COUNT(*) FROM "Pulse";
```

The `pulse-insert.sql` file uses `ON CONFLICT` clauses, so it's safe to run multiple times.

## Common Tasks

### Manually Trigger a Pulse Check

```bash
curl -X POST http://localhost:3001/api/pulse/trigger-check \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-01-04"}'
```

### Query Database Directly

```bash
npx prisma studio  # GUI
# or
psql $DATABASE_URL
```

### View Logs

Backend logs include:
- News extraction count
- AI analysis results
- Database save confirmations
- Cron job execution times

### Add New Migration

```bash
cd be
npx prisma migrate dev --name add_new_field
```

## Troubleshooting

### Frontend not loading data
- Check `VITE_API_URL` in `/fe/.env`
- Verify backend is running on correct port
- Check browser console for CORS errors
- Ensure database has data for last 7 days

### Cron job not running
- Check system time vs. UTC (cron uses UTC)
- Verify cron is initialized in `src/index.ts`
- Check logs for errors
- Test manually via trigger endpoint

### Database connection issues
- Verify `DATABASE_URL` format
- Check PostgreSQL is running
- Ensure database exists
- Run `npx prisma generate` if Prisma client errors

### AI analysis failing
- Verify `GEMINI_API_KEY` is valid
- Check API quota/rate limits
- Test with smaller headline set
- Review Mastra framework logs

## Production Deployment Checklist

### Backend
- [ ] Set production `DATABASE_URL`
- [ ] Set correct `FRONTEND_URL` for CORS
- [ ] Add all API keys (NEWS_API_KEY, GEMINI_API_KEY, GNEWS_API_KEY)
- [ ] Run `npm run migrate` to deploy schema
- [ ] Set `PORT` environment variable
- [ ] Verify cron job timezone (should be UTC)
- [ ] Test trigger endpoint is blocked from non-localhost

### Frontend
- [ ] Set production `VITE_API_URL`
- [ ] Run `npm run build`
- [ ] Deploy `dist` folder to static host
- [ ] Test CORS from production domain
- [ ] Verify loading and error states work

### Database
- [ ] PostgreSQL 12+ recommended
- [ ] Run migrations with `npm run migrate`
- [ ] Import historical data from `pulse-insert.sql`
- [ ] Set up automated backups
- [ ] Monitor connection pool limits

## API Rate Limits

- **NewsAPI**: 1000 requests/day (free tier)
- **GNews**: 100 requests/day (free tier)
- **Google Gemini**: Varies by tier

Consider these when running manual checks or backfilling data.

## Future Enhancements Ideas

- Add user authentication for trigger endpoint
- Implement caching layer (Redis)
- Add more news sources for diversity
- Create admin dashboard
- Export data to CSV/JSON
- Add data visualization charts
- Implement webhook notifications
- Add multiple AI providers for redundancy

## Support & Documentation

- Swagger API docs: `http://localhost:3001/api-docs`
- Prisma docs: https://www.prisma.io/docs
- Mastra docs: https://docs.mastra.ai
- Google Gemini: https://ai.google.dev/docs

---

**Last Updated**: 2026-01-04
**Current Version**: 1.0.0 (Post-static migration)
