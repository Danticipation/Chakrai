import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Save, Trash2, Eye, EyeOff, Brain, TrendingUp, FileText } from 'lucide-react';
import type { JournalEntry, JournalAnalytics } from '@shared/schema';

interface JournalEditorProps {
  entry?: JournalEntry;
  onSave?: (entry: JournalEntry) => void;
  onCancel?: () => void;
  userId: number;
}

interface EmotionalTag {
  id: string;
  label: string;
  color: string;
}

const emotionalTags: EmotionalTag[] = [
  { id: 'happy', label: 'Happy', color: '#10B981' },
  { id: 'sad', label: 'Sad', color: '#3B82F6' },
  { id: 'anxious', label: 'Anxious', color: '#F59E0B' },
  { id: 'grateful', label: 'Grateful', color: '#8B5CF6' },
  { id: 'frustrated', label: 'Frustrated', color: '#EF4444' },
  { id: 'hopeful', label: 'Hopeful', color: '#06B6D4' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: '#EC4899' },
  { id: 'peaceful', label: 'Peaceful', color: '#84CC16' }
];

const moodOptions = [
  { value: 'very_positive', label: '😊 Very Positive', color: '#10B981' },
  { value: 'positive', label: '🙂 Positive', color: '#84CC16' },
  { value: 'neutral', label: '😐 Neutral', color: '#6B7280' },
  { value: 'negative', label: '🙁 Negative', color: '#F59E0B' },
  { value: 'very_negative', label: '😢 Very Negative', color: '#EF4444' }
];

export default function JournalEditor({ entry, onSave, onCancel, userId }: JournalEditorProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(entry?.emotionalTags || []);
  const [triggers, setTriggers] = useState<string[]>(entry?.triggers || []);
  const [gratitude, setGratitude] = useState<string[]>(entry?.gratitude || []);
  const [goals, setGoals] = useState<string[]>(entry?.goals || []);
  const [newTrigger, setNewTrigger] = useState('');
  const [newGratitude, setNewGratitude] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analytics, setAnalytics] = useState<JournalAnalytics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (journalData: any) => {
      if (entry?.id) {
        const response = await axios.patch(`/api/journal/${entry.id}`, journalData);
        return response.data;
      } else {
        const response = await axios.post('/api/journal', journalData);
        return response.data;
      }
    },
    onSuccess: (savedEntry) => {
      console.log("Journal entry saved successfully");
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      onSave?.(savedEntry);
    },
    onError: (error) => {
      console.error("Failed to save journal entry:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!entry?.id) return;
      await axios.delete(`/api/journal/${entry.id}`);
    },
    onSuccess: () => {
      console.log("Journal entry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      onCancel?.();
    },
    onError: (error) => {
      console.error("Failed to delete journal entry:", error);
    },
  });

  const analyzeEntryMutation = useMutation({
    mutationFn: async () => {
      if (!entry?.id) return null;
      const response = await axios.get(`/api/journal/${entry.id}/analyze`);
      return response.data;
    },
    onSuccess: (analysisData) => {
      setAnalytics(analysisData);
      setShowAnalysis(true);
    },
    onError: (error) => {
      console.error("Failed to analyze journal entry:", error);
    },
  });

  const handleSave = () => {
    if (!content.trim()) {
      console.warn("Content required before saving");
      return;
    }

    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);

    const journalData = {
      userId,
      title: title.trim() || undefined,
      content: content.trim(),
      mood: mood || undefined,
      emotionalTags: selectedTags.length > 0 ? selectedTags : undefined,
      triggers: triggers.length > 0 ? triggers : undefined,
      gratitude: gratitude.length > 0 ? gratitude : undefined,
      goals: goals.length > 0 ? goals : undefined,
      wordCount,
      readingTime
    };

    saveMutation.mutate(journalData);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const addTrigger = () => {
    if (newTrigger.trim() && !triggers.includes(newTrigger.trim())) {
      setTriggers([...triggers, newTrigger.trim()]);
      setNewTrigger('');
    }
  };

  const addGratitude = () => {
    if (newGratitude.trim() && !gratitude.includes(newGratitude.trim())) {
      setGratitude([...gratitude, newGratitude.trim()]);
      setNewGratitude('');
    }
  };

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const removeGratitude = (index: number) => {
    setGratitude(gratitude.filter((_, i) => i !== index));
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (entry?.id) {
      setIsAnalyzing(true);
      analyzeEntryMutation.mutate();
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {entry ? 'Edit Entry' : 'New Journal Entry'}
          </h2>
          {entry && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ 
                backgroundColor: 'var(--soft-blue-dark)',
                color: 'white'
              }}
            >
              <Brain className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
            </button>
          )}
        </div>

        {/* Title Input */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your entry a title..."
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ 
              borderColor: 'var(--gentle-lavender-dark)',
              backgroundColor: 'white',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Mood Selection */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            How are you feeling?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {moodOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`p-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  mood === option.value ? 'border-opacity-100' : 'border-transparent'
                }`}
                style={{ 
                  backgroundColor: mood === option.value ? option.color + '20' : 'white',
                  borderColor: mood === option.value ? option.color : 'transparent',
                  color: 'var(--text-primary)'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Your Thoughts
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share what's on your mind... Express your thoughts, feelings, experiences, or reflections freely."
            className="w-full h-32 px-3 py-2 rounded-lg border text-sm resize-none"
            style={{ 
              borderColor: 'var(--gentle-lavender-dark)',
              backgroundColor: 'white',
              color: 'var(--text-primary)'
            }}
          />
          <div className="flex justify-between items-center mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>{content.split(/\s+/).filter(word => word.length > 0).length} words</span>
            <span>~{Math.ceil(content.split(/\s+/).filter(word => word.length > 0).length / 200)} min read</span>
          </div>
        </div>

        {/* Emotional Tags */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Emotional Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {emotionalTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedTags.includes(tag.id) ? 'text-white' : 'text-gray-700'
                }`}
                style={{ 
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'white',
                  border: `1px solid ${tag.color}`
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Analysis Display */}
        {showAnalysis && analytics && (
          <div className="rounded-2xl p-4 shadow-sm border-2" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--soft-blue-dark)'
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Brain className="w-5 h-5" />
                AI Insights
              </h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <EyeOff className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Sentiment & Intensity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--soft-blue-dark)' }}>
                    {((analytics.sentimentScore || 0) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Sentiment</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--pale-green)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--soft-blue-dark)' }}>
                    {analytics.emotionalIntensity || 0}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Intensity</div>
                </div>
              </div>

              {/* Key Insights */}
              {analytics.keyInsights && analytics.keyInsights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Key Insights</h4>
                  <ul className="space-y-1">
                    {analytics.keyInsights.slice(0, 3).map((insight, index) => (
                      <li key={index} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Actions */}
              {analytics.recommendedActions && analytics.recommendedActions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Suggestions</h4>
                  <ul className="space-y-1">
                    {analytics.recommendedActions.slice(0, 2).map((action, index) => (
                      <li key={index} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--gentle-lavender-dark)' }}>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !content.trim()}
          className="flex-1 px-4 py-3 rounded-2xl text-sm font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: 'var(--soft-blue-dark)',
            color: 'white'
          }}
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? 'Saving...' : 'Save Entry'}
        </button>
        
        {entry && (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="px-4 py-3 rounded-2xl text-sm font-medium shadow-sm flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: '#EF4444',
              color: 'white'
            }}
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        )}
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-3 rounded-2xl text-sm font-medium shadow-sm"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}