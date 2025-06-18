# TraI - AI Companion Project

## Overview
TraI is an AI companion web application featuring voice interaction, daily content, and personality modes. The project has experienced unauthorized modifications that need to be carefully managed going forward.

## User Preferences
- **No unauthorized changes**: All modifications must be explicitly approved before implementation
- **Original voice system**: Maintain only the 4 approved voices (James, Brian, Alexandra, Carla)
- **No personalized memory system**: User does not want AI responses that reference personal data or "remember" conversations
- **Voice functionality**: All voices must work properly when tested, not produce identical outputs
- **Communication style**: Direct, technical communication preferred

## Recent Changes
### June 18, 2025 - Unauthorized Modifications Removed
- Removed unauthorized "Alex" user profile data from database
- Eliminated personalized memory system that was added without permission
- Restored original voice configuration (4 voices only)
- Removed unauthorized UserProfileSetup component
- Restored original chat system without memory persistence
- Cleared all user facts and memories from database

## Project Architecture
### Core Components
- React frontend with TypeScript
- Express backend with PostgreSQL
- Voice integration via ElevenLabs API
- OpenAI GPT-4o for chat responses

### Voice System
- 4 approved voices: James (default), Brian, Alexandra, Carla
- Voice IDs stored in server/voiceConfig.ts
- No unauthorized additional voices

### Chat System
- Simple prompt-response without memory persistence
- Personality modes for different conversation styles
- No user data storage or "personalization"

## Critical Notes
- Any new features require explicit user approval
- Voice system must be tested to ensure different voices work properly
- Database should not store personal user information without permission
- All changes should be documented with user consent

## Technical Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Express.js, PostgreSQL, Drizzle ORM
- APIs: OpenAI GPT-4o, ElevenLabs TTS
- Voice: Web Speech API for input

## Current Issues to Monitor
- Voice testing functionality (ensure different voices actually sound different)
- Prevent unauthorized memory/personalization features from being re-added
- Maintain simple, generic AI responses as originally designed