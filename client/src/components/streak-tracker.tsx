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
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 Streak Tracker</h3>
      
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-accent mb-2">
          {streak?.currentStreak || 0}
        </div>
        <div className="text-gray-600">Day Streak</div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Best Streak:</span>
          <span className="font-semibold">{streak?.bestStreak || 0} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Completed:</span>
          <span className="font-semibold">{streak?.totalCompleted || 0} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Success Rate:</span>
          <span className="font-semibold text-secondary">{successRate}%</span>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">This Week</h4>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded text-white flex items-center justify-center text-xs font-semibold ${
                day.isCompleted
                  ? 'bg-secondary'
                  : day.isToday
                  ? 'bg-accent'
                  : 'bg-gray-200 text-gray-400'
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
