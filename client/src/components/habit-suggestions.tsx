import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, Target, Zap } from "lucide-react";

interface HabitSuggestionsProps {
  goalName: string;
  currentStreak: number;
  completions: any[];
}

export default function HabitSuggestions({ goalName, currentStreak, completions }: HabitSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    generateSuggestions();
  }, [goalName, currentStreak, completions]);

  const generateSuggestions = () => {
    const completedDays = completions.filter(c => c.completed).length;
    const successRate = completions.length > 0 ? (completedDays / completions.length) * 100 : 0;

    const newSuggestions = [];

    // Goal-based suggestions
    const goalLower = goalName.toLowerCase();
    
    if (goalLower.includes('startup') || goalLower.includes('business') || goalLower.includes('agency')) {
      newSuggestions.push({
        icon: Target,
        title: "Daily Revenue Focus",
        description: "Set a small daily revenue target to maintain business momentum",
        difficulty: "Medium",
        impact: "High"
      });
      
      newSuggestions.push({
        icon: Zap,
        title: "Network Daily",
        description: "Connect with 3 new potential clients or partners each day",
        difficulty: "Easy",
        impact: "High"
      });
    }

    if (goalLower.includes('fitness') || goalLower.includes('health') || goalLower.includes('gym')) {
      newSuggestions.push({
        icon: Clock,
        title: "Morning Workout",
        description: "Exercise within 2 hours of waking up for better consistency",
        difficulty: "Medium",
        impact: "High"
      });
    }

    if (goalLower.includes('learn') || goalLower.includes('skill') || goalLower.includes('coding')) {
      newSuggestions.push({
        icon: Lightbulb,
        title: "Learn Before Scroll",
        description: "Study for 25 minutes before checking social media",
        difficulty: "Easy",
        impact: "High"
      });
    }

    // Streak-based suggestions
    if (currentStreak < 7) {
      newSuggestions.push({
        icon: Clock,
        title: "Same Time Daily",
        description: "Do your goal activity at the exact same time every day",
        difficulty: "Easy",
        impact: "Medium"
      });
    }

    if (successRate < 70) {
      newSuggestions.push({
        icon: Target,
        title: "Minimum Viable Progress",
        description: "Set a 5-minute minimum version of your goal for bad days",
        difficulty: "Easy",
        impact: "High"
      });
    }

    // Universal productivity habits
    newSuggestions.push({
      icon: Zap,
      title: "2-Minute Rule",
      description: "If your goal takes less than 2 minutes, do it immediately",
      difficulty: "Easy",
      impact: "Medium"
    });

    newSuggestions.push({
      icon: Lightbulb,
      title: "Implementation Intention",
      description: "Plan exactly when and where you'll work on your goal",
      difficulty: "Easy",
      impact: "High"
    });

    setSuggestions(newSuggestions.slice(0, 4)); // Show top 4 suggestions
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 border-green-600';
      case 'Medium': return 'text-yellow-600 border-yellow-600';
      case 'Hard': return 'text-red-600 border-red-600';
      default: return 'text-gold border-gold';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-gray-600';
      default: return 'text-gold';
    }
  };

  return (
    <div className="card-minimal p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gold">Smart Suggestions</h3>
        <Badge variant="outline" className="text-gold border-gold">
          Personalized
        </Badge>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <div key={index} className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gold/10 rounded-lg">
                  <Icon className="h-4 w-4 text-gold" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm">{suggestion.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{suggestion.description}</div>
                  <div className="flex gap-2 mt-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getDifficultyColor(suggestion.difficulty)}`}
                    >
                      {suggestion.difficulty}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getImpactColor(suggestion.impact)}`}
                    >
                      {suggestion.impact} Impact
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-gold/5 rounded-lg border border-gold/20">
        <div className="text-xs text-gold font-medium">💡 Pro Tip</div>
        <div className="text-xs text-foreground mt-1">
          Start with one habit and master it for 21 days before adding another.
        </div>
      </div>
    </div>
  );
}