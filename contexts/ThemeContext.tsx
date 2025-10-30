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
  colorScheme: 'light' | 'dark';
}

const themeOptions: ThemeOption[] = [
  { 
    id: 'theme1', 
    name: 'Theme 1', 
    primary: '#D63447', 
    secondary: '#1F8A70', 
    accent: '#2980B9',
    surface: '#F8F9FA',
    background: '#FFFFFF',
    palette: ['#D63447', '#1F8A70', '#2980B9', '#52796F', '#C5A500'] // Rainbow
  },
  { 
    id: 'theme3', 
    name: 'Theme 2', 
    primary: '#1C2833', 
    secondary: '#273746', 
    accent: '#C0392B',
    surface: '#FFFFFF',
    background: '#F8F9FA',
    palette: ['#1C2833', '#273746', '#424949', '#566573', '#C0392B'] // Dark with red accent
  },
  { 
    id: 'theme6', 
    name: 'Theme 3', 
    primary: '#16697A', 
    secondary: '#0E4C59', 
    accent: '#DB9000',
    surface: '#E8F8F5',
    background: '#F0FDF4',
    palette: ['#489FB5', '#16697A', '#0E4C59', '#DB9000', '#D97106']
  },
  { 
    id: 'theme4', 
    name: 'Theme 4 (Dark Mode)', 
    primary: '#E8E8E8', 
    secondary: '#D0D0D0', 
    accent: '#5FC7E3',
    surface: '#1C2833',
    background: '#0F1419',
    palette: ['#E8E8E8', '#D0D0D0', '#B0B0B0', '#909090', '#5FC7E3'] // Light grays with bright cyan accent
  }
];

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(themeOptions[0]);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        const theme = themeOptions.find(t => t.id === savedTheme);
        if (theme) {
          setCurrentTheme(theme);
          setColorScheme(savedTheme === 'theme4' ? 'dark' : 'light');
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
        setColorScheme(themeId === 'theme4' ? 'dark' : 'light');
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
    colorScheme,
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