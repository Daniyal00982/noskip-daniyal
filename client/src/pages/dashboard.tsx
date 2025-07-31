import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from '@/components/countdown-timer';
import { StreakTracker } from '@/components/streak-tracker';
import { DailyNotification } from '@/components/daily-notification';
import { SocialMediaTracker } from '@/components/social-media-tracker';
import { FocusSession } from '@/components/focus-session';
import { Leaderboard } from '@/components/leaderboard';
import { RewardsGamification } from '@/components/rewards-gamification';
import { ShameNotifications } from '@/components/shame-notifications';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Goal, Streak, DailyCompletion } from '@shared/schema';

const POWER_MOTIVATIONAL_QUOTES = [
  { text: "Every second you waste scrolling, someone else is building their empire. YOUR TIME IS RUNNING OUT!", author: "Reality Check", intensity: "critical" },
  { text: "While you're making excuses, your competition is making MILLIONS. WAKE UP!", author: "Success Mindset", intensity: "critical" },
  { text: "POVERTY is waiting for you if you don't ACT NOW. Your family deserves BETTER!", author: "Financial Freedom", intensity: "urgent" },
  { text: "You're ONE decision away from a completely different life. CHOOSE GREATNESS TODAY!", author: "Life Transformation", intensity: "critical" },
  { text: "Your future self is BEGGING you to stop being lazy. DON'T DISAPPOINT THEM!", author: "Future You", intensity: "urgent" },
  { text: "Every day you don't work on your goal, you're choosing to stay BROKE and AVERAGE.", author: "Wealth Mindset", intensity: "critical" },
  { text: "STOP scrolling and START BUILDING! Your dreams won't create themselves!", author: "Action Taker", intensity: "urgent" },
  { text: "Rich people work while poor people make excuses. WHICH ONE ARE YOU?", author: "Mindset Shift", intensity: "critical" },
  { text: "Your goal isn't just a wish - it's your ESCAPE PLAN from mediocrity!", author: "Success Strategy", intensity: "urgent" },
  { text: "The pain of discipline weighs ounces. The pain of regret weighs TONS!", author: "Discipline Master", intensity: "critical" },
  { text: "You're not tired, you're UNINSPIRED. Find your WHY and DOMINATE!", author: "Motivation Beast", intensity: "urgent" },
  { text: "Every minute wasted on social media is a minute stolen from your SUCCESS!", author: "Time Master", intensity: "critical" }
];

const SUCCESS_COMPLETION_QUOTES = [
  "🔥 THAT'S THE SPIRIT! Rich people have this EXACT discipline!",
  "💪 BOOM! You just did what 90% of people CAN'T DO!",
  "⚡ SUCCESS ENERGY! You're building MILLIONAIRE habits!",
  "🚀 UNSTOPPABLE! This is how LEGENDS are made!",
  "👑 KING/QUEEN MOVES! Your future self is PROUD!",
  "💎 DIAMOND MENTALITY! You're becoming UNBREAKABLE!",
  "🏆 CHAMPION MINDSET! This is your PATH to GREATNESS!",
  "🔥 ON FIRE! Every completion brings you closer to WEALTH!"
];

