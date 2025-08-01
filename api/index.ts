import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import { storage } from "../server/storage";
import { insertGoalSchema } from "../shared/schema";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Goals routes
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
    console.error('Goal creation error:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: "Invalid goal data", error: error.message });
    } else {
      res.status(400).json({ message: "Invalid goal data" });
    }
  }
});

// Streaks routes
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

    // Create daily completion record
    await storage.createDailyCompletion({
      goalId,
      date: today,
      completed: true,
    });

    // Update streak
    const streak = await storage.getStreak(goalId);
    if (streak) {
      const newStreak = streak.currentStreak! + 1;
      await storage.updateStreak(goalId, {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, streak.bestStreak || 0),
        totalCompleted: (streak.totalCompleted || 0) + 1,
        lastCompletedDate: today,
      });
    }

    const updatedStreak = await storage.getStreak(goalId);
    res.json(updatedStreak);
  } catch (error) {
    res.status(500).json({ message: "Failed to complete streak" });
  }
});

// Handle all other API routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

export default app;