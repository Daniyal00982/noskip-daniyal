import { eq, desc } from 'drizzle-orm';
import { getDatabase } from './db';
import { 
  goals, streaks, dailyCompletions, screenTimeEntries, microSessions,
  leaderboardEntries, rewards, shameMetrics, focusSessions,
  type Goal, type InsertGoal, 
  type Streak, type InsertStreak, 
  type DailyCompletion, type InsertDailyCompletion,
  type ScreenTime, type InsertScreenTime,
  type MicroSession, type InsertMicroSession,
  type LeaderboardEntry, type InsertLeaderboard,
  type Reward, type InsertReward,
  type ShameMetrics, type InsertShameMetrics,
  type FocusSession, type InsertFocusSession
} from '../shared/schema';
import type { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  private get db() {
    return getDatabase();
  }

  // Goals
  async getGoal(id: string): Promise<Goal | undefined> {
    const result = await this.db.select().from(goals).where(eq(goals.id, id));
    return result[0];
  }

  async getAllGoals(): Promise<Goal[]> {
    return await this.db.select().from(goals).orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const result = await this.db.insert(goals).values(goal).returning();
    return result[0];
  }

  async updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const result = await this.db.update(goals).set(goal).where(eq(goals.id, id)).returning();
    return result[0];
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await this.db.delete(goals).where(eq(goals.id, id));
    return result.rowCount! > 0;
  }

  // Streaks
  async getStreak(goalId: string): Promise<Streak | undefined> {
    const result = await this.db.select().from(streaks).where(eq(streaks.goalId, goalId));
    return result[0];
  }

  async createStreak(streak: InsertStreak): Promise<Streak> {
    const result = await this.db.insert(streaks).values(streak).returning();
    return result[0];
  }

  async updateStreak(goalId: string, streak: Partial<InsertStreak>): Promise<Streak | undefined> {
    const result = await this.db.update(streaks).set(streak).where(eq(streaks.goalId, goalId)).returning();
    return result[0];
  }

  // Daily Completions
  async getDailyCompletion(goalId: string, date: Date): Promise<DailyCompletion | undefined> {
    const result = await this.db.select().from(dailyCompletions)
      .where(eq(dailyCompletions.goalId, goalId));
    
    return result.find(completion => {
      if (!completion.date) return false;
      const completionDate = new Date(completion.date);
      return completionDate.toDateString() === date.toDateString();
    });
  }

  async createDailyCompletion(completion: InsertDailyCompletion): Promise<DailyCompletion> {
    const result = await this.db.insert(dailyCompletions).values(completion).returning();
    return result[0];
  }

  async getCompletionsForGoal(goalId: string): Promise<DailyCompletion[]> {
    return await this.db.select().from(dailyCompletions)
      .where(eq(dailyCompletions.goalId, goalId))
      .orderBy(desc(dailyCompletions.date));
  }

  // Screen Time Tracking
  async getScreenTimeEntries(goalId: string): Promise<ScreenTime[]> {
    return await this.db.select().from(screenTimeEntries)
      .where(eq(screenTimeEntries.goalId, goalId))
      .orderBy(desc(screenTimeEntries.date));
  }

  async createScreenTimeEntry(entry: InsertScreenTime): Promise<ScreenTime> {
    const result = await this.db.insert(screenTimeEntries).values(entry).returning();
    return result[0];
  }

  async getTodayScreenTime(goalId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entries = await this.db.select().from(screenTimeEntries)
      .where(eq(screenTimeEntries.goalId, goalId));
    
    const todayEntries = entries.filter(entry => {
      if (!entry.date) return false;
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === today.toDateString();
    });
    
    return todayEntries.reduce((total, entry) => total + (entry.timeSpentMinutes || 0), 0);
  }

  // Micro Sessions
  async getMicroSessions(goalId: string): Promise<MicroSession[]> {
    return await this.db.select().from(microSessions)
      .where(eq(microSessions.goalId, goalId))
      .orderBy(desc(microSessions.completedAt));
  }

  async createMicroSession(session: InsertMicroSession): Promise<MicroSession> {
    const result = await this.db.insert(microSessions).values(session).returning();
    return result[0];
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return await this.db.select().from(leaderboardEntries)
      .orderBy(desc(leaderboardEntries.streakCount));
  }

  async updateLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry> {
    const existing = await this.db.select().from(leaderboardEntries)
      .where(eq(leaderboardEntries.goalId, entry.goalId!));
    
    if (existing.length > 0) {
      const result = await this.db.update(leaderboardEntries)
        .set({ ...entry, lastActiveDate: new Date() })
        .where(eq(leaderboardEntries.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(leaderboardEntries)
        .values({ ...entry, lastActiveDate: new Date() })
        .returning();
      return result[0];
    }
  }

  // Rewards
  async getRewards(goalId: string): Promise<Reward[]> {
    return await this.db.select().from(rewards)
      .where(eq(rewards.goalId, goalId))
      .orderBy(desc(rewards.unlockedAt));
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const result = await this.db.insert(rewards).values(reward).returning();
    return result[0];
  }

  async claimReward(rewardId: string): Promise<Reward | undefined> {
    const result = await this.db.update(rewards)
      .set({ claimed: true })
      .where(eq(rewards.id, rewardId))
      .returning();
    return result[0];
  }

  // Shame Metrics
  async getShameMetrics(goalId: string): Promise<ShameMetrics | undefined> {
    const result = await this.db.select().from(shameMetrics)
      .where(eq(shameMetrics.goalId, goalId));
    return result[0];
  }

  async updateShameMetrics(goalId: string, metrics: Partial<InsertShameMetrics>): Promise<ShameMetrics> {
    const existing = await this.getShameMetrics(goalId);
    
    if (existing) {
      const result = await this.db.update(shameMetrics)
        .set(metrics)
        .where(eq(shameMetrics.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(shameMetrics)
        .values({ goalId, ...metrics })
        .returning();
      return result[0];
    }
  }

  // Focus Sessions
  async getFocusSessions(goalId: string): Promise<FocusSession[]> {
    return await this.db.select().from(focusSessions)
      .where(eq(focusSessions.goalId, goalId))
      .orderBy(desc(focusSessions.startTime));
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const result = await this.db.insert(focusSessions).values(session).returning();
    return result[0];
  }

  async updateFocusSession(id: string, updates: Partial<InsertFocusSession>): Promise<FocusSession | undefined> {
    const result = await this.db.update(focusSessions)
      .set(updates)
      .where(eq(focusSessions.id, id))
      .returning();
    return result[0];
  }
}