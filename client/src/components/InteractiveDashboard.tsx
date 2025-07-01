import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter
} from 'lucide-react';

interface DashboardData {
  userId: number;
  dateRange: { start: Date; end: Date };
  emotionalOverview: {
    currentMood: string;
    moodDistribution: Array<{ emotion: string; percentage: number; color: string }>;
    weeklyTrend: Array<{ date: string; valence: number; arousal: number }>;
    riskLevel: 'low' | 'medium' | 'high';
  };
  activityOverview: {
    totalSessions: number;
    weeklySessionGoal: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  };
  progressTracking: {
    goalsProgress: Array<{ name: string; current: number; target: number; category: string }>;
    badgeProgress: Array<{ name: string; progress: number; target: number; category: string }>;
    skillsDevelopment: Array<{ skill: string; level: number; maxLevel: number }>;
  };
  insights: {
    topAchievements: string[];
    areasOfStrength: string[];
    growthOpportunities: string[];
    personalizedTips: string[];
  };
}

interface InteractiveDashboardProps {
  userId: number;
}

export function InteractiveDashboard({ userId }: InteractiveDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [activeView, setActiveView] = useState<'overview' | 'emotions' | 'progress' | 'insights'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [userId, dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dateRange: {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString()
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return <TrendingDown className="w-4 h-4" />;
      case 'medium': return <Activity className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wellness Dashboard</h1>
          <p className="text-gray-600">Track your therapeutic journey and progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full bg-white rounded-lg p-1 shadow-lg">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveView('overview')}
            className={`w-full px-2 py-3 text-xs font-bold rounded-md transition-all border-2 ${
              activeView === 'overview'
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                : 'bg-orange-500 text-white border-orange-400 hover:bg-orange-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 mx-auto mb-1" />
            Overview
          </button>
          <button
            onClick={() => setActiveView('emotions')}
            className={`w-full px-2 py-3 text-xs font-bold rounded-md transition-all border-2 ${
              activeView === 'emotions'
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                : 'bg-orange-500 text-white border-orange-400 hover:bg-orange-600'
            }`}
          >
            <PieChart className="w-4 h-4 mx-auto mb-1" />
            Emotions
          </button>
          <button
            onClick={() => setActiveView('progress')}
            className={`w-full px-2 py-3 text-xs font-bold rounded-md transition-all border-2 ${
              activeView === 'progress'
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                : 'bg-orange-500 text-white border-orange-400 hover:bg-orange-600'
            }`}
          >
            <Target className="w-4 h-4 mx-auto mb-1" />
            Progress
          </button>
          <button
            onClick={() => setActiveView('insights')}
            className={`w-full px-2 py-3 text-xs font-bold rounded-md transition-all border-2 ${
              activeView === 'insights'
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                : 'bg-orange-500 text-white border-orange-400 hover:bg-orange-600'
            }`}
          >
            <Award className="w-4 h-4 mx-auto mb-1" />
            Insights
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Current Mood</p>
                    <p className="text-2xl font-bold text-blue-800 capitalize">
                      {dashboardData.emotionalOverview.currentMood}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg border ${getRiskLevelColor(dashboardData.emotionalOverview.riskLevel)}`}>
                    {getRiskLevelIcon(dashboardData.emotionalOverview.riskLevel)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Current Streak</p>
                    <p className="text-2xl font-bold text-green-800">
                      {dashboardData.activityOverview.currentStreak}
                      <span className="text-sm ml-1">days</span>
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Sessions</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {dashboardData.activityOverview.totalSessions}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Completion Rate</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {dashboardData.activityOverview.completionRate}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.insights.topAchievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-yellow-800">{achievement}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Areas of Strength
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.insights.areasOfStrength.slice(0, 3).map((strength, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-green-800">{strength}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Emotions Tab */}
      {activeView === 'emotions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Overview</CardTitle>
              <p className="text-sm text-gray-600">Your emotional patterns over the selected period</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Distribution */}
                <div>
                  <h3 className="font-semibold mb-4">Mood Distribution</h3>
                  <div className="space-y-3">
                    {dashboardData.emotionalOverview.moodDistribution.map((mood, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: mood.color }}
                          ></div>
                          <span className="text-sm capitalize">{mood.emotion}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${mood.percentage}%`,
                                backgroundColor: mood.color 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{mood.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Trend */}
                <div>
                  <h3 className="font-semibold mb-4">Weekly Emotional Trend</h3>
                  <div className="space-y-2">
                    {dashboardData.emotionalOverview.weeklyTrend.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{day.date}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Mood:</span>
                            <div className={`w-3 h-3 rounded-full ${
                              day.valence > 0.3 ? 'bg-green-400' : 
                              day.valence < -0.3 ? 'bg-red-400' : 'bg-yellow-400'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className={`border-2 ${getRiskLevelColor(dashboardData.emotionalOverview.riskLevel)}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getRiskLevelIcon(dashboardData.emotionalOverview.riskLevel)}
                <span className="ml-2">Current Risk Level: {dashboardData.emotionalOverview.riskLevel.toUpperCase()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Personalized Tips</h4>
                  <ul className="space-y-1">
                    {dashboardData.insights.personalizedTips.slice(0, 3).map((tip, index) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Growth Opportunities</h4>
                  <ul className="space-y-1">
                    {dashboardData.insights.growthOpportunities.slice(0, 3).map((opportunity, index) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Tab */}
      {activeView === 'progress' && (
        <div className="space-y-6">
          {/* Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Goals Progress</CardTitle>
              <p className="text-sm text-gray-600">Track your wellness goals and achievements</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.progressTracking.goalsProgress.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm text-gray-500">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  <Badge variant="outline" className="text-xs">
                    {goal.category}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills Development */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Development</CardTitle>
              <p className="text-sm text-gray-600">Your therapeutic skills progression</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.progressTracking.skillsDevelopment.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm text-gray-500">
                      Level {skill.level}/{skill.maxLevel}
                    </span>
                  </div>
                  <Progress value={(skill.level / skill.maxLevel) * 100} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Badge Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Achievement Progress</CardTitle>
              <p className="text-sm text-gray-600">Badges and milestones you're working towards</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.progressTracking.badgeProgress.map((badge, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{badge.name}</span>
                      <span className="text-xs text-gray-500">{badge.progress}%</span>
                    </div>
                    <Progress value={badge.progress} className="h-2 mb-1" />
                    <Badge variant="secondary" className="text-xs">
                      {badge.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Tab */}
      {activeView === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Top Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.insights.topAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-green-800">{achievement}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Areas of Strength</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.insights.areasOfStrength.map((strength, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-blue-800">{strength}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800">Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.insights.growthOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <Target className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-purple-800">{opportunity}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800">Personalized Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.insights.personalizedTips.map((tip, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <LineChart className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-orange-800">{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}