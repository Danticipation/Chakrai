# TraI - Mental Wellness Companion Application

TraI is a comprehensive AI-powered mental wellness companion that provides supportive interactions through intelligent, adaptive technology and professional-grade features for mental health and personal growth.

## Features Overview

- **AI Wellness Conversations** - Dynamic personality mirroring with OpenAI GPT-4o
- **Voice Integration** - ElevenLabs text-to-speech with multiple calming voices (Hope, James, Charlotte, Bronson)
- **Comprehensive Journaling** - AI-assisted wellness journaling with analytics
- **Mood & Emotion Tracking** - Real-time emotional analysis and pattern recognition
- **Crisis Detection** - Advanced NLP-driven safety monitoring and intervention
- **Professional Integration** - Clinical collaboration tools and session management
- **Privacy & Compliance** - Zero-knowledge architecture with differential privacy
- **EHR Integration** - FHIR-compliant healthcare data integration for licensed professionals

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- ElevenLabs API key (optional, for voice features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trai-mental-wellness
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file with:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   SESSION_SECRET=your_session_secret
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## Project Structure

```
trai-mental-wellness/
├── client/           # React frontend application
├── server/           # Express backend API
├── shared/           # Shared types and database schema
├── docs/             # Additional documentation
├── README.md         # This file
├── PRODUCT_FEATURES.md  # Product features overview
├── TECH_DOCS.md      # Technical documentation
└── SECURITY.md       # Security and compliance
```

## Architecture

- **Frontend**: React with TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for conversations and analysis
- **Voice**: ElevenLabs for text-to-speech synthesis
- **Real-time**: WebSocket support for live interactions

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Database operations
npm run db:push        # Push schema changes
npm run db:studio      # Open database studio

# Type checking
npm run type-check

# Linting
npm run lint
```

## Documentation

- **[Product Features](PRODUCT_FEATURES.md)** - Comprehensive feature overview
- **[Technical Documentation](TECH_DOCS.md)** - Development and API documentation
- **[Security & Compliance](SECURITY.md)** - Privacy, security, and compliance details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact the development team or open an issue in the repository.

---

**Important**: This application is designed as a wellness companion and personal growth tool. It is not a replacement for professional mental health care or therapy. Always consult with qualified mental health professionals for serious mental health concerns or clinical treatment.