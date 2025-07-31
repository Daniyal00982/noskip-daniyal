import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Users, TrendingUp, Crown, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LeaderboardProps {
  goalId: string;
  currentStreak: number;
  userName?: string;
}

// Mock leaderboard data for social pressure effect
const MOCK_LEADERBOARD = [
  { name: 'Sarah M.', streak: 47, total: 89, isTop: true },
  { name: 'Alex K.', streak: 32, total: 67, isTop: true },
  { name: 'Jordan R.', streak: 28, total: 45, isTop: true },
  { name: 'Taylor S.', streak: 21, total: 38, isTop: false },
  { name: 'Casey L.', streak: 18, total: 29, isTop: false },
  { name: 'Riley P.', streak: 15, total: 24, isTop: false },
  { name: 'Morgan D.', streak: 12, total: 19, isTop: false },
  { name: 'Avery C.', streak: 8, total: 15, isTop: false },
];

export function Leaderboard({ goalId, currentStreak, userName = 'You' }: LeaderboardProps) {
  const [showFullBoard, setShowFullBoard] = useState(false);

  // Add user to leaderboard for comparison
  const userEntry = { name: userName, streak: currentStreak, total: currentStreak, isTop: false };
  const leaderboardWithUser = [...MOCK_LEADERBOARD, userEntry]
    .sort((a, b) => b.streak - a.streak)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const userRank = leaderboardWithUser.find(entry => entry.name === userName)?.rank || 0;
  const topPerformers = leaderboardWithUser.slice(0, 3);
  const displayBoard = showFullBoard ? leaderboardWithUser : topPerformers;

  const getMotivationalMessage = () => {
    if (userRank === 1) return "🏆 YOU'RE THE CHAMPION! Keep dominating!";
    if (userRank <= 3) return "🥇 TOP 3! You're almost at the top!";
    if (userRank <= 5) return "📈 TOP 5! Push harder to reach the podium!";
    if (userRank <= 10) return "⚡ TOP 10! You're in the game, keep climbing!";
    return "💪 Time to step up! Look how far behind you are!";
  };

  const getBehindMessage = () => {
    const leader = leaderboardWithUser[0];
    const daysBehind = leader.streak - currentStreak;
    if (daysBehind > 0) {
      return `You are ${daysBehind} days behind ${leader.name}`;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="mr-2 text-yellow-500" />
          Leaderboard
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="mr-1" size={16} />
          <span>{leaderboardWithUser.length} competitors</span>
        </div>
      </div>

      {/* User Rank Highlight */}
      <div className={`rounded-xl p-4 mb-6 ${
        userRank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
        userRank <= 10 ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' :
        'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
      }`}>
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            #{userRank} <span className="text-lg">out of {leaderboardWithUser.length}</span>
          </div>
          <p className={`font-semibold ${
            userRank <= 3 ? 'text-yellow-700' :
            userRank <= 10 ? 'text-blue-700' :
            'text-red-700'
          }`}>
            {getMotivationalMessage()}
          </p>
          {getBehindMessage() && (
            <p className="text-red-600 text-sm mt-2 font-medium">
              ⚠️ {getBehindMessage()}
            </p>
          )}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {displayBoard.map((entry, index) => {
          const isUser = entry.name === userName;
          const isTop3 = entry.rank <= 3;
          
          return (
            <div
              key={entry.name}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                isUser 
                  ? 'bg-blue-100 border-2 border-blue-300 shadow-md' 
                  : isTop3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                    : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  entry.rank === 1 ? 'bg-yellow-500 text-white' :
                  entry.rank === 2 ? 'bg-gray-400 text-white' :
                  entry.rank === 3 ? 'bg-orange-500 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {entry.rank === 1 ? <Crown size={16} /> : entry.rank}
                </div>
                
                <div>
                  <div className={`font-semibold ${isUser ? 'text-blue-800' : 'text-gray-900'}`}>
                    {entry.name} {isUser && '(You)'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {entry.total} total days completed
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-lg font-bold flex items-center ${
                    entry.streak >= 30 ? 'text-red-500' :
                    entry.streak >= 20 ? 'text-orange-500' :
                    entry.streak >= 10 ? 'text-yellow-500' :
                    'text-gray-600'
                  }`}>
                    <Flame className="mr-1" size={16} />
                    {entry.streak}
                  </div>
                  <div className="text-xs text-gray-500">day streak</div>
                </div>
                
                {isTop3 && (
                  <div className="text-yellow-500">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {!showFullBoard && leaderboardWithUser.length > 3 && (
        <div className="text-center mt-4">
          <Button
            onClick={() => setShowFullBoard(true)}
            variant="outline"
            className="text-sm"
          >
            See Full Ranking ({leaderboardWithUser.length - 3} more)
          </Button>
        </div>
      )}

      {/* Competitive Pressure */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center">
            <TrendingUp className="mr-2" size={16} />
            Reality Check
          </h4>
          <div className="space-y-2 text-sm text-red-700">
            <p>• <strong>{MOCK_LEADERBOARD.filter(e => e.streak > currentStreak).length}</strong> people are ahead of you</p>
            <p>• While you were making excuses, <strong>Sarah M.</strong> completed 47 days straight</p>
            <p>• The top 3 have been consistent for <strong>weeks</strong></p>
            <p>• Your competition isn't slowing down. Are you?</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Rank */}
      {userRank > 1 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            Progress to Beat #{userRank - 1}:
          </div>
          {(() => {
            const nextPerson = leaderboardWithUser[userRank - 2];
            const daysNeeded = nextPerson.streak - currentStreak + 1;
            const progress = Math.max(0, Math.min(100, (currentStreak / nextPerson.streak) * 100));
            
            return (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">
                    Need {daysNeeded} more days to beat {nextPerson.name}
                  </span>
                  <span className="text-xs font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}