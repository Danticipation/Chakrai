import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, Target, TrendingUp, Lightbulb, Settings, CheckCircle, Clock, Star, Zap, BookOpen, Activity } from 'lucide-react';
import axios from 'axios';

interface UserPreferences {
  id: number;
  communicationStyle: string;
  responseLength: string;
  emotionalSupportType: string;
  exercisePreferences: string[];
  preferredTopics: string[];
  learningPace: string;
  adaptationLevel: number;
}

interface TherapyPlan {
  id: number;
  planName: string;
  planType: string;
  currentPhase: string;
  totalPhases: number;
  difficultyLevel: string;
  focusAreas: string[];
  progressMetrics: any;
  isActive: boolean;
  startDate: string;
  nextAdaptation: string;
}

interface CBTExercise {
  id: number;
  exerciseType: string;
  title: string;
  description: string;
  instructions: string;
  targetPatterns: string[];
  difficultyLevel: string;
  estimatedDuration: number;
  aiRationale: string;
  isCompleted: boolean;
  effectivenessRating: number;
}

interface WellnessRecommendation {
  id: number;
  recommendationType: string;
  title: string;
  description: string;
  rationale: string;
  priorityLevel: string;
  category: string;
  instructions: string;
  durationMinutes: number;
  confidenceScore: number;
  isCompleted: boolean;
  userRating: number;
}

interface AdaptationInsight {
  id: number;
  insightType: string;
  insightTitle: string;
  insightDescription: string;
  dataSources: string[];
  confidenceLevel: number;
  adaptationActions: string[];
  impactAssessment: string;
  isActedUpon: boolean;
}

