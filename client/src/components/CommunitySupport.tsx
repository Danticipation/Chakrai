import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageSquare, Heart, Calendar, Star, Plus, Shield, UserCheck } from 'lucide-react';

interface Forum {
  id: number;
  name: string;
  description: string;
  category: string;
  member_count: number;
  is_active: boolean;
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_name: string;
  created_at: string;
  heart_count: number;
  reply_count: number;
}

interface PeerCheckIn {
  id: number;
  paired_user_name: string;
  check_in_type: string;
  scheduled_time: string;
  completion_status: string;
  last_contact: string;
}

const CommunitySupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forums');

  const { data: forums } = useQuery<Forum[]>({
    queryKey: ['/api/support-forums'],
    queryFn: () => fetch('/api/support-forums').then(res => res.json()),
  });

  const { data: posts } = useQuery<ForumPost[]>({
    queryKey: ['/api/forum-posts'],
    queryFn: () => fetch('/api/forum-posts').then(res => res.json()),
  });

  const { data: checkIns } = useQuery<PeerCheckIn[]>({
    queryKey: ['/api/peer-check-ins/1'],
    queryFn: () => fetch('/api/peer-check-ins/1').then(res => res.json()),
  });

  const renderForumsTab = () => {
    return (
      <div className="space-y-6">
        {/* Forum Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forums?.map((forum) => (
            <div key={forum.id} className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold theme-text">{forum.name}</h3>
                <div className="flex items-center space-x-1 theme-text-secondary">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{forum.member_count}</span>
                </div>
              </div>
              <p className="theme-text-secondary text-sm mb-4">{forum.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs theme-text-secondary px-2 py-1 bg-[var(--theme-accent)] rounded">
                  {forum.category}
                </span>
                <button className="theme-text hover:bg-[var(--theme-accent)]/20 text-sm font-medium px-3 py-1 rounded-lg transition-colors">
                  Join Discussion →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
          <h3 className="text-lg font-semibold theme-text mb-4">Recent Posts</h3>
          <div className="space-y-4">
            {posts?.slice(0, 5).map((post) => (
              <div key={post.id} className="p-4 bg-[var(--theme-accent)] rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium theme-text mb-1">{post.title}</h4>
                    <p className="theme-text-secondary text-sm mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex items-center space-x-4 text-xs theme-text-secondary">
                      <span>by {post.author_name}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 theme-text-secondary">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.heart_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{post.reply_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPeerSupportTab = () => {
    return (
      <div className="space-y-6">
        {/* Peer Check-ins Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-secondary">Active Connections</p>
                <p className="text-2xl font-bold theme-text">{checkIns?.length || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-[var(--theme-accent)]">
                <UserCheck className="w-6 h-6 theme-text" />
              </div>
            </div>
          </div>

          <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-secondary">This Week</p>
                <p className="text-2xl font-bold theme-text">
                  {checkIns?.filter(c => c.completion_status === 'completed').length || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-[var(--theme-accent)]">
                <Calendar className="w-6 h-6 theme-text" />
              </div>
            </div>
          </div>

          <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-secondary">Support Score</p>
                <p className="text-2xl font-bold theme-text">4.8</p>
              </div>
              <div className="p-3 rounded-full bg-[var(--theme-accent)]">
                <Star className="w-6 h-6 theme-text" />
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Check-ins */}
        <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
          <h3 className="text-lg font-semibold theme-text mb-4">Scheduled Check-ins</h3>
          <div className="space-y-3">
            {checkIns?.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center justify-between p-3 bg-[var(--theme-accent)]/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-[var(--theme-accent)]/30">
                    <Users className="w-4 h-4 theme-text" />
                  </div>
                  <div>
                    <p className="font-medium theme-text">{checkIn.paired_user_name}</p>
                    <p className="text-sm theme-text-secondary capitalize">{checkIn.check_in_type} check-in</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm theme-text font-medium">
                    {new Date(checkIn.scheduled_time).toLocaleDateString()}
                  </p>
                  <p className="text-xs theme-text-secondary capitalize">{checkIn.completion_status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen theme-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold theme-text mb-2">Community Support</h1>
          <p className="theme-text-secondary">Connect with others on their wellness journey</p>
        </div>

        {/* Navigation Tabs */}
        <div className="theme-card rounded-xl p-1 mb-6 border border-[var(--theme-accent)]">
          <div className="flex space-x-1">
            {[
              { id: 'forums', label: 'Support Forums', icon: MessageSquare },
              { id: 'peer', label: 'Peer Check-ins', icon: Users },
              { id: 'moderation', label: 'Community Guidelines', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--theme-primary)] theme-text shadow-sm'
                    : 'theme-text-secondary hover:theme-text hover:bg-[var(--theme-accent)]/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'forums' && renderForumsTab()}
        {activeTab === 'peer' && renderPeerSupportTab()}
        {activeTab === 'moderation' && (
          <div className="text-center py-8 theme-text-secondary">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Community guidelines and moderation tools coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitySupport;