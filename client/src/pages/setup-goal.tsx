import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function SetupGoal() {
  const [, setLocation] = useLocation();
  const [goalName, setGoalName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [reason, setReason] = useState('');
  const [, setCurrentGoalId] = useLocalStorage('currentGoalId', '');
  const { toast } = useToast();

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: { name: string; deadline: Date; reason?: string }) => {
      const response = await apiRequest('POST', '/api/goals', goalData);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentGoalId(data.id);
      toast({
        title: "🚀 GOAL LOCKED IN! UNSTOPPABLE MODE ACTIVATED!",
        description: "Your empire starts NOW! Time to DOMINATE and make MILLIONS! 💪",
      });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      console.error('Goal creation error:', error);
      toast({
        title: "Goal Creation Failed",
        description: error?.message || "Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalName.trim() || !deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in your goal name and deadline.",
        variant: "destructive",
      });
      return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      toast({
        title: "Invalid Deadline",
        description: "Your deadline must be in the future.",
        variant: "destructive",
      });
      return;
    }

    console.log('Creating goal with data:', {
      name: goalName.trim(),
      deadline: deadlineDate,
      reason: reason.trim() || undefined,
    });
    
    createGoalMutation.mutate({
      name: goalName.trim(),
      deadline: deadlineDate,
      reason: reason.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-premium py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="text-8xl mb-8 animate-luxury-pulse">👑</div>
          <h1 className="text-5xl sm:text-7xl font-black text-gradient-luxury mb-8 uppercase tracking-wide">
            BUILD YOUR <span className="text-gradient-gold">EMPIRE</span>
          </h1>
          <p className="text-2xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed">Every billionaire started with one crystal-clear goal. What's your path to greatness?</p>
        </div>

        <div className="bg-gradient-card glass-effect rounded-3xl premium-shadow border border-white/10">
          <div className="p-12 sm:p-16">
            <form onSubmit={handleSubmit} className="space-y-12">
              <div>
                <Label htmlFor="goalName" className="text-xl font-bold text-gradient-luxury mb-6 block uppercase tracking-wide flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  EMPIRE MISSION *
                </Label>
                <Input
                  id="goalName"
                  type="text"
                  placeholder="Launch billion-dollar startup, Build my empire, Master the game..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="px-8 py-6 text-xl rounded-2xl bg-black/20 border-white/20 text-white placeholder-gray-400 font-medium"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-goal-name"
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="text-xl font-bold text-gradient-luxury mb-6 block uppercase tracking-wide flex items-center">
                  <span className="text-2xl mr-3">⏰</span>
                  EMPIRE DEADLINE *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="px-8 py-6 text-xl rounded-2xl bg-black/20 border-white/20 text-white font-medium"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-deadline"
                />
              </div>

              <div>
                <Label htmlFor="reason" className="text-xl font-bold text-gradient-luxury mb-6 block uppercase tracking-wide flex items-center">
                  <span className="text-2xl mr-3">🔥</span>
                  YOUR WHY (OPTIONAL)
                </Label>
                <Textarea
                  id="reason"
                  rows={6}
                  placeholder="What drives you? Why do you DESERVE this success? What will achieving this change about your life?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="px-8 py-6 text-lg rounded-2xl resize-none bg-black/20 border-white/20 text-white placeholder-gray-400 font-medium"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-reason"
                />
              </div>

              <Button
                type="submit"
                disabled={createGoalMutation.isPending}
                className="w-full btn-luxury py-8 px-12 rounded-3xl text-2xl font-black uppercase tracking-wider transform hover:scale-[1.02] transition-all duration-300 luxury-glow"
                data-testid="button-create-goal"
              >
                {createGoalMutation.isPending ? '👑 BUILDING EMPIRE...' : '💎 BUILD MY EMPIRE NOW 💎'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
