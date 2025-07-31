import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface AICoachProps {
  goalName: string;
  currentStreak: number;
  completions: any[];
  daysRemaining: number;
}

export default function AICoach({ goalName, currentStreak, completions, daysRemaining }: AICoachProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    generateAIInsights();
  }, [completions, currentStreak]);

  const generateAIInsights = () => {
    const completedDays = completions.filter(c => c.completed).length;
    const successRate = completions.length > 0 ? (completedDays / completions.length) * 100 : 0;
    
    const newInsights = [];

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

    // Find best performing day
    const bestDay = Object.entries(weeklyData).reduce((best: any, [day, data]: [string, any]) => {
      const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      return rate > (best.rate || 0) ? { day, rate } : best;
    }, {});

    // AI Coaching Insights
    if (successRate >= 80) {
      newInsights.push({
        type: "success",
        icon: Target,
        title: "Elite Performance",
        message: `${Math.round(successRate)}% success rate puts you in the top 10% of achievers`,
        action: "Maintain this momentum"
      });
    }

    if (currentStreak >= 7) {
      newInsights.push({
        type: "success",
        icon: TrendingUp,
        title: "Momentum Master",
        message: `${currentStreak} day streak! Research shows you're 3x more likely to reach your goal`,
        action: "You're in the compound effect zone"
      });
    }

    if (bestDay.day && bestDay.rate > 70) {
      newInsights.push({
        type: "info",
        icon: Brain,
        title: "Pattern Recognition",
        message: `${bestDay.day}s are your power days (${Math.round(bestDay.rate)}% success)`,
        action: "Schedule important tasks on " + bestDay.day + "s"
      });
    }

    // Failure prediction
    if (successRate < 60 && daysRemaining > 14) {
      newInsights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Risk Alert",
        message: `Current pace suggests 40% goal completion risk`,
        action: "Increase daily consistency immediately"
      });
    }

    // Goal-specific AI coaching
    const goalLower = goalName.toLowerCase();
    if (goalLower.includes('business') || goalLower.includes('startup') || goalLower.includes('agency')) {
      newInsights.push({
        type: "coaching",
        icon: Brain,
        title: "Business AI Coach",
        message: "Focus on revenue-generating activities first. Track customer interactions daily.",
        action: "Set daily revenue targets"
      });
    }

    setInsights(newInsights);

    // Predictive analysis
    const avgDailyProgress = completedDays / Math.max(completions.length, 1);
    const predictedSuccess = Math.min(100, avgDailyProgress * daysRemaining * 100 / daysRemaining);
    
    setPrediction({
      successProbability: Math.round(predictedSuccess),
      riskLevel: predictedSuccess < 70 ? 'high' : predictedSuccess < 85 ? 'medium' : 'low',
      daysToImprove: Math.max(0, Math.ceil((0.8 - avgDailyProgress) * 10))
    });
  };

  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-foreground" />
        <h3 className="text-sm font-semibold text-foreground tracking-tight">AI Coach</h3>
        <Badge variant="outline" className="text-muted-foreground border-border text-xs">
          AI
        </Badge>
      </div>

      {/* Prediction */}
      {prediction && (
        <div className="mb-4 p-3 card-premium">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground tracking-wide">SUCCESS PROBABILITY</span>
            <span className={`text-sm font-medium ${
              prediction.riskLevel === 'high' ? 'text-destructive' : 
              prediction.riskLevel === 'medium' ? 'text-yellow-600' : 'text-foreground'
            }`}>
              {prediction.successProbability}%
            </span>
          </div>
          {prediction.riskLevel === 'high' && (
            <p className="text-xs text-muted-foreground">
              Improve consistency in next {prediction.daysToImprove} days to get back on track
            </p>
          )}
        </div>
      )}

      {/* AI Insights */}
      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-xs text-muted-foreground p-3 text-center">
            Complete more days to unlock AI insights
          </div>
        ) : (
          insights.slice(0, 2).map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="p-3 border-l-2 border-border bg-muted/50">
                <div className="flex items-start gap-2">
                  <Icon className="w-3 h-3 text-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{insight.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{insight.message}</div>
                    <div className="text-xs text-foreground font-medium mt-1">{insight.action}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {insights.length > 2 && (
        <Button variant="outline" className="w-full mt-3 text-xs" size="sm">
          VIEW ALL INSIGHTS ({insights.length})
        </Button>
      )}
    </div>
  );
}