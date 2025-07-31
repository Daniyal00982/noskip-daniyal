import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertCoachingSessionSchema } from "@shared/schema";
import { getBrutalCoachResponse } from "./services/openai";

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
      const goalData = insertGoalSchema.parse(req.body);
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
      res.status(400).json({ message: "Invalid goal data" });
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

  // Coaching
  app.get("/api/coaching/:goalId", async (req, res) => {
    try {
      const sessions = await storage.getCoachingSessions(req.params.goalId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaching sessions" });
    }
  });

  app.post("/api/coaching/:goalId", async (req, res) => {
    try {
      const goalId = req.params.goalId;
      const { userMessage } = req.body;

      if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ message: "User message is required" });
      }

      // Get goal for context
      const goal = await storage.getGoal(goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      // Get coach response from OpenAI
      const coachResponse = await getBrutalCoachResponse(userMessage, goal.name);

      // Save session
      const session = await storage.createCoachingSession({
        goalId,
        userMessage,
        coachResponse,
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get coaching response" });
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

  const httpServer = createServer(app);
  return httpServer;
}
