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
  const { data: memoryProfile, isLoading, error } = useQuery<MemoryProfile>({
    queryKey: ['/api/memory-profile', userId],
    queryFn: async () => {
      const response = await fetch(`/api/memory-profile?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch memory profile');
      return response.json();
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Memory & Reflection</h2>
        <div className="animate-pulse space-y-4">
          <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
            <div className="h-6 bg-white/60 rounded mb-4 w-3/4"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-xl p-3 h-16"></div>
              <div className="bg-white/60 rounded-xl p-3 h-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Memory & Reflection</h2>
        <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Unable to load memory data. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!memoryProfile) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Memory & Reflection</h2>
        <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No memory data available.</p>
        </div>
      </div>
    );
  }

  const profile = memoryProfile?.personalityProfile;

  // Debug logging
  console.log('Memory Profile Data:', memoryProfile);
  console.log('Profile:', profile);

  return (
    <div className="space-y-4">
      {/* Title */}
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Memory & Reflection</h2>
      
      {/* Memory Statistics */}
      <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Self-Reflection Progress
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <div className="text-xl font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{memoryProfile?.totalMemories || 0}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Memories</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <div className="text-xl font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{memoryProfile?.totalFacts || 0}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Personal Facts</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{memoryProfile?.stage || 'Learning'}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Mirror Stage</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{profile?.coreTraits?.length || 0}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Core Traits</div>
          </div>
        </div>
      </div>

      {/* Personality Profile */}
      {profile && (
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Your Personality Mirror
            </h3>
          </div>
          <div className="space-y-3">
            <div className="bg-white/60 rounded-xl p-3">
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Communication Style</h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {profile.communicationStyle}
              </p>
            </div>
            
            {profile.coreTraits?.length > 0 && (
              <div className="bg-white/60 rounded-xl p-3">
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Core Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.coreTraits.slice(0, 4).map((trait, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
                      backgroundColor: 'var(--soft-blue-light)', 
                      color: 'var(--soft-blue-dark)' 
                    }}>
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.interests?.length > 0 && (
              <div className="bg-white/60 rounded-xl p-3">
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.slice(0, 3).map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
                      backgroundColor: 'var(--pale-green)', 
                      color: 'var(--soft-blue-dark)' 
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.lifePhilosophy && (
              <div className="bg-white/60 rounded-xl p-3">
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Life Philosophy</h4>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                  "{profile.lifePhilosophy}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Memories */}
      <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--soft-blue-light)' }}>
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Conversations
          </h3>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {memoryProfile?.recentMemories && memoryProfile.recentMemories.length > 0 ? (
            memoryProfile.recentMemories.slice(-8).map((memory) => (
              <div key={memory.id} className="bg-white/60 rounded-xl p-3">
                <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
                  {memory.memory}
                </p>
                <div className="flex items-center space-x-2">
                  <span 
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: memory.importance === 'high' ? 'var(--gentle-lavender)' : 'var(--pale-green)',
                      color: 'var(--soft-blue-dark)'
                    }}
                  >
                    {memory.importance}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p style={{ color: 'var(--text-secondary)' }}>Start conversations to build your reflection mirror</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}