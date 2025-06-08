# TraI - Advanced AI Companion

TraI is an advanced AI companion web application that evolves through developmental stages, learning user personality and speech patterns through persistent memory and multimodal interactions.

## Core Features

### 🤖 Developmental AI System
- **Progressive Learning Stages**: Infant → Toddler → Child → Adolescent → Adult
- **Memory Evolution**: Starts with zero knowledge and gradually learns user traits
- **Personality Mirroring**: Adapts conversation style based on user interactions
- **Word Learning Tracking**: Monitors vocabulary growth through stages

### 🎤 Voice & Audio Capabilities
- **Voice Input**: Web Speech API integration for voice-to-text transcription
- **Text-to-Speech**: ElevenLabs integration with multiple voice profiles
- **Dynamic Voice Selection**: Voice changes based on mood and conversation stage
- **Audio Playback Controls**: Replay last bot responses

### 🧠 Memory & Learning System
- **Persistent User Memory**: Stores conversation history and learned facts
- **Fact Extraction**: Automatically identifies and stores personal information
- **Memory Importance Analysis**: Categorizes memories by significance (low, medium, high, critical)
- **Incremental Reflection**: Builds understanding over time

### 📊 Progress Tracking
- **Memory Dashboard**: Visual progress tracking with stage indicators
- **Conversation Statistics**: Word count, facts learned, memory count
- **Weekly Summaries**: AI-generated reflection summaries
- **Learning Milestones**: Achievement tracking system

### 🎯 Personality Modes
- **Friend Mode**: Casual conversation and friendly banter
- **Counsel Mode**: Advice and guidance for decisions
- **Study Mode**: Research and learning assistance
- **Diary Mode**: Listening and emotional support
- **Goal-Setting Mode**: Track progress and achieve milestones
- **Wellness Mode**: Mental health and mindfulness support
- **Creative Mode**: Brainstorming and creative inspiration

### 📱 Mobile-First Design
- **Responsive Interface**: Optimized for mobile devices
- **Touch-Friendly Controls**: Large buttons and intuitive navigation
- **Mobile Menu System**: Collapsible navigation for small screens
- **Voice Controls**: Easy access to microphone functionality

### 🔮 Daily Features
- **Daily Affirmations**: Personalized motivational messages
- **Horoscope Integration**: Contextual astrological insights
- **Time-Aware Responses**: Considers time of day and context

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
- **WebSocket**: Real-time communication support

### AI & Voice Services
- **OpenAI GPT-4o**: Natural language processing and generation
- **ElevenLabs**: High-quality text-to-speech synthesis
- **Web Speech API**: Browser-based voice recognition

### Key API Endpoints
- `POST /api/chat` - Send messages and receive AI responses
- `GET /api/stats` - Retrieve user progress statistics
- `GET /api/weekly-summary` - Generate reflection summaries
- `POST /api/transcribe` - Voice-to-text transcription
- `POST /api/text-to-speech` - Generate audio from text
- `GET/POST /api/voice/*` - Voice profile management
- `GET/POST /api/memories` - Memory management
- `GET/POST /api/facts` - User fact storage

## Data Models

### User Progress Tracking
- Conversation word count and stage progression
- Learned vocabulary and fact accumulation
- Memory importance categorization
- Milestone achievement records

### Memory System
- User facts (personal information, preferences)
- Conversation memories with emotional context
- Learning patterns and behavioral insights
- Temporal memory with timestamp labeling

### Voice Profiles
- Multiple voice personalities (James, Brian, Alexandra, Carla)
- Mood-based voice selection
- Emotional tone matching
- Custom voice settings per user

## Development Features

### Stage-Based Learning
The AI progresses through developmental stages based on conversation volume:
- **Infant (0-50 words)**: Basic responses, simple learning
- **Toddler (51-150 words)**: Improved context understanding
- **Child (151-300 words)**: Enhanced personality recognition
- **Adolescent (301-500 words)**: Complex reasoning and memory
- **Adult (500+ words)**: Full personality mirroring and advanced insights

### Memory Importance Algorithm
Automatically categorizes memories based on:
- Personal details (names, locations, relationships)
- Emotional content and significance
- Goals and aspirations
- Professional context
- Temporal relevance

### Voice Selection Logic
Chooses appropriate voice based on:
- Current mood analysis
- Conversation stage
- Time of day
- Emotional context
- User preferences

## Mobile Optimization

### Interface Design
- Large touch targets (48px minimum)
- Simplified navigation with mobile menu
- Optimized text sizing and spacing
- Gesture-friendly interactions

### Performance
- Efficient data caching
- Optimized API calls
- Progressive loading
- Offline capability consideration

## Security & Privacy

### Data Protection
- Secure API key management
- Environment variable configuration
- User data encryption considerations
- Privacy-focused design principles

### Authentication Ready
- User session management structure
- Multi-user support architecture
- Secure data isolation patterns

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

## Future Enhancements

### Planned Features
- Advanced emotion recognition
- Long-term memory consolidation
- Multi-language support
- Enhanced personality customization
- Social sharing capabilities
- Advanced analytics dashboard

### Technical Improvements
- WebSocket real-time features
- Advanced caching strategies
- Performance optimizations
- Enhanced mobile features
- Progressive Web App capabilities

---

TraI represents the future of personalized AI companionship, combining advanced natural language processing with persistent memory and multimodal interaction capabilities.