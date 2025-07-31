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
        title: "Goal Created!",
        description: "Your journey starts now. Let's make it happen!",
      });
      setLocation('/dashboard');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
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

    createGoalMutation.mutate({
      name: goalName.trim(),
      deadline: deadlineDate,
      reason: reason.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            What's Your <span className="text-primary">Big Goal</span>?
          </h1>
          <p className="text-xl text-gray-600">Define your mission and start your transformation journey today.</p>
        </div>

        <Card className="rounded-3xl shadow-xl">
          <CardContent className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <Label htmlFor="goalName" className="text-sm font-semibold text-gray-900 mb-3 block">
                  Goal Name *
                </Label>
                <Input
                  id="goalName"
                  type="text"
                  placeholder="e.g. Launch my startup, Get fit, Learn coding..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="px-4 py-4 text-lg rounded-xl"
                  disabled={createGoalMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="text-sm font-semibold text-gray-900 mb-3 block">
                  Deadline *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="px-4 py-4 text-lg rounded-xl"
                  disabled={createGoalMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="reason" className="text-sm font-semibold text-gray-900 mb-3 block">
                  Why is this important? (Optional)
                </Label>
                <Textarea
                  id="reason"
                  rows={4}
                  placeholder="This will fuel your motivation on tough days..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="px-4 py-4 text-lg rounded-xl resize-none"
                  disabled={createGoalMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                disabled={createGoalMutation.isPending}
                className="w-full bg-gradient-primary text-white py-4 px-8 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              >
                {createGoalMutation.isPending ? 'Creating Your Journey...' : '🚀 Start My Journey'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
