import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Trophy, Star, Target, Users, Zap, Crown, Award, Flame, Calendar } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface WellnessPoints {
  level: number;
  totalPoints: number;
  availablePoints: number;
  pointsToNext: number;
  completedAchievements: number;
  activeStreaks: number;
  activeChallenges: number;
  todayActivities: number;
  todayPoints: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  rarity: string;
  icon: string;
  pointsReward: number;
  progress: number;
  isCompleted: boolean;
  unlockedAt?: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  category: string;
  cost: number;
  rarity: string;
  therapeuticValue: string;
  isPurchased: boolean;
  canAfford: boolean;
}

interface Streak {
  id: number;
  streakType: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  challengeType: string;
  targetGoal: number;
  pointsReward: number;
  userProgress: number;
  isParticipating: boolean;
  isCompleted: boolean;
  daysRemaining: number;
}

export default function WellnessRewards() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();
  const userId = 1; // User ID from auth context

  // Fetch gamification overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/gamification/overview', userId],
    queryFn: () => apiRequest(`/api/gamification/overview/${userId}`),
  });

  // Fetch achievements
  const { data: achievementsData, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements', userId],
    queryFn: () => apiRequest(`/api/achievements/${userId}`),
  });

  // Fetch rewards shop
  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ['/api/rewards-shop'],
    queryFn: () => apiRequest(`/api/rewards-shop?userId=${userId}`),
  });

  // Fetch community challenges
  const { data: challengesData, isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/community-challenges'],
    queryFn: () => apiRequest(`/api/community-challenges?userId=${userId}`),
  });

  // Fetch wellness streaks
  const { data: streaksData, isLoading: streaksLoading } = useQuery({
    queryKey: ['/api/streaks', userId],
    queryFn: () => apiRequest(`/api/streaks/${userId}`),
  });

  // Purchase reward mutation
  const purchaseRewardMutation = useMutation({
    mutationFn: ({ rewardId }: { rewardId: number }) =>
      apiRequest('/api/rewards-shop/purchase', {
        method: 'POST',
        body: JSON.stringify({ userId, rewardId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards-shop'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/overview', userId] });
    },
  });

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: ({ challengeId }: { challengeId: number }) =>
      apiRequest('/api/community-challenges/join', {
        method: 'POST',
        body: JSON.stringify({ userId, challengeId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community-challenges'] });
    },
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <Zap className="w-4 h-4" />;
      case 'milestone': return <Trophy className="w-4 h-4" />;
      case 'wellness': return <Star className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getStreakIcon = (streakType: string) => {
    switch (streakType) {
      case 'journaling': return <Calendar className="w-4 h-4" />;
      case 'mood_tracking': return <Target className="w-4 h-4" />;
      case 'chat_session': return <Users className="w-4 h-4" />;
      default: return <Flame className="w-4 h-4" />;
    }
  };

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-700">Loading your wellness rewards...</p>
        </div>
      </div>
    );
  }

  const wellnessPoints: WellnessPoints = overview?.overview || {
    level: 1,
    totalPoints: 0,
    availablePoints: 0,
    pointsToNext: 100,
    completedAchievements: 0,
    activeStreaks: 0,
    activeChallenges: 0,
    todayActivities: 0,
    todayPoints: 0
  };

  const achievements: Achievement[] = achievementsData?.achievements || [];
  const rewards: Reward[] = rewardsData?.rewards || [];
  const challenges: Challenge[] = challengesData?.challenges || [];
  const streaks: Streak[] = streaksData?.streaks || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Wellness Rewards</h1>
          </div>
          <p className="text-gray-600">Earn points, unlock achievements, and join community challenges</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Rewards Shop
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* User Level & Points */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Level {wellnessPoints.level} Wellness Warrior
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{wellnessPoints.totalPoints}</div>
                    <div className="text-sm opacity-80">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{wellnessPoints.availablePoints}</div>
                    <div className="text-sm opacity-80">Available Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{wellnessPoints.todayPoints}</div>
                    <div className="text-sm opacity-80">Today's Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{wellnessPoints.todayActivities}</div>
                    <div className="text-sm opacity-80">Today's Activities</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Level {wellnessPoints.level + 1}</span>
                    <span>{wellnessPoints.pointsToNext} points needed</span>
                  </div>
                  <Progress 
                    value={((wellnessPoints.totalPoints % 100) / 100) * 100} 
                    className="bg-white/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="flex items-center p-6">
                  <Trophy className="w-8 h-8 text-yellow-500 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">{wellnessPoints.completedAchievements}</div>
                    <div className="text-sm text-gray-600">Achievements Unlocked</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <Flame className="w-8 h-8 text-orange-500 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">{wellnessPoints.activeStreaks}</div>
                    <div className="text-sm text-gray-600">Active Streaks</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <Users className="w-8 h-8 text-blue-500 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">{wellnessPoints.activeChallenges}</div>
                    <div className="text-sm text-gray-600">Active Challenges</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Streaks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Current Streaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {streaksLoading ? (
                  <div className="text-center py-8">Loading streaks...</div>
                ) : streaks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {streaks.map((streak) => (
                      <div key={streak.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStreakIcon(streak.streakType)}
                          <div>
                            <div className="font-semibold capitalize">
                              {streak.streakType.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              Best: {streak.longestStreak} days
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-500">
                            {streak.currentStreak}
                          </div>
                          <div className="text-sm text-gray-600">days</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No active streaks yet. Start your wellness journey today!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Shop Tab */}
          <TabsContent value="shop" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Wellness Rewards Shop
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Available Points: {wellnessPoints.availablePoints}
                </div>
              </CardHeader>
              <CardContent>
                {rewardsLoading ? (
                  <div className="text-center py-8">Loading rewards...</div>
                ) : rewards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.map((reward) => (
                      <Card key={reward.id} className="relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(reward.rarity)}`} />
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{reward.name}</CardTitle>
                            <Badge variant={reward.rarity === 'legendary' ? 'default' : 'secondary'}>
                              {reward.rarity}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                          <p className="text-xs text-green-600 mb-4">{reward.therapeuticValue}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold">{reward.cost} points</span>
                            </div>
                            <Button
                              size="sm"
                              disabled={reward.isPurchased || !reward.canAfford || purchaseRewardMutation.isPending}
                              onClick={() => purchaseRewardMutation.mutate({ rewardId: reward.id })}
                            >
                              {reward.isPurchased ? 'Owned' : reward.canAfford ? 'Purchase' : 'Need More Points'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No rewards available at the moment. Check back soon!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Wellness Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {challengesLoading ? (
                  <div className="text-center py-8">Loading challenges...</div>
                ) : challenges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenges.map((challenge) => (
                      <Card key={challenge.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{challenge.name}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{challenge.daysRemaining} days left</span>
                            <Badge variant="outline">{challenge.challengeType}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{challenge.userProgress}/{challenge.targetGoal}</span>
                            </div>
                            <Progress value={(challenge.userProgress / challenge.targetGoal) * 100} />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">{challenge.pointsReward} points reward</span>
                              </div>
                              {!challenge.isParticipating && !challenge.isCompleted && (
                                <Button
                                  size="sm"
                                  disabled={joinChallengeMutation.isPending}
                                  onClick={() => joinChallengeMutation.mutate({ challengeId: challenge.id })}
                                >
                                  Join Challenge
                                </Button>
                              )}
                              {challenge.isCompleted && (
                                <Badge variant="default">Completed!</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No active challenges at the moment. Check back for new opportunities!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievement Gallery
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {wellnessPoints.completedAchievements} of {achievements.length} achievements unlocked
                </div>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="text-center py-8">Loading achievements...</div>
                ) : achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                      <Card key={achievement.id} className={`relative ${achievement.isCompleted ? 'ring-2 ring-yellow-400' : 'opacity-75'}`}>
                        <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(achievement.rarity)}`} />
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {getCategoryIcon(achievement.category)}
                              {achievement.name}
                            </CardTitle>
                            {achievement.isCompleted && (
                              <Trophy className="w-5 h-5 text-yellow-500" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'}>
                              {achievement.rarity}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{achievement.pointsReward} points</span>
                            </div>
                          </div>
                          {!achievement.isCompleted && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} />
                            </div>
                          )}
                          {achievement.isCompleted && achievement.unlockedAt && (
                            <div className="text-xs text-green-600">
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No achievements available yet. Start your wellness journey to unlock them!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}