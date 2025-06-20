import { 
  users, bots, messages, learnedWords, milestones, userMemories, userFacts, moodEntries, emotionalPatterns,
  safetyCheckIns, crisisInterventions, journalEntries, journalAnalytics, journalExports,
  therapists, therapistSessions, therapistSharedInsights, collaborationSettings,
  userAchievements, wellnessStreaks, dailyActivities,
  supportForums, forumPosts, forumReplies, peerCheckIns, peerSessions, communityModerations,
  type User, type InsertUser, type Bot, type InsertBot,
  type Message, type InsertMessage, type LearnedWord, type InsertLearnedWord,
  type Milestone, type InsertMilestone, type UserMemory, type InsertUserMemory,
  type UserFact, type InsertUserFact, type MoodEntry, type InsertMoodEntry,
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
  type CommunityModeration, type InsertCommunityModeration
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Bot methods
  getBot(id: number): Promise<Bot | undefined>;
  getBotByUserId(userId: number): Promise<Bot | undefined>;
  createBot(bot: InsertBot): Promise<Bot>;
  updateBot(id: number, updates: Partial<Bot>): Promise<Bot | undefined>;

  // Message methods
  getMessages(botId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Learning methods
  getLearnedWords(botId: number): Promise<LearnedWord[]>;
  createOrUpdateWord(word: InsertLearnedWord): Promise<LearnedWord>;

  // Milestone methods
  getMilestones(botId: number): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;

  // Memory methods
  getUserMemories(userId: number): Promise<UserMemory[]>;
  createUserMemory(memory: InsertUserMemory): Promise<UserMemory>;
  clearUserMemories(userId: number): Promise<void>;
  getUserFacts(userId: number): Promise<UserFact[]>;
  createUserFact(fact: InsertUserFact): Promise<UserFact>;
  clearUserFacts(userId: number): Promise<void>;

  // Mood tracking methods
  getMoodEntries(userId: number, limit?: number): Promise<MoodEntry[]>;
  createMoodEntry(mood: InsertMoodEntry): Promise<MoodEntry>;
  getEmotionalPattern(userId: number): Promise<EmotionalPattern | undefined>;
  updateEmotionalPattern(userId: number, pattern: InsertEmotionalPattern): Promise<EmotionalPattern>;

  // Crisis detection methods
  createSafetyCheckIn(checkIn: InsertSafetyCheckIn): Promise<SafetyCheckIn>;
  getSafetyCheckIns(userId: number, limit?: number): Promise<SafetyCheckIn[]>;
  updateSafetyCheckIn(id: number, updates: Partial<SafetyCheckIn>): Promise<SafetyCheckIn | undefined>;
  createCrisisIntervention(intervention: InsertCrisisIntervention): Promise<CrisisIntervention>;
  getPendingCheckIns(userId: number): Promise<SafetyCheckIn[]>;

  // Journaling methods
  getJournalEntries(userId: number, limit?: number, offset?: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, updates: Partial<JournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<void>;
  getJournalAnalytics(entryId: number): Promise<JournalAnalytics | undefined>;
  createJournalAnalytics(analytics: InsertJournalAnalytics): Promise<JournalAnalytics>;
  getJournalAnalyticsByUser(userId: number, limit?: number): Promise<JournalAnalytics[]>;
  createJournalExport(exportData: InsertJournalExport): Promise<JournalExport>;
  getJournalExports(userId: number): Promise<JournalExport[]>;
  updateJournalExport(id: number, updates: Partial<JournalExport>): Promise<JournalExport | undefined>;

  // Therapist integration methods
  getTherapistsByUser(userId: number): Promise<Therapist[]>;
  createTherapist(therapist: InsertTherapist): Promise<Therapist>;
  getTherapistSessionsByUser(userId: number): Promise<TherapistSession[]>;
  createTherapistSession(session: InsertTherapistSession): Promise<TherapistSession>;
  updateTherapistSession(id: number, updates: Partial<TherapistSession>): Promise<TherapistSession | undefined>;
  getTherapistSharedInsightsByUser(userId: number): Promise<TherapistSharedInsight[]>;
  createTherapistSharedInsight(insight: InsertTherapistSharedInsight): Promise<TherapistSharedInsight>;
  getCollaborationSettings(userId: number): Promise<CollaborationSettings | undefined>;
  createCollaborationSettings(settings: InsertCollaborationSettings): Promise<CollaborationSettings>;
  updateCollaborationSettings(userId: number, updates: Partial<CollaborationSettings>): Promise<CollaborationSettings | undefined>;

  // Gamification methods
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  getWellnessStreak(userId: number, streakType: string): Promise<WellnessStreak | undefined>;
  createWellnessStreak(streak: InsertWellnessStreak): Promise<WellnessStreak>;
  updateWellnessStreak(id: number, updates: Partial<WellnessStreak>): Promise<WellnessStreak | undefined>;
  updateDailyActivity(userId: number, date: Date, activityType: string): Promise<void>;
  getDailyActivitiesHistory(userId: number, limit?: number): Promise<DailyActivity[]>;
  getDailyCheckinCount(userId: number): Promise<number>;
  getJournalEntryCount(userId: number): Promise<number>;
  getMoodEntryCount(userId: number): Promise<number>;
  getChatSessionCount(userId: number): Promise<number>;
  getGoalProgressCount(userId: number): Promise<number>;

  // Community and Peer Support methods
  getSupportForums(): Promise<SupportForum[]>;
  getSupportForum(id: number): Promise<SupportForum | undefined>;
  createSupportForum(forum: InsertSupportForum): Promise<SupportForum>;
  getForumPosts(forumId: number, limit?: number): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, updates: Partial<ForumPost>): Promise<ForumPost | undefined>;
  getForumReplies(postId: number): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  updateForumReply(id: number, updates: Partial<ForumReply>): Promise<ForumReply | undefined>;
  getPeerCheckInRequests(status?: string): Promise<PeerCheckIn[]>;
  getUserPeerCheckIns(userId: number): Promise<PeerCheckIn[]>;
  createPeerCheckIn(checkIn: InsertPeerCheckIn): Promise<PeerCheckIn>;
  updatePeerCheckIn(id: number, updates: Partial<PeerCheckIn>): Promise<PeerCheckIn | undefined>;
  getPeerSessions(userId: number): Promise<PeerSession[]>;
  createPeerSession(session: InsertPeerSession): Promise<PeerSession>;
  updatePeerSession(id: number, updates: Partial<PeerSession>): Promise<PeerSession | undefined>;
  createCommunityModeration(moderation: InsertCommunityModeration): Promise<CommunityModeration>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getBot(id: number): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || undefined;
  }

  async getBotByUserId(userId: number): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.userId, userId));
    return bot || undefined;
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const [bot] = await db
      .insert(bots)
      .values({
        ...insertBot,
        name: insertBot.name || "Mirror",
        level: insertBot.level || 1,
        wordsLearned: insertBot.wordsLearned || 0,
        personalityTraits: insertBot.personalityTraits || {
          enthusiasm: 1,
          humor: 1,
          curiosity: 2
        }
      })
      .returning();
    return bot;
  }

  async updateBot(id: number, updates: Partial<Bot>): Promise<Bot | undefined> {
    const [bot] = await db
      .update(bots)
      .set(updates)
      .where(eq(bots.id, id))
      .returning();
    return bot || undefined;
  }

  async getMessages(botId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.botId, botId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getLearnedWords(botId: number): Promise<LearnedWord[]> {
    return await db.select().from(learnedWords).where(eq(learnedWords.botId, botId));
  }

  async createOrUpdateWord(insertWord: InsertLearnedWord): Promise<LearnedWord> {
    const existingWords = await db
      .select()
      .from(learnedWords)
      .where(eq(learnedWords.word, insertWord.word.toLowerCase()));
    
    const existingWord = existingWords.find(w => w.botId === insertWord.botId);
    
    if (existingWord) {
      const [updatedWord] = await db
        .update(learnedWords)
        .set({ 
          frequency: existingWord.frequency + 1,
          context: insertWord.context || existingWord.context
        })
        .where(eq(learnedWords.id, existingWord.id))
        .returning();
      return updatedWord;
    } else {
      const [word] = await db
        .insert(learnedWords)
        .values({
          ...insertWord,
          frequency: insertWord.frequency || 1
        })
        .returning();
      return word;
    }
  }

  async getMilestones(botId: number): Promise<Milestone[]> {
    return await db.select().from(milestones).where(eq(milestones.botId, botId));
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db
      .insert(milestones)
      .values({
        ...insertMilestone,
        description: insertMilestone.description || null
      })
      .returning();
    return milestone;
  }

  async getUserMemories(userId: number): Promise<UserMemory[]> {
    return await db.select().from(userMemories).where(eq(userMemories.userId, userId));
  }

  async createUserMemory(insertMemory: InsertUserMemory): Promise<UserMemory> {
    const [memory] = await db
      .insert(userMemories)
      .values({
        userId: insertMemory.userId,
        memory: insertMemory.memory,
        category: insertMemory.category || 'conversation',
        importance: insertMemory.importance || 'medium'
      })
      .returning();
    return memory;
  }

  async getUserFacts(userId: number): Promise<UserFact[]> {
    return await db.select().from(userFacts).where(eq(userFacts.userId, userId));
  }

  async createUserFact(insertFact: InsertUserFact): Promise<UserFact> {
    const [fact] = await db
      .insert(userFacts)
      .values(insertFact)
      .returning();
    return fact;
  }

  async clearUserMemories(userId: number): Promise<void> {
    await db.delete(userMemories).where(eq(userMemories.userId, userId));
  }

  async clearUserFacts(userId: number): Promise<void> {
    await db.delete(userFacts).where(eq(userFacts.userId, userId));
  }

  // Mood tracking methods
  async getMoodEntries(userId: number, limitCount?: number): Promise<MoodEntry[]> {
    const query = db.select().from(moodEntries).where(eq(moodEntries.userId, userId)).orderBy(desc(moodEntries.createdAt));
    if (limitCount) {
      return await query.limit(limitCount);
    }
    return await query;
  }

  async createMoodEntry(insertMood: InsertMoodEntry): Promise<MoodEntry> {
    const [mood] = await db.insert(moodEntries).values(insertMood).returning();
    return mood;
  }

  async getEmotionalPattern(userId: number): Promise<EmotionalPattern | undefined> {
    const [pattern] = await db.select().from(emotionalPatterns)
      .where(eq(emotionalPatterns.userId, userId))
      .orderBy(desc(emotionalPatterns.updatedAt));
    return pattern || undefined;
  }

  async updateEmotionalPattern(userId: number, patternData: InsertEmotionalPattern): Promise<EmotionalPattern> {
    const existingPattern = await this.getEmotionalPattern(userId);
    
    if (existingPattern) {
      const [updated] = await db.update(emotionalPatterns)
        .set({ ...patternData, updatedAt: new Date() })
        .where(eq(emotionalPatterns.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(emotionalPatterns)
        .values({ ...patternData, userId })
        .returning();
      return created;
    }
  }

  // Crisis detection methods
  async createSafetyCheckIn(insertCheckIn: InsertSafetyCheckIn): Promise<SafetyCheckIn> {
    const [checkIn] = await db.insert(safetyCheckIns).values(insertCheckIn).returning();
    return checkIn;
  }

  async getSafetyCheckIns(userId: number, limitCount?: number): Promise<SafetyCheckIn[]> {
    const query = db.select().from(safetyCheckIns)
      .where(eq(safetyCheckIns.userId, userId))
      .orderBy(desc(safetyCheckIns.createdAt));
    
    if (limitCount) {
      return await query.limit(limitCount);
    }
    return await query;
  }

  async updateSafetyCheckIn(id: number, updates: Partial<SafetyCheckIn>): Promise<SafetyCheckIn | undefined> {
    const [updated] = await db.update(safetyCheckIns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(safetyCheckIns.id, id))
      .returning();
    return updated || undefined;
  }

  async createCrisisIntervention(insertIntervention: InsertCrisisIntervention): Promise<CrisisIntervention> {
    const [intervention] = await db.insert(crisisInterventions).values(insertIntervention).returning();
    return intervention;
  }

  async getPendingCheckIns(userId: number): Promise<SafetyCheckIn[]> {
    return await db.select().from(safetyCheckIns)
      .where(
        and(
          eq(safetyCheckIns.userId, userId),
          eq(safetyCheckIns.responseReceived, false),
          eq(safetyCheckIns.checkInRequired, true)
        )
      )
      .orderBy(desc(safetyCheckIns.createdAt));
  }

  // Journaling storage methods
  async getJournalEntries(userId: number, limitCount?: number, offset?: number): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limitCount || 50)
      .offset(offset || 0);
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db.insert(journalEntries).values(insertEntry).returning();
    return entry;
  }

  async updateJournalEntry(id: number, updates: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    const [updated] = await db.update(journalEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteJournalEntry(id: number): Promise<void> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  }

  async getJournalAnalytics(entryId: number): Promise<JournalAnalytics | undefined> {
    const [analytics] = await db.select().from(journalAnalytics)
      .where(eq(journalAnalytics.entryId, entryId));
    return analytics || undefined;
  }

  async createJournalAnalytics(insertAnalytics: InsertJournalAnalytics): Promise<JournalAnalytics> {
    const [analytics] = await db.insert(journalAnalytics).values(insertAnalytics).returning();
    return analytics;
  }

  async getJournalAnalyticsByUser(userId: number, limitCount?: number): Promise<JournalAnalytics[]> {
    return await db.select().from(journalAnalytics)
      .where(eq(journalAnalytics.userId, userId))
      .orderBy(desc(journalAnalytics.createdAt))
      .limit(limitCount || 50);
  }

  async createJournalExport(insertExport: InsertJournalExport): Promise<JournalExport> {
    const [exportData] = await db.insert(journalExports).values(insertExport).returning();
    return exportData;
  }

  async getJournalExports(userId: number): Promise<JournalExport[]> {
    return await db.select().from(journalExports)
      .where(eq(journalExports.userId, userId))
      .orderBy(desc(journalExports.createdAt));
  }

  async updateJournalExport(id: number, updates: Partial<JournalExport>): Promise<JournalExport | undefined> {
    const [updated] = await db.update(journalExports)
      .set(updates)
      .where(eq(journalExports.id, id))
      .returning();
    return updated || undefined;
  }

  // Therapist integration methods
  async getTherapistsByUser(userId: number): Promise<Therapist[]> {
    return await db.select().from(therapists)
      .where(eq(therapists.userId, userId))
      .orderBy(desc(therapists.createdAt));
  }

  async createTherapist(insertTherapist: InsertTherapist): Promise<Therapist> {
    const [therapist] = await db.insert(therapists).values(insertTherapist).returning();
    return therapist;
  }

  async getTherapistSessionsByUser(userId: number): Promise<TherapistSession[]> {
    return await db.select().from(therapistSessions)
      .where(eq(therapistSessions.userId, userId))
      .orderBy(desc(therapistSessions.scheduledAt));
  }

  async createTherapistSession(insertSession: InsertTherapistSession): Promise<TherapistSession> {
    const [session] = await db.insert(therapistSessions).values(insertSession).returning();
    return session;
  }

  async updateTherapistSession(id: number, updates: Partial<TherapistSession>): Promise<TherapistSession | undefined> {
    const [updated] = await db.update(therapistSessions)
      .set(updates)
      .where(eq(therapistSessions.id, id))
      .returning();
    return updated || undefined;
  }

  async getTherapistSharedInsightsByUser(userId: number): Promise<TherapistSharedInsight[]> {
    return await db.select().from(therapistSharedInsights)
      .where(eq(therapistSharedInsights.userId, userId))
      .orderBy(desc(therapistSharedInsights.sharedAt));
  }

  async createTherapistSharedInsight(insertInsight: InsertTherapistSharedInsight): Promise<TherapistSharedInsight> {
    const [insight] = await db.insert(therapistSharedInsights).values(insertInsight).returning();
    return insight;
  }

  async getCollaborationSettings(userId: number): Promise<CollaborationSettings | undefined> {
    const [settings] = await db.select().from(collaborationSettings)
      .where(eq(collaborationSettings.userId, userId));
    return settings || undefined;
  }

  async createCollaborationSettings(insertSettings: InsertCollaborationSettings): Promise<CollaborationSettings> {
    const [settings] = await db.insert(collaborationSettings).values(insertSettings).returning();
    return settings;
  }

  async updateCollaborationSettings(userId: number, updates: Partial<CollaborationSettings>): Promise<CollaborationSettings | undefined> {
    const [updated] = await db.update(collaborationSettings)
      .set(updates)
      .where(eq(collaborationSettings.userId, userId))
      .returning();
    return updated || undefined;
  }

  // Gamification methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async createUserAchievement(insertAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [achievement] = await db.insert(userAchievements).values(insertAchievement).returning();
    return achievement;
  }

  async getWellnessStreak(userId: number, streakType: string): Promise<WellnessStreak | undefined> {
    const [streak] = await db.select().from(wellnessStreaks)
      .where(eq(wellnessStreaks.userId, userId))
      .where(eq(wellnessStreaks.streakType, streakType as any));
    return streak || undefined;
  }

  async createWellnessStreak(insertStreak: InsertWellnessStreak): Promise<WellnessStreak> {
    const [streak] = await db.insert(wellnessStreaks).values(insertStreak).returning();
    return streak;
  }

  async updateWellnessStreak(id: number, updates: Partial<WellnessStreak>): Promise<WellnessStreak | undefined> {
    const [updated] = await db.update(wellnessStreaks)
      .set(updates)
      .where(eq(wellnessStreaks.id, id))
      .returning();
    return updated || undefined;
  }

  async updateDailyActivity(userId: number, date: Date, activityType: string): Promise<void> {
    const dateString = date.toISOString().split('T')[0];
    const existingActivity = await db.select().from(dailyActivities)
      .where(eq(dailyActivities.userId, userId))
      .where(sql`DATE(activity_date) = ${dateString}`)
      .limit(1);

    const updates: any = { [activityType]: true };
    
    if (existingActivity.length > 0) {
      const activity = existingActivity[0];
      const totalActivities = [
        updates.checkedIn || activity.checkedIn,
        updates.journalEntry || activity.journalEntry,
        updates.moodTracked || activity.moodTracked,
        updates.chatSession || activity.chatSession,
        updates.goalProgress || activity.goalProgress
      ].filter(Boolean).length;

      await db.update(dailyActivities)
        .set({ ...updates, totalActivities })
        .where(eq(dailyActivities.id, activity.id));
    } else {
      await db.insert(dailyActivities).values({
        userId,
        activityDate: date,
        ...updates,
        totalActivities: 1
      });
    }
  }

  async getDailyActivitiesHistory(userId: number, limit = 30): Promise<DailyActivity[]> {
    return await db.select().from(dailyActivities)
      .where(eq(dailyActivities.userId, userId))
      .orderBy(desc(dailyActivities.activityDate))
      .limit(limit);
  }

  async getDailyCheckinCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(dailyActivities)
      .where(eq(dailyActivities.userId, userId))
      .where(eq(dailyActivities.checkedIn, true));
    return result[0]?.count || 0;
  }

  async getJournalEntryCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));
    return result[0]?.count || 0;
  }

  async getMoodEntryCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId));
    return result[0]?.count || 0;
  }

  async getChatSessionCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(dailyActivities)
      .where(eq(dailyActivities.userId, userId))
      .where(eq(dailyActivities.chatSession, true));
    return result[0]?.count || 0;
  }

  async getGoalProgressCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(dailyActivities)
      .where(eq(dailyActivities.userId, userId))
      .where(eq(dailyActivities.goalProgress, true));
    return result[0]?.count || 0;
  }

  // Community and Peer Support methods implementation
  async getSupportForums(): Promise<SupportForum[]> {
    return await db.select().from(supportForums).orderBy(desc(supportForums.createdAt));
  }

  async getSupportForum(id: number): Promise<SupportForum | undefined> {
    const [forum] = await db.select().from(supportForums).where(eq(supportForums.id, id));
    return forum || undefined;
  }

  async createSupportForum(forum: InsertSupportForum): Promise<SupportForum> {
    const [newForum] = await db.insert(supportForums).values(forum).returning();
    return newForum;
  }

  async getForumPosts(forumId: number, limit = 20): Promise<ForumPost[]> {
    return await db.select().from(forumPosts)
      .where(eq(forumPosts.forumId, forumId))
      .orderBy(desc(forumPosts.createdAt))
      .limit(limit);
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    return post || undefined;
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    return newPost;
  }

  async updateForumPost(id: number, updates: Partial<ForumPost>): Promise<ForumPost | undefined> {
    const [updatedPost] = await db.update(forumPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumPosts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return await db.select().from(forumReplies)
      .where(eq(forumReplies.postId, postId))
      .orderBy(forumReplies.createdAt);
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    return newReply;
  }

  async updateForumReply(id: number, updates: Partial<ForumReply>): Promise<ForumReply | undefined> {
    const [updatedReply] = await db.update(forumReplies)
      .set(updates)
      .where(eq(forumReplies.id, id))
      .returning();
    return updatedReply || undefined;
  }

  async getPeerCheckInRequests(status?: string): Promise<PeerCheckIn[]> {
    const query = db.select().from(peerCheckIns);
    if (status) {
      return await query.where(eq(peerCheckIns.status, status)).orderBy(desc(peerCheckIns.createdAt));
    }
    return await query.orderBy(desc(peerCheckIns.createdAt));
  }

  async getUserPeerCheckIns(userId: number): Promise<PeerCheckIn[]> {
    return await db.select().from(peerCheckIns)
      .where(eq(peerCheckIns.requesterId, userId))
      .orderBy(desc(peerCheckIns.createdAt));
  }

  async createPeerCheckIn(checkIn: InsertPeerCheckIn): Promise<PeerCheckIn> {
    const [newCheckIn] = await db.insert(peerCheckIns).values(checkIn).returning();
    return newCheckIn;
  }

  async updatePeerCheckIn(id: number, updates: Partial<PeerCheckIn>): Promise<PeerCheckIn | undefined> {
    const [updatedCheckIn] = await db.update(peerCheckIns)
      .set(updates)
      .where(eq(peerCheckIns.id, id))
      .returning();
    return updatedCheckIn || undefined;
  }

  async getPeerSessions(userId: number): Promise<PeerSession[]> {
    return await db.select().from(peerSessions)
      .where(
        sql`${peerSessions.participant1Id} = ${userId} OR ${peerSessions.participant2Id} = ${userId}`
      )
      .orderBy(desc(peerSessions.createdAt));
  }

  async createPeerSession(session: InsertPeerSession): Promise<PeerSession> {
    const [newSession] = await db.insert(peerSessions).values(session).returning();
    return newSession;
  }

  async updatePeerSession(id: number, updates: Partial<PeerSession>): Promise<PeerSession | undefined> {
    const [updatedSession] = await db.update(peerSessions)
      .set(updates)
      .where(eq(peerSessions.id, id))
      .returning();
    return updatedSession || undefined;
  }

  async createCommunityModeration(moderation: InsertCommunityModeration): Promise<CommunityModeration> {
    const [newModeration] = await db.insert(communityModerations).values(moderation).returning();
    return newModeration;
  }
}

export const storage = new DatabaseStorage();
