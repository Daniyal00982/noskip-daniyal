import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  deadline: timestamp("deadline").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  currentStreak: integer("current_streak").default(0),
  bestStreak: integer("best_streak").default(0),
  totalCompleted: integer("total_completed").default(0),
  lastCompletedDate: timestamp("last_completed_date"),
});

export const dailyCompletions = pgTable("daily_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false),
});

export const coachingSessions = pgTable("coaching_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  userMessage: text("user_message").notNull(),
  coachResponse: text("coach_response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  deadline: true,
  reason: true,
});

export const insertStreakSchema = createInsertSchema(streaks).pick({
  goalId: true,
  currentStreak: true,
  bestStreak: true,
  totalCompleted: true,
  lastCompletedDate: true,
});

export const insertDailyCompletionSchema = createInsertSchema(dailyCompletions).pick({
  goalId: true,
  date: true,
  completed: true,
});

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).pick({
  goalId: true,
  userMessage: true,
  coachResponse: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Streak = typeof streaks.$inferSelect;
export type InsertDailyCompletion = z.infer<typeof insertDailyCompletionSchema>;
export type DailyCompletion = typeof dailyCompletions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;
