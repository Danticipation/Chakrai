import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Users, Heart, Flag, Clock, Shield, Send, Plus, UserCheck, Eye, EyeOff } from 'lucide-react';

interface SupportForum {
  id: number;
  name: string;
  description: string;
  category: string;
  isModerated: boolean;
  anonymousPostsAllowed: boolean;
  createdAt: string;
}

interface ForumPost {
  id: number;
  forumId: number;
  authorId: number | null;
  anonymousName: string | null;
  title: string;
  content: string;
  isAnonymous: boolean;
  supportCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ForumReply {
  id: number;
  postId: number;
  authorId: number | null;
  anonymousName: string | null;
  content: string;
  isAnonymous: boolean;
  supportCount: number;
  createdAt: string;
}

interface PeerCheckIn {
  id: number;
  requesterId: number;
  partnerId: number | null;
  status: string;
  checkInType: string;
  preferredTime: string;
  duration: number;
  isAnonymous: boolean;
  notes: string | null;
  scheduledAt: string | null;
  createdAt: string;
}

interface CommunityPortalProps {
  userId: number;
}

export default function CommunityPortal({ userId }: CommunityPortalProps) {
  const [activeTab, setActiveTab] = useState<'forums' | 'checkins'>('forums');
  const [selectedForum, setSelectedForum] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [showNewCheckIn, setShowNewCheckIn] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const queryClient = useQueryClient();

  // Fetch support forums
  const { data: forums } = useQuery({
    queryKey: ['/api/community/forums'],
    retry: false,
  });

  // Fetch forum posts for selected forum
  const { data: posts } = useQuery({
    queryKey: ['/api/community/forums', selectedForum, 'posts'],
    enabled: !!selectedForum,
    retry: false,
  });

  // Fetch forum replies for selected post
  const { data: replies } = useQuery({
    queryKey: ['/api/community/posts', selectedPost, 'replies'],
    enabled: !!selectedPost,
    retry: false,
  });

  // Fetch user's peer check-ins
  const { data: userCheckIns } = useQuery({
    queryKey: ['/api/community/peer-checkins', userId],
    retry: false,
  });

  // Fetch available peer check-in requests
  const { data: availableCheckIns } = useQuery({
    queryKey: ['/api/community/peer-checkins/available'],
    retry: false,
  });

  const generateAnonymousName = () => {
    const adjectives = ['Kind', 'Brave', 'Gentle', 'Strong', 'Calm', 'Wise', 'Hope', 'Peace'];
    const nouns = ['Heart', 'Soul', 'Spirit', 'Friend', 'Helper', 'Listener', 'Supporter', 'Guardian'];
    const randomNum = Math.floor(Math.random() * 999);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}${randomNum}`;
  };

  const ForumsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Support Forums</h2>
          <p className="text-gray-600 mt-1">Anonymous, moderated spaces for peer support</p>
        </div>
      </div>

      <div className="grid gap-4">
        {(forums || []).map((forum: SupportForum) => (
          <div
            key={forum.id}
            onClick={() => setSelectedForum(forum.id)}
            className="bg-white rounded-2xl p-6 border border-blue-100 hover:border-blue-200 cursor-pointer transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-800">{forum.name}</h3>
                  {forum.isModerated && (
                    <Shield className="w-4 h-4 text-green-500" title="Moderated Forum" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{forum.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {forum.category}
                  </span>
                  {forum.anonymousPostsAllowed && (
                    <span className="flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Anonymous posting allowed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PostsList = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setSelectedForum(null)}
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          ← Back to Forums
        </button>
        <button
          onClick={() => setShowNewPost(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="space-y-4">
        {(posts || []).map((post: ForumPost) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post.id)}
            className="bg-white rounded-2xl p-6 border border-blue-100 hover:border-blue-200 cursor-pointer transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex-1">{post.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Heart className="w-4 h-4" />
                {post.supportCount}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-2">
                {post.isAnonymous ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    {post.anonymousName || 'Anonymous'}
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    User
                  </>
                )}
              </span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PostView = () => (
    <div className="space-y-6">
      <button
        onClick={() => setSelectedPost(null)}
        className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
      >
        ← Back to Posts
      </button>

      {/* Post content would be rendered here */}
      <div className="bg-white rounded-2xl p-6 border border-blue-100">
        <p className="text-gray-600">Post content and replies will be displayed here</p>
      </div>
    </div>
  );

  const PeerCheckIns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Peer Check-Ins</h2>
          <p className="text-gray-600 mt-1">Connect with others for mutual support</p>
        </div>
        <button
          onClick={() => setShowNewCheckIn(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Request Check-In
        </button>
      </div>

      {/* Your Check-Ins */}
      <div className="bg-white rounded-2xl p-6 border border-green-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-green-500" />
          Your Check-Ins
        </h3>
        <div className="space-y-3">
          {(userCheckIns || []).map((checkIn: PeerCheckIn) => (
            <div key={checkIn.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{checkIn.checkInType} Check-In</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  checkIn.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  checkIn.status === 'matched' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {checkIn.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Duration: {checkIn.duration} minutes</div>
                <div>Preferred time: {checkIn.preferredTime}</div>
                {checkIn.notes && <div>Notes: {checkIn.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Check-Ins */}
      <div className="bg-white rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Available Check-Ins
        </h3>
        <div className="space-y-3">
          {(availableCheckIns || []).map((checkIn: PeerCheckIn) => (
            <div key={checkIn.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{checkIn.checkInType} Check-In</span>
                <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                  Join
                </button>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Duration: {checkIn.duration} minutes</div>
                <div>Preferred time: {checkIn.preferredTime}</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Posted {new Date(checkIn.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const NewPostModal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    return showNewPost ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Post</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <button
                onClick={() => setAnonymousMode(!anonymousMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  anonymousMode ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                {anonymousMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {anonymousMode ? 'Anonymous' : 'Identified'}
              </button>
              {anonymousMode && (
                <span className="text-sm text-gray-600">
                  You'll appear as: {generateAnonymousName()}
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none"
            />
            
            <textarea
              placeholder="Share your thoughts or ask for support..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowNewPost(false)}
              className="flex-1 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle post creation
                setShowNewPost(false);
                setTitle('');
                setContent('');
              }}
              className="flex-1 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    ) : null;
  };

  const NewCheckInModal = () => {
    const [checkInType, setCheckInType] = useState('daily');
    const [preferredTime, setPreferredTime] = useState('flexible');
    const [duration, setDuration] = useState(15);
    const [notes, setNotes] = useState('');

    return showNewCheckIn ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Request Peer Check-In</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-In Type</label>
              <select
                value={checkInType}
                onChange={(e) => setCheckInType(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none"
              >
                <option value="daily">Daily Check-In</option>
                <option value="crisis">Crisis Support</option>
                <option value="motivation">Motivation Boost</option>
                <option value="accountability">Accountability Partner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
              </select>
            </div>

            <textarea
              placeholder="Optional: Share context about what kind of support you're looking for..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowNewCheckIn(false)}
              className="flex-1 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle check-in request creation
                setShowNewCheckIn(false);
                setCheckInType('daily');
                setPreferredTime('flexible');
                setDuration(15);
                setNotes('');
              }}
              className="flex-1 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              Request Check-In
            </button>
          </div>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('forums')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
            activeTab === 'forums'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Support Forums
          </div>
        </button>
        <button
          onClick={() => setActiveTab('checkins')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
            activeTab === 'checkins'
              ? 'bg-white shadow-sm text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Peer Check-Ins
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'forums' && (
        <>
          {selectedPost ? (
            <PostView />
          ) : selectedForum ? (
            <PostsList />
          ) : (
            <ForumsList />
          )}
        </>
      )}

      {activeTab === 'checkins' && <PeerCheckIns />}

      {/* Modals */}
      <NewPostModal />
      <NewCheckInModal />
    </div>
  );
}