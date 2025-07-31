import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, TrendingDown, Users } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface ShameNotificationsProps {
  goalName: string;
  daysRemaining: number;
  currentStreak: number;
  consecutiveSkips: number;
  socialMediaMinutes: number;
}

const getShameMessages = (props: ShameNotificationsProps) => [
  {
    condition: props.consecutiveSkips >= 3,
    title: "3 DAYS OF EXCUSES",
    message: "While you were making excuses, someone else got 3 days closer to their dreams. ENOUGH!",
    type: "critical" as const,
    action: "Break the pattern NOW"
  },
  {
    condition: props.socialMediaMinutes > 120,
    title: "2+ HOURS ON SOCIAL MEDIA",
    message: `You wasted ${props.socialMediaMinutes} minutes scrolling. That's ${Math.floor(props.socialMediaMinutes / 30)} goal sessions lost forever.`,
    type: "urgent" as const,
    action: "Stop the addiction"
  },
  {
    condition: props.currentStreak === 0 && props.daysRemaining < 30,
    title: "ZERO PROGRESS, TIME RUNNING OUT",
    message: `Only ${props.daysRemaining} days left and you haven't even started. Your future self is DISAPPOINTED.`,
    type: "critical" as const,
    action: "Start TODAY or fail"
  },
  {
    condition: props.currentStreak < 7 && props.daysRemaining < 60,
    title: "BARELY TRYING",
    message: `${props.currentStreak} days? That's pathetic. Others have 30+ day streaks while you're playing around.`,
    type: "warning" as const,
    action: "Step up your game"
  }
];

const MOTIVATIONAL_SHAME = [
  "Everyone else is getting ahead while you're stuck",
  "Your excuses won't change your life",
  "Mediocrity is a choice. Choose greatness instead",
  "Stop disappointing the person you could become",
  "Your competition isn't taking days off"
];

export function ShameNotifications(props: ShameNotificationsProps) {
  const [activeShame, setActiveShame] = useState<ReturnType<typeof getShameMessages>[0] | null>(null);
  const [lastShameDate, setLastShameDate] = useLocalStorage('lastShameDate', '');
  const [shameCount, setShameCount] = useLocalStorage('dailyShameCount', 0);

  useEffect(() => {
    const today = new Date().toDateString();
    const shouldShowShame = lastShameDate !== today || shameCount < 3;

    if (shouldShowShame) {
      // Find the most relevant shame message
      const shameMessages = getShameMessages(props);
      const applicableShames = shameMessages.filter(shame => shame.condition);
      
      if (applicableShames.length > 0) {
        // Show the most critical one first
        const criticalShames = applicableShames.filter(s => s.type === 'critical');
        const urgentShames = applicableShames.filter(s => s.type === 'urgent');
        
        const shameToShow = criticalShames[0] || urgentShames[0] || applicableShames[0];
        
        setTimeout(() => {
          setActiveShame(shameToShow);
          setLastShameDate(today);
          setShameCount(prev => prev + 1);
        }, 2000); // Show after 2 seconds
      }
    }
  }, [props, lastShameDate, shameCount, setLastShameDate, setShameCount]);

  const handleDismiss = () => {
    setActiveShame(null);
  };

  const getShameColor = (type: string) => {
    switch (type) {
      case 'critical': return 'from-red-600 to-red-800';
      case 'urgent': return 'from-orange-600 to-red-600';
      case 'warning': return 'from-yellow-600 to-orange-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  if (!activeShame) return null;

  return (
    <Dialog open={!!activeShame} onOpenChange={() => setActiveShame(null)}>
      <DialogContent className="sm:max-w-lg border-0 p-0 overflow-hidden">
        <div className={`bg-gradient-to-br ${getShameColor(activeShame.type)} text-white`}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/20">
            <div className="flex items-center">
              <AlertTriangle className="mr-3 text-white" size={24} />
              <h2 className="text-xl font-bold">{activeShame.title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-lg mb-6 leading-relaxed">
              {activeShame.message}
            </p>

            {/* Harsh Reality Stats */}
            <div className="bg-black/20 rounded-xl p-4 mb-6">
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingDown className="mr-2" size={16} />
                Your Reality Check:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <span className="font-bold">{props.currentStreak} days (WEAK)</span>
                </div>
                <div className="flex justify-between">
                  <span>Days Skipped:</span>
                  <span className="font-bold">{props.consecutiveSkips} in a row</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Left:</span>
                  <span className="font-bold">{props.daysRemaining} days (SHRINKING)</span>
                </div>
                <div className="flex justify-between">
                  <span>Social Media Today:</span>
                  <span className="font-bold">{props.socialMediaMinutes} min (WASTED)</span>
                </div>
              </div>
            </div>

            {/* Comparison Pressure */}
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <h4 className="font-semibold mb-2 flex items-center">
                <Users className="mr-2" size={16} />
                While You Were Slacking:
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Sarah completed her 47th day straight</li>
                <li>• Alex just hit a 32-day streak</li>
                <li>• Jordan is crushing goals while you make excuses</li>
                <li>• 847 people completed their goals this month</li>
              </ul>
            </div>

            {/* Random Motivational Shame */}
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-3 mb-6">
              <p className="text-sm font-semibold italic">
                "{MOTIVATIONAL_SHAME[Math.floor(Math.random() * MOTIVATIONAL_SHAME.length)]}"
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleDismiss}
              className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 text-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              {activeShame.action} →
            </Button>

            {/* Fine Print */}
            <p className="text-xs text-white/70 mt-4 text-center">
              These harsh truths are designed to break you out of mediocrity. Your future depends on what you do next.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}