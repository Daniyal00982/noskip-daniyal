import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Clock, Zap, Star, BookOpen } from 'lucide-react';

interface HourlyEntry {
  hour: number;
  activity: string;
  feeling: 'great' | 'good' | 'okay' | 'bad';
  productivity: number;
  energy: number;
  category: 'work' | 'personal' | 'health' | 'learning' | 'social' | 'break';
}

interface GoalIntegrationVizProps {
  goalId: string;
  goalName: string;
  daysRemaining: number;
}

export default function GoalIntegrationViz({ goalId, goalName, daysRemaining }: GoalIntegrationVizProps) {
  const [weeklyData, setWeeklyData] = useState<HourlyEntry[]>([]);

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

  const goalAnalysis = useMemo(() => {
    if (weeklyData.length === 0) return null;

    // Extract goal keywords for matching
    const goalKeywords = goalName.toLowerCase().split(' ').filter(word => word.length > 2);
    
    // Find goal-related activities
    const goalRelatedEntries = weeklyData.filter(entry => {
      const activity = entry.activity.toLowerCase();
      const isDirectlyRelated = goalKeywords.some(keyword => activity.includes(keyword));
      const isLearningRelated = entry.category === 'learning' || entry.category === 'work';
      return isDirectlyRelated || isLearningRelated;
    });

    // Calculate goal contribution metrics
    const totalHoursThisWeek = weeklyData.length;
    const goalHoursThisWeek = goalRelatedEntries.length;
    const goalContributionPercentage = totalHoursThisWeek > 0 ? (goalHoursThisWeek / totalHoursThisWeek) * 100 : 0;
    
    const avgGoalProductivity = goalRelatedEntries.length > 0 
      ? goalRelatedEntries.reduce((sum, entry) => sum + entry.productivity, 0) / goalRelatedEntries.length
      : 0;

    const avgGoalEnergy = goalRelatedEntries.length > 0
      ? goalRelatedEntries.reduce((sum, entry) => sum + entry.energy, 0) / goalRelatedEntries.length
      : 0;

    // Daily goal progress pattern
    const dailyGoalHours = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayEntries = weeklyData.filter(entry => {
        const entryDate = new Date();
        entryDate.setDate(entryDate.getDate() - i);
        return true; // Simplified for demo
      });
      
      const goalHours = dayEntries.filter(entry => {
        const activity = entry.activity.toLowerCase();
        return goalKeywords.some(keyword => activity.includes(keyword)) || 
               entry.category === 'learning' || entry.category === 'work';
      }).length;
      
      return { day: i, hours: goalHours, date: dateKey };
    }).reverse();

    // Most productive goal activities
    const goalActivities = goalRelatedEntries.reduce((acc, entry) => {
      const key = entry.activity.toLowerCase();
      if (!acc[key]) {
        acc[key] = { 
          activity: entry.activity, 
          count: 0, 
          avgProductivity: 0, 
          category: entry.category 
        };
      }
      acc[key].count++;
      acc[key].avgProductivity = (acc[key].avgProductivity * (acc[key].count - 1) + entry.productivity) / acc[key].count;
      return acc;
    }, {} as Record<string, { activity: string; count: number; avgProductivity: number; category: string }>);

    const topGoalActivities = Object.values(goalActivities)
      .sort((a, b) => b.avgProductivity - a.avgProductivity)
      .slice(0, 5);

    // Weekly goal momentum
    const recentHours = goalRelatedEntries.filter(entry => {
      // Last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return true; // Simplified for demo
    }).length;

    const momentum = recentHours >= 6 ? 'strong' : recentHours >= 3 ? 'moderate' : 'low';

    return {
      totalHoursThisWeek,
      goalHoursThisWeek,
      goalContributionPercentage,
      avgGoalProductivity,
      avgGoalEnergy,
      dailyGoalHours,
      topGoalActivities,
      momentum,
      recentHours
    };
  }, [weeklyData, goalName]);

  if (!goalAnalysis) {
    return (
      <div className="journal-glass p-6">
        <div className="text-center text-white/60">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Start logging activities to see goal integration</p>
        </div>
      </div>
    );
  }

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'strong': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'strong': return '🚀';
      case 'moderate': return '⚡';
      default: return '📉';
    }
  };

  return (
    <div className="journal-glass p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 journal-glass rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Goal Integration</h3>
          <p className="text-white/60 text-sm">How your daily activities connect to "{goalName}"</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="journal-glass p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{goalAnalysis.goalHoursThisWeek}h</div>
          <div className="text-white/80 text-sm">Goal Time</div>
          <div className="text-white/60 text-xs mt-1">This week</div>
        </div>
        
        <div className="journal-glass p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {Math.round(goalAnalysis.goalContributionPercentage)}%
          </div>
          <div className="text-white/80 text-sm">Time Contribution</div>
          <div className="text-white/60 text-xs mt-1">Of total hours</div>
        </div>
        
        <div className="journal-glass p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {goalAnalysis.avgGoalProductivity.toFixed(1)}
          </div>
          <div className="text-white/80 text-sm">Avg Productivity</div>
          <div className="text-white/60 text-xs mt-1">On goal work</div>
        </div>
        
        <div className="journal-glass p-4 text-center">
          <div className={`text-2xl font-bold mb-1 ${getMomentumColor(goalAnalysis.momentum)}`}>
            {getMomentumIcon(goalAnalysis.momentum)}
          </div>
          <div className="text-white/80 text-sm capitalize">{goalAnalysis.momentum}</div>
          <div className="text-white/60 text-xs mt-1">Momentum</div>
        </div>
      </div>

      {/* Daily Goal Progress */}
      <div className="journal-glass p-4">
        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Daily Goal Progress (Last 7 Days)
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {goalAnalysis.dailyGoalHours.map((day, index) => (
            <div key={day.day} className="text-center">
              <div 
                className="w-full bg-white/10 rounded-lg mb-2 flex items-end justify-center"
                style={{ height: '60px' }}
              >
                <div 
                  className="w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-sm"
                  style={{ height: `${Math.max(4, (day.hours / 8) * 60)}px` }}
                />
              </div>
              <div className="text-xs text-white/80 font-medium">{day.hours}h</div>
              <div className="text-[10px] text-white/60">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Goal Activities */}
      <div className="journal-glass p-4">
        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          Most Productive Goal Activities
        </h4>
        <div className="space-y-3">
          {goalAnalysis.topGoalActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Badge variant="outline" className="text-white/70 border-white/20 text-xs">
                  #{index + 1}
                </Badge>
                <div className="flex-1">
                  <div className="text-white text-sm">{activity.activity}</div>
                  <div className="text-white/60 text-xs capitalize">{activity.category} • {activity.count} times</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={activity.avgProductivity * 20} className="w-16 h-2" />
                <span className="text-white/80 text-sm font-medium">
                  {activity.avgProductivity.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Recommendations */}
      <div className="journal-glass p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-green-400" />
          Smart Recommendations
        </h4>
        <div className="space-y-2 text-sm text-white/80">
          {goalAnalysis.goalContributionPercentage < 30 && (
            <p>• 🎯 Consider dedicating more time to "{goalName}" - currently only {Math.round(goalAnalysis.goalContributionPercentage)}% of your time</p>
          )}
          {goalAnalysis.avgGoalProductivity < 3.5 && (
            <p>• ⚡ Your goal productivity could improve - try working during your peak hours or in focused sessions</p>
          )}
          {goalAnalysis.momentum === 'low' && (
            <p>• 📈 Build momentum by setting aside consistent daily time for your goal</p>
          )}
          {goalAnalysis.topGoalActivities.length > 0 && (
            <p>• 🌟 "{goalAnalysis.topGoalActivities[0].activity}" is your most productive goal activity - do more of this!</p>
          )}
          {daysRemaining < 30 && goalAnalysis.goalHoursThisWeek < 10 && (
            <p>• ⏰ With {daysRemaining} days left, consider increasing your goal focus time to {Math.ceil(10 / 7 * daysRemaining)}+ hours/week</p>
          )}
        </div>
      </div>
    </div>
  );
}