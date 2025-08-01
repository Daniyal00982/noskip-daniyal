import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { goalId } = req.query;

  if (!goalId || typeof goalId !== 'string') {
    return res.status(400).json({ message: 'Invalid goal ID' });
  }

  try {
    if (req.method === 'GET') {
      const streak = await storage.getStreak(goalId);
      if (!streak) {
        return res.status(404).json({ message: "Streak not found" });
      }
      return res.status(200).json(streak);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Streak API error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}