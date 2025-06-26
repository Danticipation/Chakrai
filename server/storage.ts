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
}

export const storage = new DbStorage();