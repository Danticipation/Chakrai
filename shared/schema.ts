import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { Json } from "./types";

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

// Emotional intelligence and mood tracking
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  emotion: text("emotion").notNull(),
  intensity: integer("intensity").notNull().default(50),
  valence: integer("valence").notNull().default(0),
  arousal: integer("arousal").notNull().default(50),
  context: text("context"),
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

// Crisis detection and safety
export const safetyCheckIns = pgTable("safety_check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  riskLevel: text("risk_level").notNull(),
  triggerMessage: text("trigger_message").notNull(),
  confidenceScore: integer("confidence_score"),
  indicators: text("indicators").array(),
  checkInRequired: boolean("check_in_required").default(true),
  responseReceived: boolean("response_received").default(false),
  interventionTaken: boolean("intervention_taken").default(false),
  emergencyContactMade: boolean("emergency_contact_made").default(false),
  followUpScheduled: boolean("follow_up_scheduled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crisisInterventions = pgTable("crisis_interventions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  safetyCheckInId: integer("safety_check_in_id"),
  interventionType: text("intervention_type").notNull(),
  severity: text("severity").notNull(),
  actionTaken: text("action_taken").notNull(),
  outcome: text("outcome"),
  followUpRequired: boolean("follow_up_required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Journaling system
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  mood: text("mood"),
  emotionalTags: text("emotional_tags").array(),
  triggers: text("triggers").array(),
  gratitude: text("gratitude").array(),
  goals: text("goals").array(),
  reflectionPrompts: text("reflection_prompts").array(),
  private: boolean("private").default(true),
  aiAnalyzed: boolean("ai_analyzed").default(false),
  wordCount: integer("word_count"),
  readingTime: integer("reading_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalAnalytics = pgTable("journal_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  entryId: integer("entry_id").notNull(),
  sentiment: integer("sentiment"),
  emotionalTone: text("emotional_tone"),
  keyThemes: text("key_themes").array(),
  riskIndicators: text("risk_indicators").array(),
  therapeuticInsights: jsonb("therapeutic_insights"),
  emotionalThemes: jsonb("emotional_themes"),
  triggerAnalysis: jsonb("trigger_analysis"),
  copingStrategies: text("coping_strategies").array(),
  recommendedActions: text("recommended_actions").array(),
  progressIndicators: jsonb("progress_indicators"),
  patternConnections: jsonb("pattern_connections"),
  confidenceScore: integer("confidence_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalExports = pgTable("journal_exports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exportType: text("export_type"),
  format: text("format"),
  dateRange: jsonb("date_range"),
  recipientType: text("recipient_type"),
  includedEntries: integer("included_entries").array(),
  fileUrl: text("file_url"),
  encryptionKey: text("encryption_key"),
  expiresAt: timestamp("expires_at"),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Therapist collaboration system
export const therapists = pgTable("therapists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  licenseNumber: text("license_number"),
  specialization: text("specialization").array(),
  isVerified: boolean("is_verified").default(false),
  collaborationLevel: text("collaboration_level", { enum: ["view_only", "interactive", "full_access"] }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const therapistSessions = pgTable("therapist_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  therapistId: integer("therapist_id").notNull(),
  sessionType: text("session_type", { enum: ["video", "phone", "in_person"] }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status", { enum: ["scheduled", "in_progress", "completed", "cancelled", "no_show"] }),
  notes: text("notes"),
  therapistNotes: text("therapist_notes"),
  userPreparation: text("user_preparation"),
  sessionGoals: text("session_goals").array(),
  outcomes: text("outcomes").array(),
  followUpActions: text("follow_up_actions").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const therapistSharedInsights = pgTable("therapist_shared_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  therapistId: integer("therapist_id").notNull(),
  insightType: text("insight_type", { enum: ["journal_summary", "mood_patterns", "crisis_alert", "progress_report"] }).notNull(),
  content: jsonb("content").notNull(),
  sharedAt: timestamp("shared_at").defaultNow(),
  therapistViewed: boolean("therapist_viewed").default(false),
  therapistResponse: text("therapist_response"),
  priority: text("priority", { enum: ["high", "medium", "low", "urgent"] }),
  isActive: boolean("is_active").default(true),
});

export const collaborationSettings = pgTable("collaboration_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  autoShareJournalSummaries: boolean("auto_share_journal_summaries").default(false),
  shareFrequency: text("share_frequency", { enum: ["daily", "weekly", "biweekly", "monthly"] }),
  allowCrisisAlerts: boolean("allow_crisis_alerts").default(true),
  shareEmotionalPatterns: boolean("share_emotional_patterns").default(false),
  shareProgressMetrics: boolean("share_progress_metrics").default(false),
  privacyLevel: text("privacy_level", { enum: ["minimal", "moderate", "comprehensive"] }).default("moderate"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gamification system
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: text("badge_id").notNull(),
  progress: integer("progress"),
  isActive: boolean("is_active").default(true),
  unlockedAt: timestamp("unlocked_at"),
});

export const wellnessStreaks = pgTable("wellness_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  streakType: text("streak_type", { enum: ["mood_tracking", "daily_checkin", "journal_entry", "chat_session", "goal_progress"] }).notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyActivities = pgTable("daily_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityDate: timestamp("activity_date").notNull(),
  checkedIn: boolean("checked_in").default(false),
  journalEntry: boolean("journal_entry").default(false),
  moodTracked: boolean("mood_tracked").default(false),
  chatSession: boolean("chat_session").default(false),
  goalProgress: boolean("goal_progress").default(false),
  totalActivities: integer("total_activities").default(0),
});

// Community features
export const supportForums = pgTable("support_forums", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  isModerated: boolean("is_moderated").default(true),
  anonymousPostsAllowed: boolean("anonymous_posts_allowed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull(),
  authorId: integer("author_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  anonymousName: text("anonymous_name"),
  isAnonymous: boolean("is_anonymous").default(false),
  isModerated: boolean("is_moderated").default(false),
  isFlagged: boolean("is_flagged").default(false),
  supportCount: integer("support_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorId: integer("author_id"),
  content: text("content").notNull(),
  anonymousName: text("anonymous_name"),
  isAnonymous: boolean("is_anonymous").default(false),
  isFlagged: boolean("is_flagged").default(false),
  supportCount: integer("support_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const peerCheckIns = pgTable("peer_check_ins", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  supporterId: integer("supporter_id"),
  status: text("status"),
  notes: text("notes"),
  isAnonymous: boolean("is_anonymous").default(true),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  preferredTime: text("preferred_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const peerSessions = pgTable("peer_sessions", {
  id: serial("id").primaryKey(),
  checkInId: integer("check_in_id").notNull(),
  sessionNotes: text("session_notes"),
  effectivenessRating: integer("effectiveness_rating"),
  followUpScheduled: boolean("follow_up_scheduled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityModerations = pgTable("community_moderations", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(),
  contentId: integer("content_id").notNull(),
  moderatorId: integer("moderator_id"),
  action: text("action").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Adaptive learning system
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  communicationStyle: text("communication_style").notNull(),
  responseLength: text("response_length").notNull(),
  emotionalSupport: text("emotional_support").notNull(),
  preferredTopics: text("preferred_topics").array(),
  avoidedTopics: text("avoided_topics").array(),
  exercisePreferences: text("exercise_preferences").array(),
  adaptationLevel: integer("adaptation_level").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversationPatterns = pgTable("conversation_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  conversationThemes: text("conversation_themes").array(),
  emotionalPatterns: text("emotional_patterns").array(),
  effectiveApproaches: text("effective_approaches").array(),
  preferredTimes: text("preferred_times").array(),
  wellnessNeeds: text("wellness_needs").array(),
  learningProgress: integer("learning_progress").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wellnessRecommendations = pgTable("wellness_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recommendationId: text("recommendation_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull(),
  duration: integer("duration").notNull(),
  tags: text("tags").array(),
  personalizedReason: text("personalized_reason"),
  confidence: integer("confidence").notNull(),
  wasUsed: boolean("was_used").notNull(),
  userRating: integer("user_rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adaptationInsights = pgTable("adaptation_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  conversationThemes: text("conversation_themes").array().notNull(),
  emotionalPatterns: text("emotional_patterns").array().notNull(),
  effectiveApproaches: text("effective_approaches").array().notNull(),
  preferredTimes: text("preferred_times").array().notNull(),
  wellnessNeeds: text("wellness_needs").array().notNull(),
  learningProgress: integer("learning_progress").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  feedbackType: text("feedback_type").notNull(),
  rating: integer("rating").notNull(),
  comments: text("comments"),
  context: jsonb("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const monthlyReports = pgTable("monthly_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reportMonth: text("report_month").notNull(),
  reportData: jsonb("report_data").notNull(),
  riskLevel: text("risk_level"),
  emotionalVolatility: integer("emotional_volatility"),
  keyInsights: text("key_insights").array(),
  wellnessScore: integer("wellness_score"),
  progressSummary: text("progress_summary"),
  recommendations: text("recommendations").array(),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health tracking
export const wearableDevices = pgTable("wearable_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceType: text("device_type").notNull(),
  deviceName: text("device_name").notNull(),
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  syncFrequency: text("sync_frequency").default("daily"),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceId: integer("device_id"),
  metricType: text("metric_type").notNull(),
  value: integer("value").notNull(),
  unit: text("unit").notNull(),
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthCorrelations = pgTable("health_correlations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  healthMetric: text("health_metric").notNull(),
  emotionalState: text("emotional_state").notNull(),
  correlationStrength: integer("correlation_strength").notNull(),
  analysisDate: timestamp("analysis_date").defaultNow(),
});

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceId: integer("device_id").notNull(),
  syncStatus: text("sync_status").notNull(),
  recordsSync: integer("records_sync").default(0),
  errorMessage: text("error_message"),
  syncDuration: integer("sync_duration"),
  createdAt: timestamp("created_at").defaultNow(),
});

// VR therapy system
export const vrEnvironments = pgTable("vr_environments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  therapeuticFocus: text("therapeutic_focus").notNull(),
  difficultyLevel: text("difficulty_level").default("beginner"),
  duration: integer("duration").default(10),
  isActive: boolean("is_active").default(true),
  accessibilityFeatures: text("accessibility_features").array(),
  contentWarnings: text("content_warnings").array(),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vrSessions = pgTable("vr_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  environmentId: integer("environment_id").notNull(),
  sessionType: text("session_type").notNull(),
  durationMinutes: integer("duration_minutes"),
  completionStatus: text("completion_status").notNull(),
  therapeuticNotes: text("therapeutic_notes"),
  effectivenessRating: integer("effectiveness_rating"),
  stressLevelBefore: integer("stress_level_before"),
  stressLevelAfter: integer("stress_level_after"),
  insights: jsonb("insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vrProgressTracking = pgTable("vr_progress_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  environmentId: integer("environment_id").notNull(),
  totalSessions: integer("total_sessions").default(0),
  totalDuration: integer("total_duration").default(0),
  averageEffectiveness: integer("average_effectiveness"),
  stressReduction: integer("stress_reduction"),
  skillDevelopment: text("skill_development").array(),
  milestones: jsonb("milestones"),
  lastSession: timestamp("last_session"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vrTherapeuticPlans = pgTable("vr_therapeutic_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planName: text("plan_name").notNull(),
  therapeuticGoals: text("therapeutic_goals").array(),
  recommendedEnvironments: integer("recommended_environments").array(),
  progressMilestones: jsonb("progress_milestones"),
  estimatedDuration: integer("estimated_duration"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vrAccessibilityProfiles = pgTable("vr_accessibility_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  visualAdjustments: jsonb("visual_adjustments"),
  audioAdjustments: jsonb("audio_adjustments"),
  motorAdjustments: jsonb("motor_adjustments"),
  cognitiveSupport: jsonb("cognitive_support"),
  triggerWarnings: text("trigger_warnings").array(),
  preferredSessionLength: integer("preferred_session_length").default(10),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced gamification
export const userWellnessPoints = pgTable("user_wellness_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalPoints: integer("total_points").default(0),
  currentLevel: integer("current_level").default(1),
  pointsToNextLevel: integer("points_to_next_level").default(100),
  lifetimePoints: integer("lifetime_points").default(0),
  pointsSpent: integer("points_spent").default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rewardsShop = pgTable("rewards_shop", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  pointsCost: integer("points_cost").notNull(),
  rarity: text("rarity").default("common"),
  therapeuticValue: text("therapeutic_value"),
  isActive: boolean("is_active").default(true),
  stockLimit: integer("stock_limit"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
  pointsSpent: integer("points_spent").notNull(),
  isActive: boolean("is_active").default(true),
});

export const communityChallengess = pgTable("community_challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  challengeType: text("challenge_type").notNull(),
  duration: integer("duration").notNull(),
  pointsReward: integer("points_reward").notNull(),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  userId: integer("user_id").notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const challengeActivities = pgTable("challenge_activities", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(),
  activityData: jsonb("activity_data"),
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalAchievements = pgTable("emotional_achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  triggerCondition: text("trigger_condition").notNull(),
  emotionalMilestone: text("emotional_milestone").notNull(),
  category: text("category").notNull(),
  rarity: text("rarity").default("common"),
  pointsReward: integer("points_reward").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userEmotionalAchievements = pgTable("user_emotional_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  triggeredBy: text("triggered_by"),
  emotionalContext: jsonb("emotional_context"),
  pointsEarned: integer("points_earned").notNull(),
  celebrationMessage: text("celebration_message"),
  isPersonalized: boolean("is_personalized").default(false),
  userReflection: text("user_reflection"),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  pointsChange: integer("points_change").notNull(),
  changeType: text("change_type").notNull(),
  description: text("description"),
  relatedId: integer("related_id"),
  relatedType: text("related_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Emotional intelligence enhancement
export const moodForecasts = pgTable("mood_forecasts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  forecastDate: timestamp("forecast_date").notNull(),
  predictedMood: text("predicted_mood").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  riskAssessment: text("risk_assessment"),
  preventiveRecommendations: text("preventive_recommendations").array(),
  triggerFactors: text("trigger_factors").array(),
  historicalPatterns: jsonb("historical_patterns"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalContexts = pgTable("emotional_contexts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contextType: text("context_type").notNull(),
  emotionalState: text("emotional_state").notNull(),
  intensity: integer("intensity").notNull(),
  triggers: text("triggers").array(),
  environmentalFactors: jsonb("environmental_factors"),
  socialContext: text("social_context"),
  effectiveResponses: text("effective_responses").array(),
  detectedAt: timestamp("detected_at").defaultNow(),
});

export const predictiveInsights = pgTable("predictive_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  insightType: text("insight_type").notNull(),
  prediction: text("prediction").notNull(),
  accuracy: integer("accuracy").notNull(),
  timeframe: text("timeframe").notNull(),
  recommendation: text("recommendation"),
  preventiveMeasures: text("preventive_measures").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalResponseAdaptations = pgTable("emotional_response_adaptations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contextId: integer("context_id").notNull(),
  originalResponse: text("original_response").notNull(),
  adaptedResponse: text("adapted_response").notNull(),
  adaptationReason: text("adaptation_reason"),
  effectiveness: integer("effectiveness"),
  userFeedback: text("user_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI performance monitoring
export const aiPerformanceMetrics = pgTable("ai_performance_metrics", {
  id: serial("id").primaryKey(),
  metricType: text("metric_type").notNull(),
  value: integer("value").notNull(),
  context: jsonb("context"),
  userId: integer("user_id"),
  sessionId: text("session_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const aiResponseAnalysis = pgTable("ai_response_analysis", {
  id: serial("id").primaryKey(),
  responseId: text("response_id").notNull(),
  therapeuticScore: integer("therapeutic_score"),
  empathyScore: integer("empathy_score"),
  clarityScore: integer("clarity_score"),
  appropriatenessScore: integer("appropriateness_score"),
  flaggedForReview: boolean("flagged_for_review").default(false),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crisisDetectionLogs = pgTable("crisis_detection_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  messageContent: text("message_content").notNull(),
  detectedRisk: text("detected_risk").notNull(),
  confidenceLevel: integer("confidence_level").notNull(),
  falsePositive: boolean("false_positive"),
  interventionTriggered: boolean("intervention_triggered").default(false),
  reviewedBy: text("reviewed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const therapeuticEffectivenessTracking = pgTable("therapeutic_effectiveness_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  interventionType: text("intervention_type").notNull(),
  effectivenessScore: integer("effectiveness_score"),
  userSatisfaction: integer("user_satisfaction"),
  longTermImpact: integer("long_term_impact"),
  followUpRequired: boolean("follow_up_required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemPerformanceDashboard = pgTable("system_performance_dashboard", {
  id: serial("id").primaryKey(),
  metricName: text("metric_name").notNull(),
  metricValue: integer("metric_value").notNull(),
  targetValue: integer("target_value"),
  status: text("status").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Type exports
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
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type EmotionalPattern = typeof emotionalPatterns.$inferSelect;
export type InsertEmotionalPattern = z.infer<typeof insertEmotionalPatternSchema>;
export type SafetyCheckIn = typeof safetyCheckIns.$inferSelect;
export type InsertSafetyCheckIn = z.infer<typeof insertSafetyCheckInSchema>;
export type CrisisIntervention = typeof crisisInterventions.$inferSelect;
export type InsertCrisisIntervention = z.infer<typeof insertCrisisInterventionSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalAnalytics = typeof journalAnalytics.$inferSelect;
export type InsertJournalAnalytics = z.infer<typeof insertJournalAnalyticsSchema>;
export type JournalExport = typeof journalExports.$inferSelect;
export type InsertJournalExport = z.infer<typeof insertJournalExportSchema>;
export type Therapist = typeof therapists.$inferSelect;
export type InsertTherapist = z.infer<typeof insertTherapistSchema>;
export type TherapistSession = typeof therapistSessions.$inferSelect;
export type InsertTherapistSession = z.infer<typeof insertTherapistSessionSchema>;
export type TherapistSharedInsight = typeof therapistSharedInsights.$inferSelect;
export type InsertTherapistSharedInsight = z.infer<typeof insertTherapistSharedInsightSchema>;
export type CollaborationSettings = typeof collaborationSettings.$inferSelect;
export type InsertCollaborationSettings = z.infer<typeof insertCollaborationSettingsSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type WellnessStreak = typeof wellnessStreaks.$inferSelect;
export type InsertWellnessStreak = z.infer<typeof insertWellnessStreakSchema>;
export type DailyActivity = typeof dailyActivities.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type SupportForum = typeof supportForums.$inferSelect;
export type InsertSupportForum = z.infer<typeof insertSupportForumSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type PeerCheckIn = typeof peerCheckIns.$inferSelect;
export type InsertPeerCheckIn = z.infer<typeof insertPeerCheckInSchema>;
export type PeerSession = typeof peerSessions.$inferSelect;
export type InsertPeerSession = z.infer<typeof insertPeerSessionSchema>;
export type CommunityModeration = typeof communityModerations.$inferSelect;
export type InsertCommunityModeration = z.infer<typeof insertCommunityModerationSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type ConversationPattern = typeof conversationPatterns.$inferSelect;
export type InsertConversationPattern = z.infer<typeof insertConversationPatternSchema>;
export type WellnessRecommendation = typeof wellnessRecommendations.$inferSelect;
export type InsertWellnessRecommendation = z.infer<typeof insertWellnessRecommendationSchema>;
export type AdaptationInsight = typeof adaptationInsights.$inferSelect;
export type InsertAdaptationInsight = z.infer<typeof insertAdaptationInsightSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type InsertMonthlyReport = z.infer<typeof insertMonthlyReportSchema>;
export type WearableDevice = typeof wearableDevices.$inferSelect;
export type InsertWearableDevice = z.infer<typeof insertWearableDeviceSchema>;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type HealthCorrelation = typeof healthCorrelations.$inferSelect;
export type InsertHealthCorrelation = z.infer<typeof insertHealthCorrelationSchema>;
export type SyncLog = typeof syncLogs.$inferSelect;
export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type VrEnvironment = typeof vrEnvironments.$inferSelect;
export type InsertVrEnvironment = z.infer<typeof insertVrEnvironmentSchema>;
export type VrSession = typeof vrSessions.$inferSelect;
export type InsertVrSession = z.infer<typeof insertVrSessionSchema>;
export type VrProgressTracking = typeof vrProgressTracking.$inferSelect;
export type InsertVrProgressTracking = z.infer<typeof insertVrProgressTrackingSchema>;
export type VrTherapeuticPlan = typeof vrTherapeuticPlans.$inferSelect;
export type InsertVrTherapeuticPlan = z.infer<typeof insertVrTherapeuticPlanSchema>;
export type VrAccessibilityProfile = typeof vrAccessibilityProfiles.$inferSelect;
export type InsertVrAccessibilityProfile = z.infer<typeof insertVrAccessibilityProfileSchema>;
export type UserWellnessPoints = typeof userWellnessPoints.$inferSelect;
export type InsertUserWellnessPoints = z.infer<typeof insertUserWellnessPointsSchema>;
export type RewardsShop = typeof rewardsShop.$inferSelect;
export type InsertRewardsShop = z.infer<typeof insertRewardsShopSchema>;
export type UserRewards = typeof userRewards.$inferSelect;
export type InsertUserRewards = z.infer<typeof insertUserRewardsSchema>;
export type CommunityChallenge = typeof communityChallengess.$inferSelect;
export type InsertCommunityChallenge = z.infer<typeof insertCommunityChallengeSchema>;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;
export type ChallengeActivity = typeof challengeActivities.$inferSelect;
export type InsertChallengeActivity = z.infer<typeof insertChallengeActivitySchema>;
export type EmotionalAchievement = typeof emotionalAchievements.$inferSelect;
export type InsertEmotionalAchievement = z.infer<typeof insertEmotionalAchievementSchema>;
export type UserEmotionalAchievement = typeof userEmotionalAchievements.$inferSelect;
export type InsertUserEmotionalAchievement = z.infer<typeof insertUserEmotionalAchievementSchema>;
export type PointsHistory = typeof pointsHistory.$inferSelect;
export type InsertPointsHistory = z.infer<typeof insertPointsHistorySchema>;
export type MoodForecast = typeof moodForecasts.$inferSelect;
export type InsertMoodForecast = z.infer<typeof insertMoodForecastSchema>;
export type EmotionalContext = typeof emotionalContexts.$inferSelect;
export type InsertEmotionalContext = z.infer<typeof insertEmotionalContextSchema>;
export type PredictiveInsight = typeof predictiveInsights.$inferSelect;
export type InsertPredictiveInsight = z.infer<typeof insertPredictiveInsightSchema>;
export type EmotionalResponseAdaptation = typeof emotionalResponseAdaptations.$inferSelect;
export type InsertEmotionalResponseAdaptation = z.infer<typeof insertEmotionalResponseAdaptationSchema>;
export type AiPerformanceMetric = typeof aiPerformanceMetrics.$inferSelect;
export type InsertAiPerformanceMetric = z.infer<typeof insertAiPerformanceMetricSchema>;
export type AiResponseAnalysis = typeof aiResponseAnalysis.$inferSelect;
export type InsertAiResponseAnalysis = z.infer<typeof insertAiResponseAnalysisSchema>;
export type CrisisDetectionLog = typeof crisisDetectionLogs.$inferSelect;
export type InsertCrisisDetectionLog = z.infer<typeof insertCrisisDetectionLogSchema>;
export type TherapeuticEffectivenessTracking = typeof therapeuticEffectivenessTracking.$inferSelect;
export type InsertTherapeuticEffectivenessTracking = z.infer<typeof insertTherapeuticEffectivenessTrackingSchema>;
export type SystemPerformanceDashboard = typeof systemPerformanceDashboard.$inferSelect;
export type InsertSystemPerformanceDashboard = z.infer<typeof insertSystemPerformanceDashboardSchema>;

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

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionalPatternSchema = createInsertSchema(emotionalPatterns).omit({
  id: true,
  analysisDate: true,
  updatedAt: true,
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

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertWellnessStreakSchema = createInsertSchema(wellnessStreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyActivitySchema = createInsertSchema(dailyActivities).omit({
  id: true,
});

export const insertSupportForumSchema = createInsertSchema(supportForums).omit({
  id: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
});

export const insertPeerCheckInSchema = createInsertSchema(peerCheckIns).omit({
  id: true,
  createdAt: true,
});

export const insertPeerSessionSchema = createInsertSchema(peerSessions).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityModerationSchema = createInsertSchema(communityModerations).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationPatternSchema = createInsertSchema(conversationPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWellnessRecommendationSchema = createInsertSchema(wellnessRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertAdaptationInsightSchema = createInsertSchema(adaptationInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertMonthlyReportSchema = createInsertSchema(monthlyReports).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
});

export const insertWearableDeviceSchema = createInsertSchema(wearableDevices).omit({
  id: true,
  createdAt: true,
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertHealthCorrelationSchema = createInsertSchema(healthCorrelations).omit({
  id: true,
  analysisDate: true,
});

export const insertSyncLogSchema = createInsertSchema(syncLogs).omit({
  id: true,
  createdAt: true,
});

export const insertVrEnvironmentSchema = createInsertSchema(vrEnvironments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVrSessionSchema = createInsertSchema(vrSessions).omit({
  id: true,
  createdAt: true,
});

export const insertVrProgressTrackingSchema = createInsertSchema(vrProgressTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVrTherapeuticPlanSchema = createInsertSchema(vrTherapeuticPlans).omit({
  id: true,
  createdAt: true,
});

export const insertVrAccessibilityProfileSchema = createInsertSchema(vrAccessibilityProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserWellnessPointsSchema = createInsertSchema(userWellnessPoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRewardsShopSchema = createInsertSchema(rewardsShop).omit({
  id: true,
  createdAt: true,
});

export const insertUserRewardsSchema = createInsertSchema(userRewards).omit({
  id: true,
  purchasedAt: true,
});

export const insertCommunityChallengeSchema = createInsertSchema(communityChallengess).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).omit({
  id: true,
  joinedAt: true,
  completedAt: true,
});

export const insertChallengeActivitySchema = createInsertSchema(challengeActivities).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionalAchievementSchema = createInsertSchema(emotionalAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserEmotionalAchievementSchema = createInsertSchema(userEmotionalAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertPointsHistorySchema = createInsertSchema(pointsHistory).omit({
  id: true,
  createdAt: true,
});

export const insertMoodForecastSchema = createInsertSchema(moodForecasts).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionalContextSchema = createInsertSchema(emotionalContexts).omit({
  id: true,
  detectedAt: true,
});

export const insertPredictiveInsightSchema = createInsertSchema(predictiveInsights).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionalResponseAdaptationSchema = createInsertSchema(emotionalResponseAdaptations).omit({
  id: true,
  createdAt: true,
});

export const insertAiPerformanceMetricSchema = createInsertSchema(aiPerformanceMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertAiResponseAnalysisSchema = createInsertSchema(aiResponseAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertCrisisDetectionLogSchema = createInsertSchema(crisisDetectionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertTherapeuticEffectivenessTrackingSchema = createInsertSchema(therapeuticEffectivenessTracking).omit({
  id: true,
  createdAt: true,
});

export const insertSystemPerformanceDashboardSchema = createInsertSchema(systemPerformanceDashboard).omit({
  id: true,
  lastUpdated: true,
});