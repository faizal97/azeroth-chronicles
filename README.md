# Azeroth Chronicles: A Text-Based Saga

A text-based role-playing game set in the Warcraft universe where a Large Language Model (LLM) acts as the dynamic "Dungeon Master" (DM). The game generates narrative, manages non-player characters (NPCs), and responds to player actions in real-time, creating a unique, story-driven experience.

## Features

- **Dynamic Storytelling**: AI-powered Dungeon Master using Google's Gemini API
- **Persistent Game State**: Your progress is automatically saved to localStorage
- **Immersive UI**: Dark theme with Warcraft-inspired design
- **Real-time Character Management**: Health, inventory, and location tracking
- **Natural Language Actions**: Type your actions in plain English

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand with persistence
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **AI Integration**: Google Gemini API

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Google Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd azeroth-chronicles

# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Replace `your_gemini_api_key_here` with your actual Gemini API key.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

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

### Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Main game interface
├── components/
│   ├── ui/               # shadcn/ui components
│   └── CharacterSheet.tsx # Character stats display
├── lib/
│   ├── utils.ts
│   └── gemini.ts         # AI API integration
└── stores/
    └── useGameStore.ts   # Game state management
```

## Security Note

This implementation places the API key in the frontend code for development purposes. This is acceptable for a private, personal project but should not be used for public websites. For production use, implement a backend API to handle LLM requests securely.

## Customization

### Adding New Scenarios
Edit the initial state in `src/stores/useGameStore.ts` to change the starting scenario, location, or character setup.

### Modifying the AI Behavior
Update the `MASTER_PROMPT` in `src/lib/gemini.ts` to change how the AI Dungeon Master behaves.

### UI Theming
The game uses Tailwind CSS with a dark slate theme. Modify the classes in the components to change the appearance.

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