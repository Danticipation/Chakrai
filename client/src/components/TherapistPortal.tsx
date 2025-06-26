import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCheck, Calendar, FileText, Settings, Video, Phone, MapPin, Clock, Star, MessageSquare } from 'lucide-react';

interface Therapist {
  id: number;
  name: string;
  license_number: string;
  specialization: string[];
  contact_email: string;
  contact_phone: string;
  location: string;
  is_verified: boolean;
  rating: number;
  bio: string;
}

interface TherapistSession {
  id: number;
  therapist_name: string;
  session_type: string;
  scheduled_time: string;
  duration_minutes: number;
  session_status: string;
  meeting_link: string;
  preparation_notes: string;
}

interface SharedInsight {
  id: number;
  therapist_name: string;
  insight_type: string;
  content: string;
  shared_date: string;
  user_consent: boolean;
}

interface CollaborationSettings {
  id: number;
  auto_share_journal: boolean;
  share_mood_patterns: boolean;
  share_progress_metrics: boolean;
  share_crisis_alerts: boolean;
  sharing_frequency: string;
}

const TherapistPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: therapists } = useQuery<Therapist[]>({
    queryKey: ['/api/therapists'],
    queryFn: () => fetch('/api/therapists').then(res => res.json()),
  });

  const { data: sessions } = useQuery<TherapistSession[]>({
    queryKey: ['/api/therapist-sessions/1'],
    queryFn: () => fetch('/api/therapist-sessions/1').then(res => res.json()),
  });

  const { data: insights } = useQuery<SharedInsight[]>({
    queryKey: ['/api/therapist-shared-insights/1'],
    queryFn: () => fetch('/api/therapist-shared-insights/1').then(res => res.json()),
  });

  const { data: settings } = useQuery<CollaborationSettings>({
    queryKey: ['/api/collaboration-settings/1'],
    queryFn: () => fetch('/api/collaboration-settings/1').then(res => res.json()),
  });

  const renderOverviewTab = () => {
    return (
      <div className="space-y-6">
        {/* Connected Therapists */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Connected Therapists</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {therapists?.map((therapist) => (
              <div key={therapist.id} className="p-4 bg-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{therapist.name}</h4>
                    <p className="text-white/60 text-sm">License: {therapist.license_number}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {therapist.is_verified && <UserCheck className="w-4 h-4 text-green-400" />}
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">{therapist.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-3 h-3 text-white/60" />
                    <span className="text-white/80">{therapist.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {therapist.specialization?.map((spec, index) => (
                      <span key={index} className="px-2 py-1 bg-white/20 text-white text-xs rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-white/70 text-sm mb-3 line-clamp-2">{therapist.bio}</p>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded text-sm flex items-center justify-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Schedule</span>
                  </button>
                  <button className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded text-sm flex items-center justify-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            )) || <p className="text-white/60">No therapists connected</p>}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Sessions</h3>
          <div className="space-y-3">
            {sessions?.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-white/20">
                    {session.session_type === 'video' && <Video className="w-4 h-4 text-white" />}
                    {session.session_type === 'phone' && <Phone className="w-4 h-4 text-white" />}
                    {session.session_type === 'in_person' && <MapPin className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-white">{session.therapist_name}</p>
                    <p className="text-sm text-white/60 capitalize">{session.session_type} session</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white font-medium">
                    {new Date(session.scheduled_time).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-white/60">{session.duration_minutes} min</p>
                </div>
              </div>
            )) || <p className="text-white/60">No upcoming sessions</p>}
          </div>
        </div>

        {/* Recent Insights */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Shared Insights</h3>
          <div className="space-y-3">
            {insights?.slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-4 bg-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{insight.therapist_name}</span>
                  <span className="text-white/60 text-sm">{new Date(insight.shared_date).toLocaleDateString()}</span>
                </div>
                <p className="text-white/80 text-sm mb-2 capitalize">{insight.insight_type}</p>
                <p className="text-white/70 text-sm line-clamp-2">{insight.content}</p>
              </div>
            )) || <p className="text-white/60">No insights shared yet</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderSessionsTab = () => {
    return (
      <div className="space-y-6">
        {/* Session Management */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Session Management</h3>
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions?.map((session) => (
            <div key={session.id} className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-semibold">{session.therapist_name}</h4>
                  <p className="text-white/60 text-sm capitalize">{session.session_type} session</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  session.session_status === 'scheduled' ? 'bg-blue-500/20 text-blue-200' :
                  session.session_status === 'completed' ? 'bg-green-500/20 text-green-200' :
                  session.session_status === 'cancelled' ? 'bg-red-500/20 text-red-200' :
                  'bg-white/20 text-white'
                }`}>
                  {session.session_status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-white/60 text-xs">Date & Time</p>
                  <p className="text-white font-medium">{new Date(session.scheduled_time).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Duration</p>
                  <p className="text-white font-medium">{session.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Type</p>
                  <p className="text-white font-medium capitalize">{session.session_type}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Status</p>
                  <p className="text-white font-medium capitalize">{session.session_status}</p>
                </div>
              </div>

              {session.preparation_notes && (
                <div className="p-3 bg-white/10 rounded-lg mb-4">
                  <p className="text-white/60 text-xs mb-1">Session Preparation:</p>
                  <p className="text-white/80 text-sm">{session.preparation_notes}</p>
                </div>
              )}

              <div className="flex space-x-2">
                {session.meeting_link && session.session_status === 'scheduled' && (
                  <button className="bg-green-500/20 hover:bg-green-500/30 text-green-200 py-2 px-4 rounded text-sm flex items-center space-x-1">
                    <Video className="w-3 h-3" />
                    <span>Join Session</span>
                  </button>
                )}
                <button className="bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded text-sm">
                  Reschedule
                </button>
                <button className="bg-red-500/20 hover:bg-red-500/30 text-white py-2 px-4 rounded text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )) || <p className="text-white/60">No sessions scheduled</p>}
        </div>
      </div>
    );
  };

  const renderCollaborationTab = () => {
    return (
      <div className="space-y-6">
        {/* Collaboration Settings */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Data Sharing Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">Auto-Share Journal Summaries</p>
                <p className="text-white/60 text-sm">Weekly therapeutic insights from journal entries</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative ${settings?.auto_share_journal ? 'bg-green-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings?.auto_share_journal ? 'left-6' : 'left-0.5'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">Share Mood Patterns</p>
                <p className="text-white/60 text-sm">Emotional trends and pattern analysis</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative ${settings?.share_mood_patterns ? 'bg-green-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings?.share_mood_patterns ? 'left-6' : 'left-0.5'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">Progress Metrics</p>
                <p className="text-white/60 text-sm">Goal completion and wellness tracking</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative ${settings?.share_progress_metrics ? 'bg-green-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings?.share_progress_metrics ? 'left-6' : 'left-0.5'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">Crisis Alerts</p>
                <p className="text-white/60 text-sm">Immediate notifications for high-risk indicators</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative ${settings?.share_crisis_alerts ? 'bg-green-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings?.share_crisis_alerts ? 'left-6' : 'left-0.5'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sharing Frequency */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Sharing Frequency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['daily', 'weekly', 'monthly'].map((freq) => (
              <button
                key={freq}
                className={`p-4 rounded-lg border transition-all ${
                  settings?.sharing_frequency === freq
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
                }`}
              >
                <div className="text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium capitalize">{freq}</p>
                  <p className="text-sm opacity-80">
                    {freq === 'daily' && 'Real-time updates'}
                    {freq === 'weekly' && 'Weekly summaries'}
                    {freq === 'monthly' && 'Monthly reports'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Privacy & Consent</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Encrypted Sharing</p>
                <p className="text-white/70 text-sm">All shared data is encrypted end-to-end</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Revocable Consent</p>
                <p className="text-white/70 text-sm">You can revoke sharing permissions at any time</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Professional Ethics</p>
                <p className="text-white/70 text-sm">All therapists bound by professional confidentiality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a237e] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Therapist Collaboration</h1>
          <p className="text-white/80">Professional integration for hybrid therapy support</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#3f51b5] rounded-xl p-1 mb-6 border border-white/20">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: UserCheck },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
              { id: 'collaboration', label: 'Collaboration', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1a237e] text-white shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'sessions' && renderSessionsTab()}
        {activeTab === 'collaboration' && renderCollaborationTab()}
      </div>
    </div>
  );
};

export default TherapistPortal;