const AdaptiveLearning: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const { data: userPreferences } = useQuery<UserPreferences>({
    queryKey: ['/api/user-preferences/1'],
    queryFn: () => axios.get('/api/user-preferences/1').then(res => res.data)
  });

  const { data: therapyPlans } = useQuery<TherapyPlan[]>({
    queryKey: ['/api/adaptive-therapy-plans/1'],
    queryFn: () => axios.get('/api/adaptive-therapy-plans/1').then(res => res.data || [])
  });

  const { data: cbtExercises } = useQuery<CBTExercise[]>({
    queryKey: ['/api/personalized-cbt-exercises/1'],
    queryFn: () => axios.get('/api/personalized-cbt-exercises/1').then(res => res.data || [])
  });

  const { data: wellnessRecommendations } = useQuery<WellnessRecommendation[]>({
    queryKey: ['/api/wellness-recommendations/1'],
    queryFn: () => axios.get('/api/wellness-recommendations/1').then(res => res.data || [])
  });

  const { data: adaptationInsights } = useQuery<AdaptationInsight[]>({
    queryKey: ['/api/adaptation-insights/1'],
    queryFn: () => axios.get('/api/adaptation-insights/1').then(res => res.data || [])
  });

  const completeExercise = async (exerciseId: number, rating: number) => {
    try {
      await axios.post('/api/complete-exercise', { exerciseId, userId: 1, rating });
      window.location.reload();
    } catch (error) {
      console.error('Failed to complete exercise:', error);
    }
  };

  const completeRecommendation = async (recommendationId: number, rating: number) => {
    try {
      await axios.post('/api/complete-recommendation', { recommendationId, userId: 1, rating });
      window.location.reload();
    } catch (error) {
      console.error('Failed to complete recommendation:', error);
    }
  };

  const adaptPlan = async (planId: number, adaptationType: string) => {
    try {
      await axios.post('/api/adapt-plan', { planId, userId: 1, adaptationType });
      window.location.reload();
    } catch (error) {
      console.error('Failed to adapt plan:', error);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'thought_challenging': return Brain;
      case 'behavioral_experiment': return Activity;
      case 'mindfulness': return Target;
      default: return BookOpen;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'breathing': return Target;
      case 'mindfulness': return Brain;
      case 'activity': return Activity;
      default: return Lightbulb;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6] p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Brain className="text-purple-600" />
                Adaptive Learning & Personalization
              </h1>
              <p className="text-gray-600 mt-2">AI-curated therapy plans that evolve with your progress</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-purple-600">Level {userPreferences?.adaptationLevel || 1}</div>
              <div className="text-sm text-gray-600">Learning Progress</div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{Array.isArray(therapyPlans) ? therapyPlans.filter(p => p.isActive).length : 0}</div>
              <div className="text-xs text-gray-600">Active Plans</div>
            </div>
            <div className="bg-white/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-600">{Array.isArray(cbtExercises) ? cbtExercises.filter(e => e.isCompleted).length : 0}</div>
              <div className="text-xs text-gray-600">Completed Exercises</div>
            </div>
            <div className="bg-white/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{Array.isArray(wellnessRecommendations) ? wellnessRecommendations.filter(r => r.priorityLevel === 'high').length : 0}</div>
              <div className="text-xs text-gray-600">Priority Actions</div>
            </div>
            <div className="bg-white/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{Array.isArray(adaptationInsights) ? adaptationInsights.length : 0}</div>
              <div className="text-xs text-gray-600">New Insights</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl mb-6 border border-white/20">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'plans', label: 'Therapy Plans', icon: Target },
              { id: 'exercises', label: 'CBT Exercises', icon: Brain },
              { id: 'recommendations', label: 'Wellness', icon: Lightbulb },
              { id: 'insights', label: 'Insights', icon: Zap },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-700 hover:bg-white/40'
                  }`}
                >
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Active Plans Overview */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Therapy Journey</h3>
              <div className="space-y-4">
                {therapyPlans?.filter(p => p.isActive).map((plan) => (
                  <div key={plan.id} className="bg-white/40 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800">{plan.planName}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(plan.difficultyLevel)}`}>
                        {plan.difficultyLevel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Phase {plan.currentPhase} of {plan.totalPhases} • {plan.planType.toUpperCase()}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.focusAreas.map((area) => (
                        <span key={area} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {area.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((parseInt(plan.currentPhase.split(' ')[1]) || 1) / plan.totalPhases) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Recommendations */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Wellness Actions</h3>
              <div className="space-y-3">
                {Array.isArray(wellnessRecommendations) ? wellnessRecommendations.slice(0, 3).map((rec) => {
                  const IconComponent = getRecommendationIcon(rec.recommendationType);
                  return (
                    <div key={rec.id} className="flex items-center gap-4 bg-white/40 rounded-lg p-3">
                      <IconComponent className="text-purple-600" size={20} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{rec.title}</h4>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{rec.durationMinutes}min</span>
                        <button
                          onClick={() => completeRecommendation(rec.id, 5)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No wellness recommendations available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Insights */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Latest Insights</h3>
              <div className="space-y-3">
                {Array.isArray(adaptationInsights) ? adaptationInsights.slice(0, 2).map((insight) => (
                  <div key={insight.id} className="bg-white/40 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{insight.insightTitle}</h4>
                      <span className="text-sm text-purple-600">{Math.round(insight.confidenceLevel * 100)}% confidence</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.insightDescription}</p>
                    <div className="text-xs text-gray-500">
                      Based on: {insight.dataSources.join(', ')}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No insights available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(therapyPlans) ? therapyPlans.map((plan) => (
                <div key={plan.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{plan.planName}</h3>
                      <p className="text-sm text-gray-600">{plan.planType.toUpperCase()} Program</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Phase: {plan.currentPhase}</span>
                      <span>{plan.difficultyLevel}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((parseInt(plan.currentPhase.split(' ')[1]) || 1) / plan.totalPhases) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Areas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.focusAreas.map((area) => (
                        <span key={area} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {area.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => adaptPlan(plan.id, 'advance_phase')}
                      disabled={!plan.isActive}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Advance Phase
                    </button>
                    <button
                      onClick={() => adaptPlan(plan.id, 'adjust_difficulty')}
                      disabled={!plan.isActive}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Adjust Difficulty
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No therapy plans available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(cbtExercises) ? cbtExercises.map((exercise) => {
                const IconComponent = getExerciseIcon(exercise.exerciseType);
                return (
                  <div key={exercise.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className="text-purple-600" size={24} />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{exercise.title}</h3>
                          <p className="text-sm text-gray-600">{exercise.exerciseType.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(exercise.difficultyLevel)}`}>
                          {exercise.difficultyLevel}
                        </span>
                        {exercise.isCompleted && <CheckCircle className="text-green-500" size={20} />}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{exercise.description}</p>

                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
                      <p className="text-sm text-blue-800">{exercise.instructions}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Target Patterns:</h4>
                      <div className="flex flex-wrap gap-2">
                        {exercise.targetPatterns.map((pattern) => (
                          <span key={pattern} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {pattern.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">AI Insight:</h4>
                      <p className="text-sm text-gray-600">{exercise.aiRationale}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>{exercise.estimatedDuration} minutes</span>
                      </div>
                      {!exercise.isCompleted ? (
                        <button
                          onClick={() => completeExercise(exercise.id, 4)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          Complete Exercise
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Star size={16} fill="currentColor" />
                          <span>{exercise.effectivenessRating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No CBT exercises available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(wellnessRecommendations) ? wellnessRecommendations.map((rec) => {
                const IconComponent = getRecommendationIcon(rec.recommendationType);
                return (
                  <div key={rec.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <IconComponent className="text-purple-600" size={20} />
                        <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(rec.priorityLevel)}`}>
                        {rec.priorityLevel}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                    <div className="bg-green-50 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-medium text-green-900 mb-1">How to:</h4>
                      <p className="text-sm text-green-800">{rec.instructions}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Why this helps:</h4>
                      <p className="text-sm text-gray-600">{rec.rationale}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>{rec.durationMinutes} min</span>
                        <div className="text-xs">
                          {Math.round(rec.confidenceScore * 100)}% match
                        </div>
                      </div>
                      {!rec.isCompleted ? (
                        <button
                          onClick={() => completeRecommendation(rec.id, 5)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Start
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Star size={16} fill="currentColor" />
                          <span>{rec.userRating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No wellness recommendations available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {Array.isArray(adaptationInsights) ? adaptationInsights.map((insight) => (
                <div key={insight.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{insight.insightTitle}</h3>
                      <span className="text-sm text-purple-600 capitalize">{insight.insightType.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{Math.round(insight.confidenceLevel * 100)}%</div>
                      <div className="text-xs text-gray-600">Confidence</div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{insight.insightDescription}</p>

                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {insight.adaptationActions.map((action, index) => (
                        <li key={index} className="text-sm text-blue-800">• {action.replace('_', ' ')}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Impact Assessment:</h4>
                    <p className="text-sm text-green-800">{insight.impactAssessment}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Data sources: {insight.dataSources.join(', ')}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      insight.isActedUpon ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {insight.isActedUpon ? 'Applied' : 'Pending'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No adaptation insights available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Preferences</h3>
              
              {userPreferences && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Communication Style</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current style:</span>
                          <span className="text-sm font-medium text-purple-600 capitalize">{userPreferences.communicationStyle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Response length:</span>
                          <span className="text-sm font-medium text-purple-600 capitalize">{userPreferences.responseLength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Support type:</span>
                          <span className="text-sm font-medium text-purple-600 capitalize">{userPreferences.emotionalSupportType}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Learning Settings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Learning pace:</span>
                          <span className="text-sm font-medium text-purple-600 capitalize">{userPreferences.learningPace}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Adaptation level:</span>
                          <span className="text-sm font-medium text-purple-600">Level {userPreferences.adaptationLevel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Exercise Preferences</h4>
                    <div className="flex flex-wrap gap-2">
                      {userPreferences.exercisePreferences?.map((pref) => (
                        <span key={pref} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Preferred Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {userPreferences.preferredTopics?.map((topic) => (
                        <span key={topic} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {topic.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                    Update Preferences
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveLearning;