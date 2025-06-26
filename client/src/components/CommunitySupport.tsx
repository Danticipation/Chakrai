import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageCircle, Heart, Plus, Reply, Flag, Calendar, Video, Phone, MapPin, Clock, Star } from 'lucide-react';
import axios from 'axios';

interface Forum {
  id: number;
  name: string;
  description: string;
  category: string;
  postCount: number;
  memberCount: number;
  isActive: boolean;
}

interface ForumPost {
  id: number;
  forumId: number;
  title: string;
  content: string;
  anonymousName: string;
  heartCount: number;
  replyCount: number;
  createdAt: string;
}

interface ForumReply {
  id: number;
  postId: number;
  content: string;
  anonymousName: string;
  heartCount: number;
  createdAt: string;
}

interface PeerCheckIn {
  id: number;
  checkInType: string;
  frequency: string;
  isActive: boolean;
  lastCheckIn: string;
  nextCheckIn: string;
}

interface Therapist {
  id: number;
  name: string;
  bio: string;
  yearsExperience: number;
  hourlyRate: number;
  sessionTypes: string[];
  isActive: boolean;
}

interface TherapistSession {
  id: number;
  therapistId: number;
  sessionType: string;
  scheduledTime: string;
  duration: number;
  status: string;
  meetingLink: string;
}

const CommunitySupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forums');
  const [selectedForum, setSelectedForum] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');

  const { data: forums } = useQuery<Forum[]>({
    queryKey: ['/api/support-forums'],
    queryFn: () => axios.get('/api/support-forums').then(res => res.data || [])
  });

  const { data: forumPosts } = useQuery<ForumPost[]>({
    queryKey: ['/api/forum-posts', selectedForum],
    queryFn: () => selectedForum ? axios.get(`/api/forum-posts/${selectedForum}`).then(res => res.data || []) : Promise.resolve([]),
    enabled: !!selectedForum
  });

  const { data: forumReplies } = useQuery<ForumReply[]>({
    queryKey: ['/api/forum-replies', selectedPost],
    queryFn: () => selectedPost ? axios.get(`/api/forum-replies/${selectedPost}`).then(res => res.data || []) : Promise.resolve([]),
    enabled: !!selectedPost
  });

  const { data: peerCheckIns } = useQuery<PeerCheckIn[]>({
    queryKey: ['/api/peer-check-ins/1'],
    queryFn: () => axios.get('/api/peer-check-ins/1').then(res => res.data || [])
  });

  const { data: therapists } = useQuery<Therapist[]>({
    queryKey: ['/api/therapists'],
    queryFn: () => axios.get('/api/therapists').then(res => res.data || [])
  });

  const { data: therapistSessions } = useQuery<TherapistSession[]>({
    queryKey: ['/api/therapist-sessions/1'],
    queryFn: () => axios.get('/api/therapist-sessions/1').then(res => res.data || [])
  });

  const createPost = async () => {
    if (!selectedForum || !newPostTitle.trim() || !newPostContent.trim()) return;
    
    try {
      await axios.post('/api/forum-posts', {
        forumId: selectedForum,
        userId: 1,
        title: newPostTitle,
        content: newPostContent,
        isAnonymous: true
      });
      setNewPostTitle('');
      setNewPostContent('');
      window.location.reload();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const createReply = async () => {
    if (!selectedPost || !newReplyContent.trim()) return;
    
    try {
      await axios.post('/api/forum-replies', {
        postId: selectedPost,
        userId: 1,
        content: newReplyContent,
        isAnonymous: true
      });
      setNewReplyContent('');
      window.location.reload();
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  const scheduleSession = async (therapistId: number, sessionType: string) => {
    try {
      const scheduledTime = new Date();
      scheduledTime.setDate(scheduledTime.getDate() + 7); // Schedule for next week
      
      await axios.post('/api/therapist-sessions', {
        userId: 1,
        therapistId,
        sessionType,
        scheduledTime: scheduledTime.toISOString()
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to schedule session:', error);
    }
  };

  const likeContent = async (contentType: string, contentId: number) => {
    try {
      await axios.post('/api/like-content', { contentType, contentId, userId: 1 });
      window.location.reload();
    } catch (error) {
      console.error('Failed to like content:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return Users;
      case 'anxiety': return Heart;
      case 'depression': return MessageCircle;
      case 'crisis': return Flag;
      default: return Users;
    }
  };

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in_person': return MapPin;
      default: return Video;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6] p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" />
            Community & Professional Support
          </h1>
          <p className="text-gray-600 mt-2">Connect with peers and professional therapists for comprehensive mental health support</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#1a237e]/20 backdrop-blur-sm rounded-xl mb-6 border border-[#1a237e]/30">
          <div className="flex">
            {[
              { id: 'forums', label: 'Support Forums', icon: MessageCircle },
              { id: 'peer', label: 'Peer Check-ins', icon: Users },
              { id: 'therapists', label: 'Find Therapists', icon: Star },
              { id: 'sessions', label: 'My Sessions', icon: Calendar }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#1a237e] text-white'
                      : 'text-white hover:bg-[#1a237e]/40'
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
        {activeTab === 'forums' && (
          <div className="space-y-6">
            {!selectedForum && !selectedPost && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(forums) && forums.map((forum) => {
                  const IconComponent = getCategoryIcon(forum.category);
                  return (
                    <div 
                      key={forum.id} 
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 cursor-pointer hover:bg-white/70 transition-colors"
                      onClick={() => setSelectedForum(forum.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <IconComponent className="text-blue-600" size={24} />
                        <h3 className="text-lg font-semibold text-gray-800">{forum.name}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{forum.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{forum.postCount} posts</span>
                        <span>{forum.memberCount} members</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedForum && !selectedPost && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setSelectedForum(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Back to Forums
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">Forum Posts</h2>
                </div>

                {/* New Post Form */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Post</h3>
                  <input
                    type="text"
                    placeholder="Post title..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={createPost}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={16} className="inline mr-2" />
                    Create Post
                  </button>
                </div>

                {/* Forum Posts */}
                <div className="space-y-4">
                  {Array.isArray(forumPosts) && forumPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 cursor-pointer hover:bg-white/70 transition-colors"
                      onClick={() => setSelectedPost(post.id)}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">by {post.anonymousName}</span>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              likeContent('post', post.id);
                            }}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                          >
                            <Heart size={16} />
                            {post.heartCount}
                          </button>
                          <span className="flex items-center gap-1">
                            <Reply size={16} />
                            {post.replyCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPost && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Back to Posts
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">Post Replies</h2>
                </div>

                {/* New Reply Form */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Reply</h3>
                  <textarea
                    placeholder="Write your reply..."
                    value={newReplyContent}
                    onChange={(e) => setNewReplyContent(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={createReply}
                    disabled={!newReplyContent.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Reply size={16} className="inline mr-2" />
                    Post Reply
                  </button>
                </div>

                {/* Forum Replies */}
                <div className="space-y-4">
                  {Array.isArray(forumReplies) && forumReplies.map((reply) => (
                    <div key={reply.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <p className="text-gray-700 mb-4">{reply.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">by {reply.anonymousName}</span>
                        <button
                          onClick={() => likeContent('reply', reply.id)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart size={16} />
                          {reply.heartCount}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'peer' && (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Peer Check-ins</h3>
              <div className="space-y-4">
                {Array.isArray(peerCheckIns) && peerCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="bg-white/40 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800 capitalize">{checkIn.checkInType.replace('_', ' ')} Support</h4>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        checkIn.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {checkIn.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Frequency: {checkIn.frequency}</p>
                      <p>Last check-in: {new Date(checkIn.lastCheckIn).toLocaleDateString()}</p>
                      <p>Next check-in: {new Date(checkIn.nextCheckIn).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Find Peer Support</h3>
              <p className="text-gray-600 mb-4">Connect with others who understand your journey. Our anonymous peer support system matches you with someone who can provide encouragement and accountability.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { type: 'daily', title: 'Daily Check-ins', description: 'Regular daily support and motivation' },
                  { type: 'crisis', title: 'Crisis Support', description: 'Immediate peer support during difficult times' },
                  { type: 'motivation', title: 'Motivation Partner', description: 'Accountability for goals and habits' },
                  { type: 'accountability', title: 'Accountability Buddy', description: 'Regular progress check-ins' }
                ].map((support) => (
                  <div key={support.type} className="bg-white/40 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">{support.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{support.description}</p>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors">
                      Request Support
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'therapists' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(therapists) && therapists.map((therapist) => (
                <div key={therapist.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{therapist.name}</h3>
                      <p className="text-sm text-gray-600">{therapist.yearsExperience} years experience</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${therapist.hourlyRate}/hr</div>
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        <Star size={16} fill="currentColor" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{therapist.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.isArray(therapist.sessionTypes) && therapist.sessionTypes.map((type) => {
                      const IconComponent = getSessionIcon(type);
                      return (
                        <span key={type} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          <IconComponent size={14} />
                          {type.replace('_', ' ')}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    {therapist.sessionTypes?.map((sessionType) => (
                      <button
                        key={sessionType}
                        onClick={() => scheduleSession(therapist.id, sessionType)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        Book {sessionType.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Sessions</h3>
              <div className="space-y-4">
                {Array.isArray(therapistSessions) && therapistSessions.filter(s => s.status === 'scheduled').map((session) => {
                  const IconComponent = getSessionIcon(session.sessionType);
                  return (
                    <div key={session.id} className="bg-white/40 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-800">Session with Therapist #{session.therapistId}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <IconComponent size={16} />
                            <span>{session.sessionType.replace('_', ' ')}</span>
                            <Clock size={16} />
                            <span>{session.duration} minutes</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(session.scheduledTime).toLocaleString()}
                      </p>
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                          <Video size={16} />
                          Join Session
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Session History</h3>
              <div className="space-y-4">
                {Array.isArray(therapistSessions) && therapistSessions.filter(s => s.status === 'completed').map((session) => (
                  <div key={session.id} className="bg-white/40 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">Session with Therapist #{session.therapistId}</h4>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(session.scheduledTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitySupport;