import React from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, themes } from '../contexts/ThemeContext';

interface ThemeSelectorProps {
  onClose?: () => void;
}

export default function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const { currentTheme, changeTheme } = useTheme();

  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 relative">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="text-white" size={24} />
        <h2 className="text-2xl font-bold text-white">Choose Your Theme</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => changeTheme(theme.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative group ${
              currentTheme.id === theme.id
                ? 'border-white bg-white/20 shadow-lg scale-105'
                : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10 hover:scale-102'
            }`}
          >
            {/* Theme Color Preview */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-1">
                <div 
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: theme.colors.primary }}
                ></div>
                <div 
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: theme.colors.primaryLight }}
                ></div>
                <div 
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: theme.colors.accent }}
                ></div>
              </div>
              {currentTheme.id === theme.id && (
                <Check size={16} className="text-white ml-auto" />
              )}
            </div>
            
            <h3 className="font-semibold text-white mb-2">{theme.name}</h3>
            <p className="text-sm text-white/70">
              {theme.id === 'blue' && 'Classic therapeutic blue for calming wellness'}
              {theme.id === 'lavender' && 'Gentle lavender for peaceful relaxation'}
              {theme.id === 'teal' && 'Healing teal for renewal and growth'}
              {theme.id === 'sage' && 'Natural sage for grounding and balance'}
              {theme.id === 'rose' && 'Warm rose for comfort and compassion'}
              {theme.id === 'amber' && 'Golden amber for warmth and energy'}
            </p>
            
            {/* Theme Preview Bar */}
            <div className="mt-3 h-2 rounded-full overflow-hidden flex">
              <div 
                className="flex-1" 
                style={{ backgroundColor: theme.colors.primary }}
              ></div>
              <div 
                className="flex-1" 
                style={{ backgroundColor: theme.colors.primaryLight }}
              ></div>
              <div 
                className="flex-1" 
                style={{ backgroundColor: theme.colors.accent }}
              ></div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center pt-4">
        <p className="text-white/70 text-sm">
          Current theme: <span className="font-semibold text-white">{currentTheme.name}</span>
        </p>
        <p className="text-white/60 text-xs mt-1">
          Theme changes apply instantly across the entire app
        </p>
      </div>
    </div>
  );
}