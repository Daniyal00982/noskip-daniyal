import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Target, TrendingUp } from 'lucide-react';

interface TeamGoalsProps {
  goalId: string;
  goalName: string;
  isOwner?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  streak: number;
  completionRate: number;
  joinDate: Date;
  role: 'owner' | 'member';
}

export default function TeamGoals({ goalId, goalName, isOwner = true }: TeamGoalsProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'You',
      email: 'you@example.com',
      streak: 5,
      completionRate: 85,
      joinDate: new Date(),
      role: 'owner'
    }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const handleInvite = () => {
    if (inviteEmail && inviteEmail.includes('@')) {
      // Simulate adding team member
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        streak: 0,
        completionRate: 0,
        joinDate: new Date(),
        role: 'member'
      };
      setTeamMembers([...teamMembers, newMember]);
      setInviteEmail('');
      setShowInvite(false);
    }
  };

  const teamStats = {
    totalMembers: teamMembers.length,
    avgCompletionRate: Math.round(teamMembers.reduce((sum, m) => sum + m.completionRate, 0) / teamMembers.length),
    topPerformer: teamMembers.reduce((top, member) => 
      member.completionRate > top.completionRate ? member : top
    ),
    totalStreaks: teamMembers.reduce((sum, m) => sum + m.streak, 0)
  };

  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-foreground" />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Team Goals</h3>
        </div>
        <Badge variant="outline" className="text-muted-foreground border-border text-xs">
          PRO
        </Badge>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-muted/50 rounded">
          <div className="text-lg font-bold text-foreground">{teamStats.totalMembers}</div>
          <div className="text-xs text-muted-foreground tracking-wide">MEMBERS</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded">
          <div className="text-lg font-bold text-foreground">{teamStats.avgCompletionRate}%</div>
          <div className="text-xs text-muted-foreground tracking-wide">TEAM AVG</div>
        </div>
      </div>

      {/* Top Performer */}
      <div className="p-3 border border-yellow-200 bg-yellow-50/50 rounded mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-3 h-3 text-yellow-600" />
          <span className="text-xs font-medium text-yellow-800">TOP PERFORMER</span>
        </div>
        <div className="text-sm font-medium text-foreground">{teamStats.topPerformer.name}</div>
        <div className="text-xs text-muted-foreground">{teamStats.topPerformer.completionRate}% success rate</div>
      </div>

      {/* Team Members */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-medium text-muted-foreground tracking-wide">TEAM MEMBERS</div>
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">{member.name[0].toUpperCase()}</span>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.streak} day streak</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-foreground">{member.completionRate}%</div>
              <div className="text-xs text-muted-foreground">success</div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Section */}
      {isOwner && (
        <div>
          {!showInvite ? (
            <Button 
              onClick={() => setShowInvite(true)}
              variant="outline" 
              className="w-full text-xs"
              size="sm"
            >
              INVITE TEAM MEMBER
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-xs font-medium text-muted-foreground tracking-wide">
                EMAIL ADDRESS
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-xs"
              />
              <div className="flex gap-2">
                <Button onClick={handleInvite} className="flex-1 btn-premium text-xs" size="sm">
                  SEND INVITE
                </Button>
                <Button 
                  onClick={() => setShowInvite(false)} 
                  variant="outline" 
                  className="flex-1 text-xs"
                  size="sm"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Challenge */}
      <div className="mt-4 p-3 border border-border rounded">
        <div className="text-xs font-medium text-foreground mb-1">Weekly Team Challenge</div>
        <div className="text-xs text-muted-foreground mb-2">
          Team goal: Everyone maintains 80%+ completion rate
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full h-1">
            <div 
              className="bg-foreground h-1 rounded-full" 
              style={{ width: `${Math.min(100, (teamStats.avgCompletionRate / 80) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-foreground">{teamStats.avgCompletionRate}/80%</span>
        </div>
      </div>
    </div>
  );
}