# TraI - Mental Wellness & Therapy Application

TraI is a comprehensive AI-powered mental wellness companion featuring subscription-based monetization, advanced therapeutic support, and privacy-first architecture for both anonymous and registered users.

## Features Overview

### Core Functionality
- **AI Conversations**: OpenAI GPT-4o powered therapeutic conversations with personality mirroring
- **8-Voice System**: Professional ElevenLabs voices (James, Brian, Alexandra, Carla, Hope, Charlotte, Bronson, Marcus)
- **Subscription System**: Freemium model with device-based subscriptions for anonymous users
- **Mood Tracking**: Comprehensive mood entries with intensity, tags, and AI analysis
- **Therapeutic Journaling**: Private journaling with voice-to-text and AI insights
- **Crisis Detection**: Real-time detection and intervention with professional support resources

### Premium Features (Subscription Required)
- **Unlimited AI Conversations**: Remove 10/month limit for free users
- **Advanced Analytics**: Detailed emotional patterns and longitudinal trends
- **Voice Features**: Full voice synthesis and speech-to-text capabilities
- **Export Capabilities**: PDF/CSV reports for healthcare providers
- **Personality Insights**: Deep AI analysis of communication patterns and growth areas

### Advanced Capabilities
- **Progressive Web App**: Installable mobile app with offline functionality
- **Anonymous Privacy**: Device fingerprint-based identification, no personal data required
- **Professional Integration**: EHR systems, insurance compatibility, therapist portal
- **Multi-Device Sync**: Seamless experience across all devices
- **6 Luxury Themes**: Sophisticated color schemes with glass morphism effects
- **Memory System**: AI maintains contextual personality insights across sessions

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite with Tailwind CSS luxury design system
- **Backend**: Express.js + TypeScript with comprehensive API endpoints
- **Database**: PostgreSQL with Drizzle ORM and complete schema management
- **Payments**: Stripe integration with subscription management and webhooks
- **AI Services**: OpenAI GPT-4o, ElevenLabs TTS (8 voices), Whisper STT
- **Authentication**: JWT tokens with anonymous user support and device fingerprinting
- **State Management**: TanStack Query + Context providers for subscription state

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   # Required Core Services
   OPENAI_API_KEY=your_openai_key
   DATABASE_URL=your_postgresql_url
   
   # Subscription System (Required for Premium Features)
   STRIPE_SECRET_KEY=sk_test_...
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Optional Voice Features
   ELEVENLABS_API_KEY=your_elevenlabs_key
   ```

3. **Initialize Database**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5000` to access TraI Mental Wellness Companion.

## Monetization Model

### Free Tier
- 10 AI conversations per month
- Basic mood tracking and journaling
- Community support access
- Standard analytics

### Premium Tier ($9.99/month)
- Unlimited AI conversations
- Advanced emotional intelligence features
- Voice synthesis and speech-to-text
- Professional exports and EHR integration
- Deep personality insights and analytics

## Documentation Suite

- **[PRODUCT_FEATURES.md](PRODUCT_FEATURES.md)**: Complete feature specifications and capabilities
- **[TECH_DOCS.md](TECH_DOCS.md)**: Development guides, API reference, and architecture
- **[SECURITY.md](SECURITY.md)**: Privacy compliance, security measures, and data protection

## Privacy & Compliance

TraI implements zero-knowledge architecture with complete user data isolation. Anonymous users can access all features through device fingerprinting, with seamless migration to registered accounts. Full GDPR/HIPAA compliance with enterprise-grade security measures.

## Support & Professional Integration

Compatible with healthcare systems through FHIR standards, insurance reporting, and professional therapist portal. Comprehensive crisis detection with immediate intervention resources and professional escalation pathways.

## License

Proprietary mental wellness platform with enterprise licensing available.