import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Headphones, Play, Pause, Settings, TrendingUp, Eye, Volume2, Shield, Star, Clock, Target, Brain, Activity } from 'lucide-react';

interface VREnvironment {
  id: number;
  name: string;
  category: string;
  description: string;
  therapeuticFocus: string[];
  difficulty: string;
  duration: number;
  accessibilityFeatures: string[];
  imageUrl?: string;
  isAvailable: boolean;
}

interface VRSession {
  id: number;
  userId: number;
  environmentId: number;
  environmentName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  completionStatus: string;
  effectivenessRating: number;
  stressLevelBefore: number;
  stressLevelAfter: number;
  therapeuticNotes: string;
  skillsDeveloped: string[];
}

interface VRProgress {
  userId: number;
  totalSessions: number;
  totalMinutes: number;
  averageEffectiveness: number;
  averageStressReduction: number;
  skillLevels: {
    mindfulness: number;
    relaxation: number;
    exposure_therapy: number;
    emotional_processing: number;
  };
  milestones: Array<{
    id: number;
    name: string;
    description: string;
    achievedDate: string;
    category: string;
  }>;
  nextRecommendations: Array<{
    environmentId: number;
    environmentName: string;
    reason: string;
    difficulty: string;
  }>;
}

const VRTherapy: React.FC = () => {
  const [activeTab, setActiveTab] = useState('environments');
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const { data: environments, isLoading: isLoadingEnvironments } = useQuery<VREnvironment[]>({
    queryKey: ['/api/vr-environments/1'],
    queryFn: async () => {
      const response = await fetch('/api/vr-environments/1');
      return response.json();
    }
  });

  const { data: sessions, isLoading: isLoadingSessions } = useQuery<VRSession[]>({
    queryKey: ['/api/vr-sessions/1'],
    queryFn: async () => {
      const response = await fetch('/api/vr-sessions/1');
      return response.json();
    }
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<VRProgress>({
    queryKey: ['/api/vr-progress/1'],
    queryFn: async () => {
      const response = await fetch('/api/vr-progress/1');
      return response.json();
    }
  });

  const getEnvironmentIcon = (category: string) => {
    switch (category) {
      case 'mindfulness': return Brain;
      case 'relaxation': return Volume2;
      case 'counseling': return Shield;
      case 'exposure_therapy': return Target;
      default: return Eye;
    }
  };

  const startVRSession = (environmentId: number) => {
    setSelectedEnvironment(environmentId);
    setSessionInProgress(true);
    setSessionStartTime(new Date());
  };

  const endVRSession = () => {
    setSessionInProgress(false);
    setSelectedEnvironment(null);
    setSessionStartTime(null);
  };

  const tabs = [
    { id: 'environments', label: 'VR Environments', icon: Eye },
    { id: 'sessions', label: 'Session History', icon: Clock },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp },
    { id: 'settings', label: 'Accessibility', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Headphones className="text-purple-600" size={48} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              VR Therapy Studio
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Immersive Virtual Reality experiences designed for therapeutic healing, mindfulness practice, and emotional wellness
          </p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-blue-600" size={24} />
              <span className="text-sm font-medium text-gray-600">Total Sessions</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {progress?.totalSessions || 0}
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-green-600" size={24} />
              <span className="text-sm font-medium text-gray-600">Minutes Practiced</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {sessions?.reduce((total, session) => total + session.durationMinutes, 0) || 0}
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Star className="text-yellow-600" size={24} />
              <span className="text-sm font-medium text-gray-600">Avg Effectiveness</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {sessions?.length ? (sessions.reduce((sum, s) => sum + s.effectivenessRating, 0) / sessions.length).toFixed(1) : '0.0'}
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-purple-600" size={24} />
              <span className="text-sm font-medium text-gray-600">Stress Reduction</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {progress?.averageStressReduction ? `${(progress.averageStressReduction * 10).toFixed(0)}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 mb-8">
          <div className="flex flex-wrap gap-1 p-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <IconComponent size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'environments' && (
          <div className="space-y-6">
            {isLoadingEnvironments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading VR environments...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {environments && environments.length > 0 ? environments.map((env) => {
                  const IconComponent = getEnvironmentIcon(env.category);
                  return (
                    <div key={env.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <IconComponent className="text-purple-600" size={24} />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{env.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{env.category.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          env.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          env.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {env.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{env.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {env.therapeuticFocus.slice(0, 3).map((focus, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {focus.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} />
                          <span>{env.duration} minutes</span>
                        </div>
                        <button
                          onClick={() => startVRSession(env.id)}
                          disabled={sessionInProgress}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          <Play size={16} />
                          {sessionInProgress && selectedEnvironment === env.id ? 'In Session' : 'Start Session'}
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 col-span-2">
                    <p className="text-gray-600">No VR environments available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {isLoadingSessions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading session history...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions && sessions.length > 0 ? sessions.map((session) => (
                  <div key={session.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{session.environmentName}</h3>
                        <p className="text-sm text-gray-600">{new Date(session.startTime).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.completionStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        session.completionStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {session.completionStatus.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">{session.durationMinutes}m</div>
                        <div className="text-xs text-gray-600">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">{session.effectivenessRating}/5</div>
                        <div className="text-xs text-gray-600">Effectiveness</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">
                          {((session.stressLevelBefore - session.stressLevelAfter) / session.stressLevelBefore * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Stress Reduction</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm">{session.therapeuticNotes}</p>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No session history available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {isLoadingProgress ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading progress data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Development</h3>
                  {progress?.skillLevels && Object.entries(progress.skillLevels).map(([skill, level]) => (
                    <div key={skill} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize">{skill.replace('_', ' ')}</span>
                        <span className="text-gray-600">{level.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(level / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Milestones</h3>
                  <div className="space-y-3">
                    {progress?.milestones?.slice(0, 5).map((milestone) => (
                      <div key={milestone.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Star className="text-purple-600" size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{milestone.name}</h4>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                          <p className="text-xs text-gray-500">{new Date(milestone.achievedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Accessibility Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Audio Descriptions</h4>
                    <p className="text-sm text-gray-600">Detailed voice descriptions of visual elements</p>
                  </div>
                  <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Simplified Controls</h4>
                    <p className="text-sm text-gray-600">Reduced complexity for easier navigation</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Motion Sensitivity</h4>
                    <p className="text-sm text-gray-600">Reduce motion for comfort</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Trigger Warnings</h4>
                    <p className="text-sm text-gray-600">Alert before potentially triggering content</p>
                  </div>
                  <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Voice Guidance</h4>
                    <p className="text-sm text-gray-600">Spoken instructions during sessions</p>
                  </div>
                  <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">High Contrast</h4>
                    <p className="text-sm text-gray-600">Enhanced visual contrast for clarity</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session in Progress Modal */}
        {sessionInProgress && selectedEnvironment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">VR Session in Progress</h3>
              <p className="text-gray-600 mb-4">
                You are currently in a therapeutic VR session. When you're ready to end the session, please provide feedback below.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Effectiveness (1-5)
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Select rating</option>
                    <option value="1">1 - Not effective</option>
                    <option value="2">2 - Slightly effective</option>
                    <option value="3">3 - Moderately effective</option>
                    <option value="4">4 - Very effective</option>
                    <option value="5">5 - Extremely effective</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Notes
                  </label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    placeholder="How did this session help you?"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={endVRSession}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  End Session
                </button>
                <button
                  onClick={() => setSessionInProgress(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Continue Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VRTherapy;