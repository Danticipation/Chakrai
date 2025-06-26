import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, MessageSquare, Target, TrendingUp, User, Settings, Lightbulb, Award } from 'lucide-react';

interface UserPreferences {
  id: number;
  communicationStyle: string;
  preferredTopics: string[];
  avoidedTopics: string[];
  responseLength: string;
  emotionalSupport: string;
  sessionTiming: string;
  exercisePreferences: string[];
  adaptationLevel: number;
}

interface ConversationPattern {
  id: number;
  pattern: string;
  frequency: number;
  effectiveness: number;
  category: string;
  context: string;
  lastUsed: string;
}

interface WellnessRecommendation {
  id: string;
  type: string;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  tags: string[];
  personalizedReason: string;
  confidence: number;
}

interface AdaptationInsight {
  id: number;
  conversationThemes: string[];
  emotionalPatterns: string[];
  effectiveApproaches: string[];
  preferredTimes: string[];
  wellnessNeeds: string[];
  learningProgress: number;
  confidenceScore: number;
}

const AdaptiveLearning: React.FC = () => {
  const [activeTab, setActiveTab] = useState('preferences');

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ['/api/user-preferences/1'],
    queryFn: () => fetch('/api/user-preferences/1').then(res => res.json()),
  });

  const { data: patterns } = useQuery<ConversationPattern[]>({
    queryKey: ['/api/conversation-patterns/1'],
    queryFn: () => fetch('/api/conversation-patterns/1').then(res => res.json()),
  });

  const { data: recommendations } = useQuery<WellnessRecommendation[]>({
    queryKey: ['/api/wellness-recommendations/1'],
    queryFn: () => fetch('/api/wellness-recommendations/1').then(res => res.json()),
  });

  const { data: insights } = useQuery<AdaptationInsight>({
    queryKey: ['/api/adaptation-insights/1'],
    queryFn: () => fetch('/api/adaptation-insights/1').then(res => res.json()),
  });

  const renderPreferencesTab = () => {
    return (
      <div className="space-y-6">
        {/* Communication Preferences */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Communication Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Communication Style</label>
              <div className="p-3 bg-white/10 rounded-lg">
                <span className="text-white capitalize">{preferences?.communicationStyle || 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/80">Response Length</label>
              <div className="p-3 bg-white/10 rounded-lg">
                <span className="text-white capitalize">{preferences?.responseLength || 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/80">Emotional Support</label>
              <div className="p-3 bg-white/10 rounded-lg">
                <span className="text-white capitalize">{preferences?.emotionalSupport || 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/80">Session Timing</label>
              <div className="p-3 bg-white/10 rounded-lg">
                <span className="text-white capitalize">{preferences?.sessionTiming || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Adaptation Level */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Learning Adaptation</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Adaptation Level</span>
              <span className="text-white font-bold">{Math.round((preferences?.adaptationLevel || 0) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${(preferences?.adaptationLevel || 0) * 100}%` }}
              ></div>
            </div>
            <p className="text-white/60 text-sm">
              Higher levels mean more personalized responses based on your interaction patterns
            </p>
          </div>
        </div>

        {/* Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
            <h4 className="font-semibold text-white mb-3">Preferred Topics</h4>
            <div className="flex flex-wrap gap-2">
              {preferences?.preferredTopics?.map((topic, index) => (
                <span key={index} className="px-2 py-1 bg-white/20 rounded text-white text-sm">
                  {topic}
                </span>
              )) || <span className="text-white/60">No preferences set</span>}
            </div>
          </div>
          <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
            <h4 className="font-semibold text-white mb-3">Exercise Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {preferences?.exercisePreferences?.map((exercise, index) => (
                <span key={index} className="px-2 py-1 bg-white/20 rounded text-white text-sm">
                  {exercise}
                </span>
              )) || <span className="text-white/60">No preferences set</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPatternsTab = () => {
    return (
      <div className="space-y-6">
        {/* Conversation Patterns */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Conversation Patterns</h3>
          <div className="space-y-4">
            {patterns?.map((pattern) => (
              <div key={pattern.id} className="p-4 bg-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium capitalize">{pattern.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 text-sm">Effectiveness:</span>
                    <span className="text-white font-bold">{Math.round(pattern.effectiveness * 100)}%</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-2">{pattern.pattern}</p>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Used {pattern.frequency} times</span>
                  <span>Last used: {new Date(pattern.lastUsed).toLocaleDateString()}</span>
                </div>
              </div>
            )) || <p className="text-white/60">No patterns learned yet</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendationsTab = () => {
    return (
      <div className="space-y-6">
        {/* Personalized Recommendations */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Personalized Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations?.map((rec) => (
              <div key={rec.id} className="p-4 bg-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{rec.name}</h4>
                  <span className="text-xs text-white/60 px-2 py-1 bg-white/20 rounded capitalize">
                    {rec.difficulty}
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-2">{rec.description}</p>
                <p className="text-white/60 text-xs mb-2 italic">Why for you: {rec.personalizedReason}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">{rec.duration} min</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-white/60 text-xs">Confidence:</span>
                    <span className="text-white font-bold text-xs">{Math.round(rec.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            )) || <p className="text-white/60">No recommendations available</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderInsightsTab = () => {
    return (
      <div className="space-y-6">
        {/* Learning Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Learning Progress</p>
                <p className="text-2xl font-bold text-white">{Math.round((insights?.learningProgress || 0) * 100)}%</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Confidence Score</p>
                <p className="text-2xl font-bold text-white">{Math.round((insights?.confidenceScore || 0) * 100)}%</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="bg-[#3f51b5] rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">AI Learning Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Conversation Themes</h4>
              <div className="space-y-1">
                {insights?.conversationThemes?.map((theme, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-white/20 rounded text-white text-sm mr-1 mb-1">
                    {theme}
                  </span>
                )) || <span className="text-white/60">No themes identified</span>}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Emotional Patterns</h4>
              <div className="space-y-1">
                {insights?.emotionalPatterns?.map((pattern, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-white/20 rounded text-white text-sm mr-1 mb-1">
                    {pattern}
                  </span>
                )) || <span className="text-white/60">No patterns identified</span>}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Effective Approaches</h4>
              <div className="space-y-1">
                {insights?.effectiveApproaches?.map((approach, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-white/20 rounded text-white text-sm mr-1 mb-1">
                    {approach}
                  </span>
                )) || <span className="text-white/60">No approaches identified</span>}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Wellness Needs</h4>
              <div className="space-y-1">
                {insights?.wellnessNeeds?.map((need, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-white/20 rounded text-white text-sm mr-1 mb-1">
                    {need}
                  </span>
                )) || <span className="text-white/60">No needs identified</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a237e] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Adaptive Learning</h1>
          <p className="text-white/80">AI-powered personalization and learning insights</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#3f51b5] rounded-xl p-1 mb-6 border border-white/20">
          <div className="flex space-x-1">
            {[
              { id: 'preferences', label: 'Preferences', icon: Settings },
              { id: 'patterns', label: 'Patterns', icon: MessageSquare },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'insights', label: 'Insights', icon: Brain },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1a237e] text-white shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'preferences' && renderPreferencesTab()}
        {activeTab === 'patterns' && renderPatternsTab()}
        {activeTab === 'recommendations' && renderRecommendationsTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

export default AdaptiveLearning;