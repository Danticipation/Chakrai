import { pgTable, serial, integer, text, real, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Emotional Tone Tracking
export const emotionalToneMetrics = pgTable('emotional_tone_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  sessionId: text('session_id').notNull(),
  messageText: text('message_text').notNull(),
  emotionalTone: text('emotional_tone').notNull(), // positive, negative, neutral, anxious, depressed, hopeful
  toneIntensity: real('tone_intensity').notNull(), // 0.0 to 1.0
  sentimentScore: real('sentiment_score').notNull(), // -1.0 to 1.0
  emotionalKeywords: json('emotional_keywords').$type<string[]>(),
  contextTags: json('context_tags').$type<string[]>(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// Affirmation Response Tracking
export const affirmationResponseMetrics = pgTable('affirmation_response_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  affirmationType: text('affirmation_type').notNull(), // self-compassion, confidence, gratitude, motivation
  affirmationContent: text('affirmation_content').notNull(),
  userResponse: text('user_response'), // optional user feedback
  engagementLevel: text('engagement_level').notNull(), // high, medium, low
  responseTime: integer('response_time'), // seconds to next interaction
  voiceListened: boolean('voice_listened').default(false),
  emotionalShift: real('emotional_shift'), // change in mood after affirmation
  efficacyScore: real('efficacy_score'), // 0.0 to 1.0
  presentedAt: timestamp('presented_at').defaultNow().notNull(),
});

// Wellness Goal Completion Tracking
export const wellnessGoalMetrics = pgTable('wellness_goal_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  goalType: text('goal_type').notNull(), // mindfulness, exercise, journaling, sleep
  goalDescription: text('goal_description').notNull(),
  targetValue: integer('target_value').notNull(),
  currentProgress: integer('current_progress').notNull(),
  completionRate: real('completion_rate').notNull(), // percentage
  daysActive: integer('days_active').notNull(),
  consistencyScore: real('consistency_score').notNull(), // 0.0 to 1.0
  motivationLevel: text('motivation_level'), // high, medium, low
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// User Engagement Analytics
export const userEngagementMetrics = pgTable('user_engagement_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  sessionDuration: integer('session_duration').notNull(), // minutes
  featuresUsed: json('features_used').$type<string[]>(),
  interactionCount: integer('interaction_count').notNull(),
  voiceInteractions: integer('voice_interactions').notNull(),
  journalEntries: integer('journal_entries').notNull(),
  agentHandoffs: integer('agent_handoffs').notNull(),
  wellnessActivities: integer('wellness_activities').notNull(),
  sessionDate: timestamp('session_date').defaultNow().notNull(),
});

// Therapeutic Efficacy Reports
export const therapeuticEfficacyReports = pgTable('therapeutic_efficacy_reports', {
  id: serial('id').primaryKey(),
  reportType: text('report_type').notNull(), // weekly, monthly, quarterly
  dateRange: text('date_range').notNull(),
  totalUsers: integer('total_users').notNull(),
  averageEmotionalImprovement: real('avg_emotional_improvement').notNull(),
  goalCompletionRate: real('goal_completion_rate').notNull(),
  userRetentionRate: real('user_retention_rate').notNull(),
  mostEffectiveAffirmations: json('most_effective_affirmations').$type<string[]>(),
  keyInsights: json('key_insights').$type<string[]>(),
  clinicalMetrics: json('clinical_metrics').$type<{
    anxietyReduction: number;
    depressionImprovement: number;
    stressManagement: number;
    overallWellness: number;
  }>(),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
});

// Schema types
export type EmotionalToneMetric = typeof emotionalToneMetrics.$inferSelect;
export type InsertEmotionalToneMetric = typeof emotionalToneMetrics.$inferInsert;

export type AffirmationResponseMetric = typeof affirmationResponseMetrics.$inferSelect;
export type InsertAffirmationResponseMetric = typeof affirmationResponseMetrics.$inferInsert;

export type WellnessGoalMetric = typeof wellnessGoalMetrics.$inferSelect;
export type InsertWellnessGoalMetric = typeof wellnessGoalMetrics.$inferInsert;

export type UserEngagementMetric = typeof userEngagementMetrics.$inferSelect;
export type InsertUserEngagementMetric = typeof userEngagementMetrics.$inferInsert;

export type TherapeuticEfficacyReport = typeof therapeuticEfficacyReports.$inferSelect;
export type InsertTherapeuticEfficacyReport = typeof therapeuticEfficacyReports.$inferInsert;

// Zod schemas
export const insertEmotionalToneMetricSchema = createInsertSchema(emotionalToneMetrics);
export const insertAffirmationResponseMetricSchema = createInsertSchema(affirmationResponseMetrics);
export const insertWellnessGoalMetricSchema = createInsertSchema(wellnessGoalMetrics);
export const insertUserEngagementMetricSchema = createInsertSchema(userEngagementMetrics);
export const insertTherapeuticEfficacyReportSchema = createInsertSchema(therapeuticEfficacyReports);