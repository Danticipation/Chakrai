import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryMid: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    background: string;
    surface: string;
    surfaceLight: string;
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
      primaryMid: '#303f9f',
      secondary: '#0a0e1a',
      secondaryLight: '#1e2a3a',
      secondaryDark: '#050810',
      accent: '#7986cb',
      accentLight: '#9fa8da',
      background: '#0a0e1a',
      surface: '#1a237e',
      surfaceLight: '#2c3e8a',
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
      primaryMid: '#673ab7',
      secondary: '#1a0d2e',
      secondaryLight: '#2e1a3e',
      secondaryDark: '#0d0518',
      accent: '#ce93d8',
      accentLight: '#e1bee7',
      background: '#1a0d2e',
      surface: '#4a148c',
      surfaceLight: '#6a1b9a',
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
      primaryMid: '#00695c',
      secondary: '#0d1f1c',
      secondaryLight: '#1a3028',
      secondaryDark: '#061410',
      accent: '#80cbc4',
      accentLight: '#b2dfdb',
      background: '#0d1f1c',
      surface: '#004d40',
      surfaceLight: '#00796b',
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
      primaryMid: '#4caf50',
      secondary: '#1b251e',
      secondaryLight: '#2e3b32',
      secondaryDark: '#101a14',
      accent: '#c8e6c9',
      accentLight: '#dcedc8',
      background: '#1b251e',
      surface: '#2e7d32',
      surfaceLight: '#388e3c',
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
      primaryMid: '#c2185b',
      secondary: '#2d1b25',
      secondaryLight: '#3d2a35',
      secondaryDark: '#1a1015',
      accent: '#f8bbd9',
      accentLight: '#fce4ec',
      background: '#2d1b25',
      surface: '#ad1457',
      surfaceLight: '#c2185b',
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
      primaryMid: '#f57c00',
      secondary: '#2d1f0d',
      secondaryLight: '#3d2f1d',
      secondaryDark: '#1a1405',
      accent: '#ffcc02',
      accentLight: '#fff176',
      background: '#2d1f0d',
      surface: '#e65100',
      surfaceLight: '#f57c00',
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
    root.style.setProperty('--theme-primary-mid', currentTheme.colors.primaryMid);
    root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--theme-secondary-light', currentTheme.colors.secondaryLight);
    root.style.setProperty('--theme-secondary-dark', currentTheme.colors.secondaryDark);
    root.style.setProperty('--theme-accent', currentTheme.colors.accent);
    root.style.setProperty('--theme-accent-light', currentTheme.colors.accentLight);
    root.style.setProperty('--theme-background', currentTheme.colors.background);
    root.style.setProperty('--theme-surface', currentTheme.colors.surface);
    root.style.setProperty('--theme-surface-light', currentTheme.colors.surfaceLight);
    root.style.setProperty('--theme-text', currentTheme.colors.text);
    root.style.setProperty('--theme-text-secondary', currentTheme.colors.textSecondary);
    
    // Progress bars always use red->yellow->green regardless of theme
    root.style.setProperty('--progress-start', '#ef4444'); // red-500
    root.style.setProperty('--progress-middle', '#eab308'); // yellow-500  
    root.style.setProperty('--progress-end', '#22c55e'); // green-500
    console.log('Theme applied:', currentTheme.name, currentTheme.colors);
  }, []);

  useEffect(() => {
    // Apply theme colors to CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.colors.primary);
    root.style.setProperty('--theme-primary-light', currentTheme.colors.primaryLight);
    root.style.setProperty('--theme-primary-dark', currentTheme.colors.primaryDark);
    root.style.setProperty('--theme-primary-mid', currentTheme.colors.primaryMid);
    root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--theme-secondary-light', currentTheme.colors.secondaryLight);
    root.style.setProperty('--theme-secondary-dark', currentTheme.colors.secondaryDark);
    root.style.setProperty('--theme-accent', currentTheme.colors.accent);
    root.style.setProperty('--theme-accent-light', currentTheme.colors.accentLight);
    root.style.setProperty('--theme-background', currentTheme.colors.background);
    root.style.setProperty('--theme-surface', currentTheme.colors.surface);
    root.style.setProperty('--theme-surface-light', currentTheme.colors.surfaceLight);
    root.style.setProperty('--theme-text', currentTheme.colors.text);
    root.style.setProperty('--theme-text-secondary', currentTheme.colors.textSecondary);
    
    // Progress bars always use red->yellow->green regardless of theme
    root.style.setProperty('--progress-start', '#ef4444'); // red-500
    root.style.setProperty('--progress-middle', '#eab308'); // yellow-500  
    root.style.setProperty('--progress-end', '#22c55e'); // green-500
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