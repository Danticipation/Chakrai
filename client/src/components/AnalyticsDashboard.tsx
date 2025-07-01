import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, TrendingUp, AlertTriangle, Calendar, Download, RefreshCw, Brain, Target, Activity } from 'lucide-react';

interface WellnessMetrics {
  currentWellnessScore: number;
  emotionalVolatility: number;
  therapeuticEngagement: number;
  totalJournalEntries: number;
  totalMoodEntries: number;
  averageMood: number;
}

interface ChartData {
  moodTrend: Array<{ date: string; value: number; emotion: string }>;
  wellnessTrend: Array<{ date: string; value: number; type: string }>;
  emotionDistribution: Record<string, number>;
  progressTracking: Array<{ period: string; journalEntries: number; moodEntries: number; engagement: number }>;
}

interface DashboardData {
  overview: WellnessMetrics;
  charts: ChartData;
  insights: string;
}

interface MonthlyReport {
  id: number;
  reportMonth: string;
  wellnessScore: string;
  emotionalVolatility: string;
  aiGeneratedInsights: string;
  progressSummary: string;
  recommendations: string[];
  milestonesAchieved: string[];
  createdAt: string;
}

interface RiskAssessment {
  id: number;
  riskLevel: string;
  riskScore: number;
  riskFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  followUpRequired: boolean;
  aiAnalysis: string;
  assessmentDate: string;
}

interface LongitudinalTrend {
  id: number;
  trendType: string;
  timeframe: string;
  trendDirection: string;
  trendStrength: number;
  insights: string;
  predictedOutcome: string;
  confidenceInterval: { lower: number; upper: number };
}

const AnalyticsDashboard: React.FC<{ userId: number }> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: [`/api/analytics/dashboard/${userId}`],
  }) as any;

  // Fetch monthly reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: [`/api/analytics/monthly-reports/${userId}`],
  }) as any;

  // Fetch longitudinal trends
  const { data: trendsData, isLoading: trendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: [`/api/analytics/trends/${userId}`, selectedTimeframe],
    queryFn: () => fetch(`/api/analytics/trends/${userId}?timeframe=${selectedTimeframe}`).then(res => res.json()),
  });

  // Generate monthly report mutation
  const generateReportMutation = useMutation({
    mutationFn: (data: { userId: number; reportMonth?: string }) =>
      fetch('/api/analytics/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/analytics/monthly-reports/${userId}`] });
    },
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate({ userId });
  };

  const renderOverviewTab = () => {
    if (dashboardLoading || !dashboardData?.dashboard) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      );
    }

    const { overview, charts, insights } = dashboardData.dashboard as DashboardData;

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Wellness Score</p>
                <p className="text-2xl font-bold text-white">{overview.currentWellnessScore}/100</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/60 mt-2">
              {overview.currentWellnessScore >= 75 ? 'Excellent stability' : overview.currentWellnessScore >= 50 ? 'Moderate balance' : 'Needs attention'}
            </p>
          </div>

          <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Emotional Volatility</p>
                <p className="text-2xl font-bold text-white">{overview.emotionalVolatility.toFixed(1)}</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/60 mt-2">
              {overview.emotionalVolatility <= 1.5 ? 'Good stability' : overview.emotionalVolatility <= 3.0 ? 'Some fluctuation' : 'High volatility'}
            </p>
          </div>

          <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Therapeutic Engagement</p>
                <p className="text-2xl font-bold text-white">{overview.therapeuticEngagement.toFixed(0)}%</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/60 mt-2">
              {overview.therapeuticEngagement >= 60 ? 'Excellent engagement' : overview.therapeuticEngagement >= 30 ? 'Moderate engagement' : 'Low engagement'}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Trend Chart */}
          <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
            <h3 className="text-lg font-semibold text-white mb-4">Mood Trend (Last 30 Days)</h3>
            <div className="h-48">
              {charts.moodTrend.length > 0 ? (
                <div className="space-y-2">
                  {charts.moodTrend.slice(0, 10).map((point, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-white/80">{new Date(point.date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full"
                            style={{ width: `${(point.value / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-8 text-white">{point.value}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/60">
                  No mood data available
                </div>
              )}
            </div>
          </div>

          {/* Emotion Distribution */}
          <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
            <h3 className="text-lg font-semibold text-white mb-4">Emotion Distribution</h3>
            <div className="h-48">
              {Object.keys(charts.emotionDistribution).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(charts.emotionDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([emotion, count]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="text-sm text-white/80 capitalize">{emotion}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-white h-2 rounded-full"
                              style={{ width: `${(count / Math.max(...Object.values(charts.emotionDistribution))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium w-6 text-white">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/60">
                  No emotion data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="theme-card rounded-xl p-6 border border-[var(--theme-accent)]">
          <h3 className="text-lg font-semibold text-white mb-4">AI Wellness Insights</h3>
          <div className="prose prose-sm max-w-none text-white/80">
            {insights.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen theme-primary p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics & Reporting</h1>
          <p className="text-white/80">Comprehensive wellness analytics and progress tracking</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-900 rounded-lg p-2 mb-6 border border-gray-600">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all border-2 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-700 text-gray-200 border-gray-500 hover:bg-gray-600 hover:border-gray-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all border-2 ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-700 text-gray-200 border-gray-500 hover:bg-gray-600 hover:border-gray-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Monthly Reports
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all border-2 ${
                activeTab === 'trends'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-700 text-gray-200 border-gray-500 hover:bg-gray-600 hover:border-gray-400'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Longitudinal Trends
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'reports' && (
          <div className="text-center py-8 text-white/60">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Monthly reports feature coming soon</p>
          </div>
        )}
        {activeTab === 'trends' && (
          <div className="text-center py-8 text-white/60">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Longitudinal trends analysis coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;