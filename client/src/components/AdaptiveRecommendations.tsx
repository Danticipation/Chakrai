import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Clock, Star, CheckCircle, Brain, Target } from 'lucide-react';

interface WellnessRecommendation {
  id: string;
  type: 'exercise' | 'meditation' | 'journaling' | 'breathing' | 'activity';
  name: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  tags: string[];
  personalizedReason: string;
  confidence: number;
}

interface AdaptationInsight {
  conversationThemes: string[];
  emotionalPatterns: string[];
  effectiveApproaches: string[];
  wellnessNeeds: string[];
  learningProgress: number;
  confidenceScore: number;
}

interface AdaptiveRecommendationsProps {
  userId: number;
  currentEmotion?: string;
  recentMessages?: string[];
}

export function AdaptiveRecommendations({ 
  userId, 
  currentEmotion = 'neutral',
  recentMessages = []
}: AdaptiveRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([]);
  const [insights, setInsights] = useState<AdaptationInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalizedRecommendations();
    fetchAdaptationInsights();
  }, [userId, currentEmotion]);

  const fetchPersonalizedRecommendations = async () => {
    try {
      const response = await fetch('/api/personalization/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          emotionalState: currentEmotion,
          recentMessages: recentMessages.slice(-5)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchAdaptationInsights = async () => {
    try {
      const response = await fetch(`/api/personalization/insights/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseRecommendation = async (recommendationId: string) => {
    setSelectedRecommendation(recommendationId);
    
    try {
      await fetch('/api/personalization/use-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          recommendationId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track recommendation usage:', error);
    }
  };

  const handleRateRecommendation = async (recommendationId: string, rating: number) => {
    try {
      await fetch('/api/personalization/rate-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          recommendationId,
          rating
        })
      });
      
      // Refresh recommendations after rating
      fetchPersonalizedRecommendations();
    } catch (error) {
      console.error('Failed to rate recommendation:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breathing': return '🫁';
      case 'meditation': return '🧘';
      case 'exercise': return '💪';
      case 'journaling': return '📝';
      case 'activity': return '🎯';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adaptation Insights */}
      {insights && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-purple-800">
              <Brain className="w-5 h-5 mr-2" />
              Your Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Personalization Level</span>
              <span className="text-sm font-medium text-purple-800">
                {Math.round(insights.learningProgress * 100)}%
              </span>
            </div>
            <Progress 
              value={insights.learningProgress * 100} 
              className="h-2 bg-purple-100"
            />
            
            {insights.emotionalPatterns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-purple-800 mb-2">Key Insights:</p>
                <div className="flex flex-wrap gap-1">
                  {insights.emotionalPatterns.slice(0, 3).map((pattern, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      <Card className="border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl text-blue-800">
            <Target className="w-6 h-6 mr-2" />
            Personalized for You
          </CardTitle>
          <p className="text-sm text-blue-600">
            Recommendations tailored to your preferences and current needs
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Building personalized recommendations...</p>
              <p className="text-sm mt-1">Keep chatting to help me learn your preferences!</p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <Card key={rec.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(rec.type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{rec.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getDifficultyColor(rec.difficulty)}>
                            {rec.difficulty}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {rec.duration} min
                          </div>
                          <div className="flex items-center text-xs text-blue-600">
                            <Star className="w-3 h-3 mr-1" />
                            {Math.round(rec.confidence * 100)}% match
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800">
                      <Lightbulb className="w-4 h-4 inline mr-1" />
                      {rec.personalizedReason}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {rec.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {selectedRecommendation === rec.id ? (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleRateRecommendation(rec.id, rating)}
                              className="text-yellow-400 hover:text-yellow-500"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleUseRecommendation(rec.id)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Try This
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Wellness Insights */}
      {insights && insights.wellnessNeeds.length > 0 && (
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              Your Wellness Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {insights.wellnessNeeds.slice(0, 4).map((need, index) => (
                <div key={index} className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-green-800 capitalize">
                    {need.replace('-', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}