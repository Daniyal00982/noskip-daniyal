import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock, Target } from "lucide-react";

interface TimeTrackerProps {
  goalId: string;
  goalName: string;
}

export default function TimeTracker({ goalId, goalName }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(0); // seconds
  const [todayTotal, setTodayTotal] = useState(0); // seconds
  const [weeklyGoal] = useState(7 * 60 * 60); // 7 hours per week
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load today's total from localStorage
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`timeTracker_${goalId}_${today}`);
    if (stored) {
      setTodayTotal(parseInt(stored));
    }
  }, [goalId]);

  useEffect(() => {
    if (isTracking) {
      const id = setInterval(() => {
        setCurrentSession(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const startTracking = () => {
    setIsTracking(true);
  };

  const pauseTracking = () => {
    setIsTracking(false);
  };

  const stopTracking = () => {
    setIsTracking(false);
    
    // Save session time to today's total
    const newTotal = todayTotal + currentSession;
    setTodayTotal(newTotal);
    
    // Save to localStorage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`timeTracker_${goalId}_${today}`, newTotal.toString());
    
    // Reset current session
    setCurrentSession(0);
  };

  const getTodayProgress = () => {
    const dailyGoal = weeklyGoal / 7; // 1 hour per day
    return Math.min(100, (todayTotal / dailyGoal) * 100);
  };

  const getWeeklyProgress = () => {
    // This would ideally fetch from a backend
    // For now, estimate based on today's progress
    const estimatedWeekly = todayTotal * 7;
    return Math.min(100, (estimatedWeekly / weeklyGoal) * 100);
  };

  return (
    <div className="card-minimal p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gold">Time Tracker</h3>
        <Badge variant="outline" className="text-gold border-gold">
          Focus Mode
        </Badge>
      </div>

      {/* Current Session */}
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-gold mb-2">
          {formatTime(currentSession)}
        </div>
        <div className="text-sm text-muted-foreground">Current Session</div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3 mb-6">
        {!isTracking ? (
          <Button 
            onClick={startTracking}
            className="btn-premium flex items-center gap-2"
            data-testid="button-start-timer"
          >
            <Play className="h-4 w-4" />
            Start
          </Button>
        ) : (
          <>
            <Button 
              onClick={pauseTracking}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button 
              onClick={stopTracking}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Today's Progress */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Today's Focus</span>
            <span className="text-sm text-gold">{formatTime(todayTotal)}</span>
          </div>
          <Progress value={getTodayProgress()} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            Goal: 1 hour daily
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Weekly Goal</span>
            <span className="text-sm text-gold">{Math.round(getWeeklyProgress())}%</span>
          </div>
          <Progress value={getWeeklyProgress()} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            Goal: 7 hours weekly
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center p-3 bg-card rounded-lg">
          <Clock className="h-4 w-4 text-gold mx-auto mb-1" />
          <div className="text-sm font-medium text-foreground">{formatTime(todayTotal)}</div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>
        <div className="text-center p-3 bg-card rounded-lg">
          <Target className="h-4 w-4 text-gold mx-auto mb-1" />
          <div className="text-sm font-medium text-foreground">{Math.round(getTodayProgress())}%</div>
          <div className="text-xs text-muted-foreground">Progress</div>
        </div>
      </div>

      {/* Motivational Message */}
      {isTracking && (
        <div className="mt-4 p-3 bg-gold/10 rounded-lg border border-gold/20">
          <div className="text-xs text-gold font-medium text-center">
            🔥 Deep work mode active! Stay focused on {goalName}
          </div>
        </div>
      )}
    </div>
  );
}