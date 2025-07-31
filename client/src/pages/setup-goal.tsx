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
import { Target, Calendar, Heart, Sparkles, Zap, ArrowRight, Github, Linkedin } from 'lucide-react';

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
    <div className="min-h-screen relative overflow-hidden">
      {/* ASMR Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="fixed inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-purple-900/20" />
      
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 journal-glass rounded-2xl mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Welcome to Noskip
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-lg mx-auto">
              Transform your ambitions into reality with AI-powered tracking and mindful planning
            </p>
          </div>

          {/* Main Form */}
          <div className="journal-glass p-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Goal Name */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 journal-glass rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <Label htmlFor="goalName" className="text-sm font-medium text-white/90">
                    WHAT DO YOU WANT TO ACHIEVE? *
                  </Label>
                </div>
                <Input
                  id="goalName"
                  type="text"
                  placeholder="e.g. Launch my startup, Master programming, Get healthy..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="journal-glass text-white placeholder:text-white/40 border-0 bg-transparent p-4 text-lg h-14"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-goal-name"
                />
                <p className="text-white/60 text-sm ml-11">
                  Be specific and inspiring. This will be your north star.
                </p>
              </div>

              {/* Deadline */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 journal-glass rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <Label htmlFor="deadline" className="text-sm font-medium text-white/90">
                    WHEN WILL YOU COMPLETE IT? *
                  </Label>
                </div>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="journal-glass text-white border-0 bg-transparent p-4 text-lg h-14"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-deadline"
                />
                <p className="text-white/60 text-sm ml-11">
                  Set a realistic but challenging deadline to create urgency.
                </p>
              </div>

              {/* Motivation */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 journal-glass rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <Label htmlFor="reason" className="text-sm font-medium text-white/90">
                    WHY IS THIS IMPORTANT TO YOU?
                  </Label>
                </div>
                <Textarea
                  id="reason"
                  rows={4}
                  placeholder="Share your deeper motivation... What will achieving this goal mean for your life? How will it make you feel? What doors will it open?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="journal-glass text-white placeholder:text-white/40 border-0 bg-transparent p-4 text-base resize-none"
                  disabled={createGoalMutation.isPending}
                  data-testid="input-reason"
                />
                <p className="text-white/60 text-sm ml-11">
                  Your 'why' will fuel you through tough moments. Be honest and emotional.
                </p>
              </div>

              {/* Smart Features Preview */}
              <div className="journal-glass p-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white/90">SMART FEATURES INCLUDED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>AI-powered activity categorization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Smart productivity predictions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span>Goal integration insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>Personalized recommendations</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createGoalMutation.isPending || !goalName.trim() || !deadline}
                className="w-full h-14 text-lg font-medium tracking-wide journal-glass text-white border-0 hover:bg-white/10 transition-all duration-500 flex items-center justify-center gap-3 group"
                data-testid="button-create-goal"
              >
                {createGoalMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    CREATING YOUR GOAL...
                  </>
                ) : (
                  <>
                    START YOUR JOURNEY
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Developer & Quote */}
          <div className="text-center mt-8 space-y-4">
            <blockquote className="text-white/80 text-lg italic leading-relaxed">
              "A goal is a dream with a deadline."
            </blockquote>
            <cite className="text-white/60 text-sm">— Napoleon Hill</cite>
            
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
              <span className="text-white/60 text-sm">Built with ❤️ by Daniyal</span>
              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com/Daniyal00982" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/ansaridaniyal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
