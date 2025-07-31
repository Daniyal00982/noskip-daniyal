import { useQuery } from '@tanstack/react-query';
import { BrutalCoach } from '@/components/brutal-coach';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { CoachingSession } from '@shared/schema';

export default function Coach() {
  const [currentGoalId] = useLocalStorage('currentGoalId', '');

  const { data: sessions = [] } = useQuery<CoachingSession[]>({
    queryKey: ['/api/coaching', currentGoalId],
    enabled: !!currentGoalId,
  });

  if (!currentGoalId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Goal Set</h2>
          <p className="text-gray-600 mb-6">Set up a goal first to get coaching!</p>
          <button 
            onClick={() => window.location.href = '/setup'}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Set Up Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">💪 Your Brutal Coach</h1>
          <p className="text-xl text-gray-600">Get the tough love you need to stay on track</p>
        </div>

        <div className="mb-8">
          <BrutalCoach goalId={currentGoalId} />
        </div>

        {/* Previous Sessions */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Previous Coaching Sessions</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {sessions.slice(-5).reverse().map((session) => (
                <div key={session.id} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="text-sm text-gray-600 mb-1">
                    {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                  <div className="text-gray-800 mb-2">
                    <strong>You:</strong> {session.userMessage}
                  </div>
                  <div className="text-red-700 font-medium italic">
                    <strong>Coach:</strong> {session.coachResponse}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-red-500 mb-2">{sessions.length}</div>
            <div className="text-gray-600">Coaching Sessions</div>
          </div>
          <div className="text-center bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-amber-500 mb-2">
              {sessions.length > 0 ? Math.min(100, sessions.length * 10) : 0}%
            </div>
            <div className="text-gray-600">Motivation Level</div>
          </div>
          <div className="text-center bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {sessions.length * 2}
            </div>
            <div className="text-gray-600">Actions Inspired</div>
          </div>
        </div>
      </div>
    </div>
  );
}
