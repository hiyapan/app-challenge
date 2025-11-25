import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import AppContainer from '../components/AppContainer';
import { ThemeProvider as AppThemeProvider } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';
import { useColorScheme } from '../hooks/useColorScheme';

// Keep splash screen visible while loading assets
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Get system color scheme and load custom font
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Hide splash screen when everything is loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Wrap app with all necessary providers
  return (
    <UserProvider>
      <AppThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppContainer />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppThemeProvider>
    </UserProvider>
  );
}
