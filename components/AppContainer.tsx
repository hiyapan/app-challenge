import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { Stack } from 'expo-router';
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

  const handleGetStarted = async () => {
    await completeOnboarding();
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
      
      {/* Onboarding Overlay */}
      {!isLoading && !hasCompletedOnboarding && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'white' }]}>
          <OnboardingScreen 
            onGetStarted={handleGetStarted}
            onSetupProfile={handleSetupProfile}
          />
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
