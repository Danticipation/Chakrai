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

// Therapist Integration Tables
export const therapists = pgTable("therapists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  licenseNumber: varchar("license_number"),
  specialization: text("specialization").array(),
  isVerified: boolean("is_verified").default(false),
  collaborationLevel: varchar("collaboration_level", { enum: ["view_only", "interactive", "full_access"] }).default("view_only"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const therapistSessions = pgTable("therapist_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  therapistId: integer("therapist_id").notNull().references(() => therapists.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // minutes
  sessionType: varchar("session_type", { enum: ["video", "phone", "in_person"] }).default("video"),
  status: varchar("status", { enum: ["scheduled", "in_progress", "completed", "cancelled", "no_show"] }).default("scheduled"),
  meetingLink: varchar("meeting_link"),
  notes: text("notes"),
  userPreparation: text("user_preparation"), // AI-generated session prep
  therapistNotes: text("therapist_notes"),
  followUpActions: text("follow_up_actions").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const therapistSharedInsights = pgTable("therapist_shared_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  therapistId: integer("therapist_id").notNull().references(() => therapists.id),
  insightType: varchar("insight_type", { enum: ["journal_summary", "mood_patterns", "crisis_alert", "progress_report"] }).notNull(),
  content: jsonb("content").notNull(),
  sharedAt: timestamp("shared_at").defaultNow(),
  therapistViewed: boolean("therapist_viewed").default(false),
  therapistResponse: text("therapist_response"),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
  isActive: boolean("is_active").default(true),
});

export const collaborationSettings = pgTable("collaboration_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  autoShareJournalSummaries: boolean("auto_share_journal_summaries").default(false),
  shareFrequency: varchar("share_frequency", { enum: ["daily", "weekly", "biweekly", "monthly"] }).default("weekly"),
  allowCrisisAlerts: boolean("allow_crisis_alerts").default(true),
  shareEmotionalPatterns: boolean("share_emotional_patterns").default(true),
  shareProgressMetrics: boolean("share_progress_metrics").default(true),
  privacyLevel: varchar("privacy_level", { enum: ["minimal", "standard", "detailed"] }).default("standard"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gamification Tables
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0),
  isActive: boolean("is_active").default(true),
});

export const wellnessStreaks = pgTable("wellness_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  streakType: varchar("streak_type", { enum: ["daily_checkin", "journal_entry", "mood_tracking", "chat_session", "goal_progress"] }).notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyActivities = pgTable("daily_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityDate: timestamp("activity_date").notNull(),
  checkedIn: boolean("checked_in").default(false),
  journalEntry: boolean("journal_entry").default(false),
  moodTracked: boolean("mood_tracked").default(false),
  chatSession: boolean("chat_session").default(false),
  goalProgress: boolean("goal_progress").default(false),
  totalActivities: integer("total_activities").default(0),
});

