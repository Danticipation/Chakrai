import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, real, decimal } from "drizzle-orm/pg-core";
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

// Enhanced Gamification: Wellness Points & Rewards Shop
export const userWellnessPoints = pgTable("user_wellness_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalPoints: integer("total_points").default(0),
  lifetimePoints: integer("lifetime_points").default(0),
  pointsSpent: integer("points_spent").default(0),
  currentLevel: integer("current_level").default(1),
  pointsToNextLevel: integer("points_to_next_level").default(100),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rewardsShop = pgTable("rewards_shop", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { enum: ["avatar", "theme", "premium_content", "virtual_item", "therapeutic_tool"] }).notNull(),
  pointsCost: integer("points_cost").notNull(),
  rarity: varchar("rarity", { enum: ["common", "rare", "epic", "legendary"] }).default("common"),
  isAvailable: boolean("is_available").default(true),
  isLimitedTime: boolean("is_limited_time").default(false),
  availableUntil: timestamp("available_until"),
  therapeuticValue: text("therapeutic_value"), // How this reward supports mental wellness
  previewImage: varchar("preview_image"),
  unlockRequirement: jsonb("unlock_requirement"), // Level, achievement, or special conditions
  purchaseCount: integer("purchase_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rewardId: integer("reward_id").notNull().references(() => rewardsShop.id),
  purchasedAt: timestamp("purchased_at").defaultNow(),
  pointsSpent: integer("points_spent").notNull(),
  isActive: boolean("is_active").default(true),
  isEquipped: boolean("is_equipped").default(false), // For avatars/themes
});

// Community Challenges System
export const communityChallengess = pgTable("community_challenges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  challengeType: varchar("challenge_type", { enum: ["gratitude", "mindfulness", "journaling", "mood_tracking", "social_connection", "self_care", "resilience"] }).notNull(),
  duration: integer("duration").notNull(), // days
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targetGoal: integer("target_goal").notNull(), // e.g., 30 days of gratitude
  pointsReward: integer("points_reward").default(0),
  badgeReward: varchar("badge_reward"), // Achievement badge for completion
  participantCount: integer("participant_count").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  therapeuticFocus: text("therapeutic_focus"), // Mental health benefits
  dailyPrompts: jsonb("daily_prompts"), // Array of daily prompts/activities
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => communityChallengess.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  currentProgress: integer("current_progress").default(0),
  completedDays: integer("completed_days").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
  motivationalMessage: text("motivational_message"),
  isActive: boolean("is_active").default(true),
});

export const challengeActivities = pgTable("challenge_activities", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => communityChallengess.id),
  userId: integer("user_id").notNull().references(() => users.id),
  activityDay: integer("activity_day").notNull(), // Day 1, 2, 3, etc.
  activityDate: timestamp("activity_date").notNull(),
  prompt: text("prompt").notNull(),
  userResponse: text("user_response"),
  emotionalState: varchar("emotional_state"), // Before/after emotional check-in
  reflectionNotes: text("reflection_notes"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
});

// Dynamic Emotional Achievements System
export const emotionalAchievements = pgTable("emotional_achievements", {
  id: serial("id").primaryKey(),
  achievementId: varchar("achievement_id").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { enum: ["resilience", "emotional_breakthrough", "self_awareness", "mindfulness", "social_connection", "coping_skills", "progress_milestone"] }).notNull(),
  triggerCondition: jsonb("trigger_condition").notNull(), // AI-detectable conditions
  difficultyLevel: varchar("difficulty_level", { enum: ["beginner", "intermediate", "advanced", "expert"] }).default("beginner"),
  rarity: varchar("rarity", { enum: ["common", "rare", "epic", "legendary"] }).default("common"),
  pointsReward: integer("points_reward").default(0),
  badgeIcon: varchar("badge_icon").notNull(),
  badgeColor: varchar("badge_color").default("#ADD8E6"),
  therapeuticSignificance: text("therapeutic_significance"), // Why this achievement matters for mental health
  isHidden: boolean("is_hidden").default(false), // Hidden until unlocked
  unlockMessage: text("unlock_message"),
  celebrationMessage: text("celebration_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userEmotionalAchievements = pgTable("user_emotional_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => emotionalAchievements.achievementId),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  triggerContext: jsonb("trigger_context"), // What emotional pattern/conversation triggered this
  emotionalState: jsonb("emotional_state"), // User's emotional state when achieved
  progressSnapshot: jsonb("progress_snapshot"), // User's therapy progress at time of achievement
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }), // AI confidence in achievement validity
  pointsEarned: integer("points_earned").default(0),
  isViewed: boolean("is_viewed").default(false),
  userReflection: text("user_reflection"), // User's thoughts on achieving this
});

