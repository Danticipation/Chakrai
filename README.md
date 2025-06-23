# TraI - Mental Wellness & Therapy Application

## Overview
TraI is a comprehensive AI-powered mental wellness and therapy application designed to provide therapeutic support through advanced voice interaction, emotional intelligence, and adaptive learning. The application features a calming, professional interface with therapeutic pastel colors and mobile-first design for optimal accessibility.

## Core Features

### 🎯 **Intelligent Chat System**
- **OpenAI GPT-4o Integration**: Dynamic, personality-mirrored therapeutic conversations
- **Real-time Voice Input**: Browser-based speech recognition with microphone button
- **Voice Output**: ElevenLabs TTS with 4 therapeutic voices (James, Brian, Alexandra, Carla)
- **Personality Modes**: 7 different therapeutic conversation styles
  - Friend Mode: Casual conversation and friendly banter
  - Counsel Mode: Advice and guidance for decisions
  - Study Mode: Research and learning assistance
  - Diary Mode: Listening and emotional support
  - Goal-Setting Mode: Track progress and achieve milestones
  - Wellness Mode: Mental health and mindfulness support
  - Creative Mode: Brainstorming and creative inspiration

### 🧠 **Advanced Emotional Intelligence**
- **Real-time Emotion Detection**: Comprehensive emotional analysis using OpenAI GPT-4o
- **Mood Forecasting**: AI-powered predictive mood analysis with confidence scoring
- **Contextual Response Adaptation**: Dynamic communication tone adjustment based on emotional state
- **Crisis Detection & Response**: NLP-driven safety monitoring with automatic intervention
- **Emotional Pattern Analysis**: Long-term emotional trend tracking and insights

### 📊 **Comprehensive Analytics & Reporting**
- **Monthly Wellness Reports**: AI-generated therapeutic summaries with progress analysis
- **Interactive Analytics Dashboard**: Visual emotional journey tracking with charts
- **Progress Metrics**: Wellness scores, emotional volatility, and therapeutic development
- **Risk Assessment**: Automated emotional risk level monitoring with recommendations
- **Longitudinal Trend Analysis**: Multi-month wellness tracking and milestone recognition

### 📝 **Therapeutic Journaling System**
- **AI-Assisted Analysis**: OpenAI-powered emotional pattern recognition and sentiment tracking
- **Voice Input for Entries**: Speak your thoughts with automatic transcription
- **Professional Export Reports**: Therapist-ready clinical insights and recommendations
- **Advanced Analytics**: Emotional journey visualization and recurring theme analysis
- **Crisis Integration**: Journal analysis connects with crisis detection system

### 🎮 **Enhanced Gamification & Rewards**
- **Wellness Points System**: Earn points for therapeutic activities and achievements
- **Achievement Badges**: 20+ badges across 5 categories with rarity levels
- **Rewards Shop**: Virtual rewards, avatars, and premium therapeutic content
- **Community Challenges**: Group wellness challenges with progress tracking
- **Streak Tracking**: Daily check-ins, journaling, and mood tracking streaks

### 👥 **Community & Professional Integration**
- **Anonymous Support Forums**: Safe, moderated spaces for peer discussions
- **Peer Check-ins**: Voluntary support system with privacy-conscious pairing
- **Professional Therapist Portal**: Licensed therapist integration and collaboration
- **Hybrid Therapy Model**: AI-powered self-therapy tools with professional care
- **Session Management**: Video/phone/in-person scheduling with meeting links

### 🌟 **Adaptive Learning & Personalization**
- **Dynamic Therapy Pathways**: AI-curated care plans adapted weekly based on progress
- **Personalized CBT Exercises**: AI-generated cognitive behavioral therapy targeting specific patterns
- **Conversation Pattern Learning**: System learns communication preferences and therapeutic approaches
- **Wellness Recommendations**: Smart suggestions for mindfulness, breathing, and activities
- **Real-time Plan Adaptation**: Intelligent triggers for emotional spikes and breakthroughs

### 🥽 **Immersive VR/AR Therapeutic Experiences**
- **8 Therapeutic Environments**: Peaceful beach, mountain forest, safe therapy room, and more
- **Guided Sessions**: Mindfulness, relaxation, and exposure therapy exercises
- **Progress Tracking**: Effectiveness ratings, stress monitoring, and therapeutic notes
- **AI Recommendations**: Optimal environment selection based on emotional state
- **Accessibility Features**: Audio descriptions, simplified controls, motion sensitivity

### 🔒 **Privacy & Compliance System**
- **Differential Privacy**: Anonymous analytics with configurable epsilon/delta parameters
- **Client-side Encryption**: AES-256-GCM encryption with user-controlled keys
- **Zero-Knowledge Architecture**: Therapeutic data remains private even from administrators
- **Encrypted Backups**: Client-side encrypted data backup with 90-day retention
- **Compliance Dashboard**: Real-time privacy status monitoring and audit logging

### 📱 **Health Integration & Wearables**
- **Device Support**: Apple Watch, Fitbit, Garmin, Samsung Health, Polar
- **Health Correlation Analytics**: Physical health indicators vs emotional states
- **Real-time Sync**: Automated device synchronization with status tracking
- **AI Health Insights**: Personalized wellness recommendations based on health patterns
- **Privacy-conscious Data**: Secure health data handling with user consent controls

### 🎧 **Advanced Voice & Interaction**
- **Emotionally Responsive Voices**: Dynamic voice modulation based on emotional context
- **Interactive Mindfulness Exercises**: 5 guided exercises with breathing patterns
- **Contextual Voice Selection**: Automatic tone adjustment for genuine empathy
- **Multi-language Support**: 12 languages with therapeutic translation accuracy
- **Accessibility Suite**: Screen reader compatibility, high contrast, voice navigation

