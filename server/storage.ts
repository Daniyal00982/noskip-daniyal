import { 
  type Goal, type InsertGoal, 
  type Streak, type InsertStreak, 
  type DailyCompletion, type InsertDailyCompletion,
  type ScreenTime, type InsertScreenTime,
  type MicroSession, type InsertMicroSession,
  type LeaderboardEntry, type InsertLeaderboard,
  type Reward, type InsertReward,
  type ShameMetrics, type InsertShameMetrics,
  type FocusSession, type InsertFocusSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Goals
  getGoal(id: string): Promise<Goal | undefined>;
  getAllGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;

  // Streaks
  getStreak(goalId: string): Promise<Streak | undefined>;
  createStreak(streak: InsertStreak): Promise<Streak>;
  updateStreak(goalId: string, streak: Partial<InsertStreak>): Promise<Streak | undefined>;

  // Daily Completions
  getDailyCompletion(goalId: string, date: Date): Promise<DailyCompletion | undefined>;
  createDailyCompletion(completion: InsertDailyCompletion): Promise<DailyCompletion>;
  getCompletionsForGoal(goalId: string): Promise<DailyCompletion[]>;

  // Screen Time Tracking
  getScreenTimeEntries(goalId: string): Promise<ScreenTime[]>;
  createScreenTimeEntry(entry: InsertScreenTime): Promise<ScreenTime>;
  getTodayScreenTime(goalId: string): Promise<number>;

  // Micro Sessions
  getMicroSessions(goalId: string): Promise<MicroSession[]>;
  createMicroSession(session: InsertMicroSession): Promise<MicroSession>;

  // Leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  updateLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry>;

  // Rewards
  getRewards(goalId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  claimReward(rewardId: string): Promise<Reward | undefined>;

  // Shame Metrics
  getShameMetrics(goalId: string): Promise<ShameMetrics | undefined>;
  updateShameMetrics(goalId: string, metrics: Partial<InsertShameMetrics>): Promise<ShameMetrics>;

  // Focus Sessions
  getFocusSessions(goalId: string): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: string, updates: Partial<InsertFocusSession>): Promise<FocusSession | undefined>;
}

export class MemStorage implements IStorage {
  private goals: Map<string, Goal>;
  private streaks: Map<string, Streak>;
  private dailyCompletions: Map<string, DailyCompletion>;
  private screenTimeEntries: Map<string, ScreenTime>;
  private microSessions: Map<string, MicroSession>;
  private leaderboardEntries: Map<string, LeaderboardEntry>;
  private rewards: Map<string, Reward>;
  private shameMetrics: Map<string, ShameMetrics>;
  private focusSessions: Map<string, FocusSession>;

  constructor() {
    this.goals = new Map();
    this.streaks = new Map();
    this.dailyCompletions = new Map();
    this.screenTimeEntries = new Map();
    this.microSessions = new Map();
    this.leaderboardEntries = new Map();
    this.rewards = new Map();
    this.shameMetrics = new Map();
    this.focusSessions = new Map();
  }

  // Goals
  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { 
      ...insertGoal, 
      id,
      reason: insertGoal.reason || null,
      createdAt: new Date()
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updateData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updateData };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Streaks
  async getStreak(goalId: string): Promise<Streak | undefined> {
    return Array.from(this.streaks.values()).find(streak => streak.goalId === goalId);
  }

  async createStreak(insertStreak: InsertStreak): Promise<Streak> {
    const id = randomUUID();
    const streak: Streak = { 
      ...insertStreak, 
      id,
      goalId: insertStreak.goalId || null,
      currentStreak: insertStreak.currentStreak || null,
      bestStreak: insertStreak.bestStreak || null,
      totalCompleted: insertStreak.totalCompleted || null,
      lastCompletedDate: insertStreak.lastCompletedDate || null
    };
    this.streaks.set(id, streak);
    return streak;
  }

  async updateStreak(goalId: string, updateData: Partial<InsertStreak>): Promise<Streak | undefined> {
    const streak = Array.from(this.streaks.values()).find(s => s.goalId === goalId);
    if (!streak) return undefined;
    
    const updatedStreak = { ...streak, ...updateData };
    this.streaks.set(streak.id, updatedStreak);
    return updatedStreak;
  }

  // Daily Completions
  async getDailyCompletion(goalId: string, date: Date): Promise<DailyCompletion | undefined> {
    const dateStr = date.toDateString();
    return Array.from(this.dailyCompletions.values()).find(
      completion => completion.goalId === goalId && completion.date?.toDateString() === dateStr
    );
  }

