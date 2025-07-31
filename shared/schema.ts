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

// Social Media & Screen Time Tracking
export const screenTimeEntries = pgTable("screen_time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  appName: text("app_name").notNull(),
  timeSpentMinutes: integer("time_spent_minutes").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Micro-sessions for ADHD-friendly progress
export const microSessions = pgTable("micro_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  durationSeconds: integer("duration_seconds").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  distractionCount: integer("distraction_count").default(0),
  focusScore: integer("focus_score").default(100), // 0-100
});

// Social pressure and leaderboards
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  userName: text("user_name").notNull(),
  streakCount: integer("streak_count").default(0),
  totalDays: integer("total_days").default(0),
  lastActiveDate: timestamp("last_active_date"),
  isAnonymous: boolean("is_anonymous").default(true),
});

// Rewards and gamification
export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  rewardType: text("reward_type").notNull(), // 'streak', 'milestone', 'surprise', 'focus'
  pointsEarned: integer("points_earned").default(0),
  badgeName: text("badge_name"),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  claimed: boolean("claimed").default(false),
});

// Shame and motivation tracking
export const shameMetrics = pgTable("shame_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  consecutiveSkips: integer("consecutive_skips").default(0),
  totalSkips: integer("total_skips").default(0),
  socialMediaMinutesToday: integer("social_media_minutes_today").default(0),
  opportunityCostHours: integer("opportunity_cost_hours").default(0),
  lastShameNotification: timestamp("last_shame_notification"),
});

// Focus sessions and distractions
export const focusSessions = pgTable("focus_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").references(() => goals.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  plannedDurationMinutes: integer("planned_duration_minutes").notNull(),
  actualDurationMinutes: integer("actual_duration_minutes"),
  distractionEvents: integer("distraction_events").default(0),
  completionRate: integer("completion_rate").default(0), // 0-100
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

// Insert schemas for new tables
export const insertScreenTimeSchema = createInsertSchema(screenTimeEntries).pick({
  goalId: true,
  appName: true,
  timeSpentMinutes: true,
  date: true,
});

export const insertMicroSessionSchema = createInsertSchema(microSessions).pick({
  goalId: true,
  durationSeconds: true,
  distractionCount: true,
  focusScore: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboardEntries).pick({
  goalId: true,
  userName: true,
  streakCount: true,
  totalDays: true,
  isAnonymous: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  goalId: true,
  rewardType: true,
  pointsEarned: true,
  badgeName: true,
  claimed: true,
});

export const insertShameMetricsSchema = createInsertSchema(shameMetrics).pick({
  goalId: true,
  consecutiveSkips: true,
  totalSkips: true,
  socialMediaMinutesToday: true,
  opportunityCostHours: true,
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).pick({
  goalId: true,
  startTime: true,
  endTime: true,
  plannedDurationMinutes: true,
  actualDurationMinutes: true,
  distractionEvents: true,
  completionRate: true,
});

// Types
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Streak = typeof streaks.$inferSelect;
export type InsertDailyCompletion = z.infer<typeof insertDailyCompletionSchema>;
export type DailyCompletion = typeof dailyCompletions.$inferSelect;

export type InsertScreenTime = z.infer<typeof insertScreenTimeSchema>;
export type ScreenTime = typeof screenTimeEntries.$inferSelect;
export type InsertMicroSession = z.infer<typeof insertMicroSessionSchema>;
export type MicroSession = typeof microSessions.$inferSelect;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertShameMetrics = z.infer<typeof insertShameMetricsSchema>;
export type ShameMetrics = typeof shameMetrics.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;
