import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface SocialMediaTrackerProps {
  goalId: string;
}

const SOCIAL_MEDIA_APPS = [
  { name: 'Instagram', icon: '📸', color: 'bg-pink-500' },
  { name: 'TikTok', icon: '🎵', color: 'bg-black' },
  { name: 'Twitter/X', icon: '🐦', color: 'bg-blue-500' },
  { name: 'YouTube', icon: '📺', color: 'bg-red-500' },
  { name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
  { name: 'Snapchat', icon: '👻', color: 'bg-yellow-400' },
];

export function SocialMediaTracker({ goalId }: SocialMediaTrackerProps) {
  const [selectedApp, setSelectedApp] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todayScreenTime = 0 } = useQuery({
    queryKey: ['/api/screen-time/today', goalId],
    enabled: !!goalId,
  });

  const { data: shameMetrics } = useQuery({
    queryKey: ['/api/shame-metrics', goalId],
    enabled: !!goalId,
  });

  const addScreenTimeMutation = useMutation({
    mutationFn: async (data: { app: string; minutes: number }) => {
      const response = await apiRequest('POST', `/api/screen-time/${goalId}`, {
        appName: data.app,
        timeSpentMinutes: data.minutes,
        date: new Date(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Screen Time Logged",
        description: "Awareness is the first step to breaking the addiction.",
        variant: "destructive",
      });
      setSelectedApp('');
      setTimeSpent('');
      queryClient.invalidateQueries({ queryKey: ['/api/screen-time/today', goalId] });
      queryClient.invalidateQueries({ queryKey: ['/api/shame-metrics', goalId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedApp && timeSpent) {
      addScreenTimeMutation.mutate({
        app: selectedApp,
        minutes: parseInt(timeSpent),
      });
    }
  };

  const opportunityCost = Math.floor(todayScreenTime / 30); // 30 min = 1 goal session
  const shameLevel = todayScreenTime > 120 ? 'high' : todayScreenTime > 60 ? 'medium' : 'low';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Smartphone className="mr-2 text-red-500" />
          Social Media Reality Check
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          shameLevel === 'high' ? 'bg-red-500 text-white' :
          shameLevel === 'medium' ? 'bg-yellow-500 text-white' :
          'bg-green-500 text-white'
        }`}>
          {shameLevel.toUpperCase()} USAGE
        </div>
      </div>

      {/* Today's Damage */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-800 font-semibold">Today's Time Wasted:</span>
          <span className="text-2xl font-bold text-red-600">{todayScreenTime}min</span>
        </div>
        
        <div className="space-y-2 text-sm text-red-700">
          <div className="flex justify-between">
            <span>Opportunity Cost:</span>
            <span className="font-semibold">{opportunityCost} goal sessions lost</span>
          </div>
          <div className="flex justify-between">
            <span>Weekly Projection:</span>
            <span className="font-semibold">{(todayScreenTime * 7)} minutes wasted</span>
          </div>
        </div>

        {todayScreenTime > 0 && (
          <div className="mt-3 p-2 bg-red-100 rounded-lg">
            <p className="text-xs text-red-800 font-medium">
              💀 <strong>HARSH TRUTH:</strong> You could have made {Math.floor(todayScreenTime / 15)} units of progress on your goal instead of scrolling.
            </p>
          </div>
        )}
      </div>

      {/* Log New Screen Time */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Confess Your Addiction:</label>
          <div className="grid grid-cols-3 gap-2">
            {SOCIAL_MEDIA_APPS.map((app) => (
              <button
                key={app.name}
                type="button"
                onClick={() => setSelectedApp(app.name)}
                className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                  selectedApp === app.name
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div>{app.icon}</div>
                <div>{app.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Minutes wasted"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            className="flex-1"
            min="1"
            max="1440"
          />
          <Button
            type="submit"
            disabled={!selectedApp || !timeSpent || addScreenTimeMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white px-6"
          >
            {addScreenTimeMutation.isPending ? 'Logging...' : 'Confess'}
          </Button>
        </div>
      </form>

      {/* Shame Statistics */}
      {shameMetrics && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 Your Addiction Stats</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{shameMetrics.consecutiveSkips || 0}</div>
              <div className="text-xs text-yellow-700">Days Skipped in a Row</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{shameMetrics.opportunityCostHours || 0}h</div>
              <div className="text-xs text-orange-700">Progress Hours Lost</div>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Shame */}
      {todayScreenTime > 90 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl">
          <div className="flex items-center">
            <AlertTriangle className="mr-2" size={16} />
            <p className="text-sm font-semibold">
              WAKE UP! While you were scrolling, someone else got closer to their dreams.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}