import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Lightbulb,
  Activity,
  Heart,
  Zap,
  Award,
  RefreshCw
} from 'lucide-react';

interface TherapeuticPlan {
  id: string;
  userId: number;
  planType: 'daily' | 'weekly' | 'monthly' | 'crisis_intervention';
  generatedAt: string;
  validUntil: string;
  adaptationLevel: number;
  therapeuticGoals: TherapeuticGoal[];
  dailyActivities: DailyActivity[];
  weeklyMilestones: WeeklyMilestone[];
  progressMetrics: ProgressMetric[];
  adaptationTriggers: AdaptationTrigger[];
  confidenceScore: number;
}

interface TherapeuticGoal {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetCompletion: string;
  measurableOutcomes: string[];
  adaptiveStrategies: string[];
  progressIndicators: string[];
}

interface DailyActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  emotionalFocus: string[];
  instructions: string[];
  adaptationNotes: string;
  scheduledTime?: string;
  personalizedReason: string;
}

interface WeeklyMilestone {
  id: string;
  week: number;
  goalTitle: string;
  description: string;
  successCriteria: string[];
  rewardType: string;
  adaptationPoints: number;
}

interface ProgressMetric {
  category: string;
  baseline: number;
  currentValue: number;
  targetValue: number;
  trend: 'improving' | 'stable' | 'declining';
  confidenceLevel: number;
  lastUpdated: string;
}

interface AdaptationTrigger {
  type: string;
  threshold: number;
  responseAction: string;
  description: string;
}

interface AdaptiveTherapyPlanProps {
  userId: number;
  onPlanUpdate?: (plan: TherapeuticPlan) => void;
}

