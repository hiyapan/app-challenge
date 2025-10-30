import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export function useColorScheme() {
  const context = useContext(ThemeContext);
  if (context) {
    return context.colorScheme;
  }
  // Fallback to 'light' if context is not available
  return 'light' as 'light' | 'dark';
}
