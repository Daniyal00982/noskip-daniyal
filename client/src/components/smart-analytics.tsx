import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from "lucide-react";

interface SmartAnalyticsProps {
  goalId: string;
  currentStreak: number;
  completions: any[];
  daysRemaining: number;
}

export default function SmartAnalytics({ goalId, currentStreak, completions, daysRemaining }: SmartAnalyticsProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [weeklyPattern, setWeeklyPattern] = useState<any>({});

  useEffect(() => {
    analyzePerformance();
  }, [completions, currentStreak]);

  const analyzePerformance = () => {
    if (completions.length === 0) return;

    const completedDays = completions.filter(c => c.completed).length;
    const successRate = Math.round((completedDays / completions.length) * 100);
    
    // Weekly pattern analysis
    const weeklyData = completions.reduce((acc: any, completion) => {
      const date = new Date(completion.date);
      const dayOfWeek = date.getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      
      if (!acc[dayName]) acc[dayName] = { completed: 0, total: 0 };
      acc[dayName].total++;
      if (completion.completed) acc[dayName].completed++;
      
      return acc;
    }, {});

    setWeeklyPattern(weeklyData);

    // Generate intelligent insights
    const newInsights = [];

    if (successRate < 70) {
      newInsights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Success Rate Alert",
        message: `Your success rate is ${successRate}%. Top performers maintain 80%+`,
        action: "Review your daily routine"
      });
    }

    if (currentStreak >= 7) {
      newInsights.push({
        type: "success",
        icon: CheckCircle,
        title: "Momentum Building",
        message: `${currentStreak} day streak! You're in the top 20% of users`,
        action: "Keep the momentum"
      });
    }

    // Find best and worst performing days
    const bestDay = Object.entries(weeklyData).reduce((best: any, [day, data]: [string, any]) => {
      const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      return rate > (best.rate || 0) ? { day, rate } : best;
    }, {});

    const worstDay = Object.entries(weeklyData).reduce((worst: any, [day, data]: [string, any]) => {
      const rate = data.total > 0 ? (data.completed / data.total) * 100 : 100;
      return rate < (worst.rate || 100) ? { day, rate } : worst;
    }, {});

    if (bestDay.day && worstDay.day && bestDay.day !== worstDay.day) {
      newInsights.push({
        type: "info",
        icon: TrendingUp,
        title: "Pattern Detected",
        message: `${bestDay.day}s are your strongest (${Math.round(bestDay.rate)}%), ${worstDay.day}s need work (${Math.round(worstDay.rate)}%)`,
        action: "Plan harder for weak days"
      });
    }

    // Goal completion prediction
    const avgDailyProgress = completedDays / completions.length;
    const predictedCompletion = Math.round(avgDailyProgress * daysRemaining * 100);
    
    if (predictedCompletion < 80 && daysRemaining > 7) {
      newInsights.push({
        type: "warning",
        icon: Target,
        title: "Goal Risk Assessment",
        message: `At current pace, you'll complete ${predictedCompletion}% of remaining days`,
        action: "Increase daily consistency"
      });
    }

    setInsights(newInsights);
  };

  const getBestPerformingDay = () => {
    if (Object.keys(weeklyPattern).length === 0) return null;
    
    return Object.entries(weeklyPattern).reduce((best: any, [day, data]: [string, any]) => {
      const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      return rate > (best.rate || 0) ? { day, rate: Math.round(rate) } : best;
    }, {});
  };

  const bestDay = getBestPerformingDay();

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Smart Analytics</h3>
        <Badge variant="outline" className="text-muted-foreground border-border text-xs">
          AI
        </Badge>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">
            {completions.length > 0 ? Math.round((completions.filter(c => c.completed).length / completions.length) * 100) : 0}%
          </div>
          <div className="text-xs text-muted-foreground tracking-wide">SUCCESS</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">{currentStreak}</div>
          <div className="text-xs text-muted-foreground tracking-wide">STREAK</div>
        </div>
      </div>

      {/* Best Performing Day */}
      {bestDay && (
        <div className="bg-card p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Best Day</div>
              <div className="text-sm text-muted-foreground">{bestDay.day}s</div>
            </div>
            <div className="text-lg font-bold text-gold">{bestDay.rate}%</div>
          </div>
        </div>
      )}

      {/* Intelligent Insights */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Insights</h4>
        {insights.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 text-center">
            Complete more days to get personalized insights
          </div>
        ) : (
          insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500' :
                  'bg-blue-50 dark:bg-blue-950/20 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 ${
                    insight.type === 'success' ? 'text-green-600' :
                    insight.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{insight.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{insight.message}</div>
                    <div className="text-xs text-gold mt-2 font-medium">{insight.action}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}