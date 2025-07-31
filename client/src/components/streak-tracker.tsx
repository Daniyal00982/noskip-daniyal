import { useMemo } from 'react';
import type { Streak, DailyCompletion } from '@shared/schema';

interface StreakTrackerProps {
  streak: Streak | null;
  completions: DailyCompletion[];
}

export function StreakTracker({ streak, completions }: StreakTrackerProps) {
  const weekDays = useMemo(() => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      const isCompleted = completions.some(completion => {
        if (!completion.date) return false;
        const completionDate = new Date(completion.date);
        return completionDate.toDateString() === date.toDateString() && completion.completed;
      });

      return {
        label: day,
        isCompleted,
        isPast: date < today,
        isToday: date.toDateString() === today.toDateString(),
      };
    });
  }, [completions]);

  const successRate = useMemo(() => {
    if (!completions.length) return 0;
    const completedDays = completions.filter(c => c.completed).length;
    return Math.round((completedDays / completions.length) * 100);
  }, [completions]);

  return (
    <div className="card-premium p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 tracking-tight">Streak</h3>
      
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-foreground mb-1">
          {streak?.currentStreak || 0}
        </div>
        <div className="text-xs text-muted-foreground tracking-wide">DAYS</div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground tracking-wide">BEST</span>
          <span className="font-medium text-foreground">{streak?.bestStreak || 0}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground tracking-wide">TOTAL</span>
          <span className="font-medium text-foreground">{streak?.totalCompleted || 0}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground tracking-wide">SUCCESS</span>
          <span className="font-medium text-foreground">{successRate}%</span>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="mt-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 tracking-wide">THIS WEEK</h4>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-sm flex items-center justify-center text-xs font-medium ${
                day.isCompleted
                  ? 'bg-foreground text-background'
                  : day.isToday
                  ? 'bg-muted text-foreground border border-border'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