function AdaptiveTherapyPlan({ userId, onPlanUpdate }: AdaptiveTherapyPlanProps) {
  const [currentPlan, setCurrentPlan] = useState<TherapeuticPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [adapting, setAdapting] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCurrentPlan();
  }, [userId]);

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch(`/api/adaptive-therapy/plan/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
        onPlanUpdate?.(data.plan);
      }
    } catch (error) {
      console.error('Failed to fetch therapeutic plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async (planType: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    try {
      setLoading(true);
      const response = await fetch('/api/adaptive-therapy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planType })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
        onPlanUpdate?.(data.plan);
      }
    } catch (error) {
      console.error('Failed to generate new plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const adaptPlan = async (triggerType: string, feedback?: any) => {
    if (!currentPlan) return;

    try {
      setAdapting(true);
      const response = await fetch('/api/adaptive-therapy/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: currentPlan.id,
          triggerType,
          feedback
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.adaptedPlan);
        onPlanUpdate?.(data.adaptedPlan);
      }
    } catch (error) {
      console.error('Failed to adapt plan:', error);
    } finally {
      setAdapting(false);
    }
  };

  const completeActivity = async (activityId: string) => {
    try {
      setCompletedActivities(prev => new Set([...prev, activityId]));
      
      await fetch('/api/adaptive-therapy/complete-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activityId,
          completedAt: new Date().toISOString()
        })
      });

      // Check if plan adaptation is needed
      const effectiveness = await fetch(`/api/adaptive-therapy/monitor/${userId}/${currentPlan?.id}`);
      if (effectiveness.ok) {
        const data = await effectiveness.json();
        if (data.shouldAdapt) {
          adaptPlan('goal_achievement');
        }
      }
    } catch (error) {
      console.error('Failed to complete activity:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <Lightbulb className="w-4 h-4 text-green-500" />;
      case 'intermediate': return <Activity className="w-4 h-4 text-yellow-500" />;
      case 'advanced': return <Zap className="w-4 h-4 text-red-500" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'stable': return <Target className="w-4 h-4 text-blue-500" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="text-center p-8">
        <Brain className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white-800 mb-2">Create Your Adaptive Therapy Plan</h2>
        <p className="text-white-600 mb-6">Get a personalized therapeutic plan that adapts to your progress and needs</p>
        <div className="space-x-4">
          <Button onClick={() => generateNewPlan('daily')}>Daily Plan</Button>
          <Button onClick={() => generateNewPlan('weekly')} variant="outline">Weekly Plan</Button>
          <Button onClick={() => generateNewPlan('monthly')} variant="outline">Monthly Plan</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Plan Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-blue-800">Your Adaptive Therapy Plan</CardTitle>
                <p className="text-sm text-blue-600">
                  {currentPlan.planType.charAt(0).toUpperCase() + currentPlan.planType.slice(1)} Plan • 
                  Confidence: {Math.round(currentPlan.confidenceScore * 100)}%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-white">
                Adaptation Level: {Math.round(currentPlan.adaptationLevel * 100)}%
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => adaptPlan('user_request')}
                disabled={adapting}
              >
                {adapting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {adapting ? 'Adapting...' : 'Adapt Plan'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities">Daily Activities</TabsTrigger>
          <TabsTrigger value="goals">Therapeutic Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress Metrics</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid gap-4">
            {currentPlan.dailyActivities.map(activity => (
              <Card key={activity.id} className="border-l-4 border-l-purple-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDifficultyIcon(activity.difficulty)}
                      <div>
                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.estimatedDuration} min
                      </Badge>
                      {completedActivities.has(activity.id) ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => completeActivity(activity.id)}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {activity.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    
                    {activity.emotionalFocus && (
                      <div className="flex flex-wrap gap-2">
                        {activity.emotionalFocus.map(focus => (
                          <Badge key={focus} variant="secondary" className="text-xs">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {activity.personalizedReason && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Why this helps:</strong> {activity.personalizedReason}
                        </p>
                      </div>
                    )}
                    
                    {activity.adaptationNotes && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Adaptation notes:</strong> {activity.adaptationNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4">
            {currentPlan.therapeuticGoals.map(goal => (
              <Card key={goal.id} className="border-l-4 border-l-green-400">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Target Completion:</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {new Date(goal.targetCompletion).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Measurable Outcomes:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {goal.measurableOutcomes.map((outcome, index) => (
                          <li key={index}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Adaptive Strategies:</p>
                      <div className="flex flex-wrap gap-2">
                        {goal.adaptiveStrategies.map(strategy => (
                          <Badge key={strategy} variant="outline" className="text-xs">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4">
            {currentPlan.progressMetrics.map(metric => (
              <Card key={metric.category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {metric.category.replace('_', ' ')}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                      <Badge variant="outline">{metric.trend}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Baseline: {metric.baseline ? metric.baseline.toFixed(1) : '0.0'}</span>
                        <span>Current: {metric.currentValue ? metric.currentValue.toFixed(1) : '0.0'}</span>
                        <span>Target: {metric.targetValue ? metric.targetValue.toFixed(1) : '0.0'}</span>
                      </div>
                      <Progress 
                        value={metric.currentValue && metric.baseline && metric.targetValue ? 
                          ((metric.currentValue - metric.baseline) / (metric.targetValue - metric.baseline) * 100) : 0}
                        className="h-3"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Confidence: {Math.round(metric.confidenceLevel * 100)}%
                      </span>
                      <span className="text-gray-500">
                        Updated: {new Date(metric.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="grid gap-4">
            {currentPlan.weeklyMilestones.map(milestone => (
              <Card key={milestone.id} className="border-l-4 border-l-orange-400">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{milestone.goalTitle}</CardTitle>
                      <p className="text-sm text-gray-600">Week {milestone.week}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-orange-500" />
                      <Badge variant="outline">
                        {milestone.adaptationPoints} points
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">{milestone.description}</p>
                    
                    {milestone.successCriteria && milestone.successCriteria.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Success Criteria:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {milestone.successCriteria.map((criteria, index) => (
                            <li key={index}>{criteria}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800 font-medium">
                          Reward: {milestone.rewardType ? milestone.rewardType.replace('_', ' ') : 'Achievement unlock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Plan Adaptation Information */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-2">Adaptive Intelligence</p>
              <ul className="space-y-1 text-xs">
                <li>• Your plan automatically adapts based on your progress and emotional patterns</li>
                <li>• Activities are personalized using AI analysis of your therapeutic needs</li>
                <li>• Milestones adjust dynamically to maintain optimal challenge levels</li>
                <li>• Real-time monitoring ensures interventions when support is needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdaptiveTherapyPlan;

