import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from '@/components/countdown-timer';
import { StreakTracker } from '@/components/streak-tracker';
import { DailyNotification } from '@/components/daily-notification';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Goal, Streak, DailyCompletion } from '@shared/schema';

const motivationalQuotes = [
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
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
      toast({
        title: "Day Completed! 🎉",
        description: "Great job! Keep the momentum going.",
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

  const dailyQuote = useMemo(() => {
    const today = new Date().toDateString();
    const hash = today.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return motivationalQuotes[hash % motivationalQuotes.length];
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="w-full bg-secondary hover:bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                >
                  {isCompletedToday ? '✅ Today Completed!' : markDayCompleteMutation.isPending ? 'Marking...' : '✅ Mark Today as Done'}
                </Button>
              </div>
            </div>

            <CountdownTimer goalDeadline={goal.deadline ? new Date(goal.deadline) : undefined} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Motivational Quote */}
            <div className="bg-gradient-secondary rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4">💫 Daily Motivation</h3>
              <blockquote className="text-lg italic">
                "{dailyQuote.text}"
              </blockquote>
              <cite className="block text-green-100 mt-2 text-sm">- {dailyQuote.author}</cite>
            </div>

            <StreakTracker streak={streak || null} completions={completions} />

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-secondary">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
