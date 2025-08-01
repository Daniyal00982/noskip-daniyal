import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { goals, streaks } from '../../shared/schema';
import { insertGoalSchema } from '../../shared/schema';
import { nanoid } from 'nanoid';

// Initialize database connection for Vercel
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Production CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log('Vercel API - Fetching all goals');
      const allGoals = await db.select().from(goals);
      return res.status(200).json(allGoals);
    }

    if (req.method === 'POST') {
      console.log('Vercel API - Creating goal with data:', req.body);
      
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Invalid request body' });
      }

      // Parse and validate goal data
      const goalData = insertGoalSchema.parse({
        ...req.body,
        id: nanoid(),
        createdAt: new Date()
      });
      
      console.log('Vercel API - Validated goal data:', goalData);
      
      // Insert goal into database
      const [newGoal] = await db.insert(goals).values(goalData).returning();
      
      // Create initial streak record
      await db.insert(streaks).values({
        goalId: newGoal.id,
        currentStreak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        lastCompletedDate: null,
      });
      
      console.log('Vercel API - Goal created successfully:', newGoal.id);
      return res.status(201).json(newGoal);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Vercel API Error:', error);
    
    // Enhanced error handling for production
    const errorResponse = {
      message: 'Goal creation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      method: req.method,
      body: req.body
    };
    
    return res.status(500).json(errorResponse);
  }
}