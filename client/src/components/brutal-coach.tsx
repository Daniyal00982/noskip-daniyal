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
      <div className="bg-gradient-card glass-effect rounded-3xl p-10 premium-shadow border border-white/10">
        <div className="flex items-center mb-8">
          <span className="text-3xl mr-4">🏆</span>
          <h2 className="text-2xl font-bold text-gradient-luxury uppercase tracking-wide">ELITE COACH</h2>
        </div>
        
        <div className="space-y-6">
          {lastResponse && (
            <div className="bg-gradient-luxury p-6 rounded-2xl border border-white/20">
              <p className="text-black font-bold text-lg italic">"{lastResponse}"</p>
              <div className="text-sm text-black/80 mt-3 font-semibold uppercase tracking-wide">- YOUR ELITE COACH</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your empire vision..."
              className="flex-1 bg-black/20 border-white/20 text-white placeholder-gray-400 py-4 px-6 rounded-2xl font-medium"
              disabled={coachMutation.isPending}
              data-testid="input-coach-message"
            />
            <Button 
              type="submit"
              disabled={!message.trim() || coachMutation.isPending}
              className="btn-luxury px-8 font-bold uppercase tracking-wide"
              data-testid="button-ask-coach"
            >
              {coachMutation.isPending ? 'COACHING...' : 'GET ELITE ADVICE'}
            </Button>
          </form>
          <p className="text-sm text-gray-400 font-medium">Elite AI coaching for empire builders</p>
        </div>
      </div>
    );
  }

  // Full coach interface for dedicated page
  return (
    <div className="bg-gradient-card glass-effect rounded-3xl premium-shadow p-12 border border-white/10">
      <div className="flex items-center mb-10">
        <span className="text-5xl mr-6">👑</span>
        <h1 className="text-4xl font-black text-gradient-luxury uppercase tracking-wide">ELITE COACHING SESSION</h1>
      </div>

      <div className="space-y-8 mb-12 max-h-96 overflow-y-auto">
        {lastResponse && (
          <div className="flex justify-start">
            <div className="bg-gradient-luxury text-black rounded-3xl rounded-bl-none p-8 max-w-2xl">
              <p className="font-bold text-xl mb-2 uppercase tracking-wide">Your Elite Coach:</p>
              <p className="text-lg font-medium leading-relaxed">{lastResponse}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/20 pt-8">
        <form onSubmit={handleSubmit} className="flex space-x-6">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your empire vision and challenges..."
            className="flex-1 px-8 py-6 text-xl rounded-3xl bg-black/20 border-white/20 text-white placeholder-gray-400 font-medium"
            disabled={coachMutation.isPending}
            data-testid="input-coach-message-full"
          />
          <Button
            type="submit"
            disabled={!message.trim() || coachMutation.isPending}
            className="btn-luxury px-12 py-6 rounded-3xl text-xl font-black uppercase tracking-wider luxury-glow"
            data-testid="button-send-message"
          >
            {coachMutation.isPending ? '👑 COACHING...' : '💎 GET ELITE ADVICE'}
          </Button>
        </form>
        <p className="text-lg text-gray-400 mt-4 font-medium text-center">Powered by AI for elite empire builders</p>
      </div>
    </div>
  );
}
