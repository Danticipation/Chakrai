import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    colors: {
      primary: '#3f51b5',
      primaryLight: '#5c6bc0',
      primaryDark: '#1a237e',
      secondary: '#0a0e1a',
      accent: '#7986cb',
      background: '#0a0e1a',
      surface: '#1a237e',
      text: '#ffffff',
      textSecondary: '#ffffff99'
    }
  },
  {
    id: 'lavender',
    name: 'Calm Lavender',
    colors: {
      primary: '#8e6bbd',
      primaryLight: '#b39ddb',
      primaryDark: '#4a148c',
      secondary: '#1a0d2e',
      accent: '#ce93d8',
      background: '#1a0d2e',
      surface: '#4a148c',
      text: '#ffffff',
      textSecondary: '#ffffff99'
    }
  },
  {
    id: 'teal',
    name: 'Healing Teal',
    colors: {
      primary: '#26a69a',
      primaryLight: '#4db6ac',
      primaryDark: '#004d40',
      secondary: '#0d1f1c',
      accent: '#80cbc4',
      background: '#0d1f1c',
      surface: '#004d40',
      text: '#ffffff',
      textSecondary: '#ffffff99'
    }
  },
  {
    id: 'sage',
    name: 'Peaceful Sage',
    colors: {
      primary: '#81c784',
      primaryLight: '#a5d6a7',
      primaryDark: '#2e7d32',
      secondary: '#1b251e',
      accent: '#c8e6c9',
      background: '#1b251e',
      surface: '#2e7d32',
      text: '#ffffff',
      textSecondary: '#ffffff99'
    }
  },
  {
    id: 'rose',
    name: 'Warm Rose',
    colors: {
      primary: '#f06292',
      primaryLight: '#f48fb1',
      primaryDark: '#ad1457',
      secondary: '#2d1b25',
      accent: '#f8bbd9',
      background: '#2d1b25',
      surface: '#ad1457',
      text: '#ffffff',
      textSecondary: '#ffffff99'
    }
  },
  {
    id: 'amber',
    name: 'Golden Amber',
    colors: {
      primary: '#ff9800',
      primaryLight: '#ffb74d',
      primaryDark: '#e65100',
      secondary: '#2d1f0d',
      accent: '#ffcc02',
      background: '#2d1f0d',
      surface: '#e65100',
      text: '#ffffff',
      textSecondary: '#ffffff99'
    }
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  changeTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]); // Ocean Blue default

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('trai-theme');
    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
  }, []);

  // Force initial theme application immediately
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.colors.primary);
    root.style.setProperty('--theme-primary-light', currentTheme.colors.primaryLight);
    root.style.setProperty('--theme-primary-dark', currentTheme.colors.primaryDark);
    root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--theme-accent', currentTheme.colors.accent);
    root.style.setProperty('--theme-background', currentTheme.colors.background);
    root.style.setProperty('--theme-surface', currentTheme.colors.surface);
    root.style.setProperty('--theme-text', currentTheme.colors.text);
    root.style.setProperty('--theme-text-secondary', currentTheme.colors.textSecondary);
    console.log('Theme applied:', currentTheme.name, currentTheme.colors);
  }, []);

  useEffect(() => {
    // Apply theme colors to CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.colors.primary);
    root.style.setProperty('--theme-primary-light', currentTheme.colors.primaryLight);
    root.style.setProperty('--theme-primary-dark', currentTheme.colors.primaryDark);
    root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--theme-accent', currentTheme.colors.accent);
    root.style.setProperty('--theme-background', currentTheme.colors.background);
    root.style.setProperty('--theme-surface', currentTheme.colors.surface);
    root.style.setProperty('--theme-text', currentTheme.colors.text);
    root.style.setProperty('--theme-text-secondary', currentTheme.colors.textSecondary);
  }, [currentTheme]);

  const changeTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('trai-theme', themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};