export const insertTherapistSchema = createInsertSchema(therapists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTherapistSessionSchema = createInsertSchema(therapistSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTherapistSharedInsightSchema = createInsertSchema(therapistSharedInsights).omit({
  id: true,
  sharedAt: true,
});

export const insertCollaborationSettingsSchema = createInsertSchema(collaborationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Therapist = typeof therapists.$inferSelect;
export type InsertTherapist = z.infer<typeof insertTherapistSchema>;
export type TherapistSession = typeof therapistSessions.$inferSelect;
export type InsertTherapistSession = z.infer<typeof insertTherapistSessionSchema>;
export type TherapistSharedInsight = typeof therapistSharedInsights.$inferSelect;
export type InsertTherapistSharedInsight = z.infer<typeof insertTherapistSharedInsightSchema>;
export type CollaborationSettings = typeof collaborationSettings.$inferSelect;
export type InsertCollaborationSettings = z.infer<typeof insertCollaborationSettingsSchema>;

// Gamification Schema Types
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, unlockedAt: true });
export const insertWellnessStreakSchema = createInsertSchema(wellnessStreaks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDailyActivitySchema = createInsertSchema(dailyActivities).omit({ id: true });

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type WellnessStreak = typeof wellnessStreaks.$inferSelect;
export type InsertWellnessStreak = z.infer<typeof insertWellnessStreakSchema>;
export type DailyActivity = typeof dailyActivities.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;

// Community and Peer Support Tables
export const supportForums = pgTable("support_forums", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // 'anxiety', 'depression', 'general', 'crisis'
  isModerated: boolean("is_moderated").default(true),
  anonymousPostsAllowed: boolean("anonymous_posts_allowed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").references(() => supportForums.id).notNull(),
  authorId: integer("author_id").references(() => users.id), // null for anonymous posts
  anonymousName: varchar("anonymous_name", { length: 100 }), // e.g., "Anonymous123"
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  isFlagged: boolean("is_flagged").default(false),
  isModerated: boolean("is_moderated").default(false),
  supportCount: integer("support_count").default(0), // hearts/likes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => forumPosts.id).notNull(),
  authorId: integer("author_id").references(() => users.id), // null for anonymous replies
  anonymousName: varchar("anonymous_name", { length: 100 }),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  isFlagged: boolean("is_flagged").default(false),
  supportCount: integer("support_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const peerCheckIns = pgTable("peer_check_ins", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id).notNull(),
  partnerId: integer("partner_id").references(() => users.id), // null until matched
  status: varchar("status", { length: 50 }).default('pending'), // 'pending', 'matched', 'completed', 'cancelled'
  checkInType: varchar("check_in_type", { length: 100 }).notNull(), // 'daily', 'crisis', 'motivation', 'accountability'
  preferredTime: varchar("preferred_time", { length: 100 }), // 'morning', 'afternoon', 'evening', 'flexible'
  duration: integer("duration").default(15), // minutes
  isAnonymous: boolean("is_anonymous").default(true),
  notes: text("notes"), // optional context from requester
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const peerSessions = pgTable("peer_sessions", {
  id: serial("id").primaryKey(),
  checkInId: integer("check_in_id").references(() => peerCheckIns.id).notNull(),
  participant1Id: integer("participant1_id").references(() => users.id).notNull(),
  participant2Id: integer("participant2_id").references(() => users.id).notNull(),
  sessionType: varchar("session_type", { length: 50 }).notNull(), // 'text', 'voice' (future)
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  feedback1: text("feedback1"), // feedback from participant 1
  feedback2: text("feedback2"), // feedback from participant 2
  rating1: integer("rating1"), // 1-5 rating from participant 1
  rating2: integer("rating2"), // 1-5 rating from participant 2
  isSuccessful: boolean("is_successful").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityModerations = pgTable("community_moderations", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'post', 'reply'
  contentId: integer("content_id").notNull(),
  moderatorId: integer("moderator_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // 'approved', 'flagged', 'removed', 'warning'
  reason: text("reason"),
  isAutoModerated: boolean("is_auto_moderated").default(false),
  aiConfidence: real("ai_confidence"), // 0.0-1.0 for AI moderation confidence
  createdAt: timestamp("created_at").defaultNow(),
});

export type SupportForum = typeof supportForums.$inferSelect;
export type InsertSupportForum = typeof supportForums.$inferInsert;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;
export type PeerCheckIn = typeof peerCheckIns.$inferSelect;
export type InsertPeerCheckIn = typeof peerCheckIns.$inferInsert;
export type PeerSession = typeof peerSessions.$inferSelect;
export type InsertPeerSession = typeof peerSessions.$inferInsert;
export type CommunityModeration = typeof communityModerations.$inferSelect;
export type InsertCommunityModeration = typeof communityModerations.$inferInsert;



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

// Personalization and Adaptive Learning Tables
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  communicationStyle: varchar("communication_style").notNull().default('supportive'),
  preferredTopics: text("preferred_topics").array().default([]),
  avoidedTopics: text("avoided_topics").array().default([]),
  responseLength: varchar("response_length").notNull().default('moderate'),
  emotionalSupport: varchar("emotional_support").notNull().default('gentle'),
  sessionTiming: varchar("session_timing").notNull().default('flexible'),
  exercisePreferences: text("exercise_preferences").array().default([]),
  voicePreference: varchar("voice_preference").notNull().default('james'),
  adaptationLevel: real("adaptation_level").notNull().default(0.5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversationPatterns = pgTable("conversation_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pattern: text("pattern").notNull(),
  frequency: integer("frequency").notNull().default(1),
  effectiveness: real("effectiveness").notNull().default(0.5),
  category: varchar("category").notNull(),
  context: text("context"),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adaptationInsights = pgTable("adaptation_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  conversationThemes: text("conversation_themes").array().default([]),
  emotionalPatterns: text("emotional_patterns").array().default([]),
  effectiveApproaches: text("effective_approaches").array().default([]),
  preferredTimes: text("preferred_times").array().default([]),
  wellnessNeeds: text("wellness_needs").array().default([]),
  learningProgress: real("learning_progress").notNull().default(0.1),
  confidenceScore: real("confidence_score").notNull().default(0.1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wellnessRecommendations = pgTable("wellness_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recommendationId: varchar("recommendation_id").notNull(),
  type: varchar("type").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  difficulty: varchar("difficulty").notNull(),
  tags: text("tags").array().default([]),
  personalizedReason: text("personalized_reason"),
  confidence: real("confidence").notNull().default(0.5),
  wasUsed: boolean("was_used").notNull().default(false),
  userRating: integer("user_rating"), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id"),
  responseQuality: integer("response_quality").notNull(), // 1-5
  helpfulness: integer("helpfulness").notNull(), // 1-5
  personalRelevance: integer("personal_relevance").notNull(), // 1-5
  communicationMatch: integer("communication_match").notNull(), // 1-5
  specificFeedback: text("specific_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const monthlyReports = pgTable("monthly_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  reportMonth: varchar("report_month", { length: 7 }).notNull(), // YYYY-MM format
  reportData: jsonb("report_data").notNull(), // Complete report content
  wellnessScore: real("wellness_score"),
  emotionalVolatility: real("emotional_volatility"),
  progressSummary: text("progress_summary"),
  keyInsights: text("key_insights").array(),
  recommendations: text("recommendations").array(),
  riskLevel: varchar("risk_level", { length: 20 }).default('low'),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Wearable Device Integration Tables
export const wearableDevices = pgTable("wearable_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  deviceType: varchar("device_type", { length: 50 }).notNull(), // 'apple_watch', 'fitbit', 'garmin', etc.
  deviceName: text("device_name").notNull(),
  deviceId: text("device_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncAt: timestamp("last_sync_at"),
  authToken: text("auth_token"), // Encrypted token for device API
  refreshToken: text("refresh_token"), // For OAuth refresh
  syncSettings: jsonb("sync_settings").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  deviceId: integer("device_id").references(() => wearableDevices.id),
  metricType: varchar("metric_type", { length: 50 }).notNull(), // 'heart_rate', 'sleep', 'steps', 'stress'
  value: real("value").notNull(),
  unit: varchar("unit", { length: 20 }).notNull(), // 'bpm', 'hours', 'steps', 'score'
  timestamp: timestamp("timestamp").notNull(),
  metadata: jsonb("metadata").default({}), // Additional data like sleep stages, activity type
  confidence: real("confidence").default(1.0), // Data quality score
  createdAt: timestamp("created_at").defaultNow()
});

export const healthCorrelations = pgTable("health_correlations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  emotionalMetric: varchar("emotional_metric", { length: 50 }).notNull(), // 'mood', 'anxiety', 'stress'
  physicalMetric: varchar("physical_metric", { length: 50 }).notNull(), // 'heart_rate', 'sleep_quality'
  correlationScore: real("correlation_score").notNull(), // -1.0 to 1.0
  confidence: real("confidence").notNull(), // Statistical confidence
  timeframe: varchar("timeframe", { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
  analysisDate: timestamp("analysis_date").defaultNow(),
  insights: text("insights").array(),
  recommendations: text("recommendations").array(),
  createdAt: timestamp("created_at").defaultNow()
});

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => wearableDevices.id),
  syncStatus: varchar("sync_status", { length: 20 }).notNull(), // 'success', 'failed', 'partial'
  recordsProcessed: integer("records_processed").default(0),
  errorMessage: text("error_message"),
  syncDuration: integer("sync_duration"), // milliseconds
  dataTypes: text("data_types").array(), // ['heart_rate', 'sleep', 'steps']
  createdAt: timestamp("created_at").defaultNow()
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
export type ConversationPattern = typeof conversationPatterns.$inferSelect;
export type InsertConversationPattern = typeof conversationPatterns.$inferInsert;
export type AdaptationInsight = typeof adaptationInsights.$inferSelect;
export type InsertAdaptationInsight = typeof adaptationInsights.$inferInsert;
export type WellnessRecommendation = typeof wellnessRecommendations.$inferSelect;
export type InsertWellnessRecommendation = typeof wellnessRecommendations.$inferInsert;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = typeof userFeedback.$inferInsert;
export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type InsertMonthlyReport = typeof monthlyReports.$inferInsert;

// Wearable Device Types
export type WearableDevice = typeof wearableDevices.$inferSelect;
export type InsertWearableDevice = typeof wearableDevices.$inferInsert;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = typeof healthMetrics.$inferInsert;
export type HealthCorrelation = typeof healthCorrelations.$inferSelect;
export type InsertHealthCorrelation = typeof healthCorrelations.$inferInsert;
export type SyncLog = typeof syncLogs.$inferSelect;
export type InsertSyncLog = typeof syncLogs.$inferInsert;

// Wearable Device Insert Schemas
export const insertWearableDeviceSchema = createInsertSchema(wearableDevices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({ id: true, createdAt: true });
export const insertHealthCorrelationSchema = createInsertSchema(healthCorrelations).omit({ id: true, createdAt: true });
export const insertSyncLogSchema = createInsertSchema(syncLogs).omit({ id: true, createdAt: true });

export type InsertWearableDevice = z.infer<typeof insertWearableDeviceSchema>;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type InsertHealthCorrelation = z.infer<typeof insertHealthCorrelationSchema>;
export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;

// VR/AR Therapeutic Experiences Tables
export const vrEnvironments = pgTable("vr_environments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 30 }).notNull(), // 'mindfulness', 'exposure', 'relaxation', 'cbr'
  difficulty: varchar("difficulty", { length: 20 }).notNull().default('beginner'), // 'beginner', 'intermediate', 'advanced'
  duration: integer("duration").notNull(), // minutes
  environmentType: varchar("environment_type", { length: 20 }).notNull(), // 'vr', 'ar', 'mixed'
  scenePath: text("scene_path").notNull(), // Path to 3D scene/environment
  audioPath: text("audio_path"), // Guided audio file
  instructions: text("instructions").array(),
  therapeuticGoals: text("therapeutic_goals").array(),
  contraindications: text("contraindications").array(), // Conditions where this shouldn't be used
  vrSettings: jsonb("vr_settings").notNull().default({}), // Movement, comfort settings
  accessibility: jsonb("accessibility").notNull().default({}), // Accessibility options
  tags: text("tags").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const vrSessions = pgTable("vr_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  environmentId: integer("environment_id").notNull().references(() => vrEnvironments.id),
  sessionType: varchar("session_type", { length: 30 }).notNull(), // 'guided', 'free_form', 'exposure'
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // actual duration in seconds
  completionStatus: varchar("completion_status", { length: 20 }).notNull().default('in_progress'), // 'completed', 'interrupted', 'abandoned'
  stressLevel: jsonb("stress_level"), // Before/after stress measurements
  heartRate: jsonb("heart_rate"), // HR data during session if available
  interactions: jsonb("interactions").notNull().default([]), // User interactions within VR
  achievements: text("achievements").array(), // Goals achieved during session
  notes: text("notes"), // User or therapist notes
  effectiveness: integer("effectiveness"), // 1-10 user rating
  sideEffects: text("side_effects").array(), // Any motion sickness, discomfort
  createdAt: timestamp("created_at").defaultNow()
});

export const vrProgressTracking = pgTable("vr_progress_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  environmentId: integer("environment_id").notNull().references(() => vrEnvironments.id),
  sessionCount: integer("session_count").notNull().default(0),
  totalDuration: integer("total_duration").notNull().default(0), // Total seconds spent
  averageEffectiveness: real("average_effectiveness"),
  bestScore: real("best_score"), // Best performance/comfort score
  lastSessionDate: timestamp("last_session_date"),
  progressMilestones: jsonb("progress_milestones").notNull().default([]),
  adaptations: jsonb("adaptations").notNull().default({}), // Environment adaptations based on user progress
  recommendedNext: text("recommended_next").array(), // Next recommended environments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const vrTherapeuticPlans = pgTable("vr_therapeutic_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planName: text("plan_name").notNull(),
  therapeuticGoal: varchar("therapeutic_goal", { length: 50 }).notNull(), // 'anxiety_reduction', 'phobia_treatment', 'stress_management'
  environments: jsonb("environments").notNull(), // Ordered list of environment IDs and session counts
  currentStage: integer("current_stage").notNull().default(0),
  totalStages: integer("total_stages").notNull(),
  estimatedDuration: integer("estimated_duration"), // Total plan duration in days
  progressPercent: real("progress_percent").notNull().default(0),
  adaptiveSettings: jsonb("adaptive_settings").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const vrAccessibilityProfiles = pgTable("vr_accessibility_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  motionSensitivity: varchar("motion_sensitivity", { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high'
  comfortSettings: jsonb("comfort_settings").notNull().default({}), // Snap turning, comfort zones
  visualAdjustments: jsonb("visual_adjustments").notNull().default({}), // Color contrast, text size
  audioPreferences: jsonb("audio_preferences").notNull().default({}), // Volume, spatial audio
  inputAdaptations: jsonb("input_adaptations").notNull().default({}), // Alternative input methods
  safetyProtocols: jsonb("safety_protocols").notNull().default({}), // Emergency exit, break reminders
  medicalConsiderations: text("medical_considerations").array(), // Conditions to consider
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// VR/AR Types
export type VrEnvironment = typeof vrEnvironments.$inferSelect;
export type InsertVrEnvironment = typeof vrEnvironments.$inferInsert;
export type VrSession = typeof vrSessions.$inferSelect;
export type InsertVrSession = typeof vrSessions.$inferInsert;
export type VrProgressTracking = typeof vrProgressTracking.$inferSelect;
export type InsertVrProgressTracking = typeof vrProgressTracking.$inferInsert;
export type VrTherapeuticPlan = typeof vrTherapeuticPlans.$inferSelect;
export type InsertVrTherapeuticPlan = typeof vrTherapeuticPlans.$inferInsert;
export type VrAccessibilityProfile = typeof vrAccessibilityProfiles.$inferSelect;
export type InsertVrAccessibilityProfile = typeof vrAccessibilityProfiles.$inferInsert;

// VR/AR Insert Schemas
export const insertVrEnvironmentSchema = createInsertSchema(vrEnvironments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVrSessionSchema = createInsertSchema(vrSessions).omit({ id: true, createdAt: true });
export const insertVrProgressTrackingSchema = createInsertSchema(vrProgressTracking).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVrTherapeuticPlanSchema = createInsertSchema(vrTherapeuticPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVrAccessibilityProfileSchema = createInsertSchema(vrAccessibilityProfiles).omit({ id: true, createdAt: true, updatedAt: true });
