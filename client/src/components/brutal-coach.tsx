import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BrutalCoachProps {
  goalId: string;
  compact?: boolean;
}

export function BrutalCoach({ goalId, compact = false }: BrutalCoachProps) {
  const [message, setMessage] = useState('');
  const [lastResponse, setLastResponse] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const coachMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('POST', `/api/coaching/${goalId}`, {
        userMessage,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setLastResponse(data.coachResponse);
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/coaching', goalId] });
    },
    onError: () => {
      toast({
        title: "Coach Unavailable",
        description: "Couldn't reach your coach right now, but that's no excuse to stop working!",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      coachMutation.mutate(message.trim());
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">💪 Brutal Coach</h2>
        
        <div className="space-y-4">
          {lastResponse && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
              <p className="text-red-800 font-medium italic">"{lastResponse}"</p>
              <div className="text-sm text-red-600 mt-2">- Your Brutal Coach</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How are you feeling today?"
              className="flex-1"
              disabled={coachMutation.isPending}
            />
            <Button 
              type="submit"
              disabled={!message.trim() || coachMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white px-6 font-semibold"
            >
              {coachMutation.isPending ? 'Coaching...' : 'Ask Coach'}
            </Button>
          </form>
          <p className="text-xs text-gray-500">Get tough love motivation powered by AI</p>
        </div>
      </div>
    );
  }

  // Full coach interface for dedicated page
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="space-y-6 mb-8 max-h-96 overflow-y-auto">
        {lastResponse && (
          <div className="flex justify-start">
            <div className="bg-red-500 text-white rounded-2xl rounded-bl-none p-4 max-w-xs">
              <p className="font-semibold">Your Brutal Coach says:</p>
              <p className="mt-1">{lastResponse}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell your coach how you're really feeling..."
            className="flex-1 px-6 py-4 text-lg rounded-2xl"
            disabled={coachMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!message.trim() || coachMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
          >
            {coachMutation.isPending ? '⏳' : '✈️'}
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-2">⚡ Powered by AI for maximum motivation</p>
      </div>
    </div>
  );
}
