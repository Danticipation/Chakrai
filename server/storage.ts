import { db } from "./db";
import { 
  users, bots, messages, learnedWords, milestones, userMemories, userFacts,
  journalEntries, moodEntries, therapeuticGoals, supportForums, forumPosts,
  userAchievements, wellnessStreaks, emotionalPatterns,
  moodForecasts, emotionalContexts, predictiveInsights, emotionalResponseAdaptations, crisisDetectionLogs,
  monthlyWellnessReports, analyticsMetrics, progressTracking, riskAssessments, longitudinalTrends,
  type User, type InsertUser,
  type Bot, type InsertBot,
  type Message, type InsertMessage,
  type LearnedWord, type InsertLearnedWord,
  type Milestone, type InsertMilestone,
  type UserMemory, type InsertUserMemory,
  type UserFact, type InsertUserFact,
  type JournalEntry, type InsertJournalEntry,
  type MoodEntry, type InsertMoodEntry,
  type TherapeuticGoal, type InsertTherapeuticGoal,
  type SupportForum, type InsertSupportForum,
  type ForumPost, type InsertForumPost,
  type UserAchievement, type InsertUserAchievement,
  type WellnessStreak, type InsertWellnessStreak,
  type EmotionalPattern, type InsertEmotionalPattern,
  type MoodForecast, type InsertMoodForecast,
  type EmotionalContext, type InsertEmotionalContext,
  type PredictiveInsight, type InsertPredictiveInsight,
  type EmotionalResponseAdaptation, type InsertEmotionalResponseAdaptation,
  type CrisisDetectionLog, type InsertCrisisDetectionLog,
  type MonthlyWellnessReport, type InsertMonthlyWellnessReport,
  type AnalyticsMetric, type InsertAnalyticsMetric,
  type ProgressTracking, type InsertProgressTracking,
  type RiskAssessment, type InsertRiskAssessment,
  type LongitudinalTrend, type InsertLongitudinalTrend,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  createUser(data: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  
  // Bots
  getBotByUserId(userId: number): Promise<Bot | null>;
  createBot(data: InsertBot): Promise<Bot>;
  updateBot(id: number, data: Partial<InsertBot>): Promise<Bot>;
  
  // Messages
  getMessagesByUserId(userId: number): Promise<Message[]>;
  createMessage(data: InsertMessage): Promise<Message>;
  
  // Learned Words
  getLearnedWordsByUserId(userId: number): Promise<LearnedWord[]>;
  createLearnedWord(data: InsertLearnedWord): Promise<LearnedWord>;
  
  // Milestones
  getMilestonesByUserId(userId: number): Promise<Milestone[]>;
  createMilestone(data: InsertMilestone): Promise<Milestone>;
  
  // User memories and facts
  getUserMemoriesByUserId(userId: number): Promise<UserMemory[]>;
  createUserMemory(data: InsertUserMemory): Promise<UserMemory>;
  getUserFactsByUserId(userId: number): Promise<UserFact[]>;
  createUserFact(data: InsertUserFact): Promise<UserFact>;
  
  // Personality mirroring methods
  getUserMemories(userId: number): Promise<UserMemory[]>;
  getUserFacts(userId: number): Promise<UserFact[]>;
  
  // Journal Entries
  createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  
  // Mood Entries
  createMoodEntry(data: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntries(userId: number): Promise<MoodEntry[]>;
  
  // Therapeutic Goals
  createTherapeuticGoal(data: InsertTherapeuticGoal): Promise<TherapeuticGoal>;
  getTherapeuticGoals(userId: number): Promise<TherapeuticGoal[]>;
  updateGoalProgress(goalId: number, currentValue: number): Promise<TherapeuticGoal>;
  
  // Community
  getSupportForums(): Promise<SupportForum[]>;
  getForumPosts(forumId: number): Promise<ForumPost[]>;
  createForumPost(data: InsertForumPost): Promise<ForumPost>;
  
  // Analytics
  calculateWellnessScore(userId: number): Promise<number>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getWellnessStreaks(userId: number): Promise<WellnessStreak[]>;
  createUserAchievement(data: InsertUserAchievement): Promise<UserAchievement>;
  updateWellnessStreak(userId: number, streakType: string): Promise<WellnessStreak>;
  
  // Advanced Emotional Intelligence
  createEmotionalContext(data: InsertEmotionalContext): Promise<EmotionalContext>;
  createMoodForecast(data: InsertMoodForecast): Promise<MoodForecast>;
  createPredictiveInsight(data: InsertPredictiveInsight): Promise<PredictiveInsight>;
  createEmotionalResponseAdaptation(data: InsertEmotionalResponseAdaptation): Promise<EmotionalResponseAdaptation>;
  createCrisisDetectionLog(data: InsertCrisisDetectionLog): Promise<CrisisDetectionLog>;
  getMoodForecasts(userId: number, limit?: number): Promise<MoodForecast[]>;
  getPredictiveInsights(userId: number, limit?: number): Promise<PredictiveInsight[]>;
  getEmotionalResponseAdaptations(userId: number, limit?: number): Promise<EmotionalResponseAdaptation[]>;
  getCrisisDetectionLogs(userId: number, limit?: number): Promise<CrisisDetectionLog[]>;
  getEmotionalContexts(userId: number, limit?: number): Promise<EmotionalContext[]>;
  
  // Comprehensive Analytics & Reporting
  createMonthlyWellnessReport(data: InsertMonthlyWellnessReport): Promise<MonthlyWellnessReport>;
  getMonthlyWellnessReports(userId: number, limit?: number): Promise<MonthlyWellnessReport[]>;
  getMonthlyWellnessReport(userId: number, reportMonth: string): Promise<MonthlyWellnessReport | null>;
  
  createAnalyticsMetric(data: InsertAnalyticsMetric): Promise<AnalyticsMetric>;
  getAnalyticsMetrics(userId: number, metricType?: string, limit?: number): Promise<AnalyticsMetric[]>;
  
  createProgressTracking(data: InsertProgressTracking): Promise<ProgressTracking>;
  getProgressTracking(userId: number, period?: string, limit?: number): Promise<ProgressTracking[]>;
  
  createRiskAssessment(data: InsertRiskAssessment): Promise<RiskAssessment>;
  getRiskAssessments(userId: number, limit?: number): Promise<RiskAssessment[]>;
  getLatestRiskAssessment(userId: number): Promise<RiskAssessment | null>;
  
  createLongitudinalTrend(data: InsertLongitudinalTrend): Promise<LongitudinalTrend>;
  getLongitudinalTrends(userId: number, trendType?: string, timeframe?: string): Promise<LongitudinalTrend[]>;
  
  // Analytics calculation methods
  calculateUserWellnessMetrics(userId: number): Promise<any>;
  calculateEmotionalVolatility(userId: number, days?: number): Promise<number>;
  calculateTherapeuticEngagement(userId: number, days?: number): Promise<number>;
  generateWellnessInsights(userId: number): Promise<string>;
}

export class DbStorage implements IStorage {
  private db: typeof db;
  
  constructor() {
    this.db = db;
  }

  // Users
  async createUser(data: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [user] = await this.db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  // Bots
  async getBotByUserId(userId: number): Promise<Bot | null> {
    const [bot] = await this.db.select().from(bots).where(eq(bots.userId, userId));
    return bot || null;
  }

  async createBot(data: InsertBot): Promise<Bot> {
    const [bot] = await this.db.insert(bots).values(data).returning();
    return bot;
  }

  async updateBot(id: number, data: Partial<InsertBot>): Promise<Bot> {
    const [bot] = await this.db.update(bots).set(data).where(eq(bots.id, id)).returning();
    return bot;
  }

  // Messages
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return await this.db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.timestamp));
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await this.db.insert(messages).values(data).returning();
    return message;
  }

  // Learned Words
  async getLearnedWordsByUserId(userId: number): Promise<LearnedWord[]> {
    return await this.db.select().from(learnedWords).where(eq(learnedWords.userId, userId));
  }

  async createLearnedWord(data: InsertLearnedWord): Promise<LearnedWord> {
    const [word] = await this.db.insert(learnedWords).values(data).returning();
    return word;
  }

  // Milestones
  async getMilestonesByUserId(userId: number): Promise<Milestone[]> {
    return await this.db.select().from(milestones).where(eq(milestones.userId, userId));
  }

  async createMilestone(data: InsertMilestone): Promise<Milestone> {
    const [milestone] = await this.db.insert(milestones).values(data).returning();
    return milestone;
  }

  // User memories and facts
  async getUserMemoriesByUserId(userId: number): Promise<UserMemory[]> {
    return await this.db.select().from(userMemories).where(eq(userMemories.userId, userId)).orderBy(desc(userMemories.createdAt));
  }

  async createUserMemory(data: InsertUserMemory): Promise<UserMemory> {
    const [memory] = await this.db.insert(userMemories).values(data).returning();
    return memory;
  }

  async getUserFactsByUserId(userId: number): Promise<UserFact[]> {
    return await this.db.select().from(userFacts).where(eq(userFacts.userId, userId)).orderBy(desc(userFacts.createdAt));
  }

  async createUserFact(data: InsertUserFact): Promise<UserFact> {
    const [fact] = await this.db.insert(userFacts).values(data).returning();
    return fact;
  }
  
  // Journal Entries
  async createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await this.db.insert(journalEntries).values(data).returning();
    return entry;
  }
  
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await this.db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.createdAt));
  }
  
  // Mood Entries
  async createMoodEntry(data: InsertMoodEntry): Promise<MoodEntry> {
    const [entry] = await this.db.insert(moodEntries).values(data).returning();
    return entry;
  }
  
  async getMoodEntries(userId: number): Promise<MoodEntry[]> {
    return await this.db.select().from(moodEntries).where(eq(moodEntries.userId, userId)).orderBy(desc(moodEntries.createdAt));
  }
  
  // Therapeutic Goals
  async createTherapeuticGoal(data: InsertTherapeuticGoal): Promise<TherapeuticGoal> {
    const [goal] = await this.db.insert(therapeuticGoals).values(data).returning();
    return goal;
  }
  
  async getTherapeuticGoals(userId: number): Promise<TherapeuticGoal[]> {
    return await this.db.select().from(therapeuticGoals).where(eq(therapeuticGoals.userId, userId)).orderBy(desc(therapeuticGoals.createdAt));
  }
  
  async updateGoalProgress(goalId: number, currentValue: number): Promise<TherapeuticGoal> {
    const [goal] = await this.db.update(therapeuticGoals)
      .set({ currentValue })
      .where(eq(therapeuticGoals.id, goalId))
      .returning();
    return goal;
  }
  
  // Community
  async getSupportForums(): Promise<SupportForum[]> {
    return await this.db.select().from(supportForums).where(eq(supportForums.isActive, true));
  }
  
  async getForumPosts(forumId: number): Promise<ForumPost[]> {
    return await this.db.select().from(forumPosts).where(eq(forumPosts.forumId, forumId)).orderBy(desc(forumPosts.createdAt));
  }
  
  async createForumPost(data: InsertForumPost): Promise<ForumPost> {
    const [post] = await this.db.insert(forumPosts).values(data).returning();
    return post;
  }
  
  // Analytics
  async calculateWellnessScore(userId: number): Promise<number> {
    // Calculate based on recent activity
    const recentMoods = await this.db.select().from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt))
      .limit(10);
    
    if (recentMoods.length === 0) return 50; // Default neutral score
    
    const avgMood = recentMoods.reduce((sum, entry) => sum + entry.intensity, 0) / recentMoods.length;
    return Math.round((avgMood / 10) * 100); // Convert to percentage
  }
  
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await this.db.select().from(userAchievements).where(eq(userAchievements.userId, userId)).orderBy(desc(userAchievements.unlockedAt));
  }
  
  async getWellnessStreaks(userId: number): Promise<WellnessStreak[]> {
    return await this.db.select().from(wellnessStreaks).where(eq(wellnessStreaks.userId, userId));
  }

  async createUserAchievement(data: InsertUserAchievement): Promise<UserAchievement> {
    const [achievement] = await this.db.insert(userAchievements).values(data).returning();
    return achievement;
  }

  async updateWellnessStreak(userId: number, streakType: string): Promise<WellnessStreak> {
    const [existing] = await this.db.select().from(wellnessStreaks)
      .where(and(eq(wellnessStreaks.userId, userId), eq(wellnessStreaks.streakType, streakType)));
    
    if (existing) {
      const currentStreak = existing.currentStreak || 0;
      const longestStreak = existing.longestStreak || 0;
      const [updated] = await this.db.update(wellnessStreaks)
        .set({ 
          currentStreak: currentStreak + 1,
          longestStreak: Math.max(longestStreak, currentStreak + 1),
          lastActiveDate: new Date()
        })
        .where(eq(wellnessStreaks.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await this.db.insert(wellnessStreaks).values({
        userId,
        streakType,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date()
      }).returning();
      return created;
    }
  }

  // Advanced Emotional Intelligence Storage Methods
  
  async createEmotionalContext(data: InsertEmotionalContext): Promise<EmotionalContext> {
    const [created] = await this.db.insert(emotionalContexts).values(data).returning();
    return created;
  }

  async createMoodForecast(data: InsertMoodForecast): Promise<MoodForecast> {
    const [created] = await this.db.insert(moodForecasts).values(data).returning();
    return created;
  }

  async createPredictiveInsight(data: InsertPredictiveInsight): Promise<PredictiveInsight> {
    const [created] = await this.db.insert(predictiveInsights).values(data).returning();
    return created;
  }

  async createEmotionalResponseAdaptation(data: InsertEmotionalResponseAdaptation): Promise<EmotionalResponseAdaptation> {
    const [created] = await this.db.insert(emotionalResponseAdaptations).values(data).returning();
    return created;
  }

  async createCrisisDetectionLog(data: InsertCrisisDetectionLog): Promise<CrisisDetectionLog> {
    const [created] = await this.db.insert(crisisDetectionLogs).values(data).returning();
    return created;
  }

  async getMoodForecasts(userId: number, limit: number = 10): Promise<MoodForecast[]> {
    return await this.db.select().from(moodForecasts)
      .where(eq(moodForecasts.userId, userId))
      .orderBy(desc(moodForecasts.createdAt))
      .limit(limit);
  }

  async getPredictiveInsights(userId: number, limit: number = 10): Promise<PredictiveInsight[]> {
    return await this.db.select().from(predictiveInsights)
      .where(eq(predictiveInsights.userId, userId))
      .orderBy(desc(predictiveInsights.createdAt))
      .limit(limit);
  }

  async getEmotionalResponseAdaptations(userId: number, limit: number = 10): Promise<EmotionalResponseAdaptation[]> {
    return await this.db.select().from(emotionalResponseAdaptations)
      .where(eq(emotionalResponseAdaptations.userId, userId))
      .orderBy(desc(emotionalResponseAdaptations.createdAt))
      .limit(limit);
  }

  async getCrisisDetectionLogs(userId: number, limit: number = 10): Promise<CrisisDetectionLog[]> {
    return await this.db.select().from(crisisDetectionLogs)
      .where(eq(crisisDetectionLogs.userId, userId))
      .orderBy(desc(crisisDetectionLogs.createdAt))
      .limit(limit);
  }

  async getEmotionalContexts(userId: number, limit: number = 20): Promise<EmotionalContext[]> {
    return await this.db.select().from(emotionalContexts)
      .where(eq(emotionalContexts.userId, userId))
      .orderBy(desc(emotionalContexts.createdAt))
      .limit(limit);
  }

  // Personality mirroring implementation
  async getUserMemories(userId: number): Promise<UserMemory[]> {
    return await this.db.select().from(userMemories)
      .where(eq(userMemories.userId, userId))
      .orderBy(desc(userMemories.createdAt));
  }

  async getUserFacts(userId: number): Promise<UserFact[]> {
    return await this.db.select().from(userFacts)
      .where(eq(userFacts.userId, userId))
      .orderBy(desc(userFacts.createdAt));
  }

  // Comprehensive Analytics & Reporting Implementation
  async createMonthlyWellnessReport(data: InsertMonthlyWellnessReport): Promise<MonthlyWellnessReport> {
    const [report] = await this.db.insert(monthlyWellnessReports).values(data).returning();
    return report;
  }

  async getMonthlyWellnessReports(userId: number, limit: number = 12): Promise<MonthlyWellnessReport[]> {
    return await this.db.select().from(monthlyWellnessReports)
      .where(eq(monthlyWellnessReports.userId, userId))
      .orderBy(desc(monthlyWellnessReports.reportMonth))
      .limit(limit);
  }

  async getMonthlyWellnessReport(userId: number, reportMonth: string): Promise<MonthlyWellnessReport | null> {
    const [report] = await this.db.select().from(monthlyWellnessReports)
      .where(and(
        eq(monthlyWellnessReports.userId, userId),
        eq(monthlyWellnessReports.reportMonth, reportMonth)
      ));
    return report || null;
  }

  async createAnalyticsMetric(data: InsertAnalyticsMetric): Promise<AnalyticsMetric> {
    const [metric] = await this.db.insert(analyticsMetrics).values(data).returning();
    return metric;
  }

  async getAnalyticsMetrics(userId: number, metricType?: string, limit: number = 30): Promise<AnalyticsMetric[]> {
    if (metricType) {
      return await this.db.select().from(analyticsMetrics)
        .where(and(
          eq(analyticsMetrics.userId, userId),
          eq(analyticsMetrics.metricType, metricType)
        ))
        .orderBy(desc(analyticsMetrics.calculatedDate))
        .limit(limit);
    }
    
    return await this.db.select().from(analyticsMetrics)
      .where(eq(analyticsMetrics.userId, userId))
      .orderBy(desc(analyticsMetrics.calculatedDate))
      .limit(limit);
  }

  async createProgressTracking(data: InsertProgressTracking): Promise<ProgressTracking> {
    const [tracking] = await this.db.insert(progressTracking).values(data).returning();
    return tracking;
  }

  async getProgressTracking(userId: number, period?: string, limit: number = 20): Promise<ProgressTracking[]> {
    if (period) {
      return await this.db.select().from(progressTracking)
        .where(and(
          eq(progressTracking.userId, userId),
          eq(progressTracking.trackingPeriod, period)
        ))
        .orderBy(desc(progressTracking.startDate))
        .limit(limit);
    }
    
    return await this.db.select().from(progressTracking)
      .where(eq(progressTracking.userId, userId))
      .orderBy(desc(progressTracking.startDate))
      .limit(limit);
  }

  async createRiskAssessment(data: InsertRiskAssessment): Promise<RiskAssessment> {
    const [assessment] = await this.db.insert(riskAssessments).values(data).returning();
    return assessment;
  }

  async getRiskAssessments(userId: number, limit: number = 10): Promise<RiskAssessment[]> {
    return await this.db.select().from(riskAssessments)
      .where(eq(riskAssessments.userId, userId))
      .orderBy(desc(riskAssessments.assessmentDate))
      .limit(limit);
  }

  async getLatestRiskAssessment(userId: number): Promise<RiskAssessment | null> {
    const [assessment] = await this.db.select().from(riskAssessments)
      .where(eq(riskAssessments.userId, userId))
      .orderBy(desc(riskAssessments.assessmentDate))
      .limit(1);
    return assessment || null;
  }

  async createLongitudinalTrend(data: InsertLongitudinalTrend): Promise<LongitudinalTrend> {
    const [trend] = await this.db.insert(longitudinalTrends).values(data).returning();
    return trend;
  }

  async getLongitudinalTrends(userId: number, trendType?: string, timeframe?: string): Promise<LongitudinalTrend[]> {
    if (trendType && timeframe) {
      return await this.db.select().from(longitudinalTrends)
        .where(and(
          eq(longitudinalTrends.userId, userId),
          eq(longitudinalTrends.trendType, trendType),
          eq(longitudinalTrends.timeframe, timeframe)
        ))
        .orderBy(desc(longitudinalTrends.lastCalculated));
    } else if (trendType) {
      return await this.db.select().from(longitudinalTrends)
        .where(and(
          eq(longitudinalTrends.userId, userId),
          eq(longitudinalTrends.trendType, trendType)
        ))
        .orderBy(desc(longitudinalTrends.lastCalculated));
    }
    
    return await this.db.select().from(longitudinalTrends)
      .where(eq(longitudinalTrends.userId, userId))
      .orderBy(desc(longitudinalTrends.lastCalculated));
  }

  async calculateUserWellnessMetrics(userId: number): Promise<any> {
    // Calculate comprehensive wellness metrics
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Get recent mood entries
    const recentMoods = await this.db.select().from(moodEntries)
      .where(and(
        eq(moodEntries.userId, userId),
        eq(moodEntries.createdAt, thirtyDaysAgo)
      ))
      .orderBy(desc(moodEntries.createdAt));
    
    // Get journal entries
    const journalCount = await this.db.select().from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.createdAt, thirtyDaysAgo)
      ));
    
    // Calculate averages and metrics
    const averageMood = recentMoods.length > 0 
      ? recentMoods.reduce((sum, mood) => sum + (mood.intensity || 5), 0) / recentMoods.length
      : 5;
    
    const wellnessScore = Math.min(100, (averageMood / 10) * 100);
    const engagement = Math.min(100, (journalCount.length / 30) * 100);
    
    return {
      wellnessScore: Number(wellnessScore.toFixed(2)),
      averageMood: Number(averageMood.toFixed(2)),
      moodEntries: recentMoods.length,
      journalEntries: journalCount.length,
      engagement: Number(engagement.toFixed(2)),
      calculatedAt: currentDate
    };
  }

  async calculateEmotionalVolatility(userId: number, days: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    const moods = await this.db.select().from(moodEntries)
      .where(and(
        eq(moodEntries.userId, userId),
        eq(moodEntries.createdAt, cutoffDate)
      ))
      .orderBy(desc(moodEntries.createdAt));
    
    if (moods.length < 2) return 0;
    
    // Calculate standard deviation of mood intensities
    const intensities = moods.map(mood => mood.intensity || 5);
    const mean = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;
    const volatility = Math.sqrt(variance);
    
    return Number(volatility.toFixed(2));
  }

  async calculateTherapeuticEngagement(userId: number, days: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    // Count therapeutic activities
    const journalCount = await this.db.select().from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.createdAt, cutoffDate)
      ));
    
    const moodCount = await this.db.select().from(moodEntries)
      .where(and(
        eq(moodEntries.userId, userId),
        eq(moodEntries.createdAt, cutoffDate)
      ));
    
    const messageCount = await this.db.select().from(messages)
      .where(and(
        eq(messages.userId, userId),
        eq(messages.timestamp, cutoffDate)
      ));
    
    // Calculate engagement score (0-100)
    const totalActivities = journalCount.length + moodCount.length + (messageCount.length / 5);
    const maxPossibleActivities = days * 3; // 3 activities per day max
    const engagement = Math.min(100, (totalActivities / maxPossibleActivities) * 100);
    
    return Number(engagement.toFixed(2));
  }

  async generateWellnessInsights(userId: number): Promise<string> {
    const metrics = await this.calculateUserWellnessMetrics(userId);
    const volatility = await this.calculateEmotionalVolatility(userId);
    const engagement = await this.calculateTherapeuticEngagement(userId);
    
    let insights = "Based on your recent therapeutic data:\n\n";
    
    if (metrics.wellnessScore >= 75) {
      insights += "• Your wellness score shows strong emotional stability\n";
    } else if (metrics.wellnessScore >= 50) {
      insights += "• Your wellness score indicates moderate emotional balance with room for improvement\n";
    } else {
      insights += "• Your wellness score suggests focusing on emotional support strategies\n";
    }
    
    if (volatility <= 1.5) {
      insights += "• Your emotional patterns show good stability\n";
    } else if (volatility <= 3.0) {
      insights += "• Some emotional fluctuation detected - consider stress management techniques\n";
    } else {
      insights += "• Higher emotional volatility observed - regular therapeutic check-ins recommended\n";
    }
    
    if (engagement >= 60) {
      insights += "• Excellent therapeutic engagement - keep up the consistent practice\n";
    } else if (engagement >= 30) {
      insights += "• Moderate engagement - consider increasing journaling frequency\n";
    } else {
      insights += "• Low engagement detected - daily mindfulness practice recommended\n";
    }
    
    return insights;
  }
}

export const storage = new DbStorage();