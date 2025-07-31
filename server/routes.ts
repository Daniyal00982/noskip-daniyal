import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.getGoal(req.params.id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goal" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      console.log('Received goal data:', req.body);
      const goalData = insertGoalSchema.parse(req.body);
      console.log('Parsed goal data:', goalData);
      
      const goal = await storage.createGoal(goalData);
      
      // Create initial streak for the goal
      await storage.createStreak({
        goalId: goal.id,
        currentStreak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        lastCompletedDate: null,
      });
      
      res.status(201).json(goal);
    } catch (error) {
      console.error('Goal creation error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: "Invalid goal data", error: error.message });
      } else {
        res.status(400).json({ message: "Invalid goal data" });
      }
    }
  });

  // Streaks
  app.get("/api/streaks/:goalId", async (req, res) => {
    try {
      const streak = await storage.getStreak(req.params.goalId);
      if (!streak) {
        return res.status(404).json({ message: "Streak not found" });
      }
      res.json(streak);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  app.post("/api/streaks/:goalId/complete", async (req, res) => {
    try {
      const goalId = req.params.goalId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if already completed today
      const existingCompletion = await storage.getDailyCompletion(goalId, today);
      if (existingCompletion?.completed) {
        return res.status(400).json({ message: "Already completed today" });
      }

      // Create or update daily completion
      if (existingCompletion) {
        await storage.createDailyCompletion({
          goalId,
          date: today,
          completed: true,
        });
      } else {
        await storage.createDailyCompletion({
          goalId,
          date: today,
          completed: true,
        });
      }

      // Update streak
      const streak = await storage.getStreak(goalId);
      if (streak) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let newCurrentStreak = 1;
        if (streak.lastCompletedDate) {
          const lastDate = new Date(streak.lastCompletedDate);
          lastDate.setHours(0, 0, 0, 0);
          
          if (lastDate.getTime() === yesterday.getTime()) {
            newCurrentStreak = (streak.currentStreak || 0) + 1;
          }
        }

        const newBestStreak = Math.max(streak.bestStreak || 0, newCurrentStreak);
        const newTotalCompleted = (streak.totalCompleted || 0) + 1;

        await storage.updateStreak(goalId, {
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          totalCompleted: newTotalCompleted,
          lastCompletedDate: today,
        });

        const updatedStreak = await storage.getStreak(goalId);
        res.json(updatedStreak);
      } else {
        res.status(404).json({ message: "Streak not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to complete day" });
    }
  });



  // Daily completions
  app.get("/api/completions/:goalId", async (req, res) => {
    try {
      const completions = await storage.getCompletionsForGoal(req.params.goalId);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  // Screen Time Tracking
  app.get('/api/screen-time/:goalId', async (req, res) => {
    try {
      const entries = await storage.getScreenTimeEntries(req.params.goalId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch screen time entries' });
    }
  });

  app.get('/api/screen-time/today/:goalId', async (req, res) => {
    try {
      const todayMinutes = await storage.getTodayScreenTime(req.params.goalId);
      res.json(todayMinutes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch today screen time' });
    }
  });

  app.post('/api/screen-time/:goalId', async (req, res) => {
    try {
      const entry = await storage.createScreenTimeEntry({
        goalId: req.params.goalId,
        ...req.body
      });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create screen time entry' });
    }
  });

  // Focus Sessions
  app.get('/api/focus-sessions/:goalId', async (req, res) => {
    try {
      const sessions = await storage.getFocusSessions(req.params.goalId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch focus sessions' });
    }
  });

  app.post('/api/focus-sessions/:goalId', async (req, res) => {
    try {
      const session = await storage.createFocusSession({
        goalId: req.params.goalId,
        ...req.body
      });
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create focus session' });
    }
  });

  app.put('/api/focus-sessions/:sessionId', async (req, res) => {
    try {
      const session = await storage.updateFocusSession(req.params.sessionId, req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update focus session' });
    }
  });

  // Rewards System
  app.get('/api/rewards/:goalId', async (req, res) => {
    try {
      const rewards = await storage.getRewards(req.params.goalId);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch rewards' });
    }
  });

  app.post('/api/rewards/:goalId', async (req, res) => {
    try {
      const reward = await storage.createReward({
        goalId: req.params.goalId,
        ...req.body
      });
      res.json(reward);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create reward' });
    }
  });

  app.post('/api/rewards/:rewardId/claim', async (req, res) => {
    try {
      const reward = await storage.claimReward(req.params.rewardId);
      res.json(reward);
    } catch (error) {
      res.status(500).json({ message: 'Failed to claim reward' });
    }
  });

  // Leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });

  app.post('/api/leaderboard', async (req, res) => {
    try {
      const entry = await storage.updateLeaderboardEntry(req.body);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update leaderboard' });
    }
  });

  // Shame Metrics
  app.get('/api/shame-metrics/:goalId', async (req, res) => {
    try {
      const metrics = await storage.getShameMetrics(req.params.goalId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch shame metrics' });
    }
  });

  app.put('/api/shame-metrics/:goalId', async (req, res) => {
    try {
      const metrics = await storage.updateShameMetrics(req.params.goalId, req.body);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update shame metrics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
