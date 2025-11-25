import { useUserContext } from '@/contexts/UserContext';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import OnboardingScreen from '@/components/OnboardingScreen';
import ProfileSetupScreen, { type ProfileData } from '@/components/ProfileSetupScreen';

export default function AppContainer() {
  const { completeOnboarding, hasCompletedOnboarding, checkOnboardingStatus } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load onboarding status on app start
  useEffect(() => {
    const init = async () => {
      await checkOnboardingStatus();
      setIsLoading(false);
    };
    init();
  }, [checkOnboardingStatus]);

  // Control whether onboarding is shown based on stored status
  useEffect(() => {
    if (!isLoading) {
      setShowOnboarding(!hasCompletedOnboarding);
    }
  }, [isLoading, hasCompletedOnboarding]);

  const handleGetStarted = async () => {
    await completeOnboarding();
    setShowOnboarding(false); // Hide the onboarding screen
  };

  const handleProfileComplete = async (profileData: ProfileData) => {
    // TODO: Save profile data in UserContext
    setShowProfileSetup(false);
    await completeOnboarding(); // Return to main app
  };

  const handleProfileSkip = async () => {
    setShowProfileSetup(false);
    await completeOnboarding();
  };


  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      
      {/* Loading Overlay */}
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      )}
      
      {/* Always show onboarding - for now */}
      {showOnboarding && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'white', zIndex: 1000 }]}>
          <OnboardingScreen onGetStarted={handleGetStarted} />
        </View>
      )}
      
      {/* Profile Setup Modal */}
      <Modal
        visible={showProfileSetup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfileSetup(false)}
      >
        <ProfileSetupScreen
          onComplete={handleProfileComplete}
          onSkip={handleProfileSkip}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