export default function Dashboard() {
  const [currentGoalId] = useLocalStorage('currentGoalId', '');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goal, isLoading: goalLoading } = useQuery<Goal>({
    queryKey: ['/api/goals', currentGoalId],
    enabled: !!currentGoalId,
  });

  const { data: streak } = useQuery<Streak>({
    queryKey: ['/api/streaks', currentGoalId],
    enabled: !!currentGoalId,
  });

  const { data: completions = [] } = useQuery<DailyCompletion[]>({
    queryKey: ['/api/completions', currentGoalId],
    enabled: !!currentGoalId,
  });

  const markDayCompleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/streaks/${currentGoalId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      const randomSuccessQuote = SUCCESS_COMPLETION_QUOTES[Math.floor(Math.random() * SUCCESS_COMPLETION_QUOTES.length)];
      toast({
        title: "🎯 DAY CRUSHED! UNSTOPPABLE! 🚀",
        description: randomSuccessQuote,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/streaks', currentGoalId] });
      queryClient.invalidateQueries({ queryKey: ['/api/completions', currentGoalId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark day as complete",
        variant: "destructive",
      });
    },
  });

  const { daysRemaining, progressPercentage, isCompletedToday } = useMemo(() => {
    if (!goal?.deadline) return { daysRemaining: 0, progressPercentage: 0, isCompletedToday: false };
    
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const created = new Date(goal.createdAt || now);
    
    const totalTime = deadline.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();
    const remainingTime = deadline.getTime() - now.getTime();
    
    const daysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 3600 * 24)));
    const progressPercentage = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCompletedToday = completions.some(completion => {
      if (!completion.date) return false;
      const completionDate = new Date(completion.date);
      return completionDate.toDateString() === today.toDateString() && completion.completed;
    });
    
    return { daysRemaining, progressPercentage: Math.round(progressPercentage), isCompletedToday };
  }, [goal, completions]);

  const dailyPowerQuote = useMemo(() => {
    const today = new Date().toDateString();
    const hash = today.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return POWER_MOTIVATIONAL_QUOTES[hash % POWER_MOTIVATIONAL_QUOTES.length];
  }, []);

  if (goalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Goal Found</h2>
          <p className="text-gray-600 mb-6">Start by setting up your first goal!</p>
          <Button onClick={() => window.location.href = '/setup'}>
            Set Up Goal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <DailyNotification daysRemaining={daysRemaining} goalName={goal.name} />
      
      {/* Shame & Social Pressure System */}
      <ShameNotifications
        goalName={goal.name}
        daysRemaining={daysRemaining}
        currentStreak={streak?.currentStreak || 0}
        consecutiveSkips={0} // Will be connected to real data
        socialMediaMinutes={120} // Will be connected to real screen time data
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* POWER MOTIVATIONAL QUOTE - TOP PRIORITY PLACEMENT */}
        <div className={`rounded-3xl p-8 text-white border-4 mb-8 text-center transform hover:scale-[1.02] transition-all duration-300 ${
          dailyPowerQuote.intensity === 'critical' 
            ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 border-red-300 animate-pulse shadow-red-500/30 shadow-2xl' 
            : 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 border-orange-300 shadow-orange-500/30 shadow-2xl'
        }`}>
          <div className="flex justify-center items-center mb-6">
            <div className="text-6xl mr-4">⚡</div>
            <h2 className="font-black text-3xl uppercase tracking-wide">
              {dailyPowerQuote.intensity === 'critical' ? '🚨 WAKE UP CALL! 🚨' : '💪 POWER BOOST! 💪'}
            </h2>
            <div className="text-6xl ml-4">⚡</div>
          </div>
          <blockquote className="text-3xl font-black leading-tight mb-6 max-w-4xl mx-auto">
            "{dailyPowerQuote.text}"
          </blockquote>
          <cite className="block text-green-200 text-lg font-bold">- {dailyPowerQuote.author}</cite>
        </div>
        {/* Goal Header */}
        <div className="bg-gradient-primary rounded-3xl p-8 text-white mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{goal.name}</h1>
              {goal.reason && (
                <p className="text-blue-100 text-lg">{goal.reason}</p>
              )}
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <div className="text-4xl font-bold">{daysRemaining}</div>
              <div className="text-blue-200">Days Left</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Time Elapsed</span>
                    <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                <Button
                  onClick={() => markDayCompleteMutation.mutate()}
                  disabled={markDayCompleteMutation.isPending || isCompletedToday}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 px-8 rounded-2xl font-black text-xl transform hover:scale-[1.05] transition-all duration-300 shadow-2xl border-4 border-green-400 animate-pulse"
                >
                  {isCompletedToday ? '🔥 CRUSHED TODAY! UNSTOPPABLE! 🔥' : markDayCompleteMutation.isPending ? '⚡ DOMINATING...' : '💪 DOMINATE TODAY! CRUSH IT! 🚀'}
                </Button>
              </div>
            </div>

            {/* Revolutionary New Features */}
            <FocusSession goalId={currentGoalId} />
            <SocialMediaTracker goalId={currentGoalId} />
            <CountdownTimer goalDeadline={goal.deadline ? new Date(goal.deadline) : undefined} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Rewards & Gamification */}
            <RewardsGamification goalId={currentGoalId} currentStreak={streak?.currentStreak || 0} />
            
            {/* Leaderboard with Social Pressure */}
            <Leaderboard goalId={currentGoalId} currentStreak={streak?.currentStreak || 0} />



            <StreakTracker streak={streak || null} completions={completions} />

            {/* Enhanced Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Reality Check</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className={`font-bold ${
                    completions.length ? 
                      Math.round((completions.filter(c => c.completed).length / completions.length) * 100) >= 80 ? 'text-green-600' :
                      Math.round((completions.filter(c => c.completed).length / completions.length) * 100) >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    : 'text-gray-600'
                  }`}>
                    {completions.length ? Math.round((completions.filter(c => c.completed).length / completions.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Days Active</span>
                  <span className="font-bold text-primary">{completions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Goal Progress</span>
                  <span className="font-bold text-accent">{progressPercentage}%</span>
                </div>
                
                {/* Harsh Reality Check */}
                {(streak?.currentStreak || 0) < 7 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-semibold">
                      ⚠️ Only {streak?.currentStreak || 0} days consistent. Others are at 30+ days!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
