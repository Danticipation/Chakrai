import { db } from "./db";
import { 
  users, bots, messages, learnedWords, milestones, userMemories, userFacts,
  moodEntries, emotionalPatterns, safetyCheckIns, crisisInterventions,
  journalEntries, journalAnalytics, journalExports,
  therapists, therapistSessions, therapistSharedInsights, collaborationSettings,
  userAchievements, wellnessStreaks, dailyActivities,
  supportForums, forumPosts, forumReplies, peerCheckIns, peerSessions, communityModerations,
  userPreferences, conversationPatterns, wellnessRecommendations, adaptationInsights, userFeedback, monthlyReports,
  wearableDevices, healthMetrics, healthCorrelations, syncLogs,
  vrEnvironments, vrSessions, vrProgressTracking, vrTherapeuticPlans, vrAccessibilityProfiles,
  userWellnessPoints, rewardsShop, userRewards, communityChallengess, challengeParticipants, challengeActivities,
  emotionalAchievements, userEmotionalAchievements, pointsHistory,
  moodForecasts, emotionalContexts, predictiveInsights, emotionalResponseAdaptations,
  aiPerformanceMetrics, aiResponseAnalysis, crisisDetectionLogs, therapeuticEffectivenessTracking, systemPerformanceDashboard,
  type User, type InsertUser,
  type Bot, type InsertBot,
  type Message, type InsertMessage,
  type LearnedWord, type InsertLearnedWord,
  type Milestone, type InsertMilestone,
  type UserMemory, type InsertUserMemory,
  type UserFact, type InsertUserFact,
  type MoodEntry, type InsertMoodEntry,
  type EmotionalPattern, type InsertEmotionalPattern,
  type SafetyCheckIn, type InsertSafetyCheckIn,
  type CrisisIntervention, type InsertCrisisIntervention,
  type JournalEntry, type InsertJournalEntry,
  type JournalAnalytics, type InsertJournalAnalytics,
  type JournalExport, type InsertJournalExport,
  type Therapist, type InsertTherapist,
  type TherapistSession, type InsertTherapistSession,
  type TherapistSharedInsight, type InsertTherapistSharedInsight,
  type CollaborationSettings, type InsertCollaborationSettings,
  type UserAchievement, type InsertUserAchievement,
  type WellnessStreak, type InsertWellnessStreak,
  type DailyActivity, type InsertDailyActivity,
  type SupportForum, type InsertSupportForum,
  type ForumPost, type InsertForumPost,
  type ForumReply, type InsertForumReply,
  type PeerCheckIn, type InsertPeerCheckIn,
  type PeerSession, type InsertPeerSession,
  type CommunityModeration, type InsertCommunityModeration,
  type UserPreferences, type InsertUserPreferences,
  type ConversationPattern, type InsertConversationPattern,
  type WellnessRecommendation, type InsertWellnessRecommendation,
  type AdaptationInsight, type InsertAdaptationInsight,
  type UserFeedback, type InsertUserFeedback,
  type MonthlyReport, type InsertMonthlyReport,
  type WearableDevice, type InsertWearableDevice,
  type HealthMetric, type InsertHealthMetric,
  type HealthCorrelation, type InsertHealthCorrelation,
  type SyncLog, type InsertSyncLog,
  type VrEnvironment, type InsertVrEnvironment,
  type VrSession, type InsertVrSession,
  type VrProgressTracking, type InsertVrProgressTracking,
  type VrTherapeuticPlan, type InsertVrTherapeuticPlan,
  type VrAccessibilityProfile, type InsertVrAccessibilityProfile,
  type UserWellnessPoints, type InsertUserWellnessPoints,
  type RewardsShop, type InsertRewardsShop,
  type UserRewards, type InsertUserRewards,
  type CommunityChallenge, type InsertCommunityChallenge,
  type ChallengeParticipant, type InsertChallengeParticipant,
  type ChallengeActivity, type InsertChallengeActivity,
  type EmotionalAchievement, type InsertEmotionalAchievement,
  type UserEmotionalAchievement, type InsertUserEmotionalAchievement,
  type PointsHistory, type InsertPointsHistory,
  type MoodForecast, type InsertMoodForecast,
  type EmotionalContext, type InsertEmotionalContext,
  type PredictiveInsight, type InsertPredictiveInsight,
  type EmotionalResponseAdaptation, type InsertEmotionalResponseAdaptation,
  type AiPerformanceMetric, type InsertAiPerformanceMetric,
  type AiResponseAnalysis, type InsertAiResponseAnalysis,
  type CrisisDetectionLog, type InsertCrisisDetectionLog,
  type TherapeuticEffectivenessTracking, type InsertTherapeuticEffectivenessTracking,
  type SystemPerformanceDashboard, type InsertSystemPerformanceDashboard
} from "@shared/schema";
import { eq, desc, asc, and, or, gte, lte, count, avg, isNull, isNotNull } from "drizzle-orm";

