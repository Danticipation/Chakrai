import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Clock, Calendar, Star, Award, CheckCircle, Timer } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'streak' | 'seasonal';
  reward: {
    points: number;
    badge: string | null;
    exclusive: string | null;
  };
  progress: {
    current: number;
    goal: number;
    streak: boolean;
  };
  icon: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

const starterChallenges: Challenge[] = [
  {
    id: "daily-mood-check",
    title: "Daily Mood Check-In",
    description: "Log your mood today to earn wellness points and track your emotional patterns.",
    type: "daily",
    reward: {
      points: 10,
      badge: null,
      exclusive: null
    },
    progress: {
      current: 0,
      goal: 1,
      streak: false
    },
    icon: "📅",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-12-31"
  },
  {
    id: "weekly-journals",
    title: "Weekly Journal Writer",
    description: "Complete 5 meaningful journal entries this week to boost your reflection practice.",
    type: "weekly",
    reward: {
      points: 50,
      badge: "🌱 Growth Seeker",
      exclusive: null
    },
    progress: {
      current: 2,
      goal: 5,
      streak: false
    },
    icon: "📓",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-07-07"
  },
  {
    id: "streak-7-day",
    title: "7-Day Wellness Warrior",
    description: "Maintain your self-care routine by logging mood and journaling daily for 7 consecutive days.",
    type: "streak",
    reward: {
      points: 100,
      badge: "🌟 Wellness Warrior",
      exclusive: null
    },
    progress: {
      current: 4,
      goal: 7,
      streak: true
    },
    icon: "🔥",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-12-31"
  },
  {
    id: "monthly-mindfulness",
    title: "Mindful Monthly",
    description: "Practice daily mindfulness for 30 days to develop lasting wellness habits.",
    type: "streak",
    reward: {
      points: 300,
      badge: "🧘 Mindfulness Master",
      exclusive: "Zen Garden Theme"
    },
    progress: {
      current: 12,
      goal: 30,
      streak: true
    },
    icon: "🧘",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-07-31"
  },
  {
    id: "seasonal-self-love",
    title: "14 Days of Self-Love",
    description: "Complete daily affirmations and self-care activities for 14 days in February.",
    type: "seasonal",
    reward: {
      points: 200,
      badge: "❤️ Self-Love Champion",
      exclusive: "Valentine's Avatar Skin"
    },
    progress: {
      current: 0,
      goal: 14,
      streak: true
    },
    icon: "❤️",
    active: false,
    startDate: "2025-02-01",
    endDate: "2025-02-14"
  },
  {
    id: "daily-gratitude",
    title: "Gratitude Practice",
    description: "Write down 3 things you're grateful for each day to boost positive thinking.",
    type: "daily",
    reward: {
      points: 15,
      badge: null,
      exclusive: null
    },
    progress: {
      current: 1,
      goal: 1,
      streak: false
    },
    icon: "🙏",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-12-31"
  },
  {
    id: "weekly-reflection",
    title: "Weekly Deep Reflection",
    description: "Complete a comprehensive weekly reflection on your growth and challenges.",
    type: "weekly",
    reward: {
      points: 75,
      badge: "🔍 Self-Awareness Badge",
      exclusive: null
    },
    progress: {
      current: 0,
      goal: 1,
      streak: false
    },
    icon: "🔍",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-07-07"
  },
  {
    id: "chat-engagement",
    title: "AI Companion Connection",
    description: "Have meaningful conversations with your AI companion for 5 days this week.",
    type: "weekly",
    reward: {
      points: 60,
      badge: "🤖 Digital Wellness Partner",
      exclusive: null
    },
    progress: {
      current: 3,
      goal: 5,
      streak: false
    },
    icon: "💬",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-07-07"
  },
  {
    id: "goal-tracker",
    title: "Weekly Goal Achiever",
    description: "Set and track progress on 3 personal wellness goals this week.",
    type: "weekly",
    reward: {
      points: 80,
      badge: "🎯 Goal Getter",
      exclusive: null
    },
    progress: {
      current: 1,
      goal: 3,
      streak: false
    },
    icon: "🎯",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-07-07"
  },
  {
    id: "holiday-wellness",
    title: "Holiday Wellness Challenge",
    description: "Maintain your wellness routine during the holiday season with daily check-ins.",
    type: "seasonal",
    reward: {
      points: 500,
      badge: "🎄 Holiday Wellness Hero",
      exclusive: "Winter Wonderland Theme"
    },
    progress: {
      current: 0,
      goal: 25,
      streak: true
    },
    icon: "🎄",
    active: false,
    startDate: "2025-12-01",
    endDate: "2025-12-25"
  }
];

