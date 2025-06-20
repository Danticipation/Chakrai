import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Video, Phone, MapPin, Plus, Share2, Settings, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import type { Therapist, TherapistSession, TherapistSharedInsight, CollaborationSettings } from '@shared/schema';
import { format } from 'date-fns';

interface TherapistPortalProps {
  userId: string;
}

export default function TherapistPortal({ userId }: TherapistPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'insights' | 'settings'>('overview');
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [showScheduleSession, setShowScheduleSession] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  const queryClient = useQueryClient();

  // Fetch therapists
  const { data: therapists, isLoading: therapistsLoading } = useQuery({
    queryKey: ['/api/therapists', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/therapists?userId=${userId}`);
      return response.data as Therapist[];
    },
  });

  // Fetch upcoming sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/therapist-sessions', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/therapist-sessions?userId=${userId}`);
      return response.data as TherapistSession[];
    },
  });

  // Fetch shared insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/therapist-insights', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/therapist-insights?userId=${userId}`);
      return response.data as TherapistSharedInsight[];
    },
  });

  // Fetch collaboration settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/collaboration-settings', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/collaboration-settings?userId=${userId}`);
      return response.data as CollaborationSettings;
    },
  });

  // Add therapist mutation
  const addTherapistMutation = useMutation({
    mutationFn: async (therapistData: any) => {
      const response = await axios.post('/api/therapists', therapistData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/therapists', userId] });
      setShowAddTherapist(false);
    },
  });

  // Schedule session mutation
  const scheduleSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await axios.post('/api/therapist-sessions', sessionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/therapist-sessions', userId] });
      setShowScheduleSession(false);
    },
  });

  // Share insight mutation
  const shareInsightMutation = useMutation({
    mutationFn: async (insightData: any) => {
      const response = await axios.post('/api/therapist-insights', insightData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/therapist-insights', userId] });
    },
  });

  const upcomingSessions = sessions?.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduledAt) > new Date()
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()) || [];

  const recentInsights = insights?.slice(0, 3) || [];

  if (therapistsLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--soft-blue)' }}></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Therapist Collaboration Portal
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Connect with professional therapists and share insights from your mental wellness journey
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 rounded-xl p-1" style={{ backgroundColor: 'var(--surface-secondary)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'sessions', label: 'Sessions', icon: Calendar },
          { id: 'insights', label: 'Shared Insights', icon: Share2 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--soft-blue)' : 'transparent',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Connected Therapists</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{therapists?.length || 0}</p>
                </div>
                <User className="h-8 w-8" style={{ color: 'var(--soft-blue)' }} />
              </div>
            </div>
            
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Upcoming Sessions</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{upcomingSessions.length}</p>
                </div>
                <Calendar className="h-8 w-8" style={{ color: 'var(--pale-green)' }} />
              </div>
            </div>
            
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Shared Insights</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{insights?.length || 0}</p>
                </div>
                <Share2 className="h-8 w-8" style={{ color: 'var(--gentle-lavender)' }} />
              </div>
            </div>
          </div>

          {/* Connected Therapists */}
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Your Therapists</h3>
              <button
                onClick={() => setShowAddTherapist(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: 'var(--soft-blue)' }}
              >
                <Plus size={16} />
                <span>Add Therapist</span>
              </button>
            </div>

            {therapists?.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No therapists connected yet. Add your first therapist to start collaborating.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {therapists?.map((therapist) => (
                  <div key={therapist.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--soft-blue-light)' }}>
                        <User size={20} style={{ color: 'var(--soft-blue)' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{therapist.name}</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{therapist.email}</p>
                        {therapist.specialization && (
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {therapist.specialization.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {therapist.isVerified && (
                        <CheckCircle size={16} style={{ color: 'var(--pale-green)' }} />
                      )}
                      <button
                        onClick={() => {
                          setSelectedTherapist(therapist);
                          setShowScheduleSession(true);
                        }}
                        className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: 'var(--soft-blue)' }}
                      >
                        Schedule Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Upcoming Sessions</h3>
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => {
                  const therapist = therapists?.find(t => t.id === session.therapistId);
                  const sessionDate = new Date(session.scheduledAt);
                  const Icon = session.sessionType === 'video' ? Video : session.sessionType === 'phone' ? Phone : MapPin;
                  
                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Icon size={20} style={{ color: 'var(--soft-blue)' }} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{therapist?.name}</p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {format(sessionDate, 'MMM d, yyyy')} at {format(sessionDate, 'h:mm a')}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {session.duration} minutes • {session.sessionType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {Math.round((sessionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Shared Insights */}
          {recentInsights.length > 0 && (
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Shared Insights</h3>
              <div className="space-y-3">
                {recentInsights.map((insight) => {
                  const therapist = therapists?.find(t => t.id === insight.therapistId);
                  
                  return (
                    <div key={insight.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Share2 size={20} style={{ color: 'var(--gentle-lavender)' }} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {insight.insightType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Shared with {therapist?.name} • {format(new Date(insight.sharedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {insight.therapistViewed ? (
                          <CheckCircle size={16} style={{ color: 'var(--pale-green)' }} />
                        ) : (
                          <AlertCircle size={16} style={{ color: 'var(--text-secondary)' }} />
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {insight.therapistViewed ? 'Viewed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Session scheduling interface will be implemented here */}
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Session Management</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Schedule and manage your therapy sessions with connected professionals.
            </p>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Insight sharing interface will be implemented here */}
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Shared Insights</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              View and manage insights shared with your therapists.
            </p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Collaboration settings interface will be implemented here */}
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Collaboration Settings</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Configure how your data is shared with therapists.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}