// Storage interface for all therapeutic features
export class DatabaseStorage {
  // User management
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async getUser(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0] || null;
  }

  // Bot management
  async createBot(bot: InsertBot): Promise<Bot> {
    const result = await db.insert(bots).values(bot).returning();
    return result[0];
  }

  async getBotByUserId(userId: number): Promise<Bot | null> {
    const result = await db.select().from(bots).where(eq(bots.userId, userId));
    return result[0] || null;
  }

  async updateBot(id: number, updates: Partial<Bot>): Promise<Bot | null> {
    const result = await db.update(bots).set(updates).where(eq(bots.id, id)).returning();
    return result[0] || null;
  }

  // Message management
  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.timestamp));
  }

  // Learned words
  async createLearnedWord(word: InsertLearnedWord): Promise<LearnedWord> {
    const result = await db.insert(learnedWords).values(word).returning();
    return result[0];
  }

  async getLearnedWordsByUserId(userId: number): Promise<LearnedWord[]> {
    return await db.select().from(learnedWords).where(eq(learnedWords.userId, userId));
  }

  // Milestones
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const result = await db.insert(milestones).values(milestone).returning();
    return result[0];
  }

  async getMilestonesByUserId(userId: number): Promise<Milestone[]> {
    return await db.select().from(milestones).where(eq(milestones.userId, userId));
  }

  // User memories
  async createUserMemory(memory: InsertUserMemory): Promise<UserMemory> {
    const result = await db.insert(userMemories).values(memory).returning();
    return result[0];
  }

  async getUserMemoriesByUserId(userId: number): Promise<UserMemory[]> {
    return await db.select().from(userMemories).where(eq(userMemories.userId, userId));
  }

  async getUserMemories(userId: number): Promise<UserMemory[]> {
    return await db.select().from(userMemories).where(eq(userMemories.userId, userId));
  }

  // User facts
  async createUserFact(fact: InsertUserFact): Promise<UserFact> {
    const result = await db.insert(userFacts).values(fact).returning();
    return result[0];
  }

  async getUserFactsByUserId(userId: number): Promise<UserFact[]> {
    return await db.select().from(userFacts).where(eq(userFacts.userId, userId));
  }

  async getUserFacts(userId: number): Promise<UserFact[]> {
    return await db.select().from(userFacts).where(eq(userFacts.userId, userId));
  }

  // Mood entries
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const result = await db.insert(moodEntries).values(entry).returning();
    return result[0];
  }

  async getMoodEntriesByUserId(userId: number): Promise<MoodEntry[]> {
    return await db.select().from(moodEntries).where(eq(moodEntries.userId, userId)).orderBy(desc(moodEntries.createdAt));
  }

  async getMoodEntries(userId: number): Promise<MoodEntry[]> {
    return await db.select().from(moodEntries).where(eq(moodEntries.userId, userId)).orderBy(desc(moodEntries.createdAt));
  }

  // Emotional patterns
  async createEmotionalPattern(pattern: InsertEmotionalPattern): Promise<EmotionalPattern> {
    const result = await db.insert(emotionalPatterns).values(pattern).returning();
    return result[0];
  }

  async getEmotionalPatternsByUserId(userId: number): Promise<EmotionalPattern[]> {
    return await db.select().from(emotionalPatterns).where(eq(emotionalPatterns.userId, userId));
  }

  // Safety check-ins
  async createSafetyCheckIn(checkIn: InsertSafetyCheckIn): Promise<SafetyCheckIn> {
    const result = await db.insert(safetyCheckIns).values(checkIn).returning();
    return result[0];
  }

  async getSafetyCheckInsByUserId(userId: number): Promise<SafetyCheckIn[]> {
    return await db.select().from(safetyCheckIns).where(eq(safetyCheckIns.userId, userId));
  }

  // Crisis interventions
  async createCrisisIntervention(intervention: InsertCrisisIntervention): Promise<CrisisIntervention> {
    const result = await db.insert(crisisInterventions).values(intervention).returning();
    return result[0];
  }

  async getCrisisInterventionsByUserId(userId: number): Promise<CrisisIntervention[]> {
    return await db.select().from(crisisInterventions).where(eq(crisisInterventions.userId, userId));
  }

  // Journal entries
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const result = await db.insert(journalEntries).values(entry).returning();
    return result[0];
  }

  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.createdAt));
  }

  // Journal analytics
  async createJournalAnalytics(analytics: InsertJournalAnalytics): Promise<JournalAnalytics> {
    const result = await db.insert(journalAnalytics).values(analytics).returning();
    return result[0];
  }

  async getJournalAnalyticsByUserId(userId: number): Promise<JournalAnalytics[]> {
    return await db.select().from(journalAnalytics).where(eq(journalAnalytics.userId, userId));
  }

  // Journal exports
  async createJournalExport(exportData: InsertJournalExport): Promise<JournalExport> {
    const result = await db.insert(journalExports).values(exportData).returning();
    return result[0];
  }

  async getJournalExportsByUserId(userId: number): Promise<JournalExport[]> {
    return await db.select().from(journalExports).where(eq(journalExports.userId, userId));
  }

  // Therapists
  async createTherapist(therapist: InsertTherapist): Promise<Therapist> {
    const result = await db.insert(therapists).values(therapist).returning();
    return result[0];
  }

  async getTherapistsByUserId(userId: number): Promise<Therapist[]> {
    return await db.select().from(therapists).where(eq(therapists.userId, userId));
  }

  // Therapist sessions
  async createTherapistSession(session: InsertTherapistSession): Promise<TherapistSession> {
    const result = await db.insert(therapistSessions).values(session).returning();
    return result[0];
  }

  async getTherapistSessionsByUserId(userId: number): Promise<TherapistSession[]> {
    return await db.select().from(therapistSessions).where(eq(therapistSessions.userId, userId));
  }

  // Therapist shared insights
  async createTherapistSharedInsight(insight: InsertTherapistSharedInsight): Promise<TherapistSharedInsight> {
    const result = await db.insert(therapistSharedInsights).values(insight).returning();
    return result[0];
  }

  async getTherapistSharedInsightsByUserId(userId: number): Promise<TherapistSharedInsight[]> {
    return await db.select().from(therapistSharedInsights).where(eq(therapistSharedInsights.userId, userId));
  }

  // Collaboration settings
  async createCollaborationSettings(settings: InsertCollaborationSettings): Promise<CollaborationSettings> {
    const result = await db.insert(collaborationSettings).values(settings).returning();
    return result[0];
  }

  async getCollaborationSettingsByUserId(userId: number): Promise<CollaborationSettings | null> {
    const result = await db.select().from(collaborationSettings).where(eq(collaborationSettings.userId, userId));
    return result[0] || null;
  }

  // User achievements
  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const result = await db.insert(userAchievements).values(achievement).returning();
    return result[0];
  }

  async getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  // Wellness streaks
  async createWellnessStreak(streak: InsertWellnessStreak): Promise<WellnessStreak> {
    const result = await db.insert(wellnessStreaks).values(streak).returning();
    return result[0];
  }

  async getWellnessStreaksByUserId(userId: number): Promise<WellnessStreak[]> {
    return await db.select().from(wellnessStreaks).where(eq(wellnessStreaks.userId, userId));
  }

  // Daily activities
  async createDailyActivity(activity: InsertDailyActivity): Promise<DailyActivity> {
    const result = await db.insert(dailyActivities).values(activity).returning();
    return result[0];
  }

  async getDailyActivitiesByUserId(userId: number): Promise<DailyActivity[]> {
    return await db.select().from(dailyActivities).where(eq(dailyActivities.userId, userId));
  }

  // Support forums
  async createSupportForum(forum: InsertSupportForum): Promise<SupportForum> {
    const result = await db.insert(supportForums).values(forum).returning();
    return result[0];
  }

  async getAllSupportForums(): Promise<SupportForum[]> {
    return await db.select().from(supportForums);
  }

  // Forum posts
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const result = await db.insert(forumPosts).values(post).returning();
    return result[0];
  }

  async getForumPostsByForumId(forumId: number): Promise<ForumPost[]> {
    return await db.select().from(forumPosts).where(eq(forumPosts.forumId, forumId));
  }

  // Forum replies
  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const result = await db.insert(forumReplies).values(reply).returning();
    return result[0];
  }

  async getForumRepliesByPostId(postId: number): Promise<ForumReply[]> {
    return await db.select().from(forumReplies).where(eq(forumReplies.postId, postId));
  }

  // Peer check-ins
  async createPeerCheckIn(checkIn: InsertPeerCheckIn): Promise<PeerCheckIn> {
    const result = await db.insert(peerCheckIns).values(checkIn).returning();
    return result[0];
  }

  async getPeerCheckInsByUserId(userId: number): Promise<PeerCheckIn[]> {
    return await db.select().from(peerCheckIns);
  }

  // Peer sessions
  async createPeerSession(session: InsertPeerSession): Promise<PeerSession> {
    const result = await db.insert(peerSessions).values(session).returning();
    return result[0];
  }

  async getPeerSessionsByUserId(userId: number): Promise<PeerSession[]> {
    return await db.select().from(peerSessions);
  }

  // Community moderations
  async createCommunityModeration(moderation: InsertCommunityModeration): Promise<CommunityModeration> {
    const result = await db.insert(communityModerations).values(moderation).returning();
    return result[0];
  }

  async getCommunityModerationsByContentId(contentId: number): Promise<CommunityModeration[]> {
    return await db.select().from(communityModerations).where(eq(communityModerations.contentId, contentId));
  }

  // User preferences
  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const result = await db.insert(userPreferences).values(preferences).returning();
    return result[0];
  }

  async getUserPreferencesByUserId(userId: number): Promise<UserPreferences | null> {
    const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return result[0] || null;
  }

  async updateUserPreferences(userId: number, updates: Partial<UserPreferences>): Promise<UserPreferences | null> {
    const result = await db.update(userPreferences).set(updates).where(eq(userPreferences.userId, userId)).returning();
    return result[0] || null;
  }

  // Conversation patterns
  async createConversationPattern(pattern: InsertConversationPattern): Promise<ConversationPattern> {
    const result = await db.insert(conversationPatterns).values(pattern).returning();
    return result[0];
  }

  async getConversationPatternsByUserId(userId: number): Promise<ConversationPattern[]> {
    return await db.select().from(conversationPatterns).where(eq(conversationPatterns.userId, userId));
  }

  // Wellness recommendations
  async createWellnessRecommendation(recommendation: InsertWellnessRecommendation): Promise<WellnessRecommendation> {
    const result = await db.insert(wellnessRecommendations).values(recommendation).returning();
    return result[0];
  }

  async getWellnessRecommendationsByUserId(userId: number): Promise<WellnessRecommendation[]> {
    return await db.select().from(wellnessRecommendations).where(eq(wellnessRecommendations.userId, userId));
  }

  // Adaptation insights
  async createAdaptationInsight(insight: InsertAdaptationInsight): Promise<AdaptationInsight> {
    const result = await db.insert(adaptationInsights).values(insight).returning();
    return result[0];
  }

  async getAdaptationInsightsByUserId(userId: number): Promise<AdaptationInsight[]> {
    return await db.select().from(adaptationInsights).where(eq(adaptationInsights.userId, userId));
  }

  // User feedback
  async createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const result = await db.insert(userFeedback).values(feedback).returning();
    return result[0];
  }

  async getUserFeedbackByUserId(userId: number): Promise<UserFeedback[]> {
    return await db.select().from(userFeedback).where(eq(userFeedback.userId, userId));
  }

  // Monthly reports
  async createMonthlyReport(report: InsertMonthlyReport): Promise<MonthlyReport> {
    const result = await db.insert(monthlyReports).values(report).returning();
    return result[0];
  }

  async getMonthlyReportsByUserId(userId: number): Promise<MonthlyReport[]> {
    return await db.select().from(monthlyReports).where(eq(monthlyReports.userId, userId));
  }

  // Wearable devices
  async createWearableDevice(device: InsertWearableDevice): Promise<WearableDevice> {
    const result = await db.insert(wearableDevices).values(device).returning();
    return result[0];
  }

  async getWearableDevicesByUserId(userId: number): Promise<WearableDevice[]> {
    return await db.select().from(wearableDevices).where(eq(wearableDevices.userId, userId));
  }

  // Health metrics
  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const result = await db.insert(healthMetrics).values(metric).returning();
    return result[0];
  }

  async getHealthMetricsByUserId(userId: number): Promise<HealthMetric[]> {
    return await db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId));
  }

  // Health correlations
  async createHealthCorrelation(correlation: InsertHealthCorrelation): Promise<HealthCorrelation> {
    const result = await db.insert(healthCorrelations).values(correlation).returning();
    return result[0];
  }

  async getHealthCorrelationsByUserId(userId: number): Promise<HealthCorrelation[]> {
    return await db.select().from(healthCorrelations).where(eq(healthCorrelations.userId, userId));
  }

  // Sync logs
  async createSyncLog(log: InsertSyncLog): Promise<SyncLog> {
    const result = await db.insert(syncLogs).values(log).returning();
    return result[0];
  }

  async getSyncLogsByUserId(userId: number): Promise<SyncLog[]> {
    return await db.select().from(syncLogs).where(eq(syncLogs.userId, userId));
  }

  // VR environments
  async createVrEnvironment(environment: InsertVrEnvironment): Promise<VrEnvironment> {
    const result = await db.insert(vrEnvironments).values(environment).returning();
    return result[0];
  }

  async getAllVrEnvironments(): Promise<VrEnvironment[]> {
    return await db.select().from(vrEnvironments);
  }

  // VR sessions
  async createVrSession(session: InsertVrSession): Promise<VrSession> {
    const result = await db.insert(vrSessions).values(session).returning();
    return result[0];
  }

  async getVrSessionsByUserId(userId: number): Promise<VrSession[]> {
    return await db.select().from(vrSessions).where(eq(vrSessions.userId, userId));
  }

  // VR progress tracking
  async createVrProgressTracking(progress: InsertVrProgressTracking): Promise<VrProgressTracking> {
    const result = await db.insert(vrProgressTracking).values(progress).returning();
    return result[0];
  }

  async getVrProgressTrackingByUserId(userId: number): Promise<VrProgressTracking[]> {
    return await db.select().from(vrProgressTracking).where(eq(vrProgressTracking.userId, userId));
  }

  // VR therapeutic plans
  async createVrTherapeuticPlan(plan: InsertVrTherapeuticPlan): Promise<VrTherapeuticPlan> {
    const result = await db.insert(vrTherapeuticPlans).values(plan).returning();
    return result[0];
  }

  async getVrTherapeuticPlansByUserId(userId: number): Promise<VrTherapeuticPlan[]> {
    return await db.select().from(vrTherapeuticPlans).where(eq(vrTherapeuticPlans.userId, userId));
  }

  // VR accessibility profiles
  async createVrAccessibilityProfile(profile: InsertVrAccessibilityProfile): Promise<VrAccessibilityProfile> {
    const result = await db.insert(vrAccessibilityProfiles).values(profile).returning();
    return result[0];
  }

  async getVrAccessibilityProfilesByUserId(userId: number): Promise<VrAccessibilityProfile[]> {
    return await db.select().from(vrAccessibilityProfiles).where(eq(vrAccessibilityProfiles.userId, userId));
  }

  // User wellness points
  async createUserWellnessPoints(points: InsertUserWellnessPoints): Promise<UserWellnessPoints> {
    const result = await db.insert(userWellnessPoints).values(points).returning();
    return result[0];
  }

  async getUserWellnessPointsByUserId(userId: number): Promise<UserWellnessPoints | null> {
    const result = await db.select().from(userWellnessPoints).where(eq(userWellnessPoints.userId, userId));
    return result[0] || null;
  }

  async updateUserWellnessPoints(userId: number, updates: Partial<UserWellnessPoints>): Promise<UserWellnessPoints | null> {
    const result = await db.update(userWellnessPoints).set(updates).where(eq(userWellnessPoints.userId, userId)).returning();
    return result[0] || null;
  }

  // Rewards shop
  async createRewardsShopItem(item: InsertRewardsShop): Promise<RewardsShop> {
    const result = await db.insert(rewardsShop).values(item).returning();
    return result[0];
  }

  async getAllRewardsShopItems(): Promise<RewardsShop[]> {
    return await db.select().from(rewardsShop);
  }

  // User rewards
  async createUserReward(reward: InsertUserRewards): Promise<UserRewards> {
    const result = await db.insert(userRewards).values(reward).returning();
    return result[0];
  }

  async getUserRewardsByUserId(userId: number): Promise<UserRewards[]> {
    return await db.select().from(userRewards).where(eq(userRewards.userId, userId));
  }

  // Community challenges
  async createCommunityChallenge(challenge: InsertCommunityChallenge): Promise<CommunityChallenge> {
    const result = await db.insert(communityChallengess).values(challenge).returning();
    return result[0];
  }

  async getAllCommunityChallenges(): Promise<CommunityChallenge[]> {
    return await db.select().from(communityChallengess);
  }

  // Challenge participants
  async createChallengeParticipant(participant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const result = await db.insert(challengeParticipants).values(participant).returning();
    return result[0];
  }

  async getChallengeParticipantsByUserId(userId: number): Promise<ChallengeParticipant[]> {
    return await db.select().from(challengeParticipants).where(eq(challengeParticipants.userId, userId));
  }

  // Challenge activities
  async createChallengeActivity(activity: InsertChallengeActivity): Promise<ChallengeActivity> {
    const result = await db.insert(challengeActivities).values(activity).returning();
    return result[0];
  }

  async getChallengeActivitiesByUserId(userId: number): Promise<ChallengeActivity[]> {
    return await db.select().from(challengeActivities).where(eq(challengeActivities.userId, userId));
  }

  // Emotional achievements
  async createEmotionalAchievement(achievement: InsertEmotionalAchievement): Promise<EmotionalAchievement> {
    const result = await db.insert(emotionalAchievements).values(achievement).returning();
    return result[0];
  }

  async getAllEmotionalAchievements(): Promise<EmotionalAchievement[]> {
    return await db.select().from(emotionalAchievements);
  }

  // User emotional achievements
  async createUserEmotionalAchievement(achievement: InsertUserEmotionalAchievement): Promise<UserEmotionalAchievement> {
    const result = await db.insert(userEmotionalAchievements).values(achievement).returning();
    return result[0];
  }

  async getUserEmotionalAchievementsByUserId(userId: number): Promise<UserEmotionalAchievement[]> {
    return await db.select().from(userEmotionalAchievements).where(eq(userEmotionalAchievements.userId, userId));
  }

  // Points history
  async createPointsHistory(history: InsertPointsHistory): Promise<PointsHistory> {
    const result = await db.insert(pointsHistory).values(history).returning();
    return result[0];
  }

  async getPointsHistoryByUserId(userId: number): Promise<PointsHistory[]> {
    return await db.select().from(pointsHistory).where(eq(pointsHistory.userId, userId));
  }

  // Mood forecasts
  async createMoodForecast(forecast: InsertMoodForecast): Promise<MoodForecast> {
    const result = await db.insert(moodForecasts).values(forecast).returning();
    return result[0];
  }

  async getMoodForecastsByUserId(userId: number): Promise<MoodForecast[]> {
    return await db.select().from(moodForecasts).where(eq(moodForecasts.userId, userId));
  }

  // Emotional contexts
  async createEmotionalContext(context: InsertEmotionalContext): Promise<EmotionalContext> {
    const result = await db.insert(emotionalContexts).values(context).returning();
    return result[0];
  }

  async getEmotionalContextsByUserId(userId: number): Promise<EmotionalContext[]> {
    return await db.select().from(emotionalContexts).where(eq(emotionalContexts.userId, userId));
  }

  // Predictive insights
  async createPredictiveInsight(insight: InsertPredictiveInsight): Promise<PredictiveInsight> {
    const result = await db.insert(predictiveInsights).values(insight).returning();
    return result[0];
  }

  async getPredictiveInsightsByUserId(userId: number): Promise<PredictiveInsight[]> {
    return await db.select().from(predictiveInsights).where(eq(predictiveInsights.userId, userId));
  }

  // Emotional response adaptations
  async createEmotionalResponseAdaptation(adaptation: InsertEmotionalResponseAdaptation): Promise<EmotionalResponseAdaptation> {
    const result = await db.insert(emotionalResponseAdaptations).values(adaptation).returning();
    return result[0];
  }

  async getEmotionalResponseAdaptationsByUserId(userId: number): Promise<EmotionalResponseAdaptation[]> {
    return await db.select().from(emotionalResponseAdaptations).where(eq(emotionalResponseAdaptations.userId, userId));
  }

  // AI Performance monitoring
  async createAiPerformanceMetric(metric: InsertAiPerformanceMetric): Promise<AiPerformanceMetric> {
    const result = await db.insert(aiPerformanceMetrics).values(metric).returning();
    return result[0];
  }

  async getAiPerformanceMetrics(): Promise<AiPerformanceMetric[]> {
    return await db.select().from(aiPerformanceMetrics);
  }

  async getAiPerformanceMetricsByType(metricType: string): Promise<AiPerformanceMetric[]> {
    return await db.select().from(aiPerformanceMetrics).where(eq(aiPerformanceMetrics.metricType, metricType));
  }

  // AI Response analysis
  async createAiResponseAnalysis(analysis: InsertAiResponseAnalysis): Promise<AiResponseAnalysis> {
    const result = await db.insert(aiResponseAnalysis).values(analysis).returning();
    return result[0];
  }

  async getAiResponseAnalysis(): Promise<AiResponseAnalysis[]> {
    return await db.select().from(aiResponseAnalysis);
  }

  async getFlaggedResponses(): Promise<AiResponseAnalysis[]> {
    return await db.select().from(aiResponseAnalysis).where(eq(aiResponseAnalysis.flaggedForReview, true));
  }

  // Crisis detection logs
  async createCrisisDetectionLog(log: InsertCrisisDetectionLog): Promise<CrisisDetectionLog> {
    const result = await db.insert(crisisDetectionLogs).values(log).returning();
    return result[0];
  }

  async getCrisisDetectionLogs(): Promise<CrisisDetectionLog[]> {
    return await db.select().from(crisisDetectionLogs).orderBy(desc(crisisDetectionLogs.createdAt));
  }

  async getCrisisDetectionLogsByUserId(userId: number): Promise<CrisisDetectionLog[]> {
    return await db.select().from(crisisDetectionLogs).where(eq(crisisDetectionLogs.userId, userId));
  }

  // Therapeutic effectiveness tracking
  async createTherapeuticEffectivenessTracking(tracking: InsertTherapeuticEffectivenessTracking): Promise<TherapeuticEffectivenessTracking> {
    const result = await db.insert(therapeuticEffectivenessTracking).values(tracking).returning();
    return result[0];
  }

  async getTherapeuticEffectivenessTracking(): Promise<TherapeuticEffectivenessTracking[]> {
    return await db.select().from(therapeuticEffectivenessTracking).orderBy(desc(therapeuticEffectivenessTracking.createdAt));
  }

  async getTherapeuticEffectivenessTrackingByUserId(userId: number): Promise<TherapeuticEffectivenessTracking[]> {
    return await db.select().from(therapeuticEffectivenessTracking).where(eq(therapeuticEffectivenessTracking.userId, userId));
  }

  // System performance dashboard
  async createSystemPerformanceDashboard(dashboard: InsertSystemPerformanceDashboard): Promise<SystemPerformanceDashboard> {
    const result = await db.insert(systemPerformanceDashboard).values(dashboard).returning();
    return result[0];
  }

  async getSystemPerformanceDashboard(): Promise<SystemPerformanceDashboard[]> {
    return await db.select().from(systemPerformanceDashboard).orderBy(desc(systemPerformanceDashboard.lastUpdated));
  }

  async getSystemPerformanceDashboardByMetric(metricName: string): Promise<SystemPerformanceDashboard[]> {
    return await db.select().from(systemPerformanceDashboard).where(eq(systemPerformanceDashboard.metricName, metricName));
  }

  // Additional helper methods for API compatibility  
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return this.getJournalEntriesByUserId(userId);
  }

  async getJournalAnalytics(userId: number): Promise<JournalAnalytics[]> {
    return this.getJournalAnalyticsByUserId(userId);
  }

  async getJournalEntry(entryId: number): Promise<JournalEntry | null> {
    const result = await db.select().from(journalEntries).where(eq(journalEntries.id, entryId));
    return result[0] || null;
  }

  async updateJournalEntry(entryId: number, updates: Partial<JournalEntry>): Promise<JournalEntry | null> {
    const result = await db.update(journalEntries).set(updates).where(eq(journalEntries.id, entryId)).returning();
    return result[0] || null;
  }

  async deleteJournalEntry(entryId: number): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, entryId)).returning();
    return result.length > 0;
  }

  async getJournalAnalyticsByUser(userId: number): Promise<JournalAnalytics[]> {
    return await db.select().from(journalAnalytics).where(eq(journalAnalytics.userId, userId));
  }

  async updateJournalExport(exportId: number, updates: Partial<JournalExport>): Promise<JournalExport | null> {
    const result = await db.update(journalExports).set(updates).where(eq(journalExports.id, exportId)).returning();
    return result[0] || null;
  }

  async getTherapistsByUser(userId: number): Promise<Therapist[]> {
    return this.getTherapistsByUserId(userId);
  }

  async getTherapistSessionsByUser(userId: number): Promise<TherapistSession[]> {
    return this.getTherapistSessionsByUserId(userId);
  }

  async getTherapistSharedInsightsByUser(userId: number): Promise<TherapistSharedInsight[]> {
    return this.getTherapistSharedInsightsByUserId(userId);
  }

  async getCollaborationSettings(userId: number): Promise<CollaborationSettings | null> {
    return this.getCollaborationSettingsByUserId(userId);
  }

  async updateCollaborationSettings(userId: number, updates: Partial<CollaborationSettings>): Promise<CollaborationSettings | null> {
    const result = await db.update(collaborationSettings).set(updates).where(eq(collaborationSettings.userId, userId)).returning();
    return result[0] || null;
  }

  async updateTherapistSession(sessionId: number, updates: Partial<TherapistSession>): Promise<TherapistSession | null> {
    const result = await db.update(therapistSessions).set(updates).where(eq(therapistSessions.id, sessionId)).returning();
    return result[0] || null;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | null> {
    return this.getUserPreferencesByUserId(userId);
  }

  async getConversationPatterns(userId: number): Promise<ConversationPattern[]> {
    return this.getConversationPatternsByUserId(userId);
  }

  async getLatestAdaptationInsights(userId: number): Promise<AdaptationInsight[]> {
    return this.getAdaptationInsightsByUserId(userId);
  }

  async getWellnessRecommendations(userId: number): Promise<WellnessRecommendation[]> {
    return this.getWellnessRecommendationsByUserId(userId);
  }

  async markRecommendationUsed(recommendationId: number): Promise<void> {
    // Implementation for marking recommendation as used
  }

  async rateRecommendation(recommendationId: number, rating: number): Promise<void> {
    // Implementation for rating recommendation
  }

  async clearUserMemories(userId: number): Promise<void> {
    await db.delete(userMemories).where(eq(userMemories.userId, userId));
  }

  async clearUserFacts(userId: number): Promise<void> {
    await db.delete(userFacts).where(eq(userFacts.userId, userId));
  }

  async resetBotStats(userId: number): Promise<void> {
    await db.update(bots).set({ level: 1, wordsLearned: 0 }).where(eq(bots.userId, userId));
  }

  async getMonthlyReport(userId: number, month: string, year: string): Promise<MonthlyReport | null> {
    const reportMonth = `${year}-${month}`;
    const result = await db.select().from(monthlyReports).where(and(eq(monthlyReports.userId, userId), eq(monthlyReports.reportMonth, reportMonth)));
    return result[0] || null;
  }

  async saveMonthlyReport(report: MonthlyReport): Promise<MonthlyReport> {
    const result = await db.insert(monthlyReports).values(report).returning();
    return result[0];
  }

  async getMonthlyReportById(reportId: number): Promise<MonthlyReport | null> {
    const result = await db.select().from(monthlyReports).where(eq(monthlyReports.id, reportId));
    return result[0] || null;
  }

  async getSafetyCheckIns(userId: number): Promise<SafetyCheckIn[]> {
    return this.getSafetyCheckInsByUserId(userId);
  }

  async getPendingCheckIns(userId: number): Promise<SafetyCheckIn[]> {
    const allCheckIns = await this.getSafetyCheckInsByUserId(userId);
    return allCheckIns.filter(checkIn => !checkIn.followUpScheduled);
  }

  async updateSafetyCheckIn(checkInId: number, updates: Partial<SafetyCheckIn>): Promise<SafetyCheckIn | null> {
    const result = await db.update(safetyCheckIns).set(updates).where(eq(safetyCheckIns.id, checkInId)).returning();
    return result[0] || null;
  }

  async getPointsHistory(userId: number): Promise<PointsHistory[]> {
    return await db.select().from(pointsHistory).where(eq(pointsHistory.userId, userId));
  }

  async getUserRewards(userId: number): Promise<UserRewards[]> {
    return await db.select().from(userRewards).where(eq(userRewards.userId, userId));
  }

  async getChallengeParticipant(userId: number, challengeId: number): Promise<ChallengeParticipant | null> {
    const result = await db.select().from(challengeParticipants).where(and(eq(challengeParticipants.userId, userId), eq(challengeParticipants.challengeId, challengeId)));
    return result[0] || null;
  }

  async getChallengeActivities(userId: number): Promise<ChallengeActivity[]> {
    return await db.select().from(challengeActivities).where(eq(challengeActivities.userId, userId));
  }

  async getEmotionalAchievements(): Promise<EmotionalAchievement[]> {
    return await db.select().from(emotionalAchievements);
  }

  async markEmotionalAchievementViewed(achievementId: number): Promise<void> {
    // Implementation for marking achievement as viewed
  }

  async getWearableDevices(userId: number): Promise<WearableDevice[]> {
    return await db.select().from(wearableDevices).where(eq(wearableDevices.userId, userId));
  }

  async updateWearableDevice(deviceId: number, updates: Partial<WearableDevice>): Promise<WearableDevice | null> {
    const result = await db.update(wearableDevices).set(updates).where(eq(wearableDevices.id, deviceId)).returning();
    return result[0] || null;
  }

  async deleteWearableDevice(deviceId: number): Promise<boolean> {
    const result = await db.delete(wearableDevices).where(eq(wearableDevices.id, deviceId)).returning();
    return result.length > 0;
  }

  async getHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return await db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId));
  }

  async getHealthCorrelations(userId: number): Promise<HealthCorrelation[]> {
    return await db.select().from(healthCorrelations).where(eq(healthCorrelations.userId, userId));
  }

  async getRecentSyncLogs(userId: number): Promise<SyncLog[]> {
    return await db.select().from(syncLogs).where(eq(syncLogs.userId, userId)).orderBy(desc(syncLogs.createdAt));
  }

  async getVrEnvironments(): Promise<VrEnvironment[]> {
    return await db.select().from(vrEnvironments);
  }

  async getVrEnvironment(environmentId: number): Promise<VrEnvironment | null> {
    const result = await db.select().from(vrEnvironments).where(eq(vrEnvironments.id, environmentId));
    return result[0] || null;
  }

  async getUserVrSessions(userId: number): Promise<VrSession[]> {
    return await db.select().from(vrSessions).where(eq(vrSessions.userId, userId));
  }

  async updateVrSession(sessionId: number, updates: Partial<VrSession>): Promise<VrSession | null> {
    const result = await db.update(vrSessions).set(updates).where(eq(vrSessions.id, sessionId)).returning();
    return result[0] || null;
  }

  async getVrProgress(userId: number, environmentId: number): Promise<VrProgressTracking | null> {
    const result = await db.select().from(vrProgressTracking).where(and(eq(vrProgressTracking.userId, userId), eq(vrProgressTracking.environmentId, environmentId)));
    return result[0] || null;
  }

  async updateVrProgress(progressId: number, updates: Partial<VrProgressTracking>): Promise<VrProgressTracking | null> {
    const result = await db.update(vrProgressTracking).set(updates).where(eq(vrProgressTracking.id, progressId)).returning();
    return result[0] || null;
  }

  async createVrProgress(progress: InsertVrProgressTracking): Promise<VrProgressTracking> {
    const result = await db.insert(vrProgressTracking).values(progress).returning();
    return result[0];
  }

  async getUserVrProgress(userId: number): Promise<VrProgressTracking[]> {
    return await db.select().from(vrProgressTracking).where(eq(vrProgressTracking.userId, userId));
  }

  async getUserVrTherapeuticPlans(userId: number): Promise<VrTherapeuticPlan[]> {
    return await db.select().from(vrTherapeuticPlans).where(eq(vrTherapeuticPlans.userId, userId));
  }

  async updateVrTherapeuticPlan(planId: number, updates: Partial<VrTherapeuticPlan>): Promise<VrTherapeuticPlan | null> {
    const result = await db.update(vrTherapeuticPlans).set(updates).where(eq(vrTherapeuticPlans.id, planId)).returning();
    return result[0] || null;
  }

  async getUserVrAccessibilityProfile(userId: number): Promise<VrAccessibilityProfile | null> {
    const result = await db.select().from(vrAccessibilityProfiles).where(eq(vrAccessibilityProfiles.userId, userId));
    return result[0] || null;
  }

  async updateVrAccessibilityProfile(profileId: number, updates: Partial<VrAccessibilityProfile>): Promise<VrAccessibilityProfile | null> {
    const result = await db.update(vrAccessibilityProfiles).set(updates).where(eq(vrAccessibilityProfiles.id, profileId)).returning();
    return result[0] || null;
  }

  async getMoodForecasts(userId: number): Promise<MoodForecast[]> {
    return await db.select().from(moodForecasts).where(eq(moodForecasts.userId, userId));
  }

  async getEmotionalContexts(userId: number): Promise<EmotionalContext[]> {
    return await db.select().from(emotionalContexts).where(eq(emotionalContexts.userId, userId));
  }

  async getPredictiveInsights(userId: number): Promise<PredictiveInsight[]> {
    return await db.select().from(predictiveInsights).where(eq(predictiveInsights.userId, userId));
  }

  async updatePredictiveInsight(insightId: number, updates: Partial<PredictiveInsight>): Promise<PredictiveInsight | null> {
    const result = await db.update(predictiveInsights).set(updates).where(eq(predictiveInsights.id, insightId)).returning();
    return result[0] || null;
  }

  async getEmotionalResponseAdaptations(userId: number): Promise<EmotionalResponseAdaptation[]> {
    return await db.select().from(emotionalResponseAdaptations).where(eq(emotionalResponseAdaptations.userId, userId));
  }

  async updateEmotionalResponseAdaptation(adaptationId: number, updates: Partial<EmotionalResponseAdaptation>): Promise<EmotionalResponseAdaptation | null> {
    const result = await db.update(emotionalResponseAdaptations).set(updates).where(eq(emotionalResponseAdaptations.id, adaptationId)).returning();
    return result[0] || null;
  }

  async getEmotionalPattern(userId: number): Promise<EmotionalPattern | null> {
    const patterns = await this.getEmotionalPatternsByUserId(userId);
    return patterns[0] || null;
  }

}

export const storage = new DatabaseStorage();