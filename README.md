# Hande PWA

Progressive Web App for Hande - the $1/day ride service.

## Features

- **Rider Flow**: Book rides, view bids, track trips in real-time
- **Driver Flow**: Go online, accept bids, complete trips, track earnings
- **PWA**: Installable on mobile devices, works offline
- **Real-time**: Live location tracking, instant bid notifications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Redux Toolkit + Redux Persist
- **Maps**: Google Maps JavaScript API
- **Real-time**: Pusher (WebSockets)
- **API**: Hande NestJS API

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API Key |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher app key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster |

## Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── driver/         # Driver pages
│   ├── rider/          # Rider pages
│   ├── login/          # Auth pages
│   └── register/       # Registration pages
├── components/         # React components
│   ├── driver/         # Driver-specific components
│   ├── rider/          # Rider-specific components
│   ├── map/            # Map components
│   ├── shared/         # Shared components
│   └── ui/             # UI primitives
├── store/              # Redux store
│   └── slices/         # Redux slices
├── api/                # API client functions
└── lib/                # Utilities
```

## Deployment

The app is configured for deployment on Vercel:

```bash
npm run build
```

## Brand Colors

- Primary Green: `#7ED957`
- Accent Gold: `#FFB800`
- Danger Red: `#FF4C4C`
- Info Blue: `#4DA6FF`

## License

Proprietary - Hande
