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
    <div className="min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
            Set Your Goal
          </h1>
          <p className="text-muted-foreground text-sm">Define what you want to achieve and when.</p>
        </div>

        <div className="card-premium p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="goalName" className="text-sm font-medium mb-2 block">
                  Goal Name *
                </Label>
                <Input
                  id="goalName"
                  type="text"
                  placeholder="e.g. Launch my startup, Get fit, Learn coding..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-goal-name"
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="text-sm font-medium mb-2 block">
                  Deadline *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-deadline"
                />
              </div>

              <div>
                <Label htmlFor="reason" className="text-sm font-medium mb-2 block">
                  Why is this important? (Optional)
                </Label>
                <Textarea
                  id="reason"
                  rows={4}
                  placeholder="This will help motivate you on difficult days..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full resize-none"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-reason"
                />
              </div>

              <Button
                type="submit"
                disabled={createGoalMutation.isPending}
                className="w-full btn-premium py-3 text-sm font-medium tracking-wide"
                data-testid="button-create-goal"
              >
                {createGoalMutation.isPending ? 'CREATING...' : 'CREATE GOAL'}
              </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
