import React, { useState } from 'react';
import { X, Settings, RefreshCw, Volume2, Palette, Database, Download, Upload, Info, Shield } from 'lucide-react';
import { getCurrentUserId } from '../utils/userSession';

interface SettingsPanelProps {
  onClose: () => void;
  onReset: () => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  onReset,
  selectedVoice,
  onVoiceChange,
  currentTheme,
  onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState('general');

  const voices = [
    { id: 'james', name: 'James', description: 'Professional & Calming' },
    { id: 'brian', name: 'Brian', description: 'Deep & Resonant' },
    { id: 'alexandra', name: 'Alexandra', description: 'Clear & Articulate' },
    { id: 'carla', name: 'Carla', description: 'Warm & Empathetic' },
    { id: 'hope', name: 'Hope', description: 'Warm & Encouraging' },
    { id: 'charlotte', name: 'Charlotte', description: 'Gentle & Empathetic' },
    { id: 'bronson', name: 'Bronson', description: 'Confident & Reassuring' },
    { id: 'marcus', name: 'Marcus', description: 'Smooth & Supportive' }
  ];

  const themes = [
    { id: 'midnight', name: 'Midnight Luxury', description: 'Deep blues and purples' },
    { id: 'lavender', name: 'Soft Lavender', description: 'Gentle purple tones' },
    { id: 'ocean', name: 'Ocean Depths', description: 'Calming sea blues' },
    { id: 'forest', name: 'Forest Luxury', description: 'Natural green tones' },
    { id: 'sunset', name: 'Sunset Rose', description: 'Warm pink hues' },
    { id: 'gold', name: 'Warm Gold', description: 'Rich golden tones' }
  ];

  const handleDataExport = async () => {
    const userId = getCurrentUserId();
    try {
      const response = await fetch(`/api/users/${userId}/export`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trai-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'audio', name: 'Audio', icon: Volume2 },
    { id: 'theme', name: 'Theme', icon: Palette },
    { id: 'data', name: 'Data', icon: Database },
    { id: 'about', name: 'About', icon: Info }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="theme-surface rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="theme-primary p-6 border-b border-[var(--theme-accent)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 theme-text" />
              <h2 className="text-2xl font-bold theme-text">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-red-400" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 theme-card border-r border-[var(--theme-accent)]/30">
            <div className="p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--theme-accent)]/20 text-[var(--theme-accent)]'
                      : 'theme-text-secondary hover:theme-text hover:bg-[var(--theme-surface)]'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div className="theme-card p-4 rounded-lg border border-[var(--theme-accent)]/30">
                      <h4 className="font-semibold theme-text mb-2">Reset Application Data</h4>
                      <p className="theme-text-secondary text-sm mb-4">
                        This will permanently delete all your data including chat history, journal entries, mood tracking, and preferences.
                      </p>
                      <button
                        onClick={onReset}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset All Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text mb-4">Audio Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold theme-text mb-3">Voice Selection</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {voices.map((voice) => (
                          <button
                            key={voice.id}
                            onClick={() => onVoiceChange(voice.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedVoice === voice.id
                                ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10'
                                : 'border-[var(--theme-accent)]/30 hover:border-[var(--theme-accent)]/50'
                            }`}
                          >
                            <div className="text-left">
                              <h5 className="font-semibold theme-text">{voice.name}</h5>
                              <p className="text-sm theme-text-secondary">{voice.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text mb-4">Theme Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold theme-text mb-3">Color Theme</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => onThemeChange(theme.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              currentTheme === theme.id
                                ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10'
                                : 'border-[var(--theme-accent)]/30 hover:border-[var(--theme-accent)]/50'
                            }`}
                          >
                            <div className="text-left">
                              <h5 className="font-semibold theme-text">{theme.name}</h5>
                              <p className="text-sm theme-text-secondary">{theme.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div className="theme-card p-4 rounded-lg border border-[var(--theme-accent)]/30">
                      <h4 className="font-semibold theme-text mb-2">Export Data</h4>
                      <p className="theme-text-secondary text-sm mb-4">
                        Download all your TraI data including journal entries, chat history, and preferences.
                      </p>
                      <button
                        onClick={handleDataExport}
                        className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/80 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text mb-4">About TraI</h3>
                  <div className="space-y-4">
                    <div className="theme-card p-4 rounded-lg border border-[var(--theme-accent)]/30">
                      <h4 className="font-semibold theme-text mb-2">TraI Mental Wellness Companion</h4>
                      <p className="theme-text-secondary text-sm mb-4">
                        Version 1.0.0 - A comprehensive mental wellness companion designed to support your journey with AI-powered insights, 
                        voice interactions, mood tracking, and personalized therapeutic guidance.
                      </p>
                      <div className="space-y-2 text-sm theme-text-secondary">
                        <p><strong>Privacy:</strong> All data is stored locally and anonymously</p>
                        <p><strong>AI Technology:</strong> Powered by OpenAI GPT-4 and ElevenLabs Voice</p>
                        <p><strong>Features:</strong> 8-voice system, mood tracking, journaling, personality insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;