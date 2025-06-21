# TraI - Advanced Mental Wellness & Therapy Application

TraI is a comprehensive AI-powered mental health companion designed to provide personalized therapeutic support through cutting-edge technology and evidence-based therapeutic approaches. The application combines artificial intelligence, voice synthesis, emotional analytics, and accessibility features to create an inclusive and effective mental wellness platform.

## 🌟 Core Features

### 🤖 AI-Powered Therapeutic Conversations
- **Intelligent Chat System**: GPT-4o powered conversations with personality mirroring for authentic self-reflection
- **Persistent Memory**: Bot remembers users across sessions and builds detailed personality profiles
- **Adaptive Learning**: AI analyzes conversation patterns to learn communication preferences and effective therapeutic approaches
- **Crisis Detection**: Real-time NLP analysis identifies suicide risk, self-harm indicators, and mental health crises
- **Emotional Intelligence**: Advanced sentiment analysis with immediate supportive responses based on detected emotional states

### 🎙️ Advanced Voice & Audio Features
- **Multi-Language Voice Synthesis**: ElevenLabs integration supporting 12 languages with emotionally responsive tones
- **Dynamic Voice Modulation**: Automatic emotional context detection for appropriate voice tone and intensity
- **Speech-to-Text**: Whisper-powered voice input for natural therapeutic conversations
- **Closed Captioning**: AI-generated captions for all audio content with emotional tone indicators
- **Interactive Mindfulness**: Guided audio exercises (Box Breathing, Progressive Relaxation, Grounding techniques)

### 🌍 Internationalization & Accessibility
- **12 Language Support**: English, Spanish, French, German, Portuguese, Italian, Chinese, Japanese, Korean, Arabic, Hindi, Russian
- **Cultural Adaptation**: Therapeutic approaches adapted for cultural sensitivity and regional mental health practices
- **Visual Accessibility**: Screen reader support, high contrast modes, adjustable font sizes, color blindness accommodations
- **Hearing Accessibility**: Closed captions, visual alerts, vibration feedback, speech transcription
- **Motor Accessibility**: Voice navigation, larger touch targets, one-handed mode, adjustable dwell times
- **Cognitive Support**: Simplified interfaces, reduced animations, clear language processing, memory aids

### 📊 Analytics & Progress Tracking
- **Monthly Wellness Reports**: AI-generated comprehensive summaries with therapeutic insights and personalized goals
- **Interactive Dashboards**: Multi-tab visual analytics with emotional trends, progress metrics, and activity tracking
- **Mood Analytics**: Visual emotional journey tracking with pattern recognition and volatility analysis
- **Risk Assessment**: Automated emotional risk monitoring with intervention recommendations
- **Longitudinal Analysis**: Multi-month wellness tracking showing progress patterns and achievement milestones

### 📝 Therapeutic Journaling System
- **AI-Assisted Analysis**: GPT-4o powered emotional pattern analysis and sentiment tracking
- **Professional Exports**: Therapist-ready reports with clinical recommendations and risk assessments
- **Emotional Tagging**: Mood selection, trigger identification, gratitude tracking, and goal setting
- **Pattern Recognition**: Recurring theme analysis with confidence scoring and therapeutic insights
- **Crisis Integration**: Journal analysis connects with crisis detection for comprehensive monitoring

### 🏥 Professional Therapist Integration
- **Collaboration Portal**: Licensed therapist connection with secure insight sharing capabilities
- **Session Management**: Video/phone/in-person scheduling with AI-generated session preparation
- **Automated Reporting**: Intelligent sharing of journal summaries, mood patterns, and progress reports
- **Privacy Controls**: Granular settings for data sharing frequency and content types
- **Hybrid Therapy Model**: Integration between AI self-therapy tools and professional therapeutic care

### 🎮 Gamification & Motivation
- **Achievement System**: 20+ badges across engagement, milestone, wellness, and achievement categories
- **Wellness Streaks**: Real-time tracking for daily check-ins, journaling, mood tracking, and chat sessions
- **Progressive Leveling**: Dynamic point system with achievement-based rewards and motivational feedback
- **Activity Tracking**: Automated logging throughout the application with progress monitoring
- **Positive Reinforcement**: Celebratory feedback and visual progress indicators

