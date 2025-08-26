import { useEffect } from 'react';
import { router } from 'expo-router';

export default function IndexRedirect() {
  useEffect(() => {
    // Redirect to wellness tab immediately
    router.replace('/(tabs)/wellness');
  }, []);

  // Return null since this is just a redirect
  return null;
}