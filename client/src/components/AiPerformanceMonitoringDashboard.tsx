import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Shield, BarChart, Clock, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface AiPerformanceOverview {
  totalResponses: number;
  averageResponseQuality: number;
  averageTherapeuticEffectiveness: number;
  crisisDetectionAccuracy: number;
  falsePositiveRate: number;
  userSatisfactionAverage: number;
  averageResponseTime: number;
}

interface AiPerformanceMetric {
  id: number;
  userId: number;
  metricType: string;
  metricValue: number;
  context: string;
  aiModel: string;
  promptTokens: number;
  completionTokens: number;
  responseTime: number;
  timestamp: string;
  sessionId: string;
  conversationId: string;
}

interface AiResponseAnalysis {
  id: number;
  userId: number;
  originalPrompt: string;
  aiResponse: string;
  therapeuticScore: number;
  empathyScore: number;
  clarityScore: number;
  appropriatenessScore: number;
  userFeedback: string;
  userRating: number;
  flaggedForReview: boolean;
  reviewNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface CrisisDetectionLog {
  id: number;
  userId: number;
  messageContent: string;
  detectedRiskLevel: string;
  confidenceScore: number;
  triggerKeywords: string[];
  aiAnalysis: string;
  interventionTriggered: boolean;
  interventionType: string;
  falsePositive: boolean;
  truePositive: boolean;
  reviewedBy: string;
  reviewNotes: string;
  detectedAt: string;
  reviewedAt: string;
}

export default function AiPerformanceMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch performance overview
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/internal/ai-performance/overview'],
    queryFn: () => axios.get('/api/internal/ai-performance/overview').then(res => res.data)
  });

  // Fetch recent metrics
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/internal/ai-performance/metrics'],
    queryFn: () => axios.get('/api/internal/ai-performance/metrics?limit=50').then(res => res.data)
  });

  // Fetch flagged response analyses
  const { data: flaggedAnalysesData, isLoading: flaggedLoading } = useQuery({
    queryKey: ['/api/internal/ai-performance/response-analyses', 'flagged'],
    queryFn: () => axios.get('/api/internal/ai-performance/response-analyses?flaggedOnly=true&limit=30').then(res => res.data)
  });

  // Fetch unreviewed crisis detection logs
  const { data: crisisLogsData, isLoading: crisisLoading } = useQuery({
    queryKey: ['/api/internal/ai-performance/crisis-detection', 'unreviewed'],
    queryFn: () => axios.get('/api/internal/ai-performance/crisis-detection?reviewed=false&limit=30').then(res => res.data)
  });

  const overview: AiPerformanceOverview = overviewData?.overview || {
    totalResponses: 0,
    averageResponseQuality: 0,
    averageTherapeuticEffectiveness: 0,
    crisisDetectionAccuracy: 0,
    falsePositiveRate: 0,
    userSatisfactionAverage: 0,
    averageResponseTime: 0
  };

  const metrics: AiPerformanceMetric[] = metricsData?.metrics || [];
  const flaggedAnalyses: AiResponseAnalysis[] = flaggedAnalysesData?.analyses || [];
  const crisisLogs: CrisisDetectionLog[] = crisisLogsData?.logs || [];

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  if (overviewLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            AI Performance Monitoring
          </h1>
          <p className="text-gray-600">
            Internal tracking of response quality, therapeutic effectiveness, and crisis detection accuracy
          </p>
          <div className="text-xs text-gray-500 mt-1">
            Internal Use Only - System Performance Analytics
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Total Responses</p>
              <p className="text-2xl font-bold text-blue-900">{overview.totalResponses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Response Quality</p>
              <p className={`text-2xl font-bold ${getQualityColor(overview.averageResponseQuality)}`}>
                {Math.round(overview.averageResponseQuality * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-700">Therapeutic Effectiveness</p>
              <p className={`text-2xl font-bold ${getQualityColor(overview.averageTherapeuticEffectiveness)}`}>
                {Math.round(overview.averageTherapeuticEffectiveness * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-orange-700">Crisis Detection Accuracy</p>
              <p className={`text-2xl font-bold ${getQualityColor(overview.crisisDetectionAccuracy)}`}>
                {Math.round(overview.crisisDetectionAccuracy * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm text-indigo-700">User Satisfaction</p>
              <p className="text-xl font-bold text-indigo-900">
                {overview.userSatisfactionAverage.toFixed(1)}/5.0
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700">False Positive Rate</p>
              <p className={`text-xl font-bold ${overview.falsePositiveRate > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                {Math.round(overview.falsePositiveRate * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm text-teal-700">Avg Response Time</p>
              <p className="text-xl font-bold text-teal-900">
                {Math.round(overview.averageResponseTime)}ms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'System Overview' },
            { id: 'metrics', label: 'Performance Metrics' },
            { id: 'flagged', label: 'Flagged Responses' },
            { id: 'crisis', label: 'Crisis Detection Logs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-white hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-gray-200" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Quality</span>
                    <span>{Math.round(overview.averageResponseQuality * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${overview.averageResponseQuality * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Therapeutic Effectiveness</span>
                    <span>{Math.round(overview.averageTherapeuticEffectiveness * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${overview.averageTherapeuticEffectiveness * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Crisis Detection Accuracy</span>
                    <span>{Math.round(overview.crisisDetectionAccuracy * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${overview.crisisDetectionAccuracy * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-gray-200" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <h3 className="text-lg font-semibold mb-4">System Health Indicators</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">AI Model Performance</span>
                  </div>
                  <span className="text-sm text-green-700">Optimal</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Response Time</span>
                  </div>
                  <span className="text-sm text-blue-700">{Math.round(overview.averageResponseTime)}ms avg</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">False Positive Rate</span>
                  </div>
                  <span className="text-sm text-yellow-700">{Math.round(overview.falsePositiveRate * 100)}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm font-medium">User Satisfaction</span>
                  </div>
                  <span className="text-sm text-indigo-700">{overview.userSatisfactionAverage.toFixed(1)}/5.0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Performance Metrics</h2>
            
            {metricsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : metrics.length === 0 ? (
              <div className="p-8 text-center border border-gray-200 rounded-lg" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No performance metrics available.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {metrics.slice(0, 10).map((metric) => (
                  <div key={metric.id} className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold capitalize">{metric.metricType.replace('_', ' ')}</h3>
                        <p className="text-sm text-gray-600">Model: {metric.aiModel}</p>
                        <p className="text-xs text-gray-500">{new Date(metric.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getQualityColor(metric.metricValue)}`}>
                          {Math.round(metric.metricValue * 100)}%
                        </p>
                        <p className="text-xs text-gray-500">{metric.responseTime}ms</p>
                      </div>
                    </div>
                    {metric.context && (
                      <p className="text-sm text-gray-600 mt-2">{metric.context}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'flagged' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Flagged Responses for Review</h2>
            
            {flaggedLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : flaggedAnalyses.length === 0 ? (
              <div className="p-8 text-center border border-gray-200 rounded-lg" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No flagged responses requiring review.</p>
              </div>
            ) : (
              flaggedAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-6 rounded-lg border border-orange-200 bg-orange-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-orange-800">Flagged Response #{analysis.id}</h3>
                    <span className="px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded">
                      Requires Review
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Original Prompt:</h4>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                        {analysis.originalPrompt}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">AI Response:</h4>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                        {analysis.aiResponse}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Therapeutic</p>
                      <p className={`font-semibold ${getQualityColor(analysis.therapeuticScore || 0)}`}>
                        {Math.round((analysis.therapeuticScore || 0) * 100)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Empathy</p>
                      <p className={`font-semibold ${getQualityColor(analysis.empathyScore || 0)}`}>
                        {Math.round((analysis.empathyScore || 0) * 100)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Clarity</p>
                      <p className={`font-semibold ${getQualityColor(analysis.clarityScore || 0)}`}>
                        {Math.round((analysis.clarityScore || 0) * 100)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Appropriateness</p>
                      <p className={`font-semibold ${getQualityColor(analysis.appropriatenessScore || 0)}`}>
                        {Math.round((analysis.appropriatenessScore || 0) * 100)}%
                      </p>
                    </div>
                  </div>

                  {analysis.userFeedback && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-sm text-gray-700 mb-1">User Feedback:</h4>
                      <p className="text-sm text-gray-600">{analysis.userFeedback}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'crisis' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Crisis Detection Logs</h2>
            
            {crisisLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : crisisLogs.length === 0 ? (
              <div className="p-8 text-center border border-gray-200 rounded-lg" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No unreviewed crisis detection logs.</p>
              </div>
            ) : (
              crisisLogs.map((log) => (
                <div key={log.id} className="p-6 rounded-lg border border-gray-200" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-semibold">Crisis Detection #{log.id}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${getRiskLevelColor(log.detectedRiskLevel)}`}>
                        {log.detectedRiskLevel} risk
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Confidence</p>
                      <p className="text-lg font-semibold">{Math.round((log.confidenceScore || 0) * 100)}%</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Message Content:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                      {log.messageContent}
                    </p>
                  </div>

                  {log.triggerKeywords && log.triggerKeywords.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Trigger Keywords:</h4>
                      <div className="flex flex-wrap gap-1">
                        {log.triggerKeywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.aiAnalysis && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">AI Analysis:</h4>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                        {log.aiAnalysis}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Detected: {new Date(log.detectedAt).toLocaleString()}</span>
                    <div className="flex items-center gap-4">
                      <span>Intervention: {log.interventionTriggered ? 'Yes' : 'No'}</span>
                      {log.interventionType && <span>Type: {log.interventionType}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}