### 👥 Community & Peer Support
- **Anonymous Forums**: Safe, moderated spaces for discussions across 4 support categories (General, Anxiety, Depression, Crisis)
- **Privacy-Conscious Design**: Anonymous posting with auto-generated supportive usernames
- **Peer Check-Ins**: Voluntary peer support system with privacy-conscious pairing for daily support
- **Community Moderation**: AI-assisted content monitoring with human oversight for safety
- **Supportive Interactions**: Heart reactions and threaded discussions for positive community engagement

### 🎯 Personalization & Adaptive Learning
- **Communication Style Learning**: AI adapts to user preferences for formal/casual/warm/direct/supportive communication
- **Dynamic Recommendations**: Personalized mindfulness exercises, breathing techniques, and wellness activities
- **Conversation Analysis**: Advanced pattern recognition for effective approaches and preferred topics
- **Feedback Integration**: Rating system continuously improves personalization accuracy through user feedback
- **Contextual Adaptation**: Real-time response adjustment while maintaining therapeutic value

### 🆘 Crisis Support & Safety
- **Multi-Layered Detection**: Combined AI analysis with pattern matching for accurate crisis identification
- **Automated Check-Ins**: Scheduled follow-up based on risk level (2-24 hour intervals)
- **Immediate Resources**: Crisis hotlines, emergency contacts, and professional help based on detected risk
- **Safety Protocols**: Five-tier risk classification with specific response protocols for each level
- **Professional Escalation**: Automated mental health professional contact for critical situations

