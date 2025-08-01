// Clean server entry point for Vercel deployment
// This file is only used for local development when deploying to Vercel
import express, { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertGoalSchema } from "../shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Noskip API is running" });
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

app.post("/api/goals", async (req, res) => {
  try {
    const goalData = insertGoalSchema.parse(req.body);
    const goal = await storage.createGoal(goalData);
    
    // Create initial streak
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
    res.status(400).json({ message: "Invalid goal data" });
  }
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// For local development only
if (process.env.NODE_ENV === "development") {
  const port = parseInt(process.env.PORT || '3001', 10);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Development server running on port ${port}`);
  });
}

export default app;