export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pointsChange: integer("points_change").notNull(), // Positive for earned, negative for spent
  source: varchar("source", { enum: ["achievement", "daily_activity", "streak", "challenge", "purchase", "bonus", "manual_adjustment"] }).notNull(),
  sourceId: integer("source_id"), // Reference to achievement, challenge, etc.
  description: text("description").notNull(),
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Emotional Intelligence Tables

export const moodForecasts = pgTable("mood_forecasts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  forecastDate: timestamp("forecast_date").notNull(),
  predictedMood: varchar("predicted_mood", { length: 50 }).notNull(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).notNull(),
  riskLevel: varchar("risk_level", { length: 20 }).notNull(),
  triggerFactors: text("trigger_factors").array(),
  preventiveRecommendations: text("preventive_recommendations").array(),
  historicalPatterns: jsonb("historical_patterns"),
  actualMood: varchar("actual_mood", { length: 50 }),
  actualIntensity: integer("actual_intensity"),
  forecastAccuracy: decimal("forecast_accuracy", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const emotionalContexts = pgTable("emotional_contexts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }),
  messageId: varchar("message_id", { length: 255 }),
  currentMood: varchar("current_mood", { length: 50 }).notNull(),
  intensity: integer("intensity").notNull(),
  volatility: decimal("volatility", { precision: 3, scale: 2 }).notNull(),
  urgency: varchar("urgency", { length: 20 }).notNull(),
  recentTriggers: text("recent_triggers").array(),
  supportNeeds: text("support_needs").array(),
  responseContext: jsonb("response_context"),
  createdAt: timestamp("created_at").defaultNow()
});

export const predictiveInsights = pgTable("predictive_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  insightType: varchar("insight_type", { length: 50 }).notNull(),
  insight: text("insight").notNull(),
  probability: decimal("probability", { precision: 3, scale: 2 }).notNull(),
  timeframe: varchar("timeframe", { length: 50 }).notNull(),
  preventiveActions: text("preventive_actions").array(),
  riskMitigation: text("risk_mitigation").array(),
  isActive: boolean("is_active").default(true),
  wasAccurate: boolean("was_accurate"),
  userFeedback: text("user_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  validUntil: timestamp("valid_until")
});

export const emotionalResponseAdaptations = pgTable("emotional_response_adaptations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  messageContext: text("message_context").notNull(),
  detectedEmotionalState: jsonb("detected_emotional_state").notNull(),
  responseStrategy: jsonb("response_strategy").notNull(),
  tone: varchar("tone", { length: 30 }).notNull(),
  intensity: varchar("intensity", { length: 20 }).notNull(),
  responseLength: varchar("response_length", { length: 20 }).notNull(),
  communicationStyle: text("communication_style").notNull(),
  priorityFocus: text("priority_focus").array(),
  effectiveness: decimal("effectiveness", { precision: 3, scale: 2 }),
  userResponse: text("user_response"),
  createdAt: timestamp("created_at").defaultNow()
});

