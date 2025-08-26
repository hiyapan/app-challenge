import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  background: string;
  palette: string[];
}

interface ThemeContextType {
  currentTheme: ThemeOption;
  themeOptions: ThemeOption[];
  setTheme: (themeId: string) => Promise<void>;
  loadTheme: () => Promise<void>;
}

const themeOptions: ThemeOption[] = [
  { 
    id: 'theme1', 
    name: 'Theme 1', 
    primary: '#FF6B6B', 
    secondary: '#4ECDC4', 
    accent: '#45B7D1',
    surface: '#F8F9FA',
    background: '#FFFFFF',
    palette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'] // Rainbow
  },
  { 
    id: 'theme2', 
    name: 'Theme 2', 
    primary: '#3498DB', 
    secondary: '#5DADE2', 
    accent: '#85C1E9',
    surface: '#EBF5FB',
    background: '#F8FCFF',
    palette: ['#1B4F72', '#2874A6', '#3498DB', '#5DADE2', '#85C1E9'] // Blue monochrome
  },
  { 
    id: 'theme3', 
    name: 'Theme 3', 
    primary: '#2C3E50', 
    secondary: '#34495E', 
    accent: '#E74C3C',
    surface: '#FFFFFF',
    background: '#F8F9FA',
    palette: ['#2C3E50', '#34495E', '#5D6D7E', '#85929E', '#E74C3C'] // Dark with red accent
  },
  { 
    id: 'theme4', 
    name: 'Theme 4', 
    primary: '#E67E22', 
    secondary: '#F39C12', 
    accent: '#F1C40F',
    surface: '#FEF9E7',
    background: '#FFFEF7',
    palette: ['#A04000', '#D35400', '#E67E22', '#F39C12', '#F1C40F'] // Warm oranges
  },
  { 
    id: 'theme5', 
    name: 'Theme 5', 
    primary: '#8E44AD', 
    secondary: '#9B59B6', 
    accent: '#BB8FCE',
    surface: '#FDEEF7',
    background: '#FDF2F8',
    palette: ['#4A148C', '#6A1B9A', '#8E44AD', '#9B59B6', '#BB8FCE'] // Purple gradient
  },
  { 
    id: 'theme6', 
    name: 'Theme 6', 
    primary: '#27AE60', 
    secondary: '#2ECC71', 
    accent: '#58D68D',
    surface: '#E8F8F5',
    background: '#F0FDF4',
    palette: ['#0F5132', '#1E7E34', '#27AE60', '#2ECC71', '#58D68D'] // Green nature
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(themeOptions[0]);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        const theme = themeOptions.find(t => t.id === savedTheme);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }, []);

  const setTheme = useCallback(async (themeId: string) => {
    try {
      const theme = themeOptions.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const value: ThemeContextType = {
    currentTheme,
    themeOptions,
    setTheme,
    loadTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}