### 🔍 **AI Performance Monitoring**
- **Response Quality Tracking**: Therapeutic score, empathy score, clarity metrics
- **Crisis Detection Accuracy**: Confidence scoring and intervention effectiveness
- **System Performance Analytics**: Response times, token usage, cost monitoring
- **Quality Assurance**: Automated flagging and review workflows for improvement
- **Scalability Metrics**: Edge computing readiness and health indicators

## Technical Architecture

### Frontend
- **React with TypeScript**: Type-safe, responsive user interface
- **Tailwind CSS**: Mobile-first therapeutic design system
- **Vite**: Fast development and build tooling
- **PWA Support**: Progressive web app with offline capabilities

### Backend
- **Express.js**: RESTful API server with WebSocket support
- **PostgreSQL**: Robust data persistence with Drizzle ORM
- **OpenAI GPT-4o**: Advanced AI conversation and analysis
- **ElevenLabs**: High-quality voice synthesis

### Database Schema
- **User Management**: Profiles, preferences, onboarding status
- **Conversations**: Messages, personality analysis, crisis detection
- **Wellness Tracking**: Mood entries, goals, achievements, streaks
- **Therapeutic Data**: Journal entries, CBT exercises, VR sessions
- **Privacy & Security**: Encryption keys, audit logs, compliance tracking

## Mobile Optimization

### Design Features
- **Therapeutic Color Palette**: Calming pastels (#ADD8E6, #98FB98, #E6E6FA)
- **Touch-friendly Interface**: 44px minimum touch targets, thumb navigation
- **Responsive Layout**: Grouped navigation categories for better UX
- **Safe Area Support**: iOS/Android compatibility with notched devices
- **Performance Optimized**: Smooth scrolling and reduced visual effects

### Navigation System
- **Dashboard Home**: Integrated gamification metrics and grouped categories
- **Category-based Navigation**: Therapy, Wellness, Progress, Tools, More
- **Quick Access**: Chat and microphone always easily accessible
- **Settings Integration**: Voice selection, privacy controls, profile management

## Voice System Features

### Speech Recognition
- **Browser-based Recognition**: Immediate transcription without API dependencies
- **Microphone Permission Handling**: Clear permission requests and error messaging
- **Real-time Feedback**: Visual pulse animation and "🎤 Speak now..." indicators
- **Auto-stop Safety**: 8-second timeout with manual stop capability
- **Error Recovery**: Graceful handling of no-speech and permission errors

### Voice Output
- **4 Approved Voices**: James (default), Brian, Alexandra, Carla
- **Emotional Context**: Dynamic voice modulation for therapeutic conversations
- **Fallback System**: HTML Audio → Web Audio API → Browser TTS
- **Audio Settings**: Voice selection, testing, and download options

## Security & Privacy

### Data Protection
- **End-to-end Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Anonymous Analytics**: Differential privacy with minimum 10-user cohorts
- **Zero-knowledge Storage**: User-controlled encryption keys never leave device
- **Audit Logging**: Complete privacy operation tracking for compliance
- **GDPR Compliance**: Right to export, delete, and data portability

### Crisis Safety
- **Multi-layered Detection**: AI analysis combined with pattern matching
- **Immediate Intervention**: Automatic safety check-ins based on risk level
- **Professional Escalation**: Mental health professional contact automation
- **Resource Provision**: Crisis hotlines and emergency contacts
- **Follow-up Monitoring**: Scheduled check-ins for continued safety

## Getting Started

### Prerequisites
- Node.js 18+ with npm
- PostgreSQL database
- OpenAI API key
- ElevenLabs API key (optional for voice)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd trai-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```
DATABASE_URL=postgresql://[credentials]
OPENAI_API_KEY=sk-[your-key]
ELEVENLABS_API_KEY=[your-key] # Optional
NODE_ENV=development
```

## API Endpoints

### Core Functionality
- `GET /api/stats` - User statistics and bot growth data
- `POST /api/chat` - Send message and get AI response
- `POST /api/text-to-speech` - Convert text to speech
- `GET /api/daily-content` - Daily affirmations and horoscopes

### Wellness & Analytics
- `GET /api/mood-entries` - Retrieve mood tracking data
- `POST /api/mood-entries` - Log new mood entry
- `GET /api/monthly-report` - Generate wellness report
- `GET /api/journal-analytics` - Journal pattern analysis

### Therapeutic Features
- `POST /api/crisis-detection` - Crisis risk assessment
- `GET /api/therapy-plans` - Adaptive therapeutic plans
- `POST /api/mindfulness-sessions` - Log mindfulness exercises
- `GET /api/cbt-exercises` - Get personalized CBT exercises

## Contributing

### Development Guidelines
- Follow mobile-first design principles
- Maintain therapeutic color scheme and calming interface
- Ensure all features work with voice input/output
- Test accessibility features thoroughly
- Document privacy and security implications

### Code Standards
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Component-based architecture
- Responsive design patterns
- Comprehensive error handling

## Support & Documentation

### User Support
- In-app help system with guided tutorials
- Crisis support resources and emergency contacts
- Professional therapist integration and referrals
- Community forums for peer support

### Technical Support
- Comprehensive error logging and monitoring
- Performance analytics and optimization
- Regular security audits and updates
- Scalability planning for growing user base

## License

This project is proprietary software designed for mental health support. Please ensure compliance with healthcare regulations (HIPAA, GDPR) when deploying in production environments.

---

**Note**: TraI is designed to supplement, not replace, professional mental health care. Users experiencing crisis situations should contact emergency services or mental health professionals immediately.