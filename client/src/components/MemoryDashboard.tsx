import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, RefreshCw, Calendar, MessageCircle, TrendingUp, Users, Clock, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface MemoryDashboard {
  summary: {
    totalMemories: number;
    activeMemories: number;
    conversationSessions: number;
    memoryConnections: number;
    lastMemoryDate: string;
  };
  recentMemories: Array<{
    id: number;
    content: string;
    emotionalContext: string;
    temporalContext: string;
    topics: string[];
    accessCount: number;
    createdAt: string;
  }>;
  topTopics: Array<{
    topic: string;
    count: number;
    recentMention: string;
  }>;
  memoryInsights: Array<{
    type: string;
    insight: string;
    confidence: number;
    generatedAt: string;
  }>;
  emotionalPatterns: Array<{
    timeframe: string;
    dominantEmotion: string;
    intensity: number;
    memoryCount: number;
  }>;
}

export default function MemoryDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: dashboard, isLoading, refetch } = useQuery<MemoryDashboard>({
    queryKey: ['/api/memory-dashboard', 1],
    queryFn: () => fetch('/api/memory-dashboard?userId=1').then(res => res.json())
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getEmotionalColor = (emotion: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-green-100 text-green-800',
      negative: 'bg-red-100 text-red-800',
      neutral: 'bg-blue-100 text-blue-800',
      anxious: 'bg-yellow-100 text-yellow-800',
      peaceful: 'bg-green-100 text-green-800',
      mixed: 'bg-purple-100 text-purple-800'
    };
    return colors[emotion.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a237e] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white">Loading memory dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a237e] p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Memory Dashboard</h1>
              <p className="text-white/80">What TraI has learned about you</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-[#3f51b5] hover:bg-[#303f9f] text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#3f51b5] rounded-lg border border-white/20">
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <div>
                  <p className="text-sm text-white/80">Total Memories</p>
                  <p className="text-2xl font-bold text-white">{dashboard?.summary.totalMemories || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#3f51b5] rounded-lg border border-white/20">
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <div>
                  <p className="text-sm text-white/80">Active Memories</p>
                  <p className="text-2xl font-bold text-white">{dashboard?.summary.activeMemories || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#3f51b5] rounded-lg border border-white/20">
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-white" />
                <div>
                  <p className="text-sm text-white/80">Conversations</p>
                  <p className="text-2xl font-bold text-white">{dashboard?.summary.conversationSessions || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#3f51b5] rounded-lg border border-white/20">
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-white" />
                <div>
                  <p className="text-sm text-white/80">Last Memory</p>
                  <p className="text-lg font-semibold text-white">{formatDate(dashboard?.summary.lastMemoryDate || '')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Memories */}
          <div className="bg-[#3f51b5] rounded-lg border border-white/20">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-lg font-semibold text-white">Recent Memories</span>
              </div>
              <p className="text-white/80 mb-6">Latest conversations and insights</p>
              <div className="space-y-4">
                {dashboard?.recentMemories?.slice(0, 5).map((memory) => (
                  <div key={memory.id} className="border border-white/30 rounded-lg p-3 bg-[#1a237e]">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {memory.emotionalContext}
                      </Badge>
                      <span className="text-xs text-white/60">{formatDate(memory.createdAt)}</span>
                    </div>
                    <p className="text-sm text-white mb-2">{memory.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {memory.topics?.slice(0, 3).map((topic, index) => (
                          <Badge key={index} className="bg-white/10 text-white/80 border-white/30 text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-white/60">
                        Accessed {memory.accessCount} times
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-white/60">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No memories yet. Start a conversation to build your memory profile!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Top Topics</span>
              </CardTitle>
              <CardDescription>Most discussed themes in our conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.topTopics?.slice(0, 6).map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{topic.topic}</span>
                        <span className="text-sm text-gray-500">{topic.count} mentions</span>
                      </div>
                      <Progress value={(topic.count / (dashboard.topTopics[0]?.count || 1)) * 100} className="h-2" />
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Topics will appear as we have more conversations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Memory Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span>AI Insights</span>
              </CardTitle>
              <CardDescription>Patterns and insights from your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.memoryInsights?.slice(0, 4).map((insight, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{insight.type}</Badge>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-500">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{insight.insight}</p>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>AI insights will develop as we learn more about you</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emotional Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Emotional Patterns</span>
              </CardTitle>
              <CardDescription>How your emotional state has evolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.emotionalPatterns?.map((pattern, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{pattern.timeframe}</span>
                      <Badge className={getEmotionalColor(pattern.dominantEmotion)}>
                        {pattern.dominantEmotion}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Intensity</span>
                          <span className="text-sm font-medium">{Math.round(pattern.intensity * 100)}%</span>
                        </div>
                        <Progress value={pattern.intensity * 100} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-500">
                        {pattern.memoryCount} memories
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Emotional patterns will emerge from our conversations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}