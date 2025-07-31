import { type Goal, type InsertGoal, type Streak, type InsertStreak, type DailyCompletion, type InsertDailyCompletion, type CoachingSession, type InsertCoachingSession } from "@shared/schema";
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

  // Coaching Sessions
  getCoachingSessions(goalId: string): Promise<CoachingSession[]>;
  createCoachingSession(session: InsertCoachingSession): Promise<CoachingSession>;
}

export class MemStorage implements IStorage {
  private goals: Map<string, Goal>;
  private streaks: Map<string, Streak>;
  private dailyCompletions: Map<string, DailyCompletion>;
  private coachingSessions: Map<string, CoachingSession>;

  constructor() {
    this.goals = new Map();
    this.streaks = new Map();
    this.dailyCompletions = new Map();
    this.coachingSessions = new Map();
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

  // Coaching Sessions
  async getCoachingSessions(goalId: string): Promise<CoachingSession[]> {
    return Array.from(this.coachingSessions.values()).filter(
      session => session.goalId === goalId
    ).sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createCoachingSession(insertSession: InsertCoachingSession): Promise<CoachingSession> {
    const id = randomUUID();
    const session: CoachingSession = { 
      ...insertSession, 
      id,
      goalId: insertSession.goalId || null,
      createdAt: new Date()
    };
    this.coachingSessions.set(id, session);
    return session;
  }
}

export const storage = new MemStorage();
