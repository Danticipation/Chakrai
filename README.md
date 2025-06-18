# TraI - Mental Wellness & Therapy Application

TraI is a professional mental wellness and therapy application designed for people seeking therapeutic support. The interface features a calming, thoughtful design with soothing pastel colors to create a welcoming, professional environment for mental health conversations.

## Core Features

### 🎯 Therapeutic Personality Modes
- **Friend Mode**: Casual conversation and supportive dialogue
- **Counsel Mode**: Guidance and advice for life decisions
- **Study Mode**: Learning and educational assistance
- **Diary Mode**: Emotional support and reflective listening
- **Goal-Setting Mode**: Wellness goal tracking and motivation
- **Wellness Mode**: Mental health and mindfulness support
- **Creative Mode**: Brainstorming and creative inspiration

### 🎤 Voice & Audio Capabilities
- **Voice Input**: Web Speech API integration for voice-to-text transcription
- **Text-to-Speech**: ElevenLabs integration with 4 distinct voice profiles
- **Voice Selection**: James (default), Brian, Alexandra, and Carla voices
- **Audio Playback**: Replay therapeutic responses with consistent voice output

### 💭 Daily Reflection System
- **Dynamic Daily Reflection**: Updates based on user interactions with therapeutic themes
- **Conversation Analysis**: Detects themes like stress management, goal setting, emotional awareness
- **Contextual Prompts**: Time-aware reflection messages that evolve with dialogue
- **Daily Affirmations**: Personalized motivational messages for mental wellness

### 🎯 Wellness Goal Tracking
- **Customizable Goals**: Create and track personal wellness objectives
- **Progress Visualization**: Interactive progress bars with completion celebrations
- **Goal Categories**: Daily habits, wellness practices, and personal development
- **Achievement Recognition**: Motivational feedback for goal completion

### 🎨 Therapeutic Interface Design
- **Calming Color Palette**: Soft blue (#ADD8E6), pale green (#98FB98), gentle lavender (#E6E6FA)
- **Professional Layout**: Clean 3-panel desktop design for focused therapeutic sessions
- **Visual Hierarchy**: Gradients, shadows, and depth to differentiate interface elements
- **Interactive Elements**: Hover states, animations, and visual feedback for engaging experience

### 📱 Responsive Design
- **Desktop Layout**: Three-panel design with Daily Reflection, Chat Interface, and Wellness Goals
- **Mobile Optimization**: Touch-friendly controls and simplified navigation
- **Accessibility**: High contrast text and intuitive interface flow
- **Settings Modal**: Comprehensive configuration options with therapeutic design

## Technical Architecture

### Frontend
- **React + TypeScript**: Type-safe component development
- **Vite**: Fast development and building
- **Tailwind CSS**: Utility-first styling
- **TanStack Query**: Data fetching and caching
- **Wouter**: Lightweight routing

### Backend
- **Express.js**: RESTful API server
- **PostgreSQL**: Persistent data storage
- **Drizzle ORM**: Type-safe database operations

### AI & Voice Services
- **OpenAI GPT-4o**: Natural language processing and therapeutic responses
- **ElevenLabs**: High-quality text-to-speech synthesis with 4 distinct voices
- **Web Speech API**: Browser-based voice recognition for user input

### Key API Endpoints
- `POST /api/chat` - Send messages and receive therapeutic AI responses
- `GET /api/stats` - Retrieve wellness goal progress statistics
- `GET /api/daily-content` - Generate daily affirmations and content
- `GET /api/weekly-summary` - Generate therapeutic reflection summaries
- `POST /api/text-to-speech` - Generate audio from text with voice selection
- `POST /api/transcribe` - Voice-to-text transcription for accessibility

## Application Structure

### Therapeutic Chat System
- **Simple Conversations**: No persistent memory or personal data storage
- **Personality Modes**: 7 therapeutic conversation styles for different needs
- **Voice Integration**: Consistent audio responses with 4 distinct voice options
- **Real-time Interaction**: Immediate response generation with voice synthesis

### Wellness Goal Management
- **Custom Goal Creation**: User-defined wellness objectives with progress tracking
- **Visual Progress**: Interactive progress bars with completion animations
- **Goal Categories**: Support for different types of wellness and personal development goals
- **Achievement Feedback**: Motivational responses for goal completion

### Daily Reflection Features
- **Dynamic Content**: Reflection messages that update based on conversation themes
- **Theme Detection**: Automatic analysis of stress, emotions, goals, and mindfulness topics
- **Time Awareness**: Context-sensitive prompts based on time of day
- **Affirmation System**: Daily motivational messages for mental wellness support

### Voice System Architecture
- **James (Default)**: Professional, calm therapeutic voice
- **Brian**: Warm, supportive conversational tone
- **Alexandra**: Clear, articulate guidance voice
- **Carla**: Friendly, encouraging wellness coach style

## Privacy & Design Principles

### Data Privacy
- **No Personal Data Storage**: Conversations are not saved or used to "remember" users
- **Session-Based Interaction**: Each conversation is independent without persistent memory
- **Secure API Communication**: All external API calls use secure environment variables
- **Privacy-First Design**: No user tracking or behavioral data collection

### Therapeutic Design Philosophy
- **Calming Interface**: Therapeutic color palette designed for mental wellness contexts
- **Professional Presentation**: Clean, welcoming design suitable for therapy applications
- **Accessibility Focus**: High contrast text and intuitive navigation for all users
- **Visual Hierarchy**: Clear differentiation between interface elements without overwhelming design

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenAI API key
- ElevenLabs API key

### Environment Setup
```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
```

### Installation
```bash
npm install
npm run db:push
npm run dev
```

## Current Status

### Working Features
- ✅ **Voice System**: All 4 voices (James, Brian, Alexandra, Carla) functioning with distinct audio output
- ✅ **Therapeutic Chat**: 7 personality modes with OpenAI GPT-4o integration
- ✅ **Dynamic Daily Reflection**: Real-time updates based on conversation themes
- ✅ **Wellness Goal Tracking**: Customizable goals with visual progress indicators
- ✅ **Responsive Design**: 3-panel desktop layout with mobile optimization
- ✅ **Audio Features**: Voice input via Web Speech API and text-to-speech playback

### Architecture Notes
- **No Memory Persistence**: Conversations are session-based without user data storage
- **Privacy-Focused**: No personal information collection or behavioral tracking
- **Professional Interface**: Therapeutic color scheme suitable for mental wellness applications
- **Voice Integration**: ElevenLabs API provides consistent, high-quality audio responses

---

TraI is a professional mental wellness application focused on providing therapeutic support through voice-enabled conversations, dynamic reflection features, and wellness goal tracking in a calming, privacy-respecting environment.