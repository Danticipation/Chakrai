import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Brain, TrendingUp, User, RotateCcw } from 'lucide-react';
import { getCurrentUserId } from '../utils/userSession';

interface PersonalityReflectionData {
  reflection: string;
  lastUpdated: string;
  dataPoints: {
    conversations: number;
    journalEntries: number;
    moodEntries: number;
  };
}

interface PersonalityReflectionProps {
  userId?: number;
}

const PersonalityReflection: React.FC<PersonalityReflectionProps> = ({ userId }) => {
  // Get current user ID from session context
  const currentUserId = userId || getCurrentUserId();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['personality-reflection', currentUserId, refreshTrigger],
    queryFn: async (): Promise<PersonalityReflectionData> => {
      const response = await fetch(`/api/personality-reflection/${currentUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch personality reflection');
      }
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6 h-full theme-primary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#9fa8da]" />
            Personality Reflection
          </h2>
        </div>
        <div className="theme-primary/30 backdrop-blur-sm rounded-xl p-6 border border-[#9fa8da]/50">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/30 rounded w-3/4"></div>
            <div className="h-4 bg-white/30 rounded w-1/2"></div>
            <div className="h-4 bg-white/30 rounded w-5/6"></div>
            <div className="h-4 bg-white/30 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full theme-primary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#9fa8da]" />
            Personality Reflection
          </h2>
          <button
            onClick={handleRefresh}
            className="p-2 theme-primary text-white rounded-lg hover:theme-primary transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-red-900/30 border border-red-600/50 rounded-xl p-6">
          <p className="text-red-200">Unable to generate your personality reflection. Please try refreshing or continue engaging with the platform to build more data for analysis.</p>
        </div>
      </div>
    );
  }

  const formatReflectionText = (text: string) => {
    // If no structured format, just display as paragraphs
    if (!text.includes('1.') && !text.includes('TRAIT')) {
      return (
        <div className="space-y-4 text-white leading-relaxed">
          {text.split('\n').filter(line => line.trim()).map((paragraph, index) => (
            <p key={index} className="text-white/90 leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      );
    }

    // Split by numbered sections and format nicely
    const sections = text.split(/(?=\d+\.\s+[A-Z\s]+:)/);
    
    return sections.map((section, index) => {
      if (!section.trim()) return null;
      
      const lines = section.trim().split('\n');
      const title = lines[0];
      const content = lines.slice(1).join(' ').trim(); // Join with spaces, not newlines
      
      // Check if this is a numbered section
      const isNumberedSection = /^\d+\.\s+[A-Z\s]+:/.test(title);
      
      if (isNumberedSection) {
        const cleanTitle = title.replace(/^\d+\.\s+/, '').replace(':', '').trim();
        return (
          <div key={index} className="mb-6">
            <h3 className="font-semibold text-[#9fa8da] mb-3 flex items-center gap-2">
              {cleanTitle.includes('TRAIT') && <User className="w-4 h-4" />}
              {cleanTitle.includes('POSITIVE') && <TrendingUp className="w-4 h-4" />}
              {cleanTitle.includes('GROWTH') && <RotateCcw className="w-4 h-4" />}
              {cleanTitle.includes('EMOTIONAL') && <Brain className="w-4 h-4" />}
              <span>{cleanTitle}</span>
            </h3>
            <p className="text-white/90 leading-relaxed">{content}</p>
          </div>
        );
      } else {
        return (
          <p key={index} className="text-white/90 leading-relaxed mb-4">
            {section.trim()}
          </p>
        );
      }
    }).filter(Boolean);
  };

  return (
    <div className="p-6 h-full theme-primary overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#9fa8da]" />
          Personality Reflection
        </h2>
        <button
          onClick={handleRefresh}
          className="p-2 theme-primary text-white rounded-lg hover:theme-primary transition-colors flex items-center gap-2"
          title="Refresh Analysis"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Data Points Summary */}
      <div className="theme-primary/30 backdrop-blur-sm rounded-xl p-4 mb-4 border border-[#9fa8da]/50">
        <div className="text-sm text-white/80 mb-2">
          <span className="block mb-2">Analysis based on:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
              <div className="font-semibold text-lg text-white">{data?.dataPoints.conversations || 0}</div>
              <div className="text-white/70">conversations</div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
              <div className="font-semibold text-lg text-white">{data?.dataPoints.journalEntries || 0}</div>
              <div className="text-white/70">journal entries</div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
              <div className="font-semibold text-lg text-white">{data?.dataPoints.moodEntries || 0}</div>
              <div className="text-white/70">mood entries</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-white/60 mt-2 text-center">
          Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Unknown'}
        </div>
      </div>

      {/* AI Personality Analysis */}
      <div className="theme-primary/30 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-[#9fa8da]/50">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-[#BBDEFB]" />
          <h3 className="text-lg font-semibold text-white">AI Personality Analysis</h3>
        </div>
        
        <div className="space-y-4">
          {data?.reflection ? (
            formatReflectionText(data.reflection)
          ) : (
            <p className="text-white/70 italic">
              Continue engaging with TraI through conversations and journaling to build a more detailed personality profile. 
              Your reflection will become more insightful as you share more about yourself.
            </p>
          )}
        </div>
      </div>

      {/* Engagement Encouragement */}
      {(!data?.dataPoints.conversations || data.dataPoints.conversations < 3) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
          <p className="text-blue-700 text-sm">
            <strong>Tip:</strong> Have more conversations and write journal entries to get deeper personality insights and therapeutic guidance.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalityReflection;