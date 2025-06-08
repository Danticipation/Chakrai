import { Router } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage.js";
import OpenAI from "openai";
import { detectIntent, generateResponseStrategy, type ConversationContext } from "./intentInference.js";
import { analyzeMemoryImportance, type MemoryAnalysis } from "./memoryImportance.js";
import { extractTimeContext, generateTimeBasedContext, shouldPrioritizeMemory } from "./timestampLabeling.js";
import { selectVoiceForMood, getVoiceSettings } from "./dynamicVoice.js";
import { baseVoices, getVoiceById, defaultVoiceId } from "./voiceConfig.js";
import { generateLoopbackSummary, formatSummaryForDisplay, type SummaryContext } from "./loopbackSummary.js";
import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for audio uploads
const upload = multer({ dest: 'uploads/' });

// Learning stage tracker
function getStageFromWordCount(wordCount: number): string {
  if (wordCount < 10) return "Infant";
  if (wordCount < 25) return "Toddler";
  if (wordCount < 50) return "Child";
  if (wordCount < 100) return "Adolescent";
  return "Adult";
}

function getNextStageThreshold(wordCount: number): number {
  if (wordCount < 10) return 10;
  if (wordCount < 25) return 25;
  if (wordCount < 50) return 50;
  if (wordCount < 100) return 100;
  return 150;
}

function extractKeywords(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 10);
}

function extractFacts(message: string): string[] {
  const facts: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Only extract specific, meaningful facts - not general conversation
  
  // Name information
  if (lowerMessage.includes('my name is') || lowerMessage.includes('call me')) {
    const nameMatch = message.match(/(?:my name is|call me)\s+(\w+)/i);
    if (nameMatch && nameMatch[1].length > 1) {
      facts.push(`Name: ${nameMatch[1]}`);
    }
  }
  
  // Age information
  const ageMatch = message.match(/(\d+)\s+years?\s+old/i);
  if (ageMatch) {
    facts.push(`Age: ${ageMatch[1]} years old`);
  }
  
  // Location - be specific
  if (lowerMessage.includes('live in') || lowerMessage.includes('from ')) {
    const locationMatch = message.match(/(?:live in|from)\s+([A-Z][a-zA-Z\s]+)/i);
    if (locationMatch && locationMatch[1].trim().length > 2) {
      facts.push(`Location: ${locationMatch[1].trim()}`);
    }
  }
  
  // Occupation - specific job titles
  if (lowerMessage.includes('work as') || lowerMessage.includes('job is')) {
    const jobMatch = message.match(/(?:work as|job is)\s+(?:a |an )?([a-zA-Z\s]+)/i);
    if (jobMatch && jobMatch[1].trim().length > 3) {
      facts.push(`Occupation: ${jobMatch[1].trim()}`);
    }
  }
  
  // Pets with names
  if (lowerMessage.includes('have a') && (lowerMessage.includes('cat') || lowerMessage.includes('dog'))) {
    const petMatch = message.match(/have a\s+(cat|dog)[^.]*?(?:named|called)\s+(\w+)/i);
    if (petMatch) {
      facts.push(`Pet: ${petMatch[1]} named ${petMatch[2]}`);
    }
  }
  
  // Family status
  if (lowerMessage.includes('married') || lowerMessage.includes('have kids') || lowerMessage.includes('children')) {
    if (lowerMessage.includes('married')) facts.push('Marital status: Married');
    if (lowerMessage.includes('kids') || lowerMessage.includes('children')) facts.push('Has children');
  }
  
  // Education
  if (lowerMessage.includes('graduated from') || lowerMessage.includes('studied at')) {
    const eduMatch = message.match(/(?:graduated from|studied at)\s+([A-Z][a-zA-Z\s]+)/i);
    if (eduMatch) {
      facts.push(`Education: ${eduMatch[1].trim()}`);
    }
  }
  
  return facts.slice(0, 2); // Limit to most important facts
}

