import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { goalId } = req.query;

  if (!goalId || typeof goalId !== 'string') {
    return res.status(400).json({ message: 'Invalid goal ID' });
  }

  try {
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
      const newStreak = (streak.currentStreak || 0) + 1;
      await storage.updateStreak(goalId, {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, streak.bestStreak || 0),
        totalCompleted: (streak.totalCompleted || 0) + 1,
        lastCompletedDate: today,
      });
    }

    const updatedStreak = await storage.getStreak(goalId);
    return res.status(200).json(updatedStreak);
  } catch (error) {
    console.error('Complete streak API error:', error);
    return res.status(500).json({ message: "Failed to complete streak" });
  }
}