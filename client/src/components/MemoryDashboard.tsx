import { useQuery } from '@tanstack/react-query';

interface MemoryProfile {
  totalMemories: number;
  totalFacts: number;
  recentMemories: Array<{
    id: number;
    memory: string;
    category: string;
    importance: string;
    createdAt: string;
  }>;
  keyFacts: Array<{
    id: number;
    fact: string;
    category: string;
    confidence: string;
    createdAt: string;
  }>;
  personalityProfile: {
    communicationStyle: string;
    emotionalPatterns: string[];
    interests: string[];
    values: string[];
    coreTraits: string[];
    lifePhilosophy: string;
    uniqueMannerisms: string[];
  };
  stage: string;
}

export default function MemoryDashboard({ userId = 1 }: { userId?: number }) {
  const { data: memoryProfile, isLoading } = useQuery<MemoryProfile>({
    queryKey: ['/api/memory-profile', userId],
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const profile = memoryProfile?.personalityProfile;

  return (
    <div className="space-y-6">
      {/* Memory Statistics */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Self-Reflection Progress
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{memoryProfile?.totalMemories || 0}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Memories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{memoryProfile?.totalFacts || 0}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Personal Facts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-800 dark:text-purple-200">{memoryProfile?.stage || 'Learning'}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Mirror Stage</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">{profile?.coreTraits?.length || 0}</div>
            <div className="text-sm text-indigo-600 dark:text-indigo-400">Core Traits</div>
          </div>
        </div>
      </div>

      {/* Personality Profile */}
      {profile && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Your Personality Mirror
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Communication Style</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                {profile.communicationStyle}
              </p>
            </div>
            
            {profile.coreTraits?.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Core Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.coreTraits.slice(0, 4).map((trait, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.interests?.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.slice(0, 3).map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.lifePhilosophy && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Life Philosophy</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded italic">
                  "{profile.lifePhilosophy}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Memories */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200/50 dark:border-green-700/50 shadow-lg">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Conversations
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {memoryProfile?.recentMemories && memoryProfile.recentMemories.length > 0 ? (
            memoryProfile.recentMemories.slice(-8).map((memory) => (
              <div key={memory.id} className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-green-200/30 dark:border-green-700/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{memory.memory}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        memory.importance === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                      }`}>
                        {memory.importance}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(memory.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Start conversations to build your reflection mirror</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}