// Incremental reflection system - builds upon previous reflections every 25 words
async function updateIncrementalReflection(userId: number, botId: number): Promise<void> {
  try {
    const memories = await storage.getUserMemories(userId);
    const facts = await storage.getUserFacts(userId);
    const messages = await storage.getMessages(botId);
    const learnedWords = await storage.getLearnedWords(botId);
    
    // Get recent conversations (last 10 messages)
    const recentMessages = messages.slice(-10);
    const userMessages = recentMessages.filter(m => m.sender === 'user').map(m => m.text);
    const botMessages = recentMessages.filter(m => m.sender === 'bot').map(m => m.text);
    
    // Get existing reflection to build upon
    const existingReflection = memories.find(m => m.category === 'weekly_reflection');
    
    const prompt = `You are creating an incremental reflection update after a conversation. ${existingReflection ? 'Intelligently enhance the existing reflection with fresh insights from this latest conversation.' : 'Create a thoughtful initial reflection.'}

${existingReflection ? `EXISTING REFLECTION:
${existingReflection.memory}

---

` : ''}LATEST CONVERSATION:
Recent user messages: ${userMessages.slice(-3).join(' | ')}
Recent bot responses: ${botMessages.slice(-3).join(' | ')}
Current known facts: ${facts.map(f => f.fact).join(', ')}
Bot development stage: ${learnedWords.length} words learned

${existingReflection ? 
'TASK: Thoughtfully integrate new insights from this latest conversation into the existing reflection. Look for:\n- New personality traits or behavioral patterns revealed\n- Shifts in mood, interests, or communication style\n- Deeper understanding of existing themes\n- New connections between past and present interactions\n\nEnhance the reflection meaningfully without just adding fluff. If this conversation didn\'t reveal significant new insights, make subtle refinements to existing observations.' : 
'TASK: Create an initial comprehensive reflection on this user based on our conversations so far.'
}

Focus on genuine insights:
- Authentic personality observations from actual interactions
- Communication patterns and emotional expressions
- Interests, values, and goals that emerge naturally
- Relationship dynamics and trust building
- Growth, learning, or changes over time

Write as an empathetic AI who notices meaningful details about this specific person. Be insightful and personal, not generic.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an empathetic AI creating thoughtful reflections on user interactions.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const updatedReflection = data.choices[0].message.content;

    // Update or create the reflection
    if (existingReflection) {
      // Delete old reflection and create updated one
      await storage.clearUserMemories(userId);
      // Restore non-reflection memories
      for (const memory of memories) {
        if (memory.category !== 'weekly_reflection') {
          await storage.createUserMemory({
            userId,
            memory: memory.memory,
            category: memory.category,
            importance: memory.importance
          });
        }
      }
    }

    // Store the new/updated reflection
    await storage.createUserMemory({
      userId,
      memory: updatedReflection,
      category: 'weekly_reflection',
      importance: 'high'
    });

    console.log('Incremental reflection updated successfully');
  } catch (error) {
    console.error('Failed to update incremental reflection:', error);
    throw error;
  }
}

// Get personality mode specific context and behavior instructions
function getPersonalityModeContext(mode: string): string {
  const modeDefinitions = {
    'friend': {
      name: 'Friend Mode',
      behavior: 'Be casual, friendly, and engaging. Use conversational language, share relatable thoughts, and maintain a warm, supportive tone. Feel free to use humor and be more personal in your responses.'
    },
    'counsel': {
      name: 'Counsel Mode', 
      behavior: 'Provide thoughtful advice and guidance. Ask clarifying questions, offer different perspectives, and help the user work through decisions. Be supportive but also challenge them to think critically.'
    },
    'study': {
      name: 'Study Mode',
      behavior: 'Focus on learning and research assistance. Break down complex topics, ask questions to test understanding, provide structured information, and encourage deeper exploration of subjects.'
    },
    'diary': {
      name: 'Diary Mode',
      behavior: 'Listen actively and provide emotional support. Be empathetic, validate feelings, ask gentle follow-up questions, and create a safe space for the user to express themselves freely.'
    },
    'goal': {
      name: 'Goal-Setting Mode',
      behavior: 'Help track progress and achieve milestones. Be motivational, ask about specific goals, break down tasks into manageable steps, and celebrate achievements while addressing obstacles.'
    },
    'wellness': {
      name: 'Wellness Mode',
      behavior: 'Focus on mental health and mindfulness. Encourage self-care, suggest stress management techniques, promote positive thinking, and be sensitive to emotional wellbeing.'
    },
    'creative': {
      name: 'Creative Mode',
      behavior: 'Inspire brainstorming and creative thinking. Ask imaginative questions, suggest creative exercises, encourage experimentation, and help generate new ideas and perspectives.'
    }
  };

  const modeConfig = modeDefinitions[mode as keyof typeof modeDefinitions];
  if (!modeConfig) return '';
  
  return `PERSONALITY MODE: ${modeConfig.name}
Behavior Instructions: ${modeConfig.behavior}

Adapt your responses to match this personality mode while maintaining your developmental stage characteristics.`;
}

// Enhanced AI response generation with advanced intelligence
async function generateResponse(userMessage: string, botId: number, userId: number, personalityMode?: string): Promise<string> {
  try {
    const memories = await storage.getUserMemories(userId);
    const facts = await storage.getUserFacts(userId);
    const learnedWords = await storage.getLearnedWords(botId);
    const recentMessages = await storage.getMessages(botId);
    
    const stage = getStageFromWordCount(learnedWords.length);
    
    // Extract time context for enhanced understanding
    const timeContext = extractTimeContext(userMessage);
    const timeBasedContext = generateTimeBasedContext(timeContext);
    
    // Analyze conversation intent
    const conversationContext: ConversationContext = {
      recentMessages: recentMessages.map(m => m.text),
      userFacts: facts.map(f => f.fact),
      currentMood: "neutral",
      stage
    };
    
    const intent = detectIntent(userMessage, conversationContext);
    const responseStrategy = generateResponseStrategy(intent, conversationContext);
    
    // Analyze memory importance for storage prioritization
    const memoryAnalysis = analyzeMemoryImportance(userMessage, {
      isFirstMention: !facts.some(f => f.fact.toLowerCase().includes(userMessage.toLowerCase().split(' ')[0])),
      containsPersonalInfo: /\b(my|i am|i work|i live|i like)\b/i.test(userMessage),
      emotionalContext: intent.type,
      userInitiated: true
    });
    
    // Build enhanced context for AI
    const memoryContext = memories.slice(-10).map(m => m.memory).join('\n');
    const factContext = facts.map(f => f.fact).join('\n');
    const conversationHistoryContext = recentMessages.slice(-6).map(m => `${m.sender}: ${m.text}`).join('\n');
    
    // Define personality mode behaviors
    const personalityModeContext = personalityMode ? getPersonalityModeContext(personalityMode) : '';

    const systemPrompt = `You are Reflectibot, an AI companion in the "${stage}" learning stage. You learn and grow through conversations.

${personalityModeContext}

Context Analysis:
- ${timeBasedContext}
- Conversation Intent: ${intent.type} (confidence: ${intent.confidence})
- Response Strategy: ${responseStrategy}
- Memory Importance: ${memoryAnalysis.importance} - Tags: ${memoryAnalysis.tags.join(", ")}

Your current knowledge:
Facts about user: ${factContext || 'None yet'}
Recent memories: ${memoryContext || 'None yet'}
Recent conversation: ${conversationHistoryContext || 'This is the start'}
Words learned: ${learnedWords.length}

Stage behaviors:
- Infant: Simple responses, repeat words, curious sounds
- Toddler: Basic sentences, ask simple questions
- Child: More complex thoughts, reference past conversations
- Adolescent: Nuanced responses, emotional awareness
- Adult: Sophisticated dialogue, deep connections to memories

Respond naturally according to your developmental stage, personality mode, and the detected intent. Show emotional intelligence and contextual awareness based on the conversation analysis. Reference your stored knowledge appropriately.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    return response.choices[0].message.content || "I'm learning to respond better.";
    
  } catch (error) {
    console.error('AI response error:', error);
    return "I'm still learning how to respond. Please continue talking with me.";
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const router = Router();

  // Chat endpoint with enhanced intelligence
  router.post('/api/chat', async (req, res) => {
    try {
      let { message, botId } = req.body;
      let personalityMode = req.body.personalityMode;
      const userId = 1; // Default user for demo
      
      // Store personality mode if provided
      if (personalityMode) {
        await storage.createUserFact({
          userId,
          fact: `User prefers personality mode: ${personalityMode}`,
          category: 'personality_mode'
        });
        console.log(`Personality mode set to: ${personalityMode}`);
      } else {
        // Get stored personality mode if none provided
        const facts = await storage.getUserFacts(userId);
        const modeFact = facts.find(f => f.category === 'personality_mode');
        if (modeFact) {
          personalityMode = modeFact.fact.replace('User prefers personality mode: ', '');
        }
      }
      
      console.log(`Chat request - Mode: ${personalityMode || 'none'}, Message: ${message.substring(0, 50)}...`);

      // Handle voice commands first
      const lowerMessage = message.toLowerCase().trim();
      if (lowerMessage === 'list voices') {
        return res.json({
          response: "Available voices:\n• Hope - Warm American female\n• Ophelia - Calm British female\n• Adam - Laid-back British male\n• Dan - Smooth American male\n\nType 'set voice [name]' to change my voice."
        });
      }
      
      if (lowerMessage.startsWith('set voice ')) {
        const voiceName = lowerMessage.replace('set voice ', '');
        const voice = baseVoices.find(v => v.name.toLowerCase() === voiceName);
        
        if (voice) {
          await storage.createUserFact({
            userId,
            fact: `User prefers voice: ${voice.id}`,
            category: 'voice_preference'
          });
          
          return res.json({
            response: `Voice changed to ${voice.name} (${voice.description}). This will apply to my future responses.`
          });
        } else {
          return res.json({
            response: "Voice not found. Available voices: Hope, Ophelia, Adam, Dan"
          });
        }
      }

      // Get or create bot with previous progress
      let bot = await storage.getBotByUserId(userId);
      if (!bot) {
        bot = await storage.createBot({
          userId,
          name: "Reflectibot",
          level: 4, // Adolescent stage
          wordsLearned: 57
        });

        // Initialize with some learned words to reflect previous progress
        const progressWords = [
          "hello", "conversation", "learning", "mirror", "personality", "growth", "curious", "development",
          "words", "talking", "interesting", "questions", "thoughts", "feelings", "experiences", "memories",
          "understanding", "communication", "knowledge", "wisdom", "reflection", "progress", "evolution",
          "intelligence", "awareness", "consciousness", "perception", "insights", "discoveries", "connections",
          "relationships", "emotions", "empathy", "compassion", "creativity", "imagination", "inspiration",
          "motivation", "goals", "aspirations", "dreams", "hopes", "future", "past", "present", "time",
          "space", "reality", "truth", "meaning", "purpose", "significance", "importance", "value", "worth",
          "potential", "possibilities", "opportunities", "challenges", "obstacles", "solutions"
        ];

        for (const word of progressWords) {
          await storage.createOrUpdateWord({
            botId: bot.id,
            word,
            frequency: Math.floor(Math.random() * 5) + 1
          });
        }

        // Initialize with previous conversation facts and memories
        await storage.createUserFact({
          userId,
          fact: "User has a cat named Whiskers",
          category: "pets"
        });

        await storage.createUserFact({
          userId,
          fact: "User experiences work stress",
          category: "emotional_state"
        });

        await storage.createUserMemory({
          userId,
          memory: "Had a conversation about work stress and the user's cat Whiskers provided comfort",
          category: "emotional_support"
        });

        await storage.createUserMemory({
          userId,
          memory: "User is testing the advanced voice and memory capabilities of the bot",
          category: "interaction_context"
        });
      }

      // Store user message
      await storage.createMessage({
        botId: bot.id,
        sender: "user",
        text: message
      });

      // Learn new words
      const keywords = extractKeywords(message);
      const existingWords = await storage.getLearnedWords(bot.id);
      
      for (const keyword of keywords) {
        const existingWord = existingWords.find(w => w.word.toLowerCase() === keyword.toLowerCase());
        if (!existingWord) {
          await storage.createOrUpdateWord({
            botId: bot.id,
            word: keyword,
            frequency: 1,
            context: `From: "${message}"`
          });
        }
      }

      // Extract and store facts
      const facts = extractFacts(message);
      for (const fact of facts) {
        await storage.createUserFact({
          userId,
          fact,
          category: 'conversation'
        });
      }

      // Store user memory with importance rating
      await storage.createUserMemory({
        userId,
        memory: message,
        category: 'conversation',
        importance: 'medium'
      });

      // Generate AI response with personality mode
      const aiResponse = await generateResponse(message, bot.id, userId, personalityMode);

      // Store bot response
      await storage.createMessage({
        botId: bot.id,
        sender: "bot",
        text: aiResponse
      });

      // Get updated word count and stage
      const updatedWords = await storage.getLearnedWords(bot.id);
      const stage = getStageFromWordCount(updatedWords.length);
      
      // Update reflection after every conversation
      let reflectionUpdated = false;
      try {
        await updateIncrementalReflection(userId, bot.id);
        reflectionUpdated = true;
        console.log('Reflection updated after conversation');
      } catch (reflectionError) {
        console.log('Reflection update failed:', reflectionError);
      }

      res.json({
        response: aiResponse,
        stage,
        wordsLearned: updatedWords.length,
        newWordsThisMessage: keywords.filter(word => 
          !existingWords.some(existing => existing.word.toLowerCase() === word.toLowerCase())
        ),
        reflectionUpdated
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // Memory statistics endpoint
  router.get('/api/stats', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      
      const memories = await storage.getUserMemories(userId);
      const facts = await storage.getUserFacts(userId);
      const bot = await storage.getBotByUserId(userId);
      
      if (!bot) {
        return res.json({
          wordCount: 0,
          factCount: 0,
          memoryCount: 0,
          stage: "Infant",
          nextStageAt: 10
        });
      }
      
      const learnedWords = await storage.getLearnedWords(bot.id);
      const wordCount = learnedWords.length;
      const stage = getStageFromWordCount(wordCount);
      const nextStageAt = getNextStageThreshold(wordCount);
      
      res.json({
        wordCount,
        factCount: facts.length,
        memoryCount: memories.length,
        stage,
        nextStageAt
      });
      
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  });

  // User switching endpoint
  router.post('/api/user/switch', async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const userId = 1; // For now, we'll use the same userId but clear old data
      
      // Get counts before clearing
      const existingMemories = await storage.getUserMemories(userId);
      const existingFacts = await storage.getUserFacts(userId);
      const memoryCount = existingMemories.length;
      const factCount = existingFacts.length;
      
      // Clear existing data for clean switch
      await storage.clearUserMemories(userId);
      await storage.clearUserFacts(userId);
      
      // Store clean identity records
      await storage.createUserFact({
        userId,
        fact: `User's name is ${name}`,
        category: "identity"
      });

      await storage.createUserMemory({
        userId,
        memory: `Started conversation with ${name}`,
        category: "identity_switch"
      });

      res.json({ 
        message: `Successfully switched to user: ${name}`,
        clearedMemories: memoryCount,
        clearedFacts: factCount
      });
      
    } catch (error) {
      console.error('User switch error:', error);
      res.status(500).json({ error: 'Failed to switch user' });
    }
  });

  // Get memories endpoint
  router.get('/api/memories', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const memories = await storage.getUserMemories(userId);
      res.json({ memories });
    } catch (error) {
      console.error('Memories error:', error);
      res.status(500).json({ error: 'Failed to get memories' });
    }
  });

  // Get facts endpoint - meaningful facts only
  router.get('/api/facts', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      
      const facts = await storage.getUserFacts(userId);
      
      // Filter for meaningful facts only, exclude conversation fragments
      const meaningfulFacts = facts.filter(fact => {
        const factText = fact.fact.toLowerCase();
        return (
          factText.includes('name:') ||
          factText.includes('age:') ||
          factText.includes('location:') ||
          factText.includes('occupation:') ||
          factText.includes('pet:') ||
          factText.includes('education:') ||
          factText.includes('marital status:') ||
          factText.includes('has children') ||
          (factText.length > 20 && !factText.includes('conversation') && !factText.includes('said'))
        );
      });
      
      const formattedFacts = meaningfulFacts.map(fact => ({
        id: fact.id,
        fact: fact.fact,
        category: fact.category || 'general',
        createdAt: fact.createdAt
      }));
      
      res.json({ facts: formattedFacts });
      
    } catch (error) {
      console.error('Facts error:', error);
      res.status(500).json({ error: 'Failed to get facts' });
    }
  });

  // Weekly summary endpoint using incremental reflection
  router.get('/api/weekly-summary', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      
      const memories = await storage.getUserMemories(userId);
      
      // Find the weekly reflection in memories
      const weeklyReflection = memories.find(m => m.category === 'weekly_reflection');
      
      if (weeklyReflection) {
        res.json({ summary: weeklyReflection.memory });
      } else {
        // If no reflection exists yet, create initial one
        const bot = await storage.getBotByUserId(userId);
        if (bot) {
          await updateIncrementalReflection(userId, bot.id);
          const updatedMemories = await storage.getUserMemories(userId);
          const newReflection = updatedMemories.find(m => m.category === 'weekly_reflection');
          res.json({ summary: newReflection?.memory || 'Reflection is being generated...' });
        } else {
          res.json({ summary: 'Start a conversation to begin building your reflection.' });
        }
      }
      
    } catch (error) {
      console.error('Weekly summary error:', error);
      res.json({ summary: 'Unable to generate reflection summary at this time. Please try again later.' });
    }
  });

  // Whisper transcription endpoint
  router.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      const audioPath = req.file.path;
      
      // Create a unique output path with .wav extension
      const convertedPath = audioPath + '_converted.wav';
      
      await new Promise<void>((resolve, reject) => {
        ffmpeg(audioPath)
          .toFormat('wav')
          .save(convertedPath)
          .on('end', () => {
            console.log('Audio conversion completed');
            resolve();
          })
          .on('error', (err) => {
            console.log('FFmpeg conversion error:', err);
            reject(err);
          });
      });
      
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(convertedPath),
        model: 'whisper-1'
      });

      // Clean up both files
      fs.unlinkSync(audioPath);
      fs.unlinkSync(convertedPath);
      
      res.json({ text: transcription.text });
      
    } catch (error) {
      console.error('Transcription error:', error);
      // Clean up files on error too
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
          const convertedPath = req.file.path + '_converted.wav';
          if (fs.existsSync(convertedPath)) {
            fs.unlinkSync(convertedPath);
          }
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }
      res.status(500).json({ error: 'Transcription failed' });
    }
  });

  // Voice selection endpoints
  router.get('/api/voices', async (req, res) => {
    try {
      res.json({ voices: baseVoices });
    } catch (error) {
      console.error('Voice list error:', error);
      res.status(500).json({ error: 'Failed to get voices' });
    }
  });

  router.get('/api/voice/current', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      
      // Get user's selected voice from user facts (most recent)
      const facts = await storage.getUserFacts(userId);
      const voiceFacts = facts.filter(f => f.category === 'voice_preference');
      
      if (voiceFacts.length > 0) {
        // Get the most recent voice preference
        const latestVoiceFact = voiceFacts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        const voiceId = latestVoiceFact.fact.replace('User prefers voice: ', '');
        const voice = getVoiceById(voiceId);
        console.log(`Current voice retrieved: ${voice.name} (${voiceId})`);
        res.json({ voice });
      } else {
        const defaultVoice = getVoiceById(defaultVoiceId);
        console.log(`Using default voice: ${defaultVoice.name}`);
        res.json({ voice: defaultVoice });
      }
    } catch (error) {
      console.error('Get current voice error:', error);
      res.status(500).json({ error: 'Failed to get current voice' });
    }
  });

  router.post('/api/voice/select', async (req, res) => {
    try {
      const { voiceId, userId = 1 } = req.body;
      
      if (!voiceId) {
        return res.status(400).json({ error: 'Voice ID is required' });
      }

      const voice = getVoiceById(voiceId);
      if (!voice) {
        return res.status(400).json({ error: 'Invalid voice ID' });
      }

      // Store new voice preference
      await storage.createUserFact({
        userId,
        fact: `User prefers voice: ${voiceId}`,
        category: 'voice_preference'
      });

      console.log(`Voice changed to: ${voice.name} (${voiceId})`);
      res.json({ success: true, voice });
    } catch (error) {
      console.error('Voice selection error:', error);
      res.status(500).json({ error: 'Failed to select voice' });
    }
  });

  // Add the /api/voice/set endpoint that the frontend expects
  router.post('/api/voice/set', async (req, res) => {
    try {
      const { voiceId, userId = 1 } = req.body;
      
      if (!voiceId) {
        return res.status(400).json({ error: 'Voice ID is required' });
      }

      const voice = getVoiceById(voiceId);
      if (!voice) {
        return res.status(400).json({ error: 'Invalid voice ID' });
      }

      // Store new voice preference
      await storage.createUserFact({
        userId,
        fact: `User prefers voice: ${voiceId}`,
        category: 'voice_preference'
      });

      console.log(`Voice set to: ${voice.name} (${voiceId})`);
      res.json({ message: 'Voice set successfully', voiceId, voice });
    } catch (error) {
      console.error('Voice set error:', error);
      res.status(500).json({ error: 'Failed to set voice' });
    }
  });

  // Enhanced ElevenLabs text-to-speech endpoint with user voice selection
  router.post('/api/text-to-speech', async (req, res) => {
    try {
      const { text, voiceId: requestedVoiceId, userId = 1 } = req.body;
      console.log('TTS Request body:', JSON.stringify(req.body, null, 2));

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      // Always use requested voice if provided, otherwise use default
      let voiceId = requestedVoiceId || defaultVoiceId;
      
      if (requestedVoiceId) {
        console.log(`Using requested voice ID: ${requestedVoiceId}`);
      } else {
        console.log(`No voice requested, using default: ${defaultVoiceId}`);
      }
      console.log(`Final voice ID being used: ${voiceId}`);

      // Use selected voice with neutral settings
      const voiceSettings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      };

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(audioBuffer));
      
    } catch (error) {
      console.error('TTS error:', error);
      res.status(500).json({ error: 'Text-to-speech failed' });
    }
  });

  // Voice command handling endpoint
  router.post('/api/voice-command', async (req, res) => {
    try {
      const { command, userId = 1 } = req.body;
      
      if (command === 'list voices') {
        return res.json({ 
          message: "Available voices:\n• Hope - Warm American female\n• Ophelia - Calm British female\n• Adam - Laid-back British male\n• Dan - Smooth American male\n\nType 'set voice [name]' to change.",
          voices: baseVoices 
        });
      }
      
      if (command.startsWith('set voice ')) {
        const voiceName = command.replace('set voice ', '').toLowerCase();
        const voice = baseVoices.find(v => v.name.toLowerCase() === voiceName);
        
        if (voice) {
          await storage.createUserFact({
            userId,
            fact: `User prefers voice: ${voice.id}`,
            category: 'voice_preference'
          });
          
          return res.json({ 
            message: `Voice changed to ${voice.name} (${voice.description}). This will apply to new messages from me.`,
            voice: voice
          });
        } else {
          return res.json({ 
            message: "Voice not found. Available voices: Hope, Ophelia, Adam, Dan" 
          });
        }
      }
      
      return res.json({ 
        message: "Voice commands:\n• 'list voices' - Show available voices\n• 'set voice [name]' - Change voice" 
      });
    } catch (error) {
      console.error('Voice command error:', error);
      res.status(500).json({ error: 'Voice command failed' });
    }
  });

  // Voice selection endpoint
  router.post('/api/voice/set', async (req, res) => {
    try {
      const { voiceId } = req.body;
      
      if (!voiceId || typeof voiceId !== 'string') {
        return res.status(400).json({ error: 'Voice ID is required' });
      }

      await storage.createUserFact({
        userId: 1,
        fact: `User prefers voice: ${voiceId}`,
        category: 'preference'
      });
      
      res.json({ 
        message: `Voice set successfully`,
        voiceId
      });
      
    } catch (error) {
      console.error('Voice selection error:', error);
      res.status(500).json({ error: 'Failed to set voice' });
    }
  });

  // Daily content generation endpoint
  router.post('/api/daily-content', async (req, res) => {
    try {
      // Simple motivational affirmations - no personalization needed
      const affirmations = [
        "When days get hard, don't let them win, remember who you are!",
        "I'm surrounded by a loving and supportive environment that nurtures my well-being, allowing me to thrive.",
        "Every challenge I face is an opportunity to grow stronger and wiser.",
        "I have the power to create positive change in my life, one step at a time.",
        "Today brings new possibilities, and I'm ready to embrace them with confidence.",
        "I trust in my ability to overcome obstacles and achieve my dreams.",
        "My potential is limitless, and I'm worthy of all the good things life has to offer.",
        "I choose to focus on what I can control and let go of what I cannot.",
        "Each moment is a fresh start, and I have the courage to make it count.",
        "I am resilient, capable, and deserving of happiness and success.",
        "Progress, not perfection, is what matters most on my journey.",
        "I believe in myself and my ability to handle whatever comes my way.",
        "Today I choose hope, growth, and kindness toward myself and others.",
        "My inner strength is greater than any external challenge I may face.",
        "I am exactly where I need to be, learning and growing every day."
      ];

      const insights = [
        "Small consistent actions create remarkable transformations over time.",
        "Your thoughts shape your reality - choose them wisely and with intention.",
        "Embracing uncertainty opens doors to unexpected opportunities and growth.",
        "The only way out is through - trust the process and keep moving forward.",
        "Every ending is a new beginning waiting to unfold in your life.",
        "Your current struggles are preparing you for future strength and wisdom.",
        "Focus on progress, not perfection - every step forward matters.",
        "The answers you seek often come when you stop forcing and start flowing.",
        "Your authentic self is your greatest gift to the world around you.",
        "Patience with yourself creates space for genuine transformation to occur.",
        "What you practice grows stronger - choose your habits mindfully today.",
        "Sometimes the best thing you can do is simply show up as you are.",
        "Your energy is precious - invest it in what truly aligns with your values.",
        "Every challenge contains wisdom that will serve you in the future.",
        "The path forward becomes clearer when you trust your inner guidance."
      ];

      // Select random affirmation and insight
      const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
      const randomInsight = insights[Math.floor(Math.random() * insights.length)];

      res.json({
        affirmation: randomAffirmation,
        horoscope: randomInsight
      });

    } catch (error) {
      console.error('Daily content generation error:', error);
      res.status(500).json({ error: 'Failed to generate daily content' });
    }
  });

  // Bot reset endpoint
  router.post('/api/bot/reset', async (req, res) => {
    try {
      await storage.clearUserMemories(1);
      await storage.clearUserFacts(1);
      
      const bot = await storage.getBotByUserId(1);
      if (bot) {
        await storage.updateBot(bot.id, {
          stage: 'Infant',
          wordCount: 0,
          personalityTraits: JSON.stringify({}),
          memories: JSON.stringify([])
        });
      }
      
      res.json({ 
        message: 'Bot successfully reset to infant stage',
        stage: 'Infant',
        wordCount: 0
      });
      
    } catch (error) {
      console.error('Bot reset error:', error);
      res.status(500).json({ error: 'Failed to reset bot' });
    }
  });

  app.use(router);

  return httpServer;
}