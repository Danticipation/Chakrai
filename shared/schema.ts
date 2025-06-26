import { pgTable, serial, text, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Basic user system
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  level: integer("level").default(1),
  wordsLearned: integer("words_learned").default(0),
  personalityMode: text("personality_mode").default("friend"),
  voiceId: text("voice_id").default("james"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isBot: boolean("is_bot").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const learnedWords = pgTable("learned_words", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  word: text("word").notNull(),
  definition: text("definition"),
  context: text("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  level: integer("level").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const userMemories = pgTable("user_memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  memory: text("memory").notNull(),
  importance: integer("importance").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFacts = pgTable("user_facts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fact: text("fact").notNull(),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Therapeutic features - Journal
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  mood: text("mood"),
  moodIntensity: integer("mood_intensity"),
  tags: text("tags").array(),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Therapeutic features - Mood tracking
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mood: text("mood").notNull(),
  intensity: integer("intensity").notNull(),
  notes: text("notes"),
  triggers: text("triggers").array(),
  copingStrategies: text("coping_strategies").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Therapeutic features - Goals
export const therapeuticGoals = pgTable("therapeutic_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  targetValue: integer("target_value").default(100),
  currentValue: integer("current_value").default(0),
  unit: text("unit").default("percent"),
  startDate: timestamp("start_date").defaultNow(),
  targetDate: timestamp("target_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community features
export const supportForums = pgTable("support_forums", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  memberCount: integer("member_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull(),
  userId: integer("user_id").notNull(),
  anonymousName: text("anonymous_name").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  heartCount: integer("heart_count").default(0),
  replyCount: integer("reply_count").default(0),
  isModerated: boolean("is_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Original achievements and streaks tables (kept for compatibility)

// Analytics and insights
export const emotionalPatterns = pgTable("emotional_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  patternType: text("pattern_type").notNull(),
  analysis: jsonb("analysis"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Advanced Emotional Intelligence Tables
export const moodForecasts = pgTable("mood_forecasts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  forecastDate: timestamp("forecast_date").defaultNow(),
  predictedMood: text("predicted_mood").notNull(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(), // 'low', 'medium', 'high', 'critical'
  triggerFactors: text("trigger_factors").array(),
  preventiveRecommendations: text("preventive_recommendations").array(),
  historicalPatterns: jsonb("historical_patterns"),
  actualMood: text("actual_mood"),
  forecastAccuracy: decimal("forecast_accuracy", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emotionalContexts = pgTable("emotional_contexts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: text("session_id"),
  currentMood: text("current_mood").notNull(),
  intensity: integer("intensity").notNull(),
  volatility: decimal("volatility", { precision: 3, scale: 2 }).notNull(),
  urgency: text("urgency").notNull(), // 'low', 'medium', 'high', 'critical'
  recentTriggers: text("recent_triggers").array(),
  supportNeeds: text("support_needs").array(),
  contextData: jsonb("context_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictiveInsights = pgTable("predictive_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  insight: text("insight").notNull(),
  probability: decimal("probability", { precision: 3, scale: 2 }).notNull(),
  timeframe: text("timeframe").notNull(),
  preventiveActions: text("preventive_actions").array(),
  riskMitigation: text("risk_mitigation").array(),
  isActive: boolean("is_active").default(true),
  wasAccurate: boolean("was_accurate"),
  userFeedback: text("user_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emotionalResponseAdaptations = pgTable("emotional_response_adaptations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  originalMessage: text("original_message").notNull(),
  adaptedResponse: text("adapted_response").notNull(),
  tone: text("tone").notNull(),
  intensity: text("intensity").notNull(),
  responseLength: text("response_length").notNull(),
  communicationStyle: text("communication_style"),
  priorityFocus: text("priority_focus").array(),
  effectiveness: text("effectiveness"),
  userResponse: text("user_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crisisDetectionLogs = pgTable("crisis_detection_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  messageContent: text("message_content").notNull(),
  riskLevel: text("risk_level").notNull(),
  crisisIndicators: text("crisis_indicators").array(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).notNull(),
  interventionTriggered: boolean("intervention_triggered").default(false),
  interventionType: text("intervention_type"),
  followUpScheduled: boolean("follow_up_scheduled").default(false),
  resolutionStatus: text("resolution_status"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertLearnedWordSchema = createInsertSchema(learnedWords).omit({
  id: true,
  createdAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  unlockedAt: true,
});

export const insertUserMemorySchema = createInsertSchema(userMemories).omit({
  id: true,
  createdAt: true,
});

export const insertUserFactSchema = createInsertSchema(userFacts).omit({
  id: true,
  createdAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
});

export const insertTherapeuticGoalSchema = createInsertSchema(therapeuticGoals).omit({
  id: true,
  createdAt: true,
});

export const insertSupportForumSchema = createInsertSchema(supportForums).omit({
  id: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertWellnessStreakSchema = createInsertSchema(wellnessStreaks).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionalPatternSchema = createInsertSchema(emotionalPatterns).omit({
  id: true,
  generatedAt: true,
});

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
  updatedAt: true,
});

export const insertEmotionalResponseAdaptationSchema = createInsertSchema(emotionalResponseAdaptations).omit({
  id: true,
  createdAt: true,
});

export const insertCrisisDetectionLogSchema = createInsertSchema(crisisDetectionLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Bot = typeof bots.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type LearnedWord = typeof learnedWords.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type UserMemory = typeof userMemories.$inferSelect;
export type UserFact = typeof userFacts.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type TherapeuticGoal = typeof therapeuticGoals.$inferSelect;
export type SupportForum = typeof supportForums.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type WellnessStreak = typeof wellnessStreaks.$inferSelect;
export type EmotionalPattern = typeof emotionalPatterns.$inferSelect;
export type MoodForecast = typeof moodForecasts.$inferSelect;
export type EmotionalContext = typeof emotionalContexts.$inferSelect;
export type PredictiveInsight = typeof predictiveInsights.$inferSelect;
export type EmotionalResponseAdaptation = typeof emotionalResponseAdaptations.$inferSelect;
export type CrisisDetectionLog = typeof crisisDetectionLogs.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertLearnedWord = z.infer<typeof insertLearnedWordSchema>;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type InsertUserMemory = z.infer<typeof insertUserMemorySchema>;
export type InsertUserFact = z.infer<typeof insertUserFactSchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type InsertTherapeuticGoal = z.infer<typeof insertTherapeuticGoalSchema>;
export type InsertSupportForum = z.infer<typeof insertSupportForumSchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertWellnessStreak = z.infer<typeof insertWellnessStreakSchema>;
export type InsertEmotionalPattern = z.infer<typeof insertEmotionalPatternSchema>;
export type InsertMoodForecast = z.infer<typeof insertMoodForecastSchema>;
export type InsertEmotionalContext = z.infer<typeof insertEmotionalContextSchema>;
export type InsertPredictiveInsight = z.infer<typeof insertPredictiveInsightSchema>;
export type InsertEmotionalResponseAdaptation = z.infer<typeof insertEmotionalResponseAdaptationSchema>;
export type InsertCrisisDetectionLog = z.infer<typeof insertCrisisDetectionLogSchema>;

// Analytics & Reporting Tables
export const monthlyWellnessReports = pgTable("monthly_wellness_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reportMonth: text("report_month").notNull(), // YYYY-MM format
  wellnessScore: decimal("wellness_score", { precision: 5, scale: 2 }),
  emotionalVolatility: decimal("emotional_volatility", { precision: 5, scale: 2 }),
  progressSummary: text("progress_summary"),
  aiGeneratedInsights: text("ai_generated_insights"),
  moodTrends: jsonb("mood_trends"),
  activityMetrics: jsonb("activity_metrics"),
  therapeuticProgress: jsonb("therapeutic_progress"),
  riskAssessment: jsonb("risk_assessment"),
  recommendations: text("recommendations").array(),
  milestonesAchieved: text("milestones_achieved").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyticsMetrics = pgTable("analytics_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  metricType: text("metric_type").notNull(), // wellness_score, volatility, engagement, etc.
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  calculatedDate: timestamp("calculated_date").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progressTracking = pgTable("progress_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trackingPeriod: text("tracking_period").notNull(), // daily, weekly, monthly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  journalEntries: integer("journal_entries").default(0),
  moodEntries: integer("mood_entries").default(0),
  chatSessions: integer("chat_sessions").default(0),
  goalsCompleted: integer("goals_completed").default(0),
  averageMoodScore: decimal("average_mood_score", { precision: 3, scale: 2 }),
  consistencyScore: decimal("consistency_score", { precision: 3, scale: 2 }),
  therapeuticEngagement: decimal("therapeutic_engagement", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assessmentDate: timestamp("assessment_date").notNull(),
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }).notNull(),
  riskFactors: text("risk_factors").array(),
  protectiveFactors: text("protective_factors").array(),
  recommendations: text("recommendations").array(),
  triggerEvents: jsonb("trigger_events"),
  followUpRequired: boolean("follow_up_required").default(false),
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Gamification & Rewards System Tables

// Wellness Points Management
export const userWellnessPoints = pgTable("user_wellness_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalPoints: integer("total_points").default(0),
  availablePoints: integer("available_points").default(0),
  lifetimePoints: integer("lifetime_points").default(0),
  currentLevel: integer("current_level").default(1),
  pointsToNextLevel: integer("points_to_next_level").default(100),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Points Transaction Log
export const pointsTransactions = pgTable("points_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  points: integer("points").notNull(),
  transactionType: text("transaction_type").notNull(), // earned, spent, bonus
  activity: text("activity").notNull(), // journal_entry, mood_check, achievement, purchase
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rewards Shop Items
export const rewardsShop = pgTable("rewards_shop", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // avatar, theme, premium_content, virtual_item, therapeutic_tool
  cost: integer("cost").notNull(),
  rarity: text("rarity").default("common"), // common, rare, epic, legendary
  isAvailable: boolean("is_available").default(true),
  therapeuticValue: text("therapeutic_value"),
  imageUrl: text("image_url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Purchased Items
export const userPurchases = pgTable("user_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
});

// Achievement System
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // engagement, milestone, wellness, achievement, social
  type: text("type").notNull(), // daily, weekly, milestone, special
  rarity: text("rarity").default("common"), // common, rare, epic, legendary
  icon: text("icon"),
  pointsReward: integer("points_reward").default(0),
  criteria: jsonb("criteria"), // Requirements to unlock
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  celebrationShown: boolean("celebration_shown").default(false),
});

// Wellness Streaks
export const wellnessStreaks = pgTable("wellness_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  streakType: text("streak_type").notNull(), // daily_checkin, journaling, mood_tracking, chat_session, goal_progress
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily Activities Tracking
export const dailyActivities = pgTable("daily_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityDate: timestamp("activity_date").defaultNow(),
  journalEntry: boolean("journal_entry").default(false),
  moodTracking: boolean("mood_tracking").default(false),
  chatSession: boolean("chat_session").default(false),
  goalProgress: boolean("goal_progress").default(false),
  dailyCheckin: boolean("daily_checkin").default(false),
  pointsEarned: integer("points_earned").default(0),
  activitiesCompleted: integer("activities_completed").default(0),
});

// Community Challenges
export const communityChallenges = pgTable("community_challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  challengeType: text("challenge_type").notNull(), // gratitude, mindfulness, mood_tracking, journaling
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targetGoal: integer("target_goal").notNull(),
  pointsReward: integer("points_reward").default(0),
  participantCount: integer("participant_count").default(0),
  isActive: boolean("is_active").default(true),
  criteria: jsonb("criteria"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Challenge Participation
export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  currentProgress: integer("current_progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
});

// User Levels and Rankings
export const userLevels = pgTable("user_levels", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull().unique(),
  name: text("name").notNull(),
  pointsRequired: integer("points_required").notNull(),
  badge: text("badge"),
  benefits: jsonb("benefits"),
  description: text("description"),
});

export const longitudinalTrends = pgTable("longitudinal_trends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trendType: text("trend_type").notNull(), // mood, wellness, engagement, etc.
  timeframe: text("timeframe").notNull(), // 3months, 6months, 1year
  trendDirection: text("trend_direction").notNull(), // improving, stable, declining
  trendStrength: decimal("trend_strength", { precision: 3, scale: 2 }),
  dataPoints: jsonb("data_points"),
  statisticalSignificance: decimal("statistical_significance", { precision: 3, scale: 2 }),
  insights: text("insights"),
  predictedOutcome: text("predicted_outcome"),
  confidenceInterval: jsonb("confidence_interval"),
  lastCalculated: timestamp("last_calculated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas for Analytics
export const insertMonthlyWellnessReportSchema = createInsertSchema(monthlyWellnessReports).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsMetricSchema = createInsertSchema(analyticsMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertProgressTrackingSchema = createInsertSchema(progressTracking).omit({
  id: true,
  createdAt: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertLongitudinalTrendSchema = createInsertSchema(longitudinalTrends).omit({
  id: true,
  createdAt: true,
});

// Export Types for Analytics
export type MonthlyWellnessReport = typeof monthlyWellnessReports.$inferSelect;
export type AnalyticsMetric = typeof analyticsMetrics.$inferSelect;
export type ProgressTracking = typeof progressTracking.$inferSelect;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type LongitudinalTrend = typeof longitudinalTrends.$inferSelect;

export type InsertMonthlyWellnessReport = z.infer<typeof insertMonthlyWellnessReportSchema>;
export type InsertAnalyticsMetric = z.infer<typeof insertAnalyticsMetricSchema>;
export type InsertProgressTracking = z.infer<typeof insertProgressTrackingSchema>;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type InsertLongitudinalTrend = z.infer<typeof insertLongitudinalTrendSchema>;