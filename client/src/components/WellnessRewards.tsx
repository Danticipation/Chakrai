import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Trophy, Star, Users, Target, TrendingUp, Award, Zap } from 'lucide-react';
import axios from 'axios';

interface WellnessPoints {
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  badge_icon: string;
  points_reward: number;
  rarity: string;
  unlock_criteria: any;
  is_unlocked: boolean;
}

interface RewardItem {
  id: number;
  name: string;
  description: string;
  category: string;
  points_cost: number;
  rarity: string;
  therapeutic_value: string;
  is_available: boolean;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  challenge_type: string;
  target_goal: number;
  points_reward: number;
  participant_count: number;
  is_active: boolean;
  duration: number;
}

interface WellnessStreak {
  id: number;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
}

const WellnessRewards: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: wellnessPoints } = useQuery<WellnessPoints>({
    queryKey: ['/api/wellness-points/1'],
    queryFn: () => axios.get('/api/wellness-points/1').then(res => res.data)
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements/1'],
    queryFn: () => axios.get('/api/achievements/1').then(res => res.data)
  });

  const { data: rewards } = useQuery<RewardItem[]>({
    queryKey: ['/api/rewards-shop'],
    queryFn: () => axios.get('/api/rewards-shop').then(res => res.data)
  });

  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ['/api/community-challenges'],
    queryFn: () => axios.get('/api/community-challenges').then(res => res.data)
  });

  const { data: streaks } = useQuery<WellnessStreak[]>({
    queryKey: ['/api/wellness-streaks/1'],
    queryFn: () => axios.get('/api/wellness-streaks/1').then(res => res.data)
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return Trophy;
      case 'milestone': return Star;
      case 'wellness': return Target;
      case 'achievement': return Award;
      default: return Trophy;
    }
  };

  const purchaseReward = async (rewardId: number) => {
    try {
      await axios.post(`/api/rewards-shop/${rewardId}/purchase`, { userId: 1 });
      // Refresh data after purchase
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const joinChallenge = async (challengeId: number) => {
    try {
      await axios.post(`/api/community-challenges/${challengeId}/join`, { userId: 1 });
      // Refresh data after joining
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="text-center mb-8">
        <Gift className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Wellness Rewards</h1>
        <p className="text-gray-600">Earn points and unlock achievements on your therapeutic journey</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {['overview', 'shop', 'challenges', 'achievements'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white/80'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Points Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <Star className="text-yellow-500" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{wellnessPoints?.totalPoints || 0}</div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <Gift className="text-green-500" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{wellnessPoints?.availablePoints || 0}</div>
                    <div className="text-sm text-gray-600">Available Points</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-purple-500" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{wellnessPoints?.currentLevel || 1}</div>
                    <div className="text-sm text-gray-600">Current Level</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <Zap className="text-blue-500" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{Array.isArray(streaks) ? streaks.reduce((sum, s) => sum + s.current_streak, 0) : 0}</div>
                    <div className="text-sm text-gray-600">Active Streaks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Streaks */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Streaks</h3>
              <div className="space-y-3">
                {Array.isArray(streaks) ? streaks.map((streak) => (
                  <div key={streak.id} className="flex items-center justify-between p-3 bg-white/40 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800 capitalize">{streak.streak_type.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-600">Best: {streak.longest_streak} days</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">{streak.current_streak}</div>
                      <div className="text-xs text-gray-600">days</div>
                    </div>
                  </div>
                )) : <div className="text-gray-600">No active streaks</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(rewards) ? rewards.map((reward) => (
                <div key={reward.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">{reward.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs text-white ${getRarityColor(reward.rarity)}`}>
                      {reward.rarity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <div className="text-xs text-gray-500 mb-4">{reward.therapeutic_value}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-purple-600">{reward.points_cost} pts</div>
                    <button
                      onClick={() => purchaseReward(reward.id)}
                      disabled={!reward.is_available || (wellnessPoints?.availablePoints || 0) < reward.points_cost}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Purchase
                    </button>
                  </div>
                </div>
              )) : <div className="text-gray-600">No rewards available</div>}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(challenges) ? challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">{challenge.name}</h3>
                    <span className="px-2 py-1 bg-green-500 text-white rounded text-xs">
                      {challenge.duration} days
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      <Users size={16} className="inline mr-1" />
                      {challenge.participant_count} participants
                    </div>
                    <div className="text-sm font-medium text-purple-600">
                      {challenge.points_reward} points reward
                    </div>
                  </div>
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    disabled={!challenge.is_active}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {challenge.is_active ? 'Join Challenge' : 'Challenge Ended'}
                  </button>
                </div>
              )) : <div className="text-gray-600">No challenges available</div>}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(achievements) ? achievements.map((achievement) => {
                const IconComponent = getCategoryIcon(achievement.category);
                return (
                  <div 
                    key={achievement.id} 
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <IconComponent 
                          size={24} 
                          className={achievement.is_unlocked ? 'text-yellow-500' : 'text-gray-400'} 
                        />
                        <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs text-white ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-purple-600">
                        {achievement.points_reward} points
                      </div>
                      {achievement.is_unlocked && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                );
              }) : <div className="text-gray-600">No achievements available</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessRewards;