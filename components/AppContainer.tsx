import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { router } from 'expo-router';
import OnboardingScreen from '@/components/OnboardingScreen';
import ProfileSetupScreen, { ProfileData } from '@/components/ProfileSetupScreen';
import { useUserContext } from '@/contexts/UserContext';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TouchableOpacity } from 'react-native';

export default function AppContainer() {
  const { hasCompletedOnboarding, checkOnboardingStatus, completeOnboarding } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkOnboardingStatus();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [checkOnboardingStatus]);

  useEffect(() => {
    if (!isLoading && hasCompletedOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isLoading, hasCompletedOnboarding]);

  const handleGetStarted = async () => {
    await completeOnboarding();
  };

  const handleSkipOnboarding = async () => {
    await completeOnboarding();
  };

  const handleGoToScanner = async () => {
    await completeOnboarding();
    // Navigate directly to the scanner tab
    setTimeout(() => {
      router.replace('/(tabs)/capture');
    }, 100);
  };

  const handleSetupProfile = () => {
    setShowProfileSetup(true);
  };

  const handleProfileComplete = async (profileData: ProfileData) => {
    // Save profile data (you can extend UserContext to store this)
    setShowProfileSetup(false);

    // Go directly to main app after profile setup
    await completeOnboarding();
  };

  const handleProfileSkip = async () => {
    setShowProfileSetup(false);
    await completeOnboarding();
  };


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return (
      <>
        <OnboardingScreen 
          onGetStarted={handleGetStarted}
          onSetupProfile={handleSetupProfile}
          onSkip={handleSkipOnboarding}
          onGoToScanner={handleGoToScanner}
        />
        
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

  // This component only handles onboarding flow
  // Navigation happens in useEffect, not during render
  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
