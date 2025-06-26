import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Headphones, Play, Pause, Settings, TrendingUp, Eye, Volume2, Shield, Star, Clock, Target, Brain, Activity } from 'lucide-react';
import axios from 'axios';

interface VREnvironment {
  id: number;
  environmentName: string;
  environmentType: string;
  description: string;
  therapeuticFocus: string;
  difficultyLevel: string;
  durationMinutes: number;
  accessibilityFeatures: any;
  environmentData: any;
  triggerWarnings: string[];
  therapeuticBenefits: string[];
}

interface VRSession {
  id: number;
  environmentId: number;
  sessionStart: string;
  sessionEnd: string;
  durationMinutes: number;
  effectivenessRating: number;
  stressLevelBefore: number;
  stressLevelAfter: number;
  moodBefore: string;
  moodAfter: string;
  therapeuticNotes: string;
  completionStatus: string;
}

interface VRProgress {
  id: number;
  environmentId: number;
  totalSessions: number;
  totalDurationMinutes: number;
  averageEffectiveness: number;
  skillDevelopmentLevel: number;
  milestoneAchievements: string[];
  therapeuticProgress: any;
  lastSessionDate: string;
}

interface VRRecommendation {
  id: number;
  environmentId: number;
  recommendationReason: string;
  confidenceScore: number;
  emotionalStateTrigger: string;
  therapeuticGoal: string;
  priorityLevel: string;
  isActive: boolean;
}

interface AccessibilitySettings {
  audioDescriptions: boolean;
  simplifiedControls: boolean;
  motionSensitivityLevel: string;
  triggerWarningAlerts: boolean;
  voiceGuidanceEnabled: boolean;
  subtitlesEnabled: boolean;
  highContrastMode: boolean;
  interactionAssistance: boolean;
}