const ChallengeSystem: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>(starterChallenges);
  const [selectedTab, setSelectedTab] = useState('active');
  const [userStats, setUserStats] = useState({
    totalPoints: 425,
    level: 3,
    completedChallenges: 12,
    activeStreaks: 2
  });

  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <Clock className="h-4 w-4" />;
      case 'streak': return <Target className="h-4 w-4" />;
      case 'seasonal': return <Star className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return 'bg-blue-500';
      case 'weekly': return 'bg-green-500';
      case 'streak': return 'bg-red-500';
      case 'seasonal': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleClaimReward = (challengeId: string) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, progress: { ...challenge.progress, current: challenge.progress.goal } }
          : challenge
      )
    );
    const completedChallenge = challenges.find(c => c.id === challengeId);
    setUserStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + (completedChallenge?.reward.points || 0),
      completedChallenges: prev.completedChallenges + 1
    }));
  };

  const activeChallenges = challenges.filter(c => c.active);
  const completedChallenges = challenges.filter(c => c.progress.current >= c.progress.goal);
  const upcomingChallenges = challenges.filter(c => !c.active);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{userStats.totalPoints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{userStats.level}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{userStats.completedChallenges}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5 text-red-500" />
              Active Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{userStats.activeStreaks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Challenges ({activeChallenges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingChallenges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="theme-surface border-theme-accent/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{challenge.icon}</span>
                      <Badge 
                        variant="secondary" 
                        className={`${getTypeColor(challenge.type)} text-white`}
                      >
                        {getTypeIcon(challenge.type)}
                        <span className="ml-1 capitalize">{challenge.type}</span>
                      </Badge>
                    </div>
                    <div className="text-sm theme-text-secondary">
                      {challenge.reward.points} pts
                    </div>
                  </div>
                  <CardTitle className="text-lg theme-text">{challenge.title}</CardTitle>
                  <CardDescription className="theme-text-secondary">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="theme-text-secondary">Progress</span>
                      <span className="theme-text">{challenge.progress.current}/{challenge.progress.goal}</span>
                    </div>
                    <Progress 
                      value={calculateProgress(challenge.progress.current, challenge.progress.goal)} 
                      className="h-2"
                    />
                  </div>
                  
                  {challenge.reward.badge && (
                    <div className="text-sm theme-text-secondary">
                      <strong>Reward:</strong> {challenge.reward.badge}
                    </div>
                  )}
                  
                  {challenge.reward.exclusive && (
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      <strong>Exclusive:</strong> {challenge.reward.exclusive}
                    </div>
                  )}
                  
                  {challenge.progress.streak && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <Target className="h-4 w-4" />
                      <span>Streak Challenge</span>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    {challenge.progress.current >= challenge.progress.goal ? (
                      <Button 
                        onClick={() => handleClaimReward(challenge.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Claim Reward
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled
                      >
                        In Progress
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedChallenges.map((challenge) => (
              <Card key={challenge.id} className="theme-surface border-green-500/30 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{challenge.icon}</span>
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3" />
                        <span className="ml-1">Completed</span>
                      </Badge>
                    </div>
                    <div className="text-sm theme-text-secondary">
                      +{challenge.reward.points} pts
                    </div>
                  </div>
                  <CardTitle className="text-lg theme-text">{challenge.title}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <Progress value={100} className="h-2" />
                  <div className="mt-2 text-sm theme-text-secondary">
                    Challenge completed! Reward claimed.
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingChallenges.map((challenge) => (
              <Card key={challenge.id} className="theme-surface border-theme-accent/30 opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{challenge.icon}</span>
                      <Badge variant="secondary" className="bg-gray-500 text-white">
                        <Clock className="h-3 w-3" />
                        <span className="ml-1">Upcoming</span>
                      </Badge>
                    </div>
                    <div className="text-sm theme-text-secondary">
                      {challenge.reward.points} pts
                    </div>
                  </div>
                  <CardTitle className="text-lg theme-text">{challenge.title}</CardTitle>
                  <CardDescription className="theme-text-secondary">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-sm theme-text-secondary">
                    <strong>Starts:</strong> {new Date(challenge.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm theme-text-secondary">
                    <strong>Ends:</strong> {new Date(challenge.endDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeSystem;