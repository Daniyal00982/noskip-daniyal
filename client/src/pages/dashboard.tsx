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
      <div className="min-h-screen flex items-center justify-center bg-gradient-premium">
        <div className="text-center glass-effect p-12 rounded-3xl premium-shadow">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6 luxury-glow"></div>
          <p className="text-xl text-gray-300 font-medium">Loading your empire...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-premium px-4">
        <div className="text-center glass-effect p-16 rounded-3xl premium-shadow max-w-2xl">
          <div className="text-8xl mb-8 animate-luxury-pulse">💎</div>
          <h2 className="text-4xl font-bold text-gradient-luxury mb-6">BUILD YOUR EMPIRE</h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">Every billionaire started with one goal. What's yours going to be?</p>
          <Button 
            onClick={() => window.location.href = '/setup'}
            className="btn-luxury text-xl px-12 py-6 rounded-2xl font-bold uppercase tracking-wider"
            data-testid="button-setup-goal"
          >
            🚀 CREATE FIRST GOAL
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
        {/* LUXURY MOTIVATIONAL QUOTE */}
        <div className={`bg-gradient-card glass-effect rounded-3xl p-12 text-white border border-white/20 mb-12 text-center transform hover:scale-[1.02] transition-all duration-300 premium-shadow ${
          dailyPowerQuote.intensity === 'critical' 
            ? 'luxury-glow animate-luxury-pulse' 
            : 'gold-glow'
        }`}>
          <div className="flex justify-center items-center mb-8">
            <div className="text-8xl mr-6 animate-bounce">💎</div>
            <h2 className="font-black text-4xl uppercase tracking-wider text-gradient-luxury">
              {dailyPowerQuote.intensity === 'critical' ? 'ELITE MINDSET' : 'LUXURY MINDSET'}
            </h2>
            <div className="text-8xl ml-6 animate-bounce">💎</div>
          </div>
          <blockquote className="text-3xl font-bold leading-tight mb-8 max-w-5xl mx-auto text-gray-200">
            "{dailyPowerQuote.text}"
          </blockquote>
          <cite className="block text-gradient-gold text-xl font-bold uppercase tracking-wide">- {dailyPowerQuote.author}</cite>
        </div>
        {/* Elite Goal Header */}
        <div className="bg-gradient-luxury rounded-3xl p-12 text-black mb-12 premium-shadow border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">🏆</div>
                <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wide">{goal.name}</h1>
              </div>
              {goal.reason && (
                <p className="text-black/80 text-xl font-medium italic">{goal.reason}</p>
              )}
            </div>
            <div className="mt-6 sm:mt-0 text-right bg-black/20 rounded-2xl p-6">
              <div className="text-5xl font-black text-white">{daysRemaining}</div>
              <div className="text-white/80 text-sm uppercase tracking-wider font-bold">DAYS TO EMPIRE</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Elite Progress Section */}
            <div className="bg-gradient-card glass-effect rounded-3xl p-10 premium-shadow border border-white/10">
              <div className="flex items-center mb-8">
                <div className="text-3xl mr-4">📊</div>
                <h2 className="text-3xl font-bold text-gradient-luxury uppercase tracking-wide">EMPIRE PROGRESS</h2>
              </div>
              
              <div className="space-y-8">
                <div className="bg-black/20 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-300 uppercase tracking-wide">Mission Progress</span>
                    <span className="text-2xl font-black text-gradient-gold">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-4 bg-black/30" />
                </div>

                <Button
                  onClick={() => markDayCompleteMutation.mutate()}
                  disabled={markDayCompleteMutation.isPending || isCompletedToday}
                  className="w-full btn-luxury py-8 px-12 rounded-3xl text-2xl font-black uppercase tracking-wider transform hover:scale-[1.02] transition-all duration-300 luxury-glow"
                  data-testid="button-complete-day"
                >
                  {isCompletedToday ? '💎 EMPIRE EXPANDED TODAY! 💎' : markDayCompleteMutation.isPending ? '⚡ BUILDING EMPIRE...' : '🚀 EXPAND EMPIRE TODAY! 🚀'}
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