### 📱 Mobile-Optimized Design
- **Therapeutic Interface**: Calming pastel color scheme (#ADD8E6 soft blue, #98FB98 pale green, #E6E6FA gentle lavender)
- **Touch-Friendly**: 44px minimum touch targets optimized for thumb navigation
- **Responsive Layout**: Mobile-first design with proper safe area handling for notched devices
- **Performance Optimized**: Smooth scrolling, reduced shadows, and touch responsiveness

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with therapeutic design system
- **shadcn/ui** component library for consistent UI
- **TanStack Query** for efficient data fetching and caching
- **Wouter** for lightweight routing

### Backend Stack
- **Express.js** with TypeScript for robust API development
- **PostgreSQL** with Drizzle ORM for data persistence
- **OpenAI GPT-4o** for intelligent conversations and analysis
- **ElevenLabs** for advanced voice synthesis
- **WebSocket** for real-time communication

### Key Integrations
- **OpenAI Whisper** for speech-to-text conversion
- **OpenAI GPT-4o** for therapeutic conversations, translations, and analysis
- **ElevenLabs** for multi-language voice synthesis with emotional responsiveness
- **External APIs** for horoscope data and wellness content

### Database Schema
```
Core Tables:
- users: User profiles and authentication
- userFacts: Personality insights and self-reflection data
- userMemories: Conversation history and learned patterns
- messages: Chat conversations with emotional context

Therapeutic Features:
- moodEntries: Daily mood tracking with analytics
- journalEntries: Therapeutic journaling with AI analysis
- crisisDetections: Safety monitoring and intervention tracking
- mindfulnessExercises: Guided wellness activities

Analytics & Progress:
- monthlyReports: AI-generated wellness summaries
- userAchievements: Gamification and progress tracking
- wellnessStreaks: Consistency monitoring
- adaptationInsights: Personalization learning data

Professional Integration:
- therapists: Licensed professional profiles
- therapistSessions: Appointment management
- collaborationSettings: Privacy and sharing preferences

Community Features:
- supportForums: Anonymous discussion spaces
- forumPosts: Community interactions
- peerCheckIns: Peer support system

Accessibility & Internationalization:
- accessibilitySettings: User accommodation preferences
- languagePreferences: Multi-language support configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- API keys for OpenAI and ElevenLabs

### Environment Setup
```bash
# Required environment variables
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
SESSION_SECRET=your_session_secret
```

### Installation
```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Database Migration
```bash
# Push schema changes to database
npm run db:push

# Generate new migration (if needed)
npm run db:generate
```

## 🎯 Usage Examples

### Therapeutic Conversation
```javascript
// AI responds with personality mirroring
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: "I'm feeling anxious about work",
    userId: 1
  })
});
```

### Multi-Language Voice Synthesis
```javascript
// Generate voice in user's preferred language
const audioResponse = await fetch('/api/voice/generate', {
  method: 'POST',
  body: JSON.stringify({
    text: "This is a calming therapeutic message",
    language: "es",
    emotionalContext: "calming"
  })
});
```

### Accessibility Features
```javascript
// Generate voice description for visual elements
const description = await fetch('/api/accessibility/voice-description', {
  method: 'POST',
  body: JSON.stringify({
    elementType: "chart",
    visualContent: "mood trend graph",
    context: "emotional analytics",
    userLanguage: "fr"
  })
});
```

### Crisis Detection
```javascript
// Real-time crisis analysis
const analysis = await fetch('/api/crisis/analyze', {
  method: 'POST',
  body: JSON.stringify({
    message: "User message for analysis",
    userId: 1,
    conversationHistory: []
  })
});
```

## 🔒 Privacy & Security

### Data Protection
- End-to-end encryption for sensitive therapeutic data
- HIPAA-compliant data handling practices
- Granular privacy controls for professional data sharing
- Anonymous community interactions with privacy-first design

### User Control
- Complete data export capabilities
- Selective data sharing with therapists
- Right to data deletion and account termination
- Transparent data usage policies

## 🌐 Supported Languages

1. **English** - 100% complete with full voice support
2. **Spanish** - 95% complete with cultural adaptation
3. **French** - 90% complete with therapeutic terminology
4. **German** - 85% complete with professional tone
5. **Portuguese** - 80% complete with regional variants
6. **Italian** - 75% complete with expressive adaptation
7. **Chinese** - 70% complete with cultural sensitivity
8. **Japanese** - 65% complete with respectful communication
9. **Korean** - 60% complete with hierarchy awareness
10. **Arabic** - 55% complete with RTL support
11. **Hindi** - 50% complete with spiritual elements
12. **Russian** - 45% complete with cultural adaptation

## ♿ Accessibility Compliance

### WCAG 2.1 AA Compliance
- Screen reader compatibility with ARIA labels
- Keyboard navigation for all interactive elements
- Color contrast ratios meeting accessibility standards
- Alternative text for all visual content
- Closed captioning for audio content

### Disability Support
- **Visual**: Screen readers, high contrast, voice descriptions, haptic feedback
- **Hearing**: Closed captions, visual alerts, vibration feedback, transcription
- **Motor**: Voice navigation, larger touch targets, one-handed mode, switch control
- **Cognitive**: Simplified interfaces, clear language, memory aids, focus assistance

## 📈 Performance & Scalability

### Optimization Features
- Server-side rendering for improved load times
- Lazy loading for non-critical components
- Efficient database queries with proper indexing
- CDN integration for static assets
- Progressive Web App capabilities

### Monitoring
- Real-time error tracking and reporting
- Performance metrics and user analytics
- Therapeutic effectiveness measurement
- Crisis intervention response times

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Maintain therapeutic design principles
- Ensure accessibility compliance
- Test multi-language functionality
- Respect user privacy and data protection

### Code Quality
- ESLint and Prettier for code formatting
- TypeScript for type safety
- Jest for unit testing
- Cypress for end-to-end testing

## 📞 Support & Resources

### Emergency Resources
- Crisis hotlines available in all supported languages
- Region-specific mental health services
- 24/7 crisis intervention protocols
- Professional therapist network integration

### Technical Support
- Comprehensive API documentation
- Accessibility testing tools
- Multi-language validation
- Performance monitoring dashboard

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Mental health professionals for therapeutic guidance
- Accessibility consultants for inclusive design
- International translators for cultural adaptation
- Open source community for technical foundations

---

**TraI - Transforming mental wellness through accessible, intelligent, and culturally-aware therapeutic technology.**

For more information, visit our documentation or contact our support team.