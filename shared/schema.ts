import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userMemories = pgTable("user_memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  memory: text("memory").notNull(),
  category: text("category").default('conversation'),
  importance: text("importance").default('medium'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFacts = pgTable("user_facts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fact: text("fact").notNull(),
  category: text("category").default('personal'),
  confidence: text("confidence").default('medium'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull().default("Mirror"),
  level: integer("level").notNull().default(1),
  wordsLearned: integer("words_learned").notNull().default(0),
  personalityTraits: jsonb("personality_traits").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  sender: text("sender").notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const learnedWords = pgTable("learned_words", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  word: text("word").notNull(),
  frequency: integer("frequency").notNull().default(1),
  context: text("context"),
  firstLearnedAt: timestamp("first_learned_at").notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  achievedAt: timestamp("achieved_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertLearnedWordSchema = createInsertSchema(learnedWords).omit({
  id: true,
  firstLearnedAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  achievedAt: true,
});

export const insertUserMemorySchema = createInsertSchema(userMemories).omit({
  id: true,
  createdAt: true,
});

export const insertUserFactSchema = createInsertSchema(userFacts).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type LearnedWord = typeof learnedWords.$inferSelect;
export type InsertLearnedWord = z.infer<typeof insertLearnedWordSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type UserMemory = typeof userMemories.$inferSelect;
export type InsertUserMemory = z.infer<typeof insertUserMemorySchema>;
export type UserFact = typeof userFacts.$inferSelect;
export type InsertUserFact = z.infer<typeof insertUserFactSchema>;

// Mood tracking tables for emotional intelligence
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  emotion: text("emotion").notNull(),
  intensity: integer("intensity").notNull().default(50), // 0 to 100
  valence: integer("valence").notNull().default(0), // -100 to 100
  arousal: integer("arousal").notNull().default(50), // 0 to 100
  context: text("context").default(""),
  sessionId: text("session_id"),
  riskLevel: text("risk_level").default("low"),
  supportiveResponse: text("supportive_response"),
  recommendedActions: jsonb("recommended_actions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalPatterns = pgTable("emotional_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dominantEmotions: jsonb("dominant_emotions"),
  averageValence: integer("average_valence").default(0),
  averageArousal: integer("average_arousal").default(50),
  emotionalVolatility: integer("emotional_volatility").default(0),
  trendDirection: text("trend_direction").default("stable"),
  triggerPatterns: jsonb("trigger_patterns"),
  copingStrategies: jsonb("coping_strategies"),
  analysisDate: timestamp("analysis_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionalPatternSchema = createInsertSchema(emotionalPatterns).omit({
  id: true,
  analysisDate: true,
  updatedAt: true,
});

export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type EmotionalPattern = typeof emotionalPatterns.$inferSelect;
export type InsertEmotionalPattern = z.infer<typeof insertEmotionalPatternSchema>;

// Crisis detection and safety check-ins
export const safetyCheckIns = pgTable("safety_check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  triggerMessage: text("trigger_message").notNull(),
  riskLevel: varchar("risk_level", { length: 20 }).notNull(), // none, low, medium, high, critical
  confidenceScore: real("confidence_score"), // 0.0 to 1.0
  indicators: text("indicators").array(),
  checkInRequired: boolean("check_in_required").default(false),
  responseReceived: boolean("response_received").default(false),
  userResponse: text("user_response"),
  followUpScheduled: timestamp("follow_up_scheduled"),
  interventionProvided: boolean("intervention_provided").default(false),
  emergencyContactMade: boolean("emergency_contact_made").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const crisisInterventions = pgTable("crisis_interventions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  checkInId: integer("check_in_id").references(() => safetyCheckIns.id),
  interventionType: varchar("intervention_type", { length: 50 }), // immediate_contact, scheduled_followup, emergency_services
  contactMethod: varchar("contact_method", { length: 50 }), // crisis_hotline, emergency_services, mental_health_professional
  outcome: varchar("outcome", { length: 100 }),
  notes: text("notes"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertSafetyCheckInSchema = createInsertSchema(safetyCheckIns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCrisisInterventionSchema = createInsertSchema(crisisInterventions).omit({
  id: true,
  createdAt: true,
});

export type SafetyCheckIn = typeof safetyCheckIns.$inferSelect;
export type InsertSafetyCheckIn = z.infer<typeof insertSafetyCheckInSchema>;
export type CrisisIntervention = typeof crisisInterventions.$inferSelect;
export type InsertCrisisIntervention = z.infer<typeof insertCrisisInterventionSchema>;

// Therapeutic journaling system
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  content: text("content").notNull(),
  mood: text("mood"),
  emotionalTags: text("emotional_tags").array(),
  triggers: text("triggers").array(),
  gratitude: text("gratitude").array(),
  goals: text("goals").array(),
  reflectionPrompts: text("reflection_prompts").array(),
  aiAnalyzed: boolean("ai_analyzed").default(false),
  wordCount: integer("word_count").default(0),
  readingTime: integer("reading_time").default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const journalAnalytics = pgTable("journal_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  entryId: integer("entry_id").notNull().references(() => journalEntries.id),
  emotionalThemes: jsonb("emotional_themes"), // recurring emotional patterns
  keyInsights: text("key_insights").array(),
  sentimentScore: real("sentiment_score"), // -1.0 to 1.0
  emotionalIntensity: integer("emotional_intensity"), // 0 to 100
  copingStrategies: text("coping_strategies").array(),
  growthIndicators: text("growth_indicators").array(),
  concernAreas: text("concern_areas").array(),
  recommendedActions: text("recommended_actions").array(),
  therapistNotes: text("therapist_notes"), // AI-generated insights for therapists
  patternConnections: jsonb("pattern_connections"), // connections to previous entries
  confidenceScore: real("confidence_score"), // AI analysis confidence 0.0 to 1.0
  createdAt: timestamp("created_at").defaultNow()
});

export const journalExports = pgTable("journal_exports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  exportType: varchar("export_type", { length: 50 }), // summary, full_entries, insights_only
  dateRange: jsonb("date_range"), // start and end dates
  includedEntries: integer("included_entries").array(),
  format: varchar("format", { length: 20 }).default("pdf"), // pdf, json, csv
  fileUrl: text("file_url"),
  recipientType: varchar("recipient_type", { length: 50 }), // therapist, self, medical_professional
  encryptionKey: text("encryption_key"),
  expiresAt: timestamp("expires_at"),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalAnalyticsSchema = createInsertSchema(journalAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertJournalExportSchema = createInsertSchema(journalExports).omit({
  id: true,
  createdAt: true,
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalAnalytics = typeof journalAnalytics.$inferSelect;
export type InsertJournalAnalytics = z.infer<typeof insertJournalAnalyticsSchema>;
export type JournalExport = typeof journalExports.$inferSelect;
export type InsertJournalExport = z.infer<typeof insertJournalExportSchema>;

// WebSocket message types
export interface ChatMessage {
  type: 'user_message' | 'bot_response' | 'learning_update' | 'milestone_achieved';
  content?: string;
  botId: number;
  data?: any;
}

export interface LearningUpdate {
  newWords: string[];
  levelUp?: boolean;
  personalityUpdate?: Record<string, number>;
}
