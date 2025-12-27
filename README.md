# Daily Tracker PWA

A Progressive Web App for tracking daily food intake and workouts using voice recordings.

## Features

- 🎤 Voice recording and transcription
- 🍎 Food entry tracking with nutritional information
- 💪 Workout tracking with calorie calculations
- 📊 Statistics and charts
- 📱 Installable PWA (works offline after installation)
- 💾 Local data storage (IndexedDB)

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment to GitHub Pages

### Initial Setup

1. Create a GitHub repository for this project
2. Push your code to the repository

### Deploy

```bash
npm run deploy
```

This will:
1. Build the production version
2. Deploy to the `gh-pages` branch
3. Make your app available at `https://[username].github.io/[repo-name]`

### Manual GitHub Pages Setup

1. Go to your repository settings on GitHub
2. Navigate to "Pages" section
3. Select source: "Deploy from a branch"
4. Select branch: `gh-pages`
5. Select folder: `/ (root)`
6. Click Save

### After Deployment

1. Visit your GitHub Pages URL
2. On iPhone Safari, tap the Share button
3. Select "Add to Home Screen"
4. The app will install as a PWA

## App Icons

Before deploying, replace the placeholder icon files in `public/icons/`:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

You can create these using any image editor or online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

## Browser Support

- Chrome/Edge (recommended)
- Safari (iOS 14.5+)
- Firefox

Note: Web Speech API support varies by browser. Safari on iOS supports it but may have limitations.

## Project Structure

```
src/
├── components/          # React components
│   ├── RecordingView.tsx
│   ├── HistoryView.tsx
│   ├── StatisticsView.tsx
│   ├── SettingsView.tsx
│   └── components/     # Reusable components
├── services/            # Business logic
│   ├── recordingService.ts
│   ├── speechService.ts
│   ├── foodParser.ts
│   ├── workoutParser.ts
│   ├── foodDatabase.ts
│   ├── workoutCalculator.ts
│   ├── statisticsService.ts
│   └── storageService.ts
├── models/              # TypeScript interfaces
└── App.tsx              # Main app with routing
```

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- Recharts (charts)
- React Router
- Vite PWA Plugin

## License

MIT
