import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, TrendingUp, Download, Calendar, Search, Filter } from 'lucide-react';
import JournalEditor from './JournalEditor';
// import JournalExportModal from './JournalExportModal';
import type { JournalEntry, JournalAnalytics } from '@shared/schema';
import { format } from 'date-fns';

interface JournalDashboardProps {
  userId: number;
}

export default function JournalDashboard({ userId }: JournalDashboardProps) {
  const [activeView, setActiveView] = useState<'list' | 'editor' | 'analytics' | 'export'>('list');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const queryClient = useQueryClient();

  // Always clear any fresh start flags and load journal entries
  useEffect(() => {
    localStorage.removeItem('freshStart');
    queryClient.removeQueries({ queryKey: ['/api/journal'] });
    queryClient.removeQueries({ queryKey: ['/api/journal/analytics'] });
  }, [queryClient]);

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['/api/journal', 13],
    enabled: true // Always fetch journal entries for user ID 13 where migrated data lives
  });

  const { data: analytics = null } = useQuery({
    queryKey: ['/api/journal/analytics', 13],
    enabled: activeView === 'analytics'
  });

  const filteredEntries = entries.filter((entry: JournalEntry) => {
    const matchesSearch = !searchQuery || 
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
    
    return matchesSearch && matchesMood;
  });

  const recentEntries = filteredEntries.slice(0, 10);

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setActiveView('editor');
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setActiveView('editor');
  };

  const handleSaveEntry = () => {
    setActiveView('list');
    setSelectedEntry(null);
  };

  const handleCancelEdit = () => {
    setActiveView('list');
    setSelectedEntry(null);
  };

  const renderEntryCard = (entry: JournalEntry) => {
    const entryAnalytics = analytics.find((a: JournalAnalytics) => a.entryId === entry.id);
    const sentimentColor = !entryAnalytics?.sentimentScore ? '#6B7280' :
      entryAnalytics.sentimentScore > 0.2 ? '#10B981' :
      entryAnalytics.sentimentScore < -0.2 ? '#EF4444' : '#F59E0B';

    return (
      <div
        key={entry.id}
        onClick={() => setSelectedEntry(entry)}
        className="rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md"
        style={{ backgroundColor: 'var(--surface-secondary)' }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              {entry.title || 'Untitled'}
            </h3>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{format(new Date(entry.createdAt!), 'MMM dd, yyyy')}</span>
              <span>{entry.wordCount || 0} words</span>
              {entry.mood && (
                <span className="px-2 py-1 rounded-full text-xs" style={{ 
                  backgroundColor: getMoodColor(entry.mood) + '20',
                  color: getMoodColor(entry.mood)
                }}>
                  {getMoodLabel(entry.mood)}
                </span>
              )}
            </div>
          </div>
          {entryAnalytics && (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: sentimentColor }}
                title={`Sentiment: ${((entryAnalytics.sentimentScore || 0) * 100).toFixed(0)}%`}
              />
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {entryAnalytics.emotionalIntensity || 0}%
              </div>
            </div>
          )}
        </div>
        
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
          {entry.content.substring(0, 120)}
          {entry.content.length > 120 && '...'}
        </p>

        {entry.emotionalTags && entry.emotionalTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.emotionalTags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full text-xs"
                style={{ 
                  backgroundColor: 'var(--gentle-lavender)',
                  color: 'var(--text-primary)'
                }}
              >
                {tag}
              </span>
            ))}
            {entry.emotionalTags.length > 3 && (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                +{entry.emotionalTags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAnalyticsSummary = () => {
    if (!analytics || analytics.totalEntries === 0) {
      return (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            No emotional journey data available
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Start journaling to see your emotional patterns and insights
          </p>
        </div>
      );
    }

    const topThemes = Object.entries(analytics.themes || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    return (
      <div className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--pale-green)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--soft-blue-dark)' }}>
              {analytics.totalEntries}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Entries</div>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--soft-blue-dark)' }}>
              {analytics.averageMoodIntensity?.toFixed(1) || '0'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Average Mood</div>
          </div>
        </div>

        {/* Top Themes */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recurring Themes</h3>
          {topThemes.length > 0 ? (
            <div className="space-y-2">
              {topThemes.map(([theme, count]) => (
                <div key={theme} className="flex items-center justify-between">
                  <span className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>{theme.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(20, (count as number) / analytics.totalEntries * 100)}px`,
                        backgroundColor: 'var(--soft-blue-dark)'
                      }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              Add tags to your entries to see recurring themes
            </p>
          )}
        </div>
        
        {/* Therapeutic Progress */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Therapeutic Progress</h3>
          <div className="text-center py-4">
            <div className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Good progress
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              You've been consistent with journaling. Keep expressing your thoughts and feelings.
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (activeView === 'editor') {
    return (
      <JournalEditor
        entry={selectedEntry || undefined}
        onSave={handleSaveEntry}
        onCancel={handleCancelEdit}
        userId={13}
      />
    );
  }

  if (activeView === 'export') {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Export Journal</h2>
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Export functionality will be available in the next update. You can access your journal entries through the main interface.
          </p>
          <button
            onClick={() => setActiveView('list')}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ 
              backgroundColor: 'var(--soft-blue-dark)',
              color: 'white'
            }}
          >
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  // Show fresh start message if this is a fresh start
  if (isFreshStart) {
    return (
      <div className="w-full p-6 bg-theme-surface rounded-lg border border-theme-accent/30">
        <div className="text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-theme-text mb-2">Fresh Start!</h2>
          <p className="text-theme-text-secondary mb-4">
            Your journal is ready for new entries. All previous data has been cleared. Start writing to begin your wellness journey!
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('freshStart');
              setActiveView('editor');
            }}
            className="bg-theme-primary text-white px-6 py-2 rounded-lg hover:bg-theme-primary-dark transition-colors"
          >
            Write Your First Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--gentle-lavender-dark)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {activeView === 'analytics' ? 'Journal Analytics' : 'Journal Entries'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'analytics' ? 'shadow-sm' : ''
              }`}
              style={{ 
                backgroundColor: activeView === 'analytics' ? 'var(--soft-blue-dark)' : 'var(--surface-secondary)',
                color: activeView === 'analytics' ? 'white' : 'var(--text-primary)'
              }}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('export')}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ 
                backgroundColor: 'var(--gentle-lavender)',
                color: 'var(--text-primary)'
              }}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleNewEntry}
              className="px-3 py-2 rounded-lg text-sm font-medium shadow-sm"
              style={{ 
                backgroundColor: 'var(--soft-blue-dark)',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full bg-[var(--theme-surface)] rounded-lg p-1 mb-6 shadow-lg border-2 border-[var(--theme-accent)]">
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => setActiveView('list')}
              className={`shimmer-border w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeView === 'list'
                  ? 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white shadow-lg border-2 border-silver animate-shimmer'
                  : 'bg-gradient-to-r from-[var(--theme-primary-light)] to-[var(--theme-surface)] text-white hover:from-[var(--theme-primary)] hover:to-[var(--theme-accent)] hover:shadow-md border border-silver hover:border-2 hover:animate-shimmer'
              }`}
            >
              <BookOpen className="w-4 h-4 mx-auto mb-1" />
              Entries
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`shimmer-border w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeView === 'analytics'
                  ? 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white shadow-lg border-2 border-silver animate-shimmer'
                  : 'bg-gradient-to-r from-[var(--theme-primary-light)] to-[var(--theme-surface)] text-white hover:from-[var(--theme-primary)] hover:to-[var(--theme-accent)] hover:shadow-md border border-silver hover:border-2 hover:animate-shimmer'
              }`}
            >
              <TrendingUp className="w-4 h-4 mx-auto mb-1" />
              Analytics
            </button>
            <button
              onClick={handleNewEntry}
              className={`shimmer-border w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeView === 'editor'
                  ? 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white shadow-lg border-2 border-silver animate-shimmer'
                  : 'bg-gradient-to-r from-[var(--theme-primary-light)] to-[var(--theme-surface)] text-white hover:from-[var(--theme-primary)] hover:to-[var(--theme-accent)] hover:shadow-md border border-silver hover:border-2 hover:animate-shimmer'
              }`}
            >
              <Plus className="w-4 h-4 mx-auto mb-1" />
              New Entry
            </button>
            <button
              onClick={() => setActiveView('export')}
              className={`shimmer-border w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeView === 'export'
                  ? 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white shadow-lg border-2 border-silver animate-shimmer'
                  : 'bg-gradient-to-r from-[var(--theme-primary-light)] to-[var(--theme-surface)] text-white hover:from-[var(--theme-primary)] hover:to-[var(--theme-accent)] hover:shadow-md border border-silver hover:border-2 hover:animate-shimmer'
              }`}
            >
              <Download className="w-4 h-4 mx-auto mb-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeView === 'list' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="rounded-2xl p-4 shadow-sm space-y-3" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search your entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                  style={{ 
                    borderColor: 'var(--gentle-lavender-dark)',
                    backgroundColor: 'white',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <select
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ 
                  borderColor: 'var(--gentle-lavender-dark)',
                  backgroundColor: 'white',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">All Moods</option>
                <option value="very_positive">Very Positive</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
                <option value="very_negative">Very Negative</option>
              </select>
            </div>

            {/* Entries List */}
            {isFreshStart ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                <p className="mb-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  Fresh Start! 🌟
                </p>
                <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your data has been cleared. Start your therapeutic journey by writing your first entry.
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem('freshStart');
                    handleNewEntry();
                  }}
                  className="px-6 py-3 rounded-2xl text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--soft-blue-dark)',
                    color: 'white'
                  }}
                >
                  Write First Entry
                </button>
              </div>
            ) : entriesLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading your entries...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {searchQuery || moodFilter !== 'all' ? 'No entries match your filters' : 'Start your therapeutic journey by writing your first entry'}
                </p>
                <button
                  onClick={handleNewEntry}
                  className="px-6 py-3 rounded-2xl text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--soft-blue-dark)',
                    color: 'white'
                  }}
                >
                  Write First Entry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map(renderEntryCard)}
                
                {filteredEntries.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Showing 10 of {filteredEntries.length} entries
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === 'analytics' && renderAnalyticsSummary()}
      </div>

      {/* Journal Entry Modal */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {selectedEntry.title || 'Untitled Entry'}
                  </h2>
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>{new Date(selectedEntry.createdAt).toLocaleDateString()}</span>
                    {selectedEntry.mood && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getMoodColor(selectedEntry.mood) }}
                        />
                        <span>{getMoodLabel(selectedEntry.mood)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="prose max-w-none mb-6">
                <div 
                  className="text-base leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedEntry.content}
                </div>
              </div>

              {/* Tags */}
              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: 'var(--accent)',
                          color: 'white'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Created on {new Date(selectedEntry.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ 
                    backgroundColor: 'var(--accent)',
                    color: 'white'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getMoodColor(mood: string): string {
  const colors: Record<string, string> = {
    very_positive: '#10B981',
    positive: '#84CC16',
    neutral: '#6B7280',
    negative: '#F59E0B',
    very_negative: '#EF4444'
  };
  return colors[mood] || '#6B7280';
}

function getMoodLabel(mood: string): string {
  const labels: Record<string, string> = {
    very_positive: 'Very Positive',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
    very_negative: 'Very Negative'
  };
  return labels[mood] || 'Unknown';
}

function getMoodLabel(mood: string): string {
  const labels: Record<string, string> = {
    very_positive: '😊',
    positive: '🙂',
    neutral: '😐',
    negative: '🙁',
    very_negative: '😢'
  };
  return labels[mood] || '😐';
}