import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square, Zap, Target, Brain } from 'lucide-react';

interface FocusSessionProps {
  goalId: string;
}

const FOCUS_POWER_QUOTES = [
  "🚀 MILLIONAIRES don't get distracted. FOCUS or stay BROKE!",
  "⚡ Every second of focus is a second closer to WEALTH!",
  "🔥 Your competition is FOCUSED while you're distracted!",
  "💰 RICH people focus. POOR people get distracted. CHOOSE!",
  "🎯 This session could change your ENTIRE LIFE. DON'T WASTE IT!",
  "⏰ TIME is the ONLY thing you can't buy back. FOCUS NOW!",
  "💎 Diamonds are made under PRESSURE. Focus under PRESSURE!",
  "🏆 Champions FOCUS when others quit. BE A CHAMPION!"
];

export function FocusSession({ goalId }: FocusSessionProps) {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(5); // Start with 5 minutes for ADHD-friendly
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [distractionCount, setDistractionCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showDistractionAlert, setShowDistractionAlert] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSessionMutation = useMutation({
    mutationFn: async (sessionData: { goalId: string; plannedDurationMinutes: number }) => {
      const response = await apiRequest('POST', `/api/focus-sessions/${goalId}`, {
        startTime: new Date(),
        plannedDurationMinutes: sessionData.plannedDurationMinutes,
        distractionEvents: 0,
        completionRate: 0,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      const randomQuote = FOCUS_POWER_QUOTES[Math.floor(Math.random() * FOCUS_POWER_QUOTES.length)];
      toast({
        title: "🎯 FOCUS MODE ACTIVATED!",
        description: randomQuote,
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionData: { 
      sessionId: string; 
      actualDuration: number; 
      distractions: number;
    }) => {
      const completionRate = Math.round((sessionData.actualDuration / (duration * 60)) * 100);
      const response = await apiRequest('PUT', `/api/focus-sessions/${sessionData.sessionId}`, {
        endTime: new Date(),
        actualDurationMinutes: Math.round(sessionData.actualDuration / 60),
        distractionEvents: sessionData.distractions,
        completionRate: Math.min(100, completionRate),
      });
      return response.json();
    },
    onSuccess: (data) => {
      const completionRate = data.completionRate || 0;
      toast({
        title: completionRate >= 80 ? "🔥 Beast Mode!" : completionRate >= 60 ? "💪 Good Effort!" : "😤 Try Harder!",
        description: `${completionRate}% completion rate. ${distractionCount} distractions logged.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/focus-sessions', goalId] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards', goalId] });
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: async (rewardData: { type: string; points: number; badge?: string }) => {
      const response = await apiRequest('POST', `/api/rewards/${goalId}`, rewardData);
      return response.json();
    },
  });

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    // Session completed
    if (timeLeft === 0 && isActive) {
      handleEndSession();
      
      // Reward based on performance
      const completionRate = 100;
      const points = Math.max(10, 30 - (distractionCount * 5));
      
      createRewardMutation.mutate({
        type: 'focus',
        points,
        badge: distractionCount === 0 ? 'Laser Focus' : distractionCount <= 2 ? 'Focused Mind' : 'Progress Made',
      });
    }
  }, [timeLeft, isActive]);

  const handleStartSession = () => {
    setIsActive(true);
    setTimeLeft(duration * 60);
    setDistractionCount(0);
    startSessionMutation.mutate({ goalId, plannedDurationMinutes: duration });
  };

  const handlePauseSession = () => {
    setIsActive(false);
  };

  const handleEndSession = () => {
    setIsActive(false);
    if (currentSessionId) {
      const actualDuration = (duration * 60) - timeLeft;
      endSessionMutation.mutate({
        sessionId: currentSessionId,
        actualDuration,
        distractions: distractionCount,
      });
    }
    setCurrentSessionId(null);
    setTimeLeft(duration * 60);
  };

  const handleDistraction = () => {
    setDistractionCount(prev => prev + 1);
    setShowDistractionAlert(true);
    setTimeout(() => setShowDistractionAlert(false), 2000);
    
    toast({
      title: "📱 DISTRACTION DETECTED!",
      description: "Focus! Every distraction costs you progress.",
      variant: "destructive",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const focusScore = Math.max(0, 100 - (distractionCount * 20));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center mb-2">
          <Brain className="mr-2 text-blue-500" />
          Laser Focus Mode
        </h3>
        <p className="text-gray-600 text-sm">Turn distractions into progress with micro-sessions</p>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold mb-4 ${
          isActive ? 'text-blue-600' : 'text-gray-400'
        }`}>
          {formatTime(timeLeft)}
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-3 mb-4"
        />
        
        <div className="flex justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <Target className="mr-1 text-green-500" size={16} />
            <span>Focus Score: <strong className={
              focusScore >= 80 ? 'text-green-600' : 
              focusScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }>{focusScore}%</strong></span>
          </div>
          <div className="flex items-center">
            <Zap className="mr-1 text-red-500" size={16} />
            <span>Distractions: <strong className="text-red-600">{distractionCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Duration Selection */}
      {!isActive && (
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Session Duration (ADHD-Friendly):
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 15, 25, 45].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                  duration === mins
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {mins}min
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isActive ? (
          <Button
            onClick={handleStartSession}
            disabled={startSessionMutation.isPending}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-bold"
          >
            <Play className="mr-2" size={16} />
            START FOCUS
          </Button>
        ) : (
          <>
            <Button
              onClick={handlePauseSession}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3"
            >
              <Pause className="mr-2" size={16} />
              Pause
            </Button>
            <Button
              onClick={handleEndSession}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
            >
              <Square className="mr-2" size={16} />
              End
            </Button>
          </>
        )}
      </div>

      {/* Distraction Button */}
      {isActive && (
        <div className="text-center mb-4">
          <Button
            onClick={handleDistraction}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            📱 I Got Distracted
          </Button>
          <p className="text-xs text-gray-500 mt-1">Honesty builds self-awareness</p>
        </div>
      )}

      {/* Distraction Alert */}
      {showDistractionAlert && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-center animate-pulse">
          <div className="text-2xl mb-2">⚠️ FOCUS!</div>
          <div>Get back to your goal NOW!</div>
        </div>
      )}

      {/* Motivational Messages */}
      {isActive && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <div className="text-center">
            {timeLeft > (duration * 60 * 0.75) && (
              <p className="text-blue-700 font-semibold">🔥 You're in the zone! Keep going!</p>
            )}
            {timeLeft <= (duration * 60 * 0.75) && timeLeft > (duration * 60 * 0.5) && (
              <p className="text-purple-700 font-semibold">💪 Halfway there! Don't give up now!</p>
            )}
            {timeLeft <= (duration * 60 * 0.5) && timeLeft > (duration * 60 * 0.25) && (
              <p className="text-green-700 font-semibold">🎯 Almost done! Push through!</p>
            )}
            {timeLeft <= (duration * 60 * 0.25) && timeLeft > 0 && (
              <p className="text-orange-700 font-semibold">🚀 Final sprint! You've got this!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}