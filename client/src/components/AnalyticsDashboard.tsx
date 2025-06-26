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

  // Risk assessment mutation
  const riskAssessmentMutation = useMutation({
    mutationFn: (data: { userId: number }) =>
      fetch('/api/analytics/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      refetchDashboard();
    },
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate({ userId });
  };

  const handleRiskAssessment = () => {
    riskAssessmentMutation.mutate({ userId });
  };

  const renderOverviewTab = () => {
    if (dashboardLoading || !dashboardData?.dashboard) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      );
    }

    const { overview, charts, insights } = dashboardData.dashboard as DashboardData;

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wellness Score</p>
                <p className="text-2xl font-bold text-gray-800">{overview.currentWellnessScore}/100</p>
              </div>
              <div className={`p-3 rounded-full ${overview.currentWellnessScore >= 75 ? 'bg-green-100' : overview.currentWellnessScore >= 50 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <Brain className={`w-6 h-6 ${overview.currentWellnessScore >= 75 ? 'text-green-600' : overview.currentWellnessScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {overview.currentWellnessScore >= 75 ? 'Excellent stability' : overview.currentWellnessScore >= 50 ? 'Moderate balance' : 'Needs attention'}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emotional Volatility</p>
                <p className="text-2xl font-bold text-gray-800">{overview.emotionalVolatility.toFixed(1)}</p>
              </div>
              <div className={`p-3 rounded-full ${overview.emotionalVolatility <= 1.5 ? 'bg-green-100' : overview.emotionalVolatility <= 3.0 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <Activity className={`w-6 h-6 ${overview.emotionalVolatility <= 1.5 ? 'text-green-600' : overview.emotionalVolatility <= 3.0 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {overview.emotionalVolatility <= 1.5 ? 'Good stability' : overview.emotionalVolatility <= 3.0 ? 'Some fluctuation' : 'High volatility'}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Therapeutic Engagement</p>
                <p className="text-2xl font-bold text-gray-800">{overview.therapeuticEngagement.toFixed(0)}%</p>
              </div>
              <div className={`p-3 rounded-full ${overview.therapeuticEngagement >= 60 ? 'bg-green-100' : overview.therapeuticEngagement >= 30 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <Target className={`w-6 h-6 ${overview.therapeuticEngagement >= 60 ? 'text-green-600' : overview.therapeuticEngagement >= 30 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {overview.therapeuticEngagement >= 60 ? 'Excellent engagement' : overview.therapeuticEngagement >= 30 ? 'Moderate engagement' : 'Low engagement'}
            </p>
          </div>
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Trend Chart */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Trend (Last 30 Days)</h3>
            <div className="h-48 relative">
              {charts.moodTrend.length > 0 ? (
                <div className="space-y-2">
                  {charts.moodTrend.slice(0, 10).map((point, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {new Date(point.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(point.value / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-8">{point.value}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No mood data available
                </div>
              )}
            </div>
          </div>

          {/* Emotion Distribution */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Emotion Distribution</h3>
            <div className="h-48">
              {Object.keys(charts.emotionDistribution).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(charts.emotionDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([emotion, count]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">{emotion}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / Math.max(...Object.values(charts.emotionDistribution))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium w-6">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No emotion data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Wellness Insights</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            {insights.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReportsTab = () => {
    if (reportsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      );
    }

    const reports = (reportsData as any)?.reports || [];

    return (
      <div className="space-y-6">
        {/* Generate Report Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Monthly Wellness Reports</h3>
          <button
            onClick={handleGenerateReport}
            disabled={generateReportMutation.isPending}
            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            {generateReportMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report: MonthlyReport) => (
              <div key={report.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {new Date(report.reportMonth + '-01').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })} Report
                    </h4>
                    <p className="text-sm text-gray-600">
                      Wellness Score: {report.wellnessScore}/100 | Volatility: {report.emotionalVolatility}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Progress Summary</h5>
                    <p className="text-sm text-gray-700">{report.progressSummary}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">AI Generated Insights</h5>
                    <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {report.aiGeneratedInsights.split('\n').map((line, index) => (
                        <p key={index} className="mb-1">{line}</p>
                      ))}
                    </div>
                  </div>

                  {report.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Recommendations</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {report.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.milestonesAchieved.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Milestones Achieved</h5>
                      <div className="flex flex-wrap gap-2">
                        {report.milestonesAchieved.map((milestone, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {milestone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reports generated yet</p>
              <p className="text-sm text-gray-500">Generate your first monthly wellness report to track progress</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTrendsTab = () => {
    if (trendsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      );
    }

    const trends = trendsData?.trends || [];
    const analysis = trendsData?.analysis || {};

    return (
      <div className="space-y-6">
        {/* Timeframe Selector */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Longitudinal Trends</h3>
          <div className="flex space-x-2">
            {['3months', '6months', '1year'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedTimeframe === timeframe
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {timeframe === '3months' ? '3 Months' : timeframe === '6months' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Assessment Button */}
        <button
          onClick={handleRiskAssessment}
          disabled={riskAssessmentMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          {riskAssessmentMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{riskAssessmentMutation.isPending ? 'Assessing...' : 'Run Risk Assessment'}</span>
        </button>

        {/* Trends Analysis */}
        {trends.length > 0 ? (
          <div className="space-y-4">
            {trends.map((trend: LongitudinalTrend) => (
              <div key={trend.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 capitalize">
                      {trend.trendType} Trend Analysis
                    </h4>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trend.trendDirection === 'improving' ? 'bg-green-100 text-green-800' :
                        trend.trendDirection === 'stable' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {trend.trendDirection.charAt(0).toUpperCase() + trend.trendDirection.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Strength: {trend.trendStrength.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Timeframe: {trend.timeframe}
                      </span>
                    </div>
                  </div>
                  <TrendingUp className={`w-6 h-6 ${
                    trend.trendDirection === 'improving' ? 'text-green-600' :
                    trend.trendDirection === 'stable' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Insights</h5>
                    <p className="text-sm text-gray-700">{trend.insights}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Predicted Outcome</h5>
                    <p className="text-sm text-gray-700">{trend.predictedOutcome}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Confidence Interval</h5>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Range: {trend.confidenceInterval.lower.toFixed(1)} - {trend.confidenceInterval.upper.toFixed(1)}
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No trend data available yet</p>
            <p className="text-sm text-gray-500">Continue using TraI to build longitudinal wellness trends</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics & Reporting</h2>
          <p className="text-gray-600">Comprehensive wellness analytics and progress tracking</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-[#1a237e]/20 rounded-xl p-1 border border-[#1a237e]/30">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'reports', label: 'Monthly Reports', icon: Calendar },
            { id: 'trends', label: 'Longitudinal Trends', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1a237e] text-white shadow-sm'
                  : 'text-white hover:bg-[#1a237e]/40'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'reports' && renderReportsTab()}
          {activeTab === 'trends' && renderTrendsTab()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;