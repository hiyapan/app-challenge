import { useEffect, useState } from 'react';
import { router, useRootNavigationState } from 'expo-router';
import { View } from 'react-native';

export default function IndexRedirect() {
  const rootNavigationState = useRootNavigationState();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Wait for navigation to be ready before redirecting
    if (rootNavigationState?.key && !hasRedirected) {
      setHasRedirected(true);
      setTimeout(() => {
        router.replace('/(tabs)/wellness');
      }, 0);
    }
  }, [rootNavigationState, hasRedirected]);

  // Return empty view while redirecting
  return <View />;
}
