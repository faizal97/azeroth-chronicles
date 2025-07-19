# Azeroth Chronicles

A text-based RPG adventure set in the Warcraft universe, powered by AI.

## Features

- **Interactive Storytelling**: Experience epic adventures across different Warcraft expansions
- **AI-Powered Game Master**: Choose between OpenAI and Google Gemini for dynamic storytelling
- **Character Customization**: Play as iconic Warcraft characters or create your own
- **Rich Audio Experience**: Text-to-speech narration and background music
- **Responsive Design**: Beautiful UI with Warcraft-inspired aesthetics
- **Persistent Game State**: Your progress is automatically saved to localStorage
- **Cost Control**: Configurable token limits and context detail levels

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Zustand with persistence
- **AI Integration**: OpenAI GPT and Google Gemini APIs
- **Audio**: Web Speech API for TTS, HTML5 Audio for music
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom Radix UI components
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for OpenAI and/or Google Gemini (can be added via UI)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd azeroth-chronicles
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables (optional):
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### API Key Setup

You can add your API keys in two ways:

1. **Via UI** (Recommended): Use the in-game settings to add your OpenAI or Gemini API keys
2. **Via Environment**: Add keys to `.env.local` file

## Deployment to Vercel

### Automatic Deployment

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js settings

2. **Configure Environment Variables** (Optional):
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add any default API keys or configuration

3. **Deploy**:
   - Push to your main branch
   - Vercel will automatically build and deploy

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

## How to Play

1. **Start the Game**: The game automatically initializes when you first visit the page
2. **Enter Actions**: Type your desired action in natural language in the input field
3. **Examples of Actions**:
   - "Look around the area"
   - "Talk to the nearby merchant"
   - "Head north towards the forest"
   - "Attack the orc with my sword"
   - "Use a health potion"
4. **Character Management**: Your character sheet shows your current health, inventory, and location
5. **Game Persistence**: Your progress is automatically saved and will be restored when you return

## Game Features

### Character System
- **Health Points**: Monitor your character's health with a visual health bar
- **Inventory Management**: Items are automatically added/removed based on your actions
- **Location Tracking**: See where you are in the world
- **Class & Level**: Your character progresses through the adventure

### AI Dungeon Master
- **Dynamic Responses**: The AI responds to your actions with rich, contextual narrative
- **World Consistency**: Maintains knowledge of your character state and previous actions
- **Lore-Accurate**: Stays true to Warcraft universe lore and The Third War setting

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   └── page.tsx        # Main game page
├── components/         # React components
│   ├── ui/            # Radix UI components
│   ├── ScenarioSelection.tsx
│   ├── CharacterSelection.tsx
│   ├── CharacterSheet.tsx
│   ├── SettingsModal.tsx
│   ├── OnboardingModal.tsx
│   ├── BackgroundMusic.tsx
│   └── TokenUsageDisplay.tsx
├── hooks/             # Custom React hooks
│   ├── useBackgroundMusic.ts
│   ├── useTooltipOnHover.ts
│   └── useOnboarding.ts
├── lib/               # Utilities and LLM providers
│   ├── llm-providers/ # AI provider implementations
│   ├── tokenEstimator.ts
│   └── utils.ts
└── stores/            # Zustand state stores
    ├── useGameStore.ts
    └── useSettingsStore.ts
```

## Configuration

### LLM Providers

The game supports multiple AI providers:

- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 models
- **Google Gemini**: Gemini Pro, Gemini Flash models

### Audio Settings

- **Text-to-Speech**: Configurable voice and speed
- **Background Music**: Volume control and enable/disable
- **Typewriter Effect**: Adjustable typing speed

### Game Settings

- **Context Detail**: Minimal, Standard, or Rich descriptions
- **History Length**: How much game history to include in AI context
- **Max Tokens**: Control response length and cost

## Security Note

This implementation places the API key in the frontend code for development purposes. This is acceptable for a private, personal project but should not be used for public websites. For production use, implement a backend API to handle LLM requests securely.

## Troubleshooting

### Common Issues

1. **"API key not found" error**: Make sure your `.env.local` file contains the correct API key
2. **Game state not loading**: Clear your browser's localStorage for the site
3. **Build errors**: Run `npm run build` to check for TypeScript/ESLint issues

### API Rate Limits

The Google Gemini API has rate limits. If you encounter rate limit errors, wait a moment before taking your next action.

## Contributing

This is a hobby project, but feel free to fork and modify it for your own use!

## License

This project is for educational and personal use. Warcraft is a trademark of Blizzard Entertainment.