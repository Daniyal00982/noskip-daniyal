import { useState, useEffect, useMemo } from 'react';
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
import SmartAnalytics from '@/components/smart-analytics';
import HabitSuggestions from '@/components/habit-suggestions';
import TimeTracker from '@/components/time-tracker';
import GoalBreakdown from '@/components/goal-breakdown';
import AICoach from '@/components/ai-coach';
import FinancialStakes from '@/components/financial-stakes';
import TeamGoals from '@/components/team-goals';
import VoiceCommands from '@/components/voice-commands';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Goal, Streak, DailyCompletion } from '@shared/schema';

const POWER_MOTIVATIONAL_QUOTES = [
  { text: "Time is the scarcest resource. Unless it is managed, nothing else can be managed.", author: "Peter Drucker", intensity: "focused" },
  { text: "The way to get things done is not to mind who gets the credit for doing them.", author: "Benjamin Jowett", intensity: "focused" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", intensity: "resilient" },
  { text: "The future depends on what we do in the present.", author: "Mahatma Gandhi", intensity: "present" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle", intensity: "habit" },
  { text: "Excellence is never an accident. It is the result of high intention, sincere effort, and skilled execution.", author: "Aristotle", intensity: "excellence" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", intensity: "action" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", intensity: "discipline" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", intensity: "focus" },
  { text: "The successful warrior is the average person with laser-like focus.", author: "Bruce Lee", intensity: "focus" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", intensity: "hope" },
  { text: "Progress, not perfection, is the goal.", author: "Unknown", intensity: "progress" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", intensity: "consistency" },
  { text: "The compound effect of small, consistent actions is extraordinary.", author: "Darren Hardy", integrity: "compound" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", intensity: "repetition" },
  { text: "Champions don't become champions in the ring. They become champions in their training.", author: "Muhammad Ali", intensity: "preparation" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson", intensity: "extra" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", intensity: "persistence" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes", intensity: "growth" },
  { text: "What we plant in the soil of contemplation, we shall reap in the harvest of action.", author: "Meister Eckhart", intensity: "contemplation" }
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
  
  // Dynamic quote that changes every 3 minutes
  const [currentQuote, setCurrentQuote] = useState(POWER_MOTIVATIONAL_QUOTES[0]);
  
  useEffect(() => {
    // Initial quote based on current time
    const getQuoteIndex = () => {
      const now = new Date();
      const minutesSinceStart = Math.floor(now.getMinutes() / 3); // Changes every 3 minutes
      const dailyOffset = now.getDate() + now.getMonth() * 31; // Different quotes for different days
      return (minutesSinceStart + dailyOffset) % POWER_MOTIVATIONAL_QUOTES.length;
    };
    
    setCurrentQuote(POWER_MOTIVATIONAL_QUOTES[getQuoteIndex()]);
    
    // Update quote every 3 minutes
    const interval = setInterval(() => {
      setCurrentQuote(POWER_MOTIVATIONAL_QUOTES[getQuoteIndex()]);
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

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



  if (goalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center card-minimal p-16 max-w-2xl">
          <h2 className="text-3xl font-bold text-gold mb-4">Create Your Goal</h2>
          <p className="text-muted-foreground mb-8">Set a clear objective and start making progress.</p>
          <Button 
            onClick={() => window.location.href = '/setup'}
            className="btn-premium px-8 py-3"
            data-testid="button-setup-goal"
          >
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <DailyNotification daysRemaining={daysRemaining} goalName={goal.name} />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Dynamic Quote */}
        <div className="card-premium p-6 mb-6 text-center">
          <blockquote className="text-base font-medium leading-relaxed mb-3 text-foreground">
            "{currentQuote.text}"
          </blockquote>
          <cite className="text-muted-foreground text-xs tracking-wide">— {currentQuote.author}</cite>
        </div>
        {/* Goal Header */}
        <div className="card-premium p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{goal.name}</h1>
              {goal.reason && (
                <p className="text-muted-foreground text-sm">{goal.reason}</p>
              )}
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <div className="text-2xl font-bold text-foreground">{daysRemaining}</div>
              <div className="text-muted-foreground text-xs tracking-wide">DAYS LEFT</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <div className="card-premium p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 tracking-tight">Progress</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground tracking-wide">TIME ELAPSED</span>
                    <span className="text-xs font-semibold text-foreground">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1" />
                </div>

                <Button
                  onClick={() => markDayCompleteMutation.mutate()}
                  disabled={markDayCompleteMutation.isPending || isCompletedToday}
                  className="w-full btn-premium py-3 text-sm font-medium tracking-wide"
                  data-testid="button-complete-day"
                >
                  {isCompletedToday ? 'COMPLETED TODAY' : markDayCompleteMutation.isPending ? 'COMPLETING...' : 'MARK COMPLETE'}
                </Button>
              </div>
            </div>

            {/* Smart Features */}
            <TimeTracker goalId={currentGoalId} goalName={goal.name} />
            <SmartAnalytics 
              goalId={currentGoalId} 
              currentStreak={streak?.currentStreak || 0}
              completions={completions || []}
              daysRemaining={daysRemaining}
            />
            
            {/* AI Coach */}
            <AICoach 
              goalName={goal.name}
              currentStreak={streak?.currentStreak || 0}
              completions={completions || []}
              daysRemaining={daysRemaining}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Goal Breakdown */}
            <GoalBreakdown 
              goalName={goal.name}
              deadline={new Date(goal.deadline)}
              daysRemaining={daysRemaining}
            />
            
            {/* Smart Habit Suggestions */}
            <HabitSuggestions 
              goalName={goal.name}
              currentStreak={streak?.currentStreak || 0}
              completions={completions || []}
            />
            
            {/* Financial Stakes */}
            <FinancialStakes 
              goalId={currentGoalId}
              goalName={goal.name}
              daysRemaining={daysRemaining}
            />
            
            {/* Team Goals */}
            <TeamGoals 
              goalId={currentGoalId}
              goalName={goal.name}
              isOwner={true}
            />
            
            {/* Voice Commands */}
            <VoiceCommands 
              goalId={currentGoalId}
              onMarkComplete={() => markDayCompleteMutation.mutate()}
              onAddNote={(note) => console.log('Note:', note)}
            />
            
            <StreakTracker streak={streak || null} completions={completions} />

            {/* Stats */}
            <div className="card-premium p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 tracking-tight">Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground tracking-wide">SUCCESS RATE</span>
                  <span className="font-medium text-foreground">
                    {completions.length ? Math.round((completions.filter(c => c.completed).length / completions.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground tracking-wide">DAYS ACTIVE</span>
                  <span className="font-medium text-foreground">{completions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground tracking-wide">PROGRESS</span>
                  <span className="font-medium text-foreground">{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
