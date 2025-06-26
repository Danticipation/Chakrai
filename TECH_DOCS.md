# Technical Documentation

This document provides comprehensive technical information for developers working on TraI.

## Architecture Overview

### System Architecture
TraI follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client (React) │◄──►│ Server (Express)│◄──►│ Database (Postgres)
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  External APIs  │    │   AI Services   │    │  File Storage   │
│ • OpenAI GPT-4o │    │ • ElevenLabs    │    │ • Local/Cloud   │
│ • Whisper API   │    │ • Transcription │    │ • Encrypted     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack

**Frontend**
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling with custom therapeutic color schemes
- **TanStack Query** for server state management
- **Wouter** for lightweight client-side routing
- **shadcn/ui** components for consistent UI elements

**Backend**
- **Express.js** with TypeScript for API development
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for primary data storage
- **WebSocket** support for real-time features
- **Multer** for file upload handling

**AI & External Services**
- **OpenAI GPT-4o** for conversational AI and analysis
- **OpenAI Whisper** for speech-to-text transcription
- **ElevenLabs** for text-to-speech synthesis
- **Neon Database** for managed PostgreSQL hosting

## Project Structure

```
trai-mental-wellness/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── styles/         # CSS and styling
│   ├── index.html          # Main HTML template
│   └── vite.config.ts      # Vite configuration
├── server/                 # Backend application
│   ├── index.ts            # Main server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database abstraction layer
│   ├── vite.ts             # Vite middleware setup
│   └── modules/            # Feature-specific modules
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
├── drizzle.config.ts       # Database configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Database Schema

### Core Tables

**Users & Authentication**
```sql
users: id, username, email, password_hash, display_name, onboarding_completed
bots: id, user_id, name, level, words_learned, personality_mode, voice_id
messages: id, user_id, content, is_bot, timestamp
```

**Mental Health Data**
```sql
journal_entries: id, user_id, content, mood, mood_intensity, tags, is_private
mood_entries: id, user_id, mood_type, intensity, triggers, notes
therapeutic_goals: id, user_id, title, description, target_date, completed
```

**Analytics & Insights**
```sql
emotional_patterns: id, user_id, pattern_data, confidence_score, detected_at
mood_forecasts: id, user_id, predicted_mood, confidence_score, risk_level
crisis_detection_logs: id, user_id, risk_level, confidence_score, intervention_type
```

**Gamification**
```sql
user_achievements: id, user_id, achievement_id, unlocked_at, is_completed
wellness_streaks: id, user_id, activity_type, current_streak, longest_streak
user_wellness_points: id, user_id, total_points, available_points, current_level
```

## API Reference

### Authentication Endpoints

**POST** `/api/auth/login`
- Login user with credentials
- Returns: JWT token and user data

**POST** `/api/auth/logout`
- Logout current user
- Clears session data

**GET** `/api/auth/user`
- Get current authenticated user
- Returns: User profile data

### Chat & AI Endpoints

**POST** `/api/chat`
```typescript
interface ChatRequest {
  message: string;
  voice?: string;
  userId?: number;
  personalityMode?: string;
}

interface ChatResponse {
  message: string;
  audioData?: string; // base64 encoded audio
  crisisDetected?: boolean;
  crisisData?: CrisisDetectionData;
}
```

**POST** `/api/transcribe`
- Convert audio to text using Whisper
- Accepts: multipart/form-data with audio file
- Returns: { text: string }

**POST** `/api/text-to-speech`
```typescript
interface TTSRequest {
  text: string;
  voice: string;
  emotionalContext?: string;
}
```

### Journal Endpoints

**GET** `/api/journal/entries/:userId`
- Retrieve user's journal entries
- Supports pagination and filtering

**POST** `/api/journal/entry`
```typescript
interface JournalEntryRequest {
  userId: number;
  content: string;
  mood?: string;
  moodIntensity?: number;
  tags?: string[];
  isPrivate?: boolean;
}
```

**GET** `/api/journal/analytics/:userId`
- Get journal analytics and insights
- Returns emotional patterns and trends

### Mood & Wellness Endpoints

**POST** `/api/mood`
```typescript
interface MoodEntryRequest {
  userId: number;
  moodType: string;
  intensity: number;
  triggers?: string[];
  notes?: string;
}
```

**GET** `/api/mood/forecast/:userId`
- Get mood forecasting data
- Returns predictions and risk assessments

**GET** `/api/wellness/overview/:userId`
- Comprehensive wellness dashboard data
- Includes scores, trends, and recommendations

## Development Workflow

### Local Development Setup

1. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Configure required variables
   DATABASE_URL=postgresql://username:password@localhost:5432/trai
   OPENAI_API_KEY=sk-...
   ELEVENLABS_API_KEY=...
   SESSION_SECRET=your-secret-key
   ```

2. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Optional: Open database studio
   npm run db:studio
   ```

3. **Development Server**
   ```bash
   # Start development mode (both frontend and backend)
   npm run dev
   
   # Backend only
   npm run server:dev
   
   # Frontend only
   npm run client:dev
   ```

### Build & Deployment

**Production Build**
```bash
# Build frontend for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

**Database Migrations**
```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

## Component Architecture

### Frontend Components

**Core Components**
- `App.tsx` - Main application shell with routing
- `AppLayout.tsx` - Layout wrapper with navigation
- `Chat.tsx` - Main chat interface
- `TherapeuticJournal.tsx` - Journaling interface

**Feature Components**
- `MoodTracking.tsx` - Mood selection and tracking
- `AnalyticsDashboard.tsx` - Data visualization
- `CommunitySupport.tsx` - Peer support features
- `VRTherapy.tsx` - Virtual reality integration

**Shared Components**
- `VoiceSelector.tsx` - Voice selection interface
- `PersonalityReflection.tsx` - AI personality insights
- `CrisisSupport.tsx` - Crisis intervention UI

### State Management

**TanStack Query Configuration**
```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});
```

**Custom Hooks**
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
```

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Lazy loading for feature components
- **Image Optimization**: SVG icons and optimized assets
- **Bundle Analysis**: Vite bundle analyzer for size monitoring
- **Caching**: Service worker for offline functionality

### Backend Optimization
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: Optimized database connection management
- **Caching**: Redis for session storage and frequent queries
- **Compression**: Gzip compression for API responses

### AI Service Optimization
- **Response Caching**: Cache similar AI responses
- **Rate Limiting**: Prevent API abuse and manage costs
- **Streaming**: Real-time response streaming for chat
- **Fallback Handling**: Graceful degradation when services unavailable

## Testing Strategy

### Frontend Testing
```bash
# Unit tests with Vitest
npm run test

# E2E tests with Playwright
npm run test:e2e

# Component testing
npm run test:components
```

### Backend Testing
```bash
# API integration tests
npm run test:api

# Database tests
npm run test:db
```

### Testing Patterns
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing
- **Accessibility Tests**: WCAG compliance testing

## Deployment

### Environment-Specific Configurations

**Development**
- Hot reloading enabled
- Detailed error logging
- Development database

**Staging**
- Production-like environment
- Limited external API calls
- Staging database with production data copy

**Production**
- Optimized builds
- Error tracking and monitoring
- Production database with backups

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to production
        run: npm run deploy
```

## Monitoring & Observability

### Application Monitoring
- **Error Tracking**: Sentry for error monitoring and alerting
- **Performance**: Web Vitals tracking for user experience metrics
- **Analytics**: Usage analytics for feature adoption tracking
- **Health Checks**: API endpoint health monitoring

### Database Monitoring
- **Query Performance**: Slow query identification and optimization
- **Connection Monitoring**: Database connection pool metrics
- **Backup Verification**: Automated backup testing and restoration

### AI Service Monitoring
- **API Usage**: Token consumption and cost tracking
- **Response Time**: AI service latency monitoring
- **Quality Metrics**: Response quality and user satisfaction tracking

## Contributing Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled, full type coverage
- **ESLint**: Configured for React and Node.js best practices
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit message format

### Development Process
1. **Feature Branching**: Create feature branches from main
2. **Code Review**: All changes require review before merging
3. **Testing**: Comprehensive test coverage for new features
4. **Documentation**: Update documentation for API changes

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git commit -m "feat: add new therapeutic feature"

# Push and create pull request
git push origin feature/new-feature
```

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify DATABASE_URL environment variable
- Check PostgreSQL service status
- Confirm database exists and permissions

**AI Service Errors**
- Validate API keys in environment variables
- Check API rate limits and quotas
- Monitor service status pages

**Build Failures**
- Clear node_modules and reinstall dependencies
- Check TypeScript compilation errors
- Verify environment variable configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Database query logging
DEBUG=drizzle:* npm run dev

# AI service debugging
DEBUG=openai:* npm run dev
```

---

For additional technical support, consult the development team or open an issue with detailed reproduction steps.