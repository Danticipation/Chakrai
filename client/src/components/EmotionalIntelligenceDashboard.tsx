import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Zap, Clock, Heart, MessageCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface MoodForecast {
  id: number;
  userId: number;
  forecastDate: string;
  predictedMood: string;
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  triggerFactors: string[];
  preventiveRecommendations: string[];
  actualMood?: string;
  forecastAccuracy?: string;
}

interface PredictiveInsight {
  id: number;
  userId: number;
  insight: string;
  probability: number;
  timeframe: string;
  preventiveActions: string[];
  riskMitigation: string[];
  isActive: boolean;
  wasAccurate?: boolean;
  userFeedback?: string;
}

interface EmotionalResponseAdaptation {
  id: number;
  userId: number;
  originalMessage: string;
  adaptedResponse: string;
  tone: string;
  intensity: string;
  responseLength: string;
  effectiveness?: string;
  userResponse?: string;
}

interface DashboardOverview {
  totalForecasts: number;
  averageAccuracy: number;
  activeInsights: number;
  adaptationEffectiveness: number;
  emotionalStability: number;
}

export default function EmotionalIntelligenceDashboard() {
  const [userId] = useState(1);
  const queryClient = useQueryClient();

  // Fetch dashboard overview
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/emotional-intelligence/dashboard', userId],
    queryFn: () => apiRequest(`/api/emotional-intelligence/dashboard/${userId}`)
  });

  // Fetch mood forecasts
  const { data: forecastsData, isLoading: forecastsLoading } = useQuery({
    queryKey: ['/api/emotional-intelligence/mood-forecasts', userId],
    queryFn: () => apiRequest(`/api/emotional-intelligence/mood-forecasts/${userId}?limit=10`)
  });

  // Fetch predictive insights
  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/emotional-intelligence/insights', userId],
    queryFn: () => apiRequest(`/api/emotional-intelligence/insights/${userId}`)
  });

  // Fetch response adaptations
  const { data: adaptationsData, isLoading: adaptationsLoading } = useQuery({
    queryKey: ['/api/emotional-intelligence/adaptations', userId],
    queryFn: () => apiRequest(`/api/emotional-intelligence/adaptations/${userId}?limit=20`)
  });

  // Generate new mood forecast
  const generateForecastMutation = useMutation({
    mutationFn: () => apiRequest('/api/emotional-intelligence/mood-forecast', {
      method: 'POST',
      body: JSON.stringify({ userId })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-intelligence/mood-forecasts', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-intelligence/dashboard', userId] });
    }
  });

  // Update insight accuracy
  const updateInsightMutation = useMutation({
    mutationFn: ({ insightId, wasAccurate, userFeedback }: { insightId: number; wasAccurate: boolean; userFeedback?: string }) =>
      apiRequest(`/api/emotional-intelligence/insights/${insightId}`, {
        method: 'PATCH',
        body: JSON.stringify({ wasAccurate, userFeedback })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-intelligence/insights', userId] });
    }
  });

  // Rate adaptation effectiveness
  const rateAdaptationMutation = useMutation({
    mutationFn: ({ adaptationId, effectiveness, userResponse }: { adaptationId: number; effectiveness: string; userResponse?: string }) =>
      apiRequest(`/api/emotional-intelligence/adaptations/${adaptationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ effectiveness, userResponse })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-intelligence/adaptations', userId] });
    }
  });

  const overview: DashboardOverview = dashboardData?.overview || {
    totalForecasts: 0,
    averageAccuracy: 0,
    activeInsights: 0,
    adaptationEffectiveness: 0,
    emotionalStability: 75
  };

  const forecasts: MoodForecast[] = forecastsData?.forecasts || [];
  const insights: PredictiveInsight[] = insightsData?.insights || [];
  const adaptations: EmotionalResponseAdaptation[] = adaptationsData?.adaptations || [];

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    if (timeframe.includes('24 hours')) return 'text-red-600 dark:text-red-400';
    if (timeframe.includes('3 days')) return 'text-orange-600 dark:text-orange-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  if (dashboardLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Emotional Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Predictive mood forecasting and contextual emotional response system
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-200">Total Forecasts</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{overview.totalForecasts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700 dark:text-green-200">Accuracy</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{overview.averageAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-200">Active Insights</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{overview.activeInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-200">Adaptation Rate</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{overview.adaptationEffectiveness}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-indigo-700 dark:text-indigo-200">Emotional Stability</p>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{overview.emotionalStability}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="forecasts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasts">Mood Forecasts</TabsTrigger>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="adaptations">Response Adaptations</TabsTrigger>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
        </TabsList>

        {/* Mood Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mood Forecasts</h2>
            <Button 
              onClick={() => generateForecastMutation.mutate()}
              disabled={generateForecastMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateForecastMutation.isPending ? 'Generating...' : 'Generate New Forecast'}
            </Button>
          </div>

          <div className="grid gap-4">
            {forecastsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : forecasts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No mood forecasts available. Generate your first forecast to begin predictive mood analysis.</p>
                </CardContent>
              </Card>
            ) : (
              forecasts.map((forecast) => (
                <Card key={forecast.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Predicted Mood: <span className="text-purple-600">{forecast.predictedMood}</span>
                          <Badge className={getRiskLevelColor(forecast.riskLevel)}>
                            {forecast.riskLevel} risk
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          <Clock className="h-4 w-4 inline mr-1" />
                          {new Date(forecast.forecastDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Confidence</p>
                        <p className="text-lg font-semibold">{Math.round(forecast.confidenceScore * 100)}%</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {forecast.triggerFactors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Trigger Factors:</h4>
                        <div className="flex flex-wrap gap-1">
                          {forecast.triggerFactors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {forecast.preventiveRecommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Preventive Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {forecast.preventiveRecommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {forecast.actualMood && (
                      <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Actual Mood:</strong> {forecast.actualMood}
                          {forecast.forecastAccuracy && (
                            <span className="ml-2 text-green-600 dark:text-green-400">
                              (Accuracy: {forecast.forecastAccuracy}%)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Predictive Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <h2 className="text-2xl font-bold">Predictive Insights</h2>

          <div className="grid gap-4">
            {insightsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : insights.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No predictive insights available. Insights will be generated as you interact with the system.</p>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Predictive Insight
                        <Badge variant="outline">
                          {Math.round(insight.probability * 100)}% probability
                        </Badge>
                      </CardTitle>
                      <span className={`text-sm font-medium ${getTimeframeColor(insight.timeframe)}`}>
                        {insight.timeframe}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">{insight.insight}</p>

                    {insight.preventiveActions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Preventive Actions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {insight.preventiveActions.map((action, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insight.riskMitigation.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Risk Mitigation:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {insight.riskMitigation.map((mitigation, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              {mitigation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insight.wasAccurate === undefined && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInsightMutation.mutate({ insightId: insight.id, wasAccurate: true })}
                          disabled={updateInsightMutation.isPending}
                        >
                          Mark Accurate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInsightMutation.mutate({ insightId: insight.id, wasAccurate: false })}
                          disabled={updateInsightMutation.isPending}
                        >
                          Mark Inaccurate
                        </Button>
                      </div>
                    )}

                    {insight.wasAccurate !== undefined && (
                      <div className={`p-2 rounded ${insight.wasAccurate ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
                        <p className="text-sm">
                          Marked as: <strong>{insight.wasAccurate ? 'Accurate' : 'Inaccurate'}</strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Response Adaptations Tab */}
        <TabsContent value="adaptations" className="space-y-4">
          <h2 className="text-2xl font-bold">Response Adaptations</h2>

          <div className="grid gap-4">
            {adaptationsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : adaptations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No response adaptations available. Adaptations will appear as the system learns your preferences.</p>
                </CardContent>
              </Card>
            ) : (
              adaptations.map((adaptation) => (
                <Card key={adaptation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      Response Adaptation
                      <div className="flex gap-1">
                        <Badge variant="outline">{adaptation.tone}</Badge>
                        <Badge variant="outline">{adaptation.intensity}</Badge>
                        <Badge variant="outline">{adaptation.responseLength}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Original Message:</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          {adaptation.originalMessage}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Adapted Response:</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900 p-3 rounded">
                          {adaptation.adaptedResponse}
                        </p>
                      </div>
                    </div>

                    {!adaptation.effectiveness && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rateAdaptationMutation.mutate({ adaptationId: adaptation.id, effectiveness: '0.9' })}
                          disabled={rateAdaptationMutation.isPending}
                        >
                          Very Effective
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rateAdaptationMutation.mutate({ adaptationId: adaptation.id, effectiveness: '0.7' })}
                          disabled={rateAdaptationMutation.isPending}
                        >
                          Effective
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rateAdaptationMutation.mutate({ adaptationId: adaptation.id, effectiveness: '0.3' })}
                          disabled={rateAdaptationMutation.isPending}
                        >
                          Not Effective
                        </Button>
                      </div>
                    )}

                    {adaptation.effectiveness && (
                      <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">
                        <p className="text-sm">
                          Effectiveness Rating: <strong>{Math.round(parseFloat(adaptation.effectiveness) * 100)}%</strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <h2 className="text-2xl font-bold">System Overview</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Emotional Intelligence Metrics</CardTitle>
                <CardDescription>
                  Comprehensive performance metrics for the AI emotional intelligence system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Forecast Accuracy</span>
                    <span>{overview.averageAccuracy}%</span>
                  </div>
                  <Progress value={overview.averageAccuracy} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Adaptation Effectiveness</span>
                    <span>{overview.adaptationEffectiveness}%</span>
                  </div>
                  <Progress value={overview.adaptationEffectiveness} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Emotional Stability</span>
                    <span>{overview.emotionalStability}%</span>
                  </div>
                  <Progress value={overview.emotionalStability} className="h-2" />
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertTitle>System Status</AlertTitle>
                  <AlertDescription>
                    Advanced Emotional Intelligence system is operational with predictive mood forecasting and contextual response adaptation capabilities.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Summary</CardTitle>
                <CardDescription>
                  Latest emotional intelligence system activities and insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Generated {overview.totalForecasts} mood forecasts</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Predictive accuracy: {overview.averageAccuracy}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">{overview.activeInsights} active predictive insights</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Risk mitigation recommendations available</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Response adaptations active</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{overview.adaptationEffectiveness}% effectiveness rate</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                    <Heart className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium">Emotional stability maintained</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{overview.emotionalStability}% stability score</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}