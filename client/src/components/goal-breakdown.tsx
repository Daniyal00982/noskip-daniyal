import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Target, Calendar, TrendingUp } from "lucide-react";

interface GoalBreakdownProps {
  goalName: string;
  deadline: Date;
  daysRemaining: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function GoalBreakdown({ goalName, deadline, daysRemaining }: GoalBreakdownProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    generateSmartMilestones();
  }, [goalName, deadline]);

  const generateSmartMilestones = () => {
    const goalLower = goalName.toLowerCase();
    const startDate = new Date();
    const totalDays = daysRemaining;
    
    let generatedMilestones: Milestone[] = [];

    // Business/Startup goals
    if (goalLower.includes('startup') || goalLower.includes('business') || goalLower.includes('agency')) {
      generatedMilestones = [
        {
          id: '1',
          title: 'Market Research & Validation',
          description: 'Complete competitor analysis and validate your business idea',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.15 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Business Plan & Strategy',
          description: 'Create detailed business plan and go-to-market strategy',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.3 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '3',
          title: 'MVP Development',
          description: 'Build minimum viable product or service offering',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.6 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '4',
          title: 'First Customer Acquisition',
          description: 'Secure your first paying customers or clients',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.8 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'medium'
        },
        {
          id: '5',
          title: 'Scale & Optimize',
          description: 'Optimize operations and scale your business systems',
          targetDate: deadline,
          completed: false,
          priority: 'medium'
        }
      ];
    }
    // Fitness goals
    else if (goalLower.includes('fitness') || goalLower.includes('weight') || goalLower.includes('muscle')) {
      generatedMilestones = [
        {
          id: '1',
          title: 'Establish Routine',
          description: 'Create consistent workout schedule and diet plan',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.2 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Build Foundation',
          description: 'Master basic exercises and establish healthy habits',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.4 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '3',
          title: 'Progressive Overload',
          description: 'Increase intensity and track measurable improvements',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.7 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Achieve Target',
          description: 'Reach your specific fitness or body composition goal',
          targetDate: deadline,
          completed: false,
          priority: 'high'
        }
      ];
    }
    // Learning goals
    else if (goalLower.includes('learn') || goalLower.includes('skill') || goalLower.includes('course')) {
      generatedMilestones = [
        {
          id: '1',
          title: 'Foundation Learning',
          description: 'Complete basic concepts and fundamental principles',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.25 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Practical Application',
          description: 'Start hands-on projects and real-world practice',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.5 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '3',
          title: 'Advanced Concepts',
          description: 'Master intermediate to advanced topics and techniques',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.75 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Mastery & Portfolio',
          description: 'Demonstrate expertise through projects or certification',
          targetDate: deadline,
          completed: false,
          priority: 'medium'
        }
      ];
    }
    // Generic goal breakdown
    else {
      generatedMilestones = [
        {
          id: '1',
          title: 'Planning Phase',
          description: 'Research, plan, and prepare for your goal',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.2 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Initial Progress',
          description: 'Take first concrete steps toward your goal',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.4 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'high'
        },
        {
          id: '3',
          title: 'Momentum Building',
          description: 'Accelerate progress and overcome initial challenges',
          targetDate: new Date(startDate.getTime() + (totalDays * 0.7 * 24 * 60 * 60 * 1000)),
          completed: false,
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Goal Achievement',
          description: 'Complete final steps and achieve your target',
          targetDate: deadline,
          completed: false,
          priority: 'high'
        }
      ];
    }

    setMilestones(generatedMilestones);
  };

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(milestone => 
      milestone.id === id 
        ? { ...milestone, completed: !milestone.completed }
        : milestone
    ));
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercentage = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 border-red-600';
      case 'medium': return 'text-yellow-600 border-yellow-600';
      case 'low': return 'text-green-600 border-green-600';
      default: return 'text-gold border-gold';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getDaysUntil = (date: Date) => {
    const diff = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="card-minimal p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gold">Goal Breakdown</h3>
        <Badge variant="outline" className="text-gold border-gold">
          {completedCount}/{milestones.length} Complete
        </Badge>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm font-semibold text-gold">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const daysUntil = getDaysUntil(milestone.targetDate);
          const isOverdue = daysUntil < 0 && !milestone.completed;
          
          return (
            <div 
              key={milestone.id}
              className={`border rounded-xl p-4 transition-all cursor-pointer ${
                milestone.completed 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                  : isOverdue
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  : 'bg-card border-border hover:border-gold/50'
              }`}
              onClick={() => toggleMilestone(milestone.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {milestone.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium ${
                        milestone.completed ? 'text-green-700 dark:text-green-400' : 'text-foreground'
                      }`}>
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(milestone.priority)}`}
                      >
                        {milestone.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(milestone.targetDate)}
                    </div>
                    {!milestone.completed && (
                      <div className={`text-xs font-medium ${
                        isOverdue ? 'text-red-600' : daysUntil <= 7 ? 'text-yellow-600' : 'text-muted-foreground'
                      }`}>
                        {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-card rounded-lg">
          <Target className="h-4 w-4 text-gold mx-auto mb-1" />
          <div className="text-sm font-medium text-foreground">{completedCount}</div>
          <div className="text-xs text-muted-foreground">Done</div>
        </div>
        <div className="text-center p-3 bg-card rounded-lg">
          <TrendingUp className="h-4 w-4 text-gold mx-auto mb-1" />
          <div className="text-sm font-medium text-foreground">{milestones.length - completedCount}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </div>
        <div className="text-center p-3 bg-card rounded-lg">
          <Calendar className="h-4 w-4 text-gold mx-auto mb-1" />
          <div className="text-sm font-medium text-foreground">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-muted-foreground">Progress</div>
        </div>
      </div>
    </div>
  );
}