// Advanced Emotional Intelligence Schema Types
export const insertMoodForecastSchema = createInsertSchema(moodForecasts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmotionalContextSchema = createInsertSchema(emotionalContexts).omit({
  id: true,
  createdAt: true,
});

export const insertPredictiveInsightSchema = createInsertSchema(predictiveInsights).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionalResponseAdaptationSchema = createInsertSchema(emotionalResponseAdaptations).omit({
  id: true,
  createdAt: true,
});

export type MoodForecast = typeof moodForecasts.$inferSelect;
export type InsertMoodForecast = z.infer<typeof insertMoodForecastSchema>;
export type EmotionalContext = typeof emotionalContexts.$inferSelect;
export type InsertEmotionalContext = z.infer<typeof insertEmotionalContextSchema>;
export type PredictiveInsight = typeof predictiveInsights.$inferSelect;
export type InsertPredictiveInsight = z.infer<typeof insertPredictiveInsightSchema>;
export type EmotionalResponseAdaptation = typeof emotionalResponseAdaptations.$inferSelect;
export type InsertEmotionalResponseAdaptation = z.infer<typeof insertEmotionalResponseAdaptationSchema>;

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

// Enhanced Gamification Schema Types
export const insertUserWellnessPointsSchema = createInsertSchema(userWellnessPoints).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRewardsShopSchema = createInsertSchema(rewardsShop).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserRewardsSchema = createInsertSchema(userRewards).omit({ id: true, purchasedAt: true });
export const insertCommunityChallengeSchema = createInsertSchema(communityChallengess).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).omit({ id: true, joinedAt: true });
export const insertChallengeActivitySchema = createInsertSchema(challengeActivities).omit({ id: true });
export const insertEmotionalAchievementSchema = createInsertSchema(emotionalAchievements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserEmotionalAchievementSchema = createInsertSchema(userEmotionalAchievements).omit({ id: true, unlockedAt: true });
export const insertPointsHistorySchema = createInsertSchema(pointsHistory).omit({ id: true, createdAt: true });

// Enhanced Gamification Types (moved to line 1064)

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

// Wearable device types defined later in file

// VR/AR Therapeutic Experiences Tables
export const vrEnvironments = pgTable("vr_environments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  environmentType: varchar("environment_type", { length: 100 }),
  therapeuticFocus: varchar("therapeutic_focus", { length: 100 }),
  immersionLevel: varchar("immersion_level", { length: 50 }),
  difficultyLevel: varchar("difficulty_level", { length: 50 }),
  durationMinutes: integer("duration_minutes"),
  settings: jsonb("settings"),
  accessibilityFeatures: jsonb("accessibility_features"),
  contentWarnings: text("content_warnings").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const vrSessions = pgTable("vr_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  environmentId: integer("environment_id").notNull().references(() => vrEnvironments.id),
  sessionType: varchar("session_type", { length: 30 }).notNull(), // 'guided', 'free_form', 'exposure'
  durationMinutes: integer("duration_minutes"), // actual duration in minutes
  completionStatus: varchar("completion_status", { length: 20 }).notNull().default('in_progress'), // 'completed', 'interrupted', 'abandoned'
  therapeuticNotes: text("therapeutic_notes"), // User or therapist notes
  effectivenessRating: integer("effectiveness_rating"), // 1-10 user rating
  stressLevelBefore: integer("stress_level_before"), // 1-10 stress before session
  stressLevelAfter: integer("stress_level_after"), // 1-10 stress after session
  insights: jsonb("insights").notNull().default([]), // Session insights and achievements
  createdAt: timestamp("created_at").defaultNow()
});

export const vrProgressTracking = pgTable("vr_progress_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  environmentId: integer("environment_id").notNull(),
  totalSessions: integer("total_sessions").notNull().default(0),
  totalDurationMinutes: integer("total_duration_minutes").notNull().default(0),
  averageEffectiveness: decimal("average_effectiveness", { precision: 3, scale: 2 }),
  stressReductionAverage: decimal("stress_reduction_average", { precision: 3, scale: 2 }),
  skillDevelopmentLevel: integer("skill_development_level").notNull().default(1),
  personalRecords: jsonb("personal_records"),
  milestonesAchieved: text("milestones_achieved").array(),
  lastSessionDate: timestamp("last_session_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const vrTherapeuticPlans = pgTable("vr_therapeutic_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planName: varchar("plan_name", { length: 255 }).notNull(),
  therapeuticGoals: text("therapeutic_goals").array(),
  recommendedEnvironments: integer("recommended_environments").array(),
  sessionFrequency: varchar("session_frequency", { length: 50 }),
  durationWeeks: integer("duration_weeks"),
  progressMetrics: jsonb("progress_metrics"),
  createdBy: varchar("created_by", { length: 100 }).default('AI'),
  status: varchar("status", { length: 50 }).default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const vrAccessibilityProfiles = pgTable("vr_accessibility_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  motionSensitivity: varchar("motion_sensitivity", { length: 50 }).default('medium'),
  audioDescriptions: boolean("audio_descriptions").default(false),
  simplifiedControls: boolean("simplified_controls").default(false),
  highContrast: boolean("high_contrast").default(false),
  largeText: boolean("large_text").default(false),
  reducedMotion: boolean("reduced_motion").default(false),
  voiceCommands: boolean("voice_commands").default(false),
  hapticFeedback: boolean("haptic_feedback").default(true),
  triggerWarnings: boolean("trigger_warnings").default(true),
  emergencyExit: boolean("emergency_exit").default(true),
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

// Enhanced Gamification Types
export type UserWellnessPoints = typeof userWellnessPoints.$inferSelect;
export type InsertUserWellnessPoints = typeof userWellnessPoints.$inferInsert;
export type RewardsShop = typeof rewardsShop.$inferSelect;
export type InsertRewardsShop = typeof rewardsShop.$inferInsert;
export type UserRewards = typeof userRewards.$inferSelect;
export type InsertUserRewards = typeof userRewards.$inferInsert;
export type CommunityChallenge = typeof communityChallengess.$inferSelect;
export type InsertCommunityChallenge = typeof communityChallengess.$inferInsert;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = typeof challengeParticipants.$inferInsert;
export type ChallengeActivity = typeof challengeActivities.$inferSelect;
export type InsertChallengeActivity = typeof challengeActivities.$inferInsert;
export type EmotionalAchievement = typeof emotionalAchievements.$inferSelect;
export type InsertEmotionalAchievement = typeof emotionalAchievements.$inferInsert;
export type UserEmotionalAchievement = typeof userEmotionalAchievements.$inferSelect;
export type InsertUserEmotionalAchievement = typeof userEmotionalAchievements.$inferInsert;
export type PointsHistory = typeof pointsHistory.$inferSelect;
export type InsertPointsHistory = typeof pointsHistory.$inferInsert;

// VR/AR Insert Schemas
export const insertVrEnvironmentSchema = createInsertSchema(vrEnvironments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVrSessionSchema = createInsertSchema(vrSessions).omit({ id: true, createdAt: true });
export const insertVrProgressTrackingSchema = createInsertSchema(vrProgressTracking).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVrTherapeuticPlanSchema = createInsertSchema(vrTherapeuticPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVrAccessibilityProfileSchema = createInsertSchema(vrAccessibilityProfiles).omit({ id: true, createdAt: true, updatedAt: true });

// AI Performance Monitoring Tables
export const aiPerformanceMetrics = pgTable('ai_performance_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  metricType: text('metric_type').notNull(), // 'response_quality', 'therapeutic_effectiveness', 'crisis_detection'
  metricValue: real('metric_value').notNull(), // 0.0-1.0 score
  context: text('context'), // Additional context about the metric
  aiModel: text('ai_model').default('gpt-4o'), // Which AI model was used
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  responseTime: integer('response_time'), // milliseconds
  timestamp: timestamp('timestamp').defaultNow(),
  sessionId: text('session_id'),
  conversationId: text('conversation_id')
});

export const aiResponseAnalysis = pgTable('ai_response_analysis', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  originalPrompt: text('original_prompt').notNull(),
  aiResponse: text('ai_response').notNull(),
  therapeuticScore: real('therapeutic_score'), // 0.0-1.0 therapeutic value
  empathyScore: real('empathy_score'), // 0.0-1.0 empathy level
  clarityScore: real('clarity_score'), // 0.0-1.0 clarity rating
  appropriatenessScore: real('appropriateness_score'), // 0.0-1.0 appropriateness
  userFeedback: text('user_feedback'), // Optional user feedback
  userRating: integer('user_rating'), // 1-5 star rating
  flaggedForReview: boolean('flagged_for_review').default(false),
  reviewNotes: text('review_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const crisisDetectionLogs = pgTable('crisis_detection_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  messageContent: text('message_content').notNull(),
  detectedRiskLevel: text('detected_risk_level').notNull(), // 'none', 'low', 'medium', 'high', 'critical'
  confidenceScore: real('confidence_score'), // 0.0-1.0 AI confidence
  triggerKeywords: text('trigger_keywords').array(),
  aiAnalysis: text('ai_analysis'), // AI's reasoning for detection
  interventionTriggered: boolean('intervention_triggered').default(false),
  interventionType: text('intervention_type'), // 'immediate', 'scheduled', 'resources'
  falsePositive: boolean('false_positive'), // Marked by review
  truePositive: boolean('true_positive'), // Confirmed crisis
  reviewedBy: text('reviewed_by'), // Internal reviewer
  reviewNotes: text('review_notes'),
  detectedAt: timestamp('detected_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at')
});

export const therapeuticEffectivenessTracking = pgTable('therapeutic_effectiveness_tracking', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  interventionType: text('intervention_type').notNull(), // 'mindfulness', 'cbt', 'crisis_support', 'mood_tracking'
  interventionId: integer('intervention_id'), // Reference to specific intervention
  userEngagement: real('user_engagement'), // 0.0-1.0 engagement level
  completionRate: real('completion_rate'), // 0.0-1.0 completion percentage
  userSatisfaction: real('user_satisfaction'), // 0.0-1.0 satisfaction score
  therapeuticProgress: real('therapeutic_progress'), // 0.0-1.0 progress indicator
  longTermImpact: real('long_term_impact'), // 0.0-1.0 measured after time
  followUpData: jsonb('follow_up_data'), // Additional tracking data
  measuredAt: timestamp('measured_at').defaultNow(),
  followUpAt: timestamp('follow_up_at')
});

export const systemPerformanceDashboard = pgTable('system_performance_dashboard', {
  id: serial('id').primaryKey(),
  metricPeriod: text('metric_period').notNull(), // 'hourly', 'daily', 'weekly', 'monthly'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  totalResponses: integer('total_responses').default(0),
  averageResponseQuality: real('average_response_quality'),
  averageTherapeuticEffectiveness: real('average_therapeutic_effectiveness'),
  crisisDetectionAccuracy: real('crisis_detection_accuracy'),
  falsePositiveRate: real('false_positive_rate'),
  userSatisfactionAverage: real('user_satisfaction_average'),
  systemUptime: real('system_uptime'), // Percentage
  averageResponseTime: real('average_response_time'), // milliseconds
  totalTokensUsed: integer('total_tokens_used'),
  costAnalysis: jsonb('cost_analysis'),
  performanceAlerts: text('performance_alerts').array(),
  createdAt: timestamp('created_at').defaultNow()
});

// AI Performance Monitoring Types
export type AiPerformanceMetric = typeof aiPerformanceMetrics.$inferSelect;
export type InsertAiPerformanceMetric = typeof aiPerformanceMetrics.$inferInsert;
export type AiResponseAnalysis = typeof aiResponseAnalysis.$inferSelect;
export type InsertAiResponseAnalysis = typeof aiResponseAnalysis.$inferInsert;
export type CrisisDetectionLog = typeof crisisDetectionLogs.$inferSelect;
export type InsertCrisisDetectionLog = typeof crisisDetectionLogs.$inferInsert;
export type TherapeuticEffectivenessTracking = typeof therapeuticEffectivenessTracking.$inferSelect;
export type InsertTherapeuticEffectivenessTracking = typeof therapeuticEffectivenessTracking.$inferInsert;
export type SystemPerformanceDashboard = typeof systemPerformanceDashboard.$inferSelect;
export type InsertSystemPerformanceDashboard = typeof systemPerformanceDashboard.$inferInsert;

// AI Performance Insert Schemas
export const insertAiPerformanceMetricSchema = createInsertSchema(aiPerformanceMetrics).omit({ id: true, timestamp: true });
export const insertAiResponseAnalysisSchema = createInsertSchema(aiResponseAnalysis).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCrisisDetectionLogSchema = createInsertSchema(crisisDetectionLogs).omit({ id: true, detectedAt: true, reviewedAt: true });
export const insertTherapeuticEffectivenessTrackingSchema = createInsertSchema(therapeuticEffectivenessTracking).omit({ id: true, measuredAt: true, followUpAt: true });
export const insertSystemPerformanceDashboardSchema = createInsertSchema(systemPerformanceDashboard).omit({ id: true, createdAt: true });