  async createDailyCompletion(insertCompletion: InsertDailyCompletion): Promise<DailyCompletion> {
    const id = randomUUID();
    const completion: DailyCompletion = { 
      ...insertCompletion, 
      id,
      goalId: insertCompletion.goalId || null,
      completed: insertCompletion.completed || null
    };
    this.dailyCompletions.set(id, completion);
    return completion;
  }

  async getCompletionsForGoal(goalId: string): Promise<DailyCompletion[]> {
    return Array.from(this.dailyCompletions.values()).filter(
      completion => completion.goalId === goalId
    );
  }

  // Screen Time Tracking
  async getScreenTimeEntries(goalId: string): Promise<ScreenTime[]> {
    return Array.from(this.screenTimeEntries.values()).filter(
      entry => entry.goalId === goalId
    ).sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  }

  async createScreenTimeEntry(insertEntry: InsertScreenTime): Promise<ScreenTime> {
    const id = randomUUID();
    const entry: ScreenTime = {
      ...insertEntry,
      id,
      goalId: insertEntry.goalId || null,
      createdAt: new Date()
    };
    this.screenTimeEntries.set(id, entry);
    return entry;
  }

  async getTodayScreenTime(goalId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entries = Array.from(this.screenTimeEntries.values()).filter(
      entry => entry.goalId === goalId && 
      entry.date && new Date(entry.date).toDateString() === today.toDateString()
    );
    return entries.reduce((total, entry) => total + (entry.timeSpentMinutes || 0), 0);
  }

  // Micro Sessions
  async getMicroSessions(goalId: string): Promise<MicroSession[]> {
    return Array.from(this.microSessions.values()).filter(
      session => session.goalId === goalId
    ).sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }

  async createMicroSession(insertSession: InsertMicroSession): Promise<MicroSession> {
    const id = randomUUID();
    const session: MicroSession = {
      ...insertSession,
      id,
      goalId: insertSession.goalId || null,
      completedAt: new Date()
    };
    this.microSessions.set(id, session);
    return session;
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboardEntries.values())
      .sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0));
  }

  async updateLeaderboardEntry(insertEntry: InsertLeaderboard): Promise<LeaderboardEntry> {
    const existing = Array.from(this.leaderboardEntries.values()).find(
      entry => entry.goalId === insertEntry.goalId
    );
    
    if (existing) {
      const updated: LeaderboardEntry = {
        ...existing,
        ...insertEntry,
        lastActiveDate: new Date()
      };
      this.leaderboardEntries.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const entry: LeaderboardEntry = {
        ...insertEntry,
        id,
        goalId: insertEntry.goalId || null,
        lastActiveDate: new Date()
      };
      this.leaderboardEntries.set(id, entry);
      return entry;
    }
  }

  // Rewards
  async getRewards(goalId: string): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      reward => reward.goalId === goalId
    ).sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0));
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = {
      ...insertReward,
      id,
      goalId: insertReward.goalId || null,
      unlockedAt: new Date()
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async claimReward(rewardId: string): Promise<Reward | undefined> {
    const reward = this.rewards.get(rewardId);
    if (!reward) return undefined;
    
    const updated = { ...reward, claimed: true };
    this.rewards.set(rewardId, updated);
    return updated;
  }

  // Shame Metrics
  async getShameMetrics(goalId: string): Promise<ShameMetrics | undefined> {
    return Array.from(this.shameMetrics.values()).find(
      metrics => metrics.goalId === goalId
    );
  }

  async updateShameMetrics(goalId: string, updateData: Partial<InsertShameMetrics>): Promise<ShameMetrics> {
    const existing = await this.getShameMetrics(goalId);
    
    if (existing) {
      const updated: ShameMetrics = { ...existing, ...updateData };
      this.shameMetrics.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const metrics: ShameMetrics = {
        id,
        goalId: goalId,
        consecutiveSkips: 0,
        totalSkips: 0,
        socialMediaMinutesToday: 0,
        opportunityCostHours: 0,
        lastShameNotification: null,
        ...updateData
      };
      this.shameMetrics.set(id, metrics);
      return metrics;
    }
  }

  // Focus Sessions
  async getFocusSessions(goalId: string): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values()).filter(
      session => session.goalId === goalId
    ).sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0));
  }

  async createFocusSession(insertSession: InsertFocusSession): Promise<FocusSession> {
    const id = randomUUID();
    const session: FocusSession = {
      ...insertSession,
      id,
      goalId: insertSession.goalId || null
    };
    this.focusSessions.set(id, session);
    return session;
  }

  async updateFocusSession(id: string, updateData: Partial<InsertFocusSession>): Promise<FocusSession | undefined> {
    const session = this.focusSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updateData };
    this.focusSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
