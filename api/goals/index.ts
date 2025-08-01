import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { insertGoalSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const goals = await storage.getAllGoals();
      return res.status(200).json(goals);
    }

    if (req.method === 'POST') {
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
      
      return res.status(201).json(goal);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Goals API error:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: "Invalid data", error: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}