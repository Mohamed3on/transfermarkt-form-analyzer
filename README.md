# Football Form Tracker

Analyze football team and player form data from Transfermarkt.

**Live:** https://football-form.vercel.app

## Features

### Team Form Tracker (`/`)
Analyzes the top 5 European leagues to find teams with exceptional form across multiple metrics:
- Points
- Goal difference
- Goals scored
- Goals conceded

Teams qualifying in 2+ categories are highlighted.

### Player Scout (`/player-form`)
Find overpriced underperformers - players with:
- Higher market value than a target player
- Fewer goal contributions (goals + assists)
- Same or more minutes played

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- React Query
- Cheerio (scraping)
- Vercel (auto-deploy)

## Development

```bash
pnpm install
pnpm dev
```

## API

| Endpoint | Cache | Description |
|----------|-------|-------------|
| `GET /api/analyze` | 1hr | Team form analysis |
| `GET /api/manager/[clubId]` | 1hr | Manager info |
| `GET /api/player-form` | 12hr | Player comparison |
| `GET /api/player-minutes/[playerId]` | 12hr | Player minutes |
| `POST /api/revalidate` | - | Bust all caches |
