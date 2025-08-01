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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid goal ID' });
  }

  try {
    if (req.method === 'GET') {
      const goal = await storage.getGoal(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      return res.status(200).json(goal);
    }

    if (req.method === 'PUT') {
      const updatedGoal = await storage.updateGoal(id, req.body);
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      return res.status(200).json(updatedGoal);
    }

    if (req.method === 'DELETE') {
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      return res.status(200).json({ message: "Goal deleted successfully" });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Goal API error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}