import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Zap, Battery, Target, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';

interface HourlyEntry {
  hour: number;
  activity: string;
  feeling: 'great' | 'good' | 'okay' | 'bad';
  productivity: number;
  energy: number;
  category: 'work' | 'personal' | 'health' | 'learning' | 'social' | 'break';
}

interface JournalAnalyticsProps {
  goalId: string;
  goalName: string;
}

export default function JournalAnalytics({ goalId, goalName }: JournalAnalyticsProps) {
  const [weeklyData, setWeeklyData] = useState<HourlyEntry[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    // Load journal data for the past week
    const loadWeeklyData = () => {
      const allEntries: HourlyEntry[] = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        const savedHourly = localStorage.getItem(`journal_${goalId}_${dateKey}_hourly`);
        if (savedHourly) {
          const dayEntries = JSON.parse(savedHourly);
          allEntries.push(...dayEntries);
        }
      }
      setWeeklyData(allEntries);
    };

    loadWeeklyData();
  }, [goalId]);

  // Smart AI-powered activity categorization
  const categorizeMtActivity = (activity: string): 'work' | 'personal' | 'health' | 'learning' | 'social' | 'break' => {
    const activityLower = activity.toLowerCase();
    
    // Work patterns
    if (activityLower.includes('meeting') || activityLower.includes('project') || 
        activityLower.includes('coding') || activityLower.includes('email') ||
        activityLower.includes('presentation') || activityLower.includes('java') ||
        activityLower.includes('programming') || activityLower.includes('development')) {
      return 'work';
    }
    
    // Learning patterns
    if (activityLower.includes('reading') || activityLower.includes('study') ||
        activityLower.includes('tutorial') || activityLower.includes('course') ||
        activityLower.includes('learn') || activityLower.includes('practice')) {
      return 'learning';
    }
    
    // Health patterns
    if (activityLower.includes('exercise') || activityLower.includes('gym') ||
        activityLower.includes('walk') || activityLower.includes('run') ||
        activityLower.includes('yoga') || activityLower.includes('meditation')) {
      return 'health';
    }
    
    // Social patterns
    if (activityLower.includes('call') || activityLower.includes('chat') ||
        activityLower.includes('friend') || activityLower.includes('family') ||
        activityLower.includes('social') || activityLower.includes('party')) {
      return 'social';
    }
    
    // Break patterns
    if (activityLower.includes('break') || activityLower.includes('lunch') ||
        activityLower.includes('rest') || activityLower.includes('nap') ||
        activityLower.includes('relax') || activityLower.includes('netflix')) {
      return 'break';
    }
    
    return 'personal';
  };

  const analytics = useMemo(() => {
    if (weeklyData.length === 0) return null;

    // Productivity patterns by hour
    const hourlyProductivity = Array.from({ length: 24 }, (_, hour) => {
      const entries = weeklyData.filter(entry => entry.hour === hour);
      const avgProductivity = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.productivity, 0) / entries.length
        : 0;
      return { hour, productivity: avgProductivity, count: entries.length };
    });

    // Peak productivity hours
    const peakHours = hourlyProductivity
      .filter(h => h.count > 0)
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 3);

    // Category breakdown
    const categoryStats = weeklyData.reduce((acc, entry) => {
      const category = entry.category || categorizeMtActivity(entry.activity);
      if (!acc[category]) {
        acc[category] = { count: 0, totalProductivity: 0, totalTime: 0 };
      }
      acc[category].count++;
      acc[category].totalProductivity += entry.productivity;
      acc[category].totalTime += 1; // 1 hour per entry
      return acc;
    }, {} as Record<string, { count: number; totalProductivity: number; totalTime: number }>);

    // Goal-related activities
    const goalKeywords = goalName.toLowerCase().split(' ');
    const goalRelatedEntries = weeklyData.filter(entry => {
      const activity = entry.activity.toLowerCase();
      return goalKeywords.some(keyword => activity.includes(keyword)) ||
             entry.category === 'learning' || entry.category === 'work';
    });

    const goalTimeSpent = goalRelatedEntries.length;
    const goalProductivity = goalRelatedEntries.length > 0
      ? goalRelatedEntries.reduce((sum, entry) => sum + entry.productivity, 0) / goalRelatedEntries.length
      : 0;

    // Energy patterns
    const avgEnergyByHour = hourlyProductivity.map(h => {
      const entries = weeklyData.filter(entry => entry.hour === h.hour);
      const avgEnergy = entries.length > 0
        ? entries.reduce((sum, entry) => sum + entry.energy, 0) / entries.length
        : 0;
      return { hour: h.hour, energy: avgEnergy };
    });

    // Mood analysis
    const moodDistribution = weeklyData.reduce((acc, entry) => {
      acc[entry.feeling] = (acc[entry.feeling] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const positiveHours = weeklyData.filter(entry => entry.feeling === 'great' || entry.feeling === 'good').length;
    const moodScore = (positiveHours / weeklyData.length) * 100;

    return {
      hourlyProductivity,
      peakHours,
      categoryStats,
      goalTimeSpent,
      goalProductivity,
      avgEnergyByHour,
      moodDistribution,
      moodScore,
      totalHours: weeklyData.length
    };
  }, [weeklyData, goalName]);

  if (!analytics) {
    return (
      <div className="journal-glass p-6">
        <div className="text-center text-white/60">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Start logging your hours to see analytics</p>
        </div>
      </div>
    );
  }

  const getHourDisplay = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return <Target className="w-4 h-4" />;
      case 'learning': return <BarChart3 className="w-4 h-4" />;
      case 'health': return <Activity className="w-4 h-4" />;
      case 'social': return <Clock className="w-4 h-4" />;
      case 'break': return <Battery className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="journal-glass p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 journal-glass rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Smart Analytics</h3>
            <p className="text-white/60 text-sm">AI-powered insights from your journal</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className="capitalize text-xs"
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {/* Goal Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="journal-glass p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{analytics.goalTimeSpent}h</div>
          <div className="text-white/80 text-sm">Goal-Related Time</div>
          <div className="text-white/60 text-xs mt-1">This week</div>
        </div>
        <div className="journal-glass p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">{analytics.goalProductivity.toFixed(1)}</div>
          <div className="text-white/80 text-sm">Goal Productivity</div>
          <div className="text-white/60 text-xs mt-1">Average score</div>
        </div>
        <div className="journal-glass p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">{Math.round(analytics.moodScore)}%</div>
          <div className="text-white/80 text-sm">Positive Mood</div>
          <div className="text-white/60 text-xs mt-1">While working on goal</div>
        </div>
      </div>

      {/* Peak Performance Hours */}
      <div className="journal-glass p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Peak Performance Hours
        </h4>
        <div className="space-y-2">
          {analytics.peakHours.map((peak, index) => (
            <div key={peak.hour} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-white/70 border-white/20">
                  #{index + 1}
                </Badge>
                <span className="text-white font-medium">{getHourDisplay(peak.hour)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={peak.productivity * 20} className="w-16 h-2" />
                <span className="text-white/80 text-sm">{peak.productivity.toFixed(1)}/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="journal-glass p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-blue-400" />
          Time Distribution
        </h4>
        <div className="space-y-3">
          {Object.entries(analytics.categoryStats)
            .sort(([,a], [,b]) => b.totalTime - a.totalTime)
            .map(([category, stats]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <span className="text-white capitalize">{category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/80">{stats.totalTime}h</span>
                  <span className="text-white/60">
                    ({Math.round((stats.totalTime / analytics.totalHours) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Energy Pattern Visualization */}
      <div className="journal-glass p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Battery className="w-4 h-4 text-green-400" />
          Energy Patterns
        </h4>
        <div className="grid grid-cols-12 gap-1">
          {analytics.avgEnergyByHour.map((data) => (
            <div key={data.hour} className="text-center">
              <div 
                className="w-full bg-white/10 rounded-sm mb-1"
                style={{ height: `${Math.max(8, data.energy * 8)}px` }}
              >
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-sm"
                  style={{ height: `${(data.energy / 5) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-white/60">{data.hour}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Suggestions */}
      <div className="journal-glass p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          Smart Suggestions
        </h4>
        <div className="space-y-2 text-sm text-white/80">
          {analytics.peakHours.length > 0 && (
            <p>• Schedule important work during {getHourDisplay(analytics.peakHours[0].hour)} when you're most productive</p>
          )}
          {analytics.goalTimeSpent < 10 && (
            <p>• Consider dedicating more time to "{goalName}" - currently {analytics.goalTimeSpent}h this week</p>
          )}
          {analytics.moodScore < 70 && (
            <p>• Take more breaks or try changing your work environment to improve mood</p>
          )}
        </div>
      </div>
    </div>
  );
}