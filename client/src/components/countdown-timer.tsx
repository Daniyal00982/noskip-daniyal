import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  goalDeadline?: Date;
}

export function CountdownTimer({ goalDeadline }: CountdownTimerProps) {
  const [goalDays, setGoalDays] = useState(0);
  const [newYearDays, setNewYearDays] = useState(0);

  useEffect(() => {
    const calculateDays = () => {
      const now = new Date();
      
      // Calculate days to goal deadline
      if (goalDeadline) {
        const goalTime = goalDeadline.getTime() - now.getTime();
        setGoalDays(Math.max(0, Math.ceil(goalTime / (1000 * 3600 * 24))));
      }
      
      // Calculate days to New Year
      const nextNewYear = new Date(now.getFullYear() + 1, 0, 1);
      const newYearTime = nextNewYear.getTime() - now.getTime();
      setNewYearDays(Math.max(0, Math.ceil(newYearTime / (1000 * 3600 * 24))));
    };

    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 3600); // Update every hour

    return () => clearInterval(interval);
  }, [goalDeadline]);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Countdown Timers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center p-6 bg-gradient-accent rounded-xl text-white">
          <h3 className="font-semibold mb-2">Your Goal</h3>
          <div className="text-3xl font-bold">{goalDays}</div>
          <div className="text-orange-100">Days Left</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
          <h3 className="font-semibold mb-2">New Year 2026</h3>
          <div className="text-3xl font-bold">{newYearDays}</div>
          <div className="text-purple-100">Days Left</div>
        </div>
      </div>
    </div>
  );
}
