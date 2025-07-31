import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Gift, Star, Zap, Trophy, Coins, Crown } from 'lucide-react';

interface RewardsGamificationProps {
  goalId: string;
  currentStreak: number;
}

const ACHIEVEMENTS = [
  { id: 'first_day', name: 'First Step', description: 'Complete your first day', icon: '🚶', points: 10, threshold: 1 },
  { id: 'week_warrior', name: 'Week Warrior', description: '7 days in a row', icon: '⚔️', points: 50, threshold: 7 },
  { id: 'double_digits', name: 'Double Digits', description: 'Reach 10-day streak', icon: '💫', points: 100, threshold: 10 },
  { id: 'unstoppable', name: 'Unstoppable', description: '30 days straight', icon: '🔥', points: 300, threshold: 30 },
  { id: 'legend', name: 'Legend Status', description: '100 days of consistency', icon: '👑', points: 1000, threshold: 100 },
];

const STREAK_REWARDS = [
  { streak: 3, reward: 'Momentum Builder', points: 25, description: 'You\'re building momentum!' },
  { streak: 7, reward: 'Week Champion', points: 75, description: 'One week of pure dedication!' },
  { streak: 14, reward: 'Fortnight Hero', points: 150, description: 'Two weeks of unstoppable progress!' },
  { streak: 21, reward: 'Habit Master', points: 250, description: 'You\'ve formed a real habit!' },
  { streak: 30, reward: 'Monthly Legend', points: 500, description: 'A full month of excellence!' },
];

export function RewardsGamification({ goalId, currentStreak }: RewardsGamificationProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards = [] } = useQuery({
    queryKey: ['/api/rewards', goalId],
    enabled: !!goalId,
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await apiRequest('POST', `/api/rewards/${rewardId}/claim`, {});
      return response.json();
    },
    onSuccess: () => {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['/api/rewards', goalId] });
    },
  });

  // Calculate total points
  useEffect(() => {
    const points = rewards.reduce((sum: number, reward: any) => sum + (reward.pointsEarned || 0), 0);
    setTotalPoints(points);
  }, [rewards]);

  // Check for new achievements based on current streak
  const unlockedAchievements = ACHIEVEMENTS.filter(achievement => 
    currentStreak >= achievement.threshold
  );

  const nextAchievement = ACHIEVEMENTS.find(achievement => 
    currentStreak < achievement.threshold
  );

  const availableStreakReward = STREAK_REWARDS.find(sr => 
    sr.streak === currentStreak && !rewards.some((r: any) => r.badgeName === sr.reward)
  );

  const getLevel = (points: number) => {
    if (points >= 1000) return { level: 10, title: 'Legendary Master', color: 'text-purple-600' };
    if (points >= 500) return { level: 9, title: 'Elite Performer', color: 'text-pink-600' };
    if (points >= 300) return { level: 8, title: 'High Achiever', color: 'text-red-600' };
    if (points >= 200) return { level: 7, title: 'Consistent Pro', color: 'text-orange-600' };
    if (points >= 150) return { level: 6, title: 'Momentum Keeper', color: 'text-yellow-600' };
    if (points >= 100) return { level: 5, title: 'Progress Maker', color: 'text-green-600' };
    if (points >= 75) return { level: 4, title: 'Streak Builder', color: 'text-blue-600' };
    if (points >= 50) return { level: 3, title: 'Goal Chaser', color: 'text-indigo-600' };
    if (points >= 25) return { level: 2, title: 'Beginner+', color: 'text-gray-600' };
    return { level: 1, title: 'Starter', color: 'text-gray-500' };
  };

  const userLevel = getLevel(totalPoints);
  const nextLevelThreshold = [25, 50, 75, 100, 150, 200, 300, 500, 1000][userLevel.level - 1] || 1000;
  const progressToNext = nextLevelThreshold > 0 ? (totalPoints / nextLevelThreshold) * 100 : 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Star className="mr-2 text-purple-500" />
          Rewards & Level
        </h3>
        <div className="flex items-center space-x-2">
          <Coins className="text-yellow-500" size={20} />
          <span className="text-xl font-bold text-yellow-600">{totalPoints}</span>
        </div>
      </div>

      {/* User Level */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center">
              <Crown className={`mr-2 ${userLevel.color}`} size={20} />
              <span className={`text-lg font-bold ${userLevel.color}`}>
                Level {userLevel.level}: {userLevel.title}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {nextLevelThreshold - totalPoints} points to next level
            </p>
          </div>
        </div>
        <Progress value={Math.min(100, progressToNext)} className="h-3" />
      </div>

      {/* Available Rewards */}
      {availableStreakReward && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-6 animate-pulse">
          <div className="text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h4 className="font-bold text-yellow-800 mb-2">New Reward Available!</h4>
            <div className="text-yellow-700">
              <div className="font-semibold">{availableStreakReward.reward}</div>
              <div className="text-sm">{availableStreakReward.description}</div>
              <div className="text-sm font-bold">+{availableStreakReward.points} points</div>
            </div>
            <Button
              onClick={() => claimRewardMutation.mutate('streak-reward')}
              className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={claimRewardMutation.isPending}
            >
              <Gift className="mr-2" size={16} />
              Claim Reward
            </Button>
          </div>
        </div>
      )}

      {/* Achievements Progress */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
          <Trophy className="mr-2 text-orange-500" size={16} />
          Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = currentStreak >= achievement.threshold;
            const progress = Math.min(100, (currentStreak / achievement.threshold) * 100);
            
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isUnlocked 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl mb-1 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className={`text-sm font-semibold ${
                    isUnlocked ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {achievement.description}
                  </div>
                  
                  {!isUnlocked && (
                    <>
                      <Progress value={progress} className="h-1 mb-1" />
                      <div className="text-xs text-gray-500">
                        {currentStreak}/{achievement.threshold}
                      </div>
                    </>
                  )}
                  
                  {isUnlocked && (
                    <div className="text-xs font-bold text-green-600">
                      +{achievement.points} pts ✓
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Milestone */}
      {nextAchievement && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-2">🎯 Next Milestone</h4>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-blue-700">{nextAchievement.name}</div>
              <div className="text-sm text-blue-600">{nextAchievement.description}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-700">
                {nextAchievement.threshold - currentStreak}
              </div>
              <div className="text-xs text-blue-600">days to go</div>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress 
              value={(currentStreak / nextAchievement.threshold) * 100} 
              className="h-2"
            />
          </div>
        </div>
      )}

      {/* Recent Rewards */}
      {rewards.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-3">Recent Rewards</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {rewards.slice(-3).reverse().map((reward: any) => (
              <div key={reward.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-semibold">{reward.badgeName || reward.rewardType}</div>
                  <div className="text-xs text-gray-500">
                    {reward.unlockedAt ? new Date(reward.unlockedAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
                <div className="flex items-center text-yellow-600">
                  <Coins size={14} className="mr-1" />
                  <span className="font-semibold">+{reward.pointsEarned}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-yellow-500 text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-bold">REWARD CLAIMED!</div>
              <div className="text-sm">Keep up the amazing work!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}