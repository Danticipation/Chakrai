import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Therapeutic Agents Table
export const therapeuticAgents = pgTable('therapeutic_agents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'cbt', 'mindfulness', 'self_compassion', 'trauma', 'anxiety'
  description: text('description').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  specializations: text('specializations').array(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent Sessions Table
export const agentSessions = pgTable('agent_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  agentId: integer('agent_id').notNull(),
  sessionType: text('session_type').notNull(),
  objective: text('objective').notNull(),
  status: text('status').default('active'), // 'active', 'completed', 'transferred'
  conversationHistory: jsonb('conversation_history'),
  insights: jsonb('insights'),
  recommendations: jsonb('recommendations'),
  transferReason: text('transfer_reason'),
  completionNotes: text('completion_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Agent Handoffs Table
export const agentHandoffs = pgTable('agent_handoffs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  fromAgent: text('from_agent').notNull(), // 'main_bot' or agent type
  toAgent: text('to_agent').notNull(),
  reason: text('reason').notNull(),
  context: jsonb('context'),
  userConsent: boolean('user_consent').default(false),
  handoffMessage: text('handoff_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent Insights Table
export const agentInsights = pgTable('agent_insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  agentType: text('agent_type').notNull(),
  sessionId: integer('session_id'),
  insightType: text('insight_type').notNull(), // 'cognitive_distortion', 'mindfulness_progress', 'self_compassion_breakthrough'
  insight: text('insight').notNull(),
  confidence: integer('confidence'), // 1-10 scale
  actionable: boolean('actionable').default(true),
  followUpRequired: boolean('follow_up_required').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent Performance Metrics Table
export const agentMetrics = pgTable('agent_metrics', {
  id: serial('id').primaryKey(),
  agentType: text('agent_type').notNull(),
  userId: integer('user_id').notNull(),
  sessionId: integer('session_id'),
  effectivenessScore: integer('effectiveness_score'), // 1-10
  userSatisfaction: integer('user_satisfaction'), // 1-10
  objectiveAchieved: boolean('objective_achieved').default(false),
  sessionDuration: integer('session_duration'), // minutes
  insightsGenerated: integer('insights_generated').default(0),
  transfersInitiated: integer('transfers_initiated').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Insert Schemas
export const insertTherapeuticAgent = createInsertSchema(therapeuticAgents).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSession = createInsertSchema(agentSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAgentHandoff = createInsertSchema(agentHandoffs).omit({
  id: true,
  createdAt: true,
});

export const insertAgentInsight = createInsertSchema(agentInsights).omit({
  id: true,
  createdAt: true,
});

export const insertAgentMetric = createInsertSchema(agentMetrics).omit({
  id: true,
  createdAt: true,
});

// Types
export type TherapeuticAgent = typeof therapeuticAgents.$inferSelect;
export type AgentSession = typeof agentSessions.$inferSelect;
export type AgentHandoff = typeof agentHandoffs.$inferSelect;
export type AgentInsight = typeof agentInsights.$inferSelect;
export type AgentMetric = typeof agentMetrics.$inferSelect;

export type InsertTherapeuticAgent = z.infer<typeof insertTherapeuticAgent>;
export type InsertAgentSession = z.infer<typeof insertAgentSession>;
export type InsertAgentHandoff = z.infer<typeof insertAgentHandoff>;
export type InsertAgentInsight = z.infer<typeof insertAgentInsight>;
export type InsertAgentMetric = z.infer<typeof insertAgentMetric>;