const VRTherapy: React.FC = () => {
  const [activeTab, setActiveTab] = useState('environments');
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const { data: environments } = useQuery<VREnvironment[]>({
    queryKey: ['/api/vr-environments'],
    queryFn: () => axios.get('/api/vr-environments').then(res => res.data || [])
  });

  const { data: sessions } = useQuery<VRSession[]>({
    queryKey: ['/api/vr-sessions/1'],
    queryFn: () => axios.get('/api/vr-sessions/1').then(res => res.data || [])
  });

  const { data: progress } = useQuery<VRProgress[]>({
    queryKey: ['/api/vr-progress/1'],
    queryFn: () => axios.get('/api/vr-progress/1').then(res => res.data || [])
  });

  const { data: recommendations } = useQuery<VRRecommendation[]>({
    queryKey: ['/api/vr-recommendations/1'],
    queryFn: () => axios.get('/api/vr-recommendations/1').then(res => res.data || [])
  });

  const { data: accessibilitySettings } = useQuery<AccessibilitySettings>({
    queryKey: ['/api/vr-accessibility/1'],
    queryFn: () => axios.get('/api/vr-accessibility/1').then(res => res.data)
  });

  const startVRSession = async (environmentId: number) => {
    try {
      setSelectedEnvironment(environmentId);
      setSessionInProgress(true);
      setSessionStartTime(new Date());
      await axios.post('/api/vr-sessions/start', { userId: 1, environmentId });
    } catch (error) {
      console.error('Failed to start VR session:', error);
    }
  };

  const endVRSession = async (rating: number, stressBefore: number, stressAfter: number, notes: string) => {
    try {
      if (sessionStartTime && selectedEnvironment) {
        const duration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000);
        await axios.post('/api/vr-sessions/end', {
          userId: 1,
          environmentId: selectedEnvironment,
          durationMinutes: duration,
          effectivenessRating: rating,
          stressLevelBefore: stressBefore,
          stressLevelAfter: stressAfter,
          therapeuticNotes: notes
        });
        setSessionInProgress(false);
        setSelectedEnvironment(null);
        setSessionStartTime(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to end VR session:', error);
    }
  };

  const updateAccessibilitySettings = async (settings: Partial<AccessibilitySettings>) => {
    try {
      await axios.patch('/api/vr-accessibility/1', settings);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update accessibility settings:', error);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFocusColor = (focus: string) => {
    switch (focus) {
      case 'anxiety': return 'bg-blue-100 text-blue-800';
      case 'stress': return 'bg-purple-100 text-purple-800';
      case 'ptsd': return 'bg-orange-100 text-orange-800';
      case 'depression': return 'bg-pink-100 text-pink-800';
      case 'social_anxiety': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'mindfulness': return Brain;
      case 'relaxation': return Target;
      case 'exposure_therapy': return Activity;
      case 'trauma_recovery': return Shield;
      case 'mood_enhancement': return Star;
      default: return Headphones;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6] p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Headphones className="text-purple-600" />
                VR/AR Therapeutic Experiences
              </h1>
              <p className="text-gray-600 mt-2">Immersive healing environments for guided therapeutic sessions</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-purple-600">{progress?.length || 0} Environments Explored</div>
              <div className="text-sm text-gray-600">Therapeutic Progress</div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{sessions?.length || 0}</div>
              <div className="text-xs text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-white/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-600">
                {sessions?.reduce((total, session) => total + session.durationMinutes, 0) || 0}
              </div>
              <div className="text-xs text-gray-600">Minutes Practiced</div>
            </div>
            <div className="bg-white/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">
                {sessions?.length ? (sessions.reduce((sum, s) => sum + s.effectivenessRating, 0) / sessions.length).toFixed(1) : '0.0'}
              </div>
              <div className="text-xs text-gray-600">Avg Effectiveness</div>
            </div>
            <div className="bg-white/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{recommendations?.length || 0}</div>
              <div className="text-xs text-gray-600">AI Recommendations</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl mb-6 border border-white/20">
          <div className="flex">
            {[
              { id: 'environments', label: 'Environments', icon: Headphones },
              { id: 'sessions', label: 'Sessions', icon: Play },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'recommendations', label: 'AI Guidance', icon: Brain },
              { id: 'accessibility', label: 'Accessibility', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-700 hover:bg-white/40'
                  }`}
                >
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'environments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {environments?.map((env) => {
                const IconComponent = getEnvironmentIcon(env.environmentType);
                return (
                  <div key={env.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className="text-purple-600" size={24} />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{env.environmentName}</h3>
                          <p className="text-sm text-gray-600 capitalize">{env.environmentType.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(env.difficultyLevel)}`}>
                          {env.difficultyLevel}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getFocusColor(env.therapeuticFocus)}`}>
                          {env.therapeuticFocus}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{env.description}</p>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Therapeutic Benefits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {env.therapeuticBenefits.map((benefit) => (
                          <span key={benefit} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {benefit.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {env.triggerWarnings.length > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-1">
                          <Shield size={14} />
                          Content Warnings:
                        </h4>
                        <p className="text-sm text-yellow-700">
                          {env.triggerWarnings.join(', ').replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>{env.durationMinutes} minutes</span>
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
              })}
            </div>

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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Effectiveness (1-5)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        className="w-full"
                        id="effectiveness"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stress Before (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          className="w-full"
                          id="stressBefore"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stress After (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          className="w-full"
                          id="stressAfter"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        rows={3}
                        placeholder="How did this session help you? Any insights or observations..."
                        id="sessionNotes"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        const effectiveness = parseInt((document.getElementById('effectiveness') as HTMLInputElement).value);
                        const stressBefore = parseInt((document.getElementById('stressBefore') as HTMLInputElement).value);
                        const stressAfter = parseInt((document.getElementById('stressAfter') as HTMLInputElement).value);
                        const notes = (document.getElementById('sessionNotes') as HTMLTextAreaElement).value;
                        endVRSession(effectiveness, stressBefore, stressAfter, notes);
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      End Session
                    </button>
                    <button
                      onClick={() => setSessionInProgress(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {sessions?.map((session) => {
                const environment = environments?.find(env => env.id === session.environmentId);
                return (
                  <div key={session.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{environment?.environmentName}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(session.sessionStart).toLocaleDateString()} • {session.durationMinutes} minutes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-500" fill="currentColor" />
                          <span className="text-sm font-medium">{session.effectivenessRating}/5</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.completionStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.completionStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">{session.stressLevelBefore}</div>
                        <div className="text-xs text-blue-800">Stress Before</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600">{session.stressLevelAfter}</div>
                        <div className="text-xs text-green-800">Stress After</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-sm font-medium text-purple-600 capitalize">{session.moodBefore}</div>
                        <div className="text-xs text-purple-800">Mood Before</div>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-3 text-center">
                        <div className="text-sm font-medium text-pink-600 capitalize">{session.moodAfter}</div>
                        <div className="text-xs text-pink-800">Mood After</div>
                      </div>
                    </div>

                    {session.therapeuticNotes && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Session Notes:</h4>
                        <p className="text-sm text-gray-600">{session.therapeuticNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progress?.map((prog) => {
                const environment = environments?.find(env => env.id === prog.environmentId);
                return (
                  <div key={prog.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">{environment?.environmentName}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">Level {prog.skillDevelopmentLevel}</div>
                        <div className="text-xs text-gray-600">Skill Level</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">{prog.totalSessions}</div>
                        <div className="text-xs text-blue-800">Total Sessions</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-600">{prog.totalDurationMinutes}</div>
                        <div className="text-xs text-green-800">Total Minutes</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Average Effectiveness</span>
                        <span>{prog.averageEffectiveness}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(prog.averageEffectiveness / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Achievements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {prog.milestoneAchievements.map((achievement) => (
                          <span key={achievement} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {achievement.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Last session: {new Date(prog.lastSessionDate).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {recommendations?.map((rec) => {
                const environment = environments?.find(env => env.id === rec.environmentId);
                return (
                  <div key={rec.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{environment?.environmentName}</h3>
                        <span className="text-sm text-purple-600 capitalize">{rec.therapeuticGoal.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{Math.round(rec.confidenceScore * 100)}%</div>
                        <div className="text-xs text-gray-600">AI Confidence</div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{rec.recommendationReason}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Trigger: <span className="font-medium capitalize">{rec.emotionalStateTrigger.replace('_', ' ')}</span>
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          rec.priorityLevel === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priorityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priorityLevel} priority
                        </span>
                      </div>
                      <button
                        onClick={() => startVRSession(rec.environmentId)}
                        disabled={sessionInProgress}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Try Recommended
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Accessibility Settings</h3>
              
              {accessibilitySettings && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Visual Accessibility</h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Audio Descriptions</span>
                        <button
                          onClick={() => updateAccessibilitySettings({ audioDescriptions: !accessibilitySettings.audioDescriptions })}
                          className={`px-3 py-1 rounded text-sm ${
                            accessibilitySettings.audioDescriptions 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {accessibilitySettings.audioDescriptions ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">High Contrast Mode</span>
                        <button
                          onClick={() => updateAccessibilitySettings({ highContrastMode: !accessibilitySettings.highContrastMode })}
                          className={`px-3 py-1 rounded text-sm ${
                            accessibilitySettings.highContrastMode 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {accessibilitySettings.highContrastMode ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Subtitles</span>
                        <button
                          onClick={() => updateAccessibilitySettings({ subtitlesEnabled: !accessibilitySettings.subtitlesEnabled })}
                          className={`px-3 py-1 rounded text-sm ${
                            accessibilitySettings.subtitlesEnabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {accessibilitySettings.subtitlesEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Interaction Accessibility</h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Simplified Controls</span>
                        <button
                          onClick={() => updateAccessibilitySettings({ simplifiedControls: !accessibilitySettings.simplifiedControls })}
                          className={`px-3 py-1 rounded text-sm ${
                            accessibilitySettings.simplifiedControls 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {accessibilitySettings.simplifiedControls ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Voice Guidance</span>
                        <button
                          onClick={() => updateAccessibilitySettings({ voiceGuidanceEnabled: !accessibilitySettings.voiceGuidanceEnabled })}
                          className={`px-3 py-1 rounded text-sm ${
                            accessibilitySettings.voiceGuidanceEnabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {accessibilitySettings.voiceGuidanceEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Interaction Assistance</span>
                        <button
                          onClick={() => updateAccessibilitySettings({ interactionAssistance: !accessibilitySettings.interactionAssistance })}
                          className={`px-3 py-1 rounded text-sm ${
                            accessibilitySettings.interactionAssistance 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {accessibilitySettings.interactionAssistance ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Motion Sensitivity</h4>
                    <div className="flex gap-2">
                      {['low', 'normal', 'high'].map((level) => (
                        <button
                          key={level}
                          onClick={() => updateAccessibilitySettings({ motionSensitivityLevel: level })}
                          className={`px-4 py-2 rounded text-sm ${
                            accessibilitySettings.motionSensitivityLevel === level
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trigger Warning Alerts</span>
                    <button
                      onClick={() => updateAccessibilitySettings({ triggerWarningAlerts: !accessibilitySettings.triggerWarningAlerts })}
                      className={`px-3 py-1 rounded text-sm ${
                        accessibilitySettings.triggerWarningAlerts 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {accessibilitySettings.triggerWarningAlerts ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VRTherapy;