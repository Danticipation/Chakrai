import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Trophy, Star, Target, Calendar, Flame, TrendingUp } from 'lucide-react';

interface Achievement {
  id: number;
  userId: number;
  badgeId: string;
  unlockedAt: Date | null;
  progress: number | null;
  isActive: boolean | null;
}

interface WellnessStreak {
  id: number;
  userId: number;
  streakType: string;
  currentStreak: number | null;
  longestStreak: number | null;
  lastActivity: Date | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'engagement' | 'milestone' | 'wellness' | 'achievement';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface AchievementDashboardProps {
  userId: number;
}

export default function AchievementDashboard({ userId }: AchievementDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements', userId],
  });

  const { data: streaks = [], isLoading: streaksLoading } = useQuery<WellnessStreak[]>({
    queryKey: ['/api/wellness-streaks', userId],
  });

  const { data: badges = [], isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ['/api/badges'],
  });

  const { data: userStats = {}, isLoading: statsLoading } = useQuery<Record<string, any>>({
    queryKey: ['/api/user-stats', userId],
  });

  if (achievementsLoading || streaksLoading || badgesLoading || statsLoading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const earnedBadges = achievements.map((a) => a.badgeId);
  const totalPoints = achievements.reduce((sum, achievement) => {
    const badge = badges.find((b) => b.id === achievement.badgeId);
    return sum + (badge?.points || 0);
  }, 0);

  const currentLevel = Math.floor(totalPoints / 100) + 1;
  const pointsToNextLevel = (currentLevel * 100) - totalPoints;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'daily_checkin': return <Calendar className="w-4 h-4" />;
      case 'journal_entry': return <Award className="w-4 h-4" />;
      case 'mood_tracking': return <Star className="w-4 h-4" />;
      case 'chat_session': return <Target className="w-4 h-4" />;
      case 'goal_progress': return <TrendingUp className="w-4 h-4" />;
      default: return <Flame className="w-4 h-4" />;
    }
  };

  const getStreakLabel = (type: string) => {
    switch (type) {
      case 'daily_checkin': return 'Daily Check-in';
      case 'journal_entry': return 'Journaling';
      case 'mood_tracking': return 'Mood Tracking';
      case 'chat_session': return 'Chat Sessions';
      case 'goal_progress': return 'Goal Progress';
      default: return type;
    }
  };

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter((badge) => badge.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Achievement Center
        </h2>
        <p className="text-sm opacity-80" style={{ color: 'var(--text-primary)' }}>
          Track your wellness journey and earn rewards
        </p>
      </div>

      {/* Level & Points Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 text-center shadow-sm border-2 border-silver" style={{ backgroundColor: 'var(--pale-green)' }}>
          <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Level {currentLevel}
          </div>
          <div className="text-sm opacity-80" style={{ color: 'var(--text-primary)' }}>
            {totalPoints} total points
          </div>
          {pointsToNextLevel > 0 && (
            <div className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>
              {pointsToNextLevel} to next level
            </div>
          )}
        </div>

        <div className="rounded-2xl p-4 text-center shadow-sm border-2 border-silver" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
          <Award className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {achievements.length}
          </div>
          <div className="text-sm opacity-80" style={{ color: 'var(--text-primary)' }}>
            Badges Earned
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>
            of {badges.length} available
          </div>
        </div>
      </div>

      {/* Wellness Streaks */}
      <div className="rounded-2xl p-4 shadow-sm border-2 border-silver" style={{ backgroundColor: 'var(--surface-secondary)' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
          <Flame className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} />
          Wellness Streaks
        </h3>
        <div className="space-y-3">
          {streaks.map((streak) => (
            <div key={streak.id} className="flex items-center justify-between p-3 rounded-xl border-2 border-silver" 
                 style={{ backgroundColor: 'var(--pale-green)' }}>
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3 border-2 border-silver" style={{ backgroundColor: 'var(--soft-blue-dark)', color: 'white' }}>
                  {getStreakIcon(streak.streakType)}
                </div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {getStreakLabel(streak.streakType)}
                  </div>
                  <div className="text-sm opacity-80" style={{ color: 'var(--text-primary)' }}>
                    Best: {streak.longestStreak || 0} days
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: 'var(--soft-blue-dark)' }}>
                  {streak.currentStreak || 0}
                </div>
                <div className="text-xs opacity-80" style={{ color: 'var(--text-primary)' }}>
                  current
                </div>
              </div>
            </div>
          ))}
          {streaks.length === 0 && (
            <div className="text-center py-4 opacity-60" style={{ color: 'var(--text-primary)' }}>
              Start your wellness activities to build streaks!
            </div>
          )}
        </div>
      </div>

      {/* Badge Categories */}
      <div className="flex flex-wrap gap-2 justify-center">
        {['all', 'engagement', 'milestone', 'wellness', 'achievement'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border-2 border-silver ${
              selectedCategory === category 
                ? 'text-white' 
                : 'opacity-70'
            }`}
            style={{ 
              backgroundColor: selectedCategory === category 
                ? 'var(--soft-blue-dark)' 
                : 'var(--surface-secondary)',
              color: selectedCategory === category 
                ? 'white' 
                : 'var(--text-primary)'
            }}
          >
            {category === 'all' ? 'All Badges' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredBadges.map((badge) => {
          const isEarned = earnedBadges.includes(badge.id);
          return (
            <div 
              key={badge.id}
              className={`rounded-2xl p-4 shadow-sm transition-all border-2 border-silver ${
                isEarned ? 'ring-2 ring-yellow-400' : 'opacity-50'
              }`}
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            >
              <div className="flex items-start space-x-3">
                <div className={`text-3xl ${isEarned ? '' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {badge.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--soft-blue-dark)' }}>
                        {badge.points}pts
                      </span>
                    </div>
                  </div>
                  <p className="text-sm opacity-80" style={{ color: 'var(--text-primary)' }}>
                    {badge.description}
                  </p>
                  {isEarned && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      ✓ Unlocked
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <div className="text-center p-4 rounded-2xl border-2 border-silver" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
        <Star className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Every small step in your wellness journey counts. Keep going!
        </p>
      </div>
    </div>
  );
}