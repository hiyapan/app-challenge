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
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

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
    // Generate personalized recommendations
    const personalizedRecommendations = generateRecommendations(profileData);
    
    // Save profile data (you can extend UserContext to store this)
    setRecommendations(personalizedRecommendations);
    setShowProfileSetup(false);
    
    // Show recommendations if any
    if (personalizedRecommendations.length > 0) {
      setShowRecommendations(true);
    } else {
      await completeOnboarding();
    }
  };

  const handleProfileSkip = async () => {
    setShowProfileSetup(false);
    await completeOnboarding();
  };

  const handleRecommendationsClose = async () => {
    setShowRecommendations(false);
    await completeOnboarding();
  };

  const generateRecommendations = (profileData: ProfileData): string[] => {
    const recommendations: string[] = [];
    
    // Age-based recommendations
    if (profileData.age === '18-25') {
      recommendations.push('Great time to build healthy habits! Focus on iron-rich foods and regular sleep.');
    } else if (profileData.age === '55+') {
      recommendations.push('Iron absorption decreases with age. Consider regular monitoring and vitamin C with meals.');
    }
    
    // Gender-based recommendations
    if (profileData.gender === 'Female') {
      recommendations.push('Women need extra iron, especially during menstruation. Focus on iron-rich foods.');
    }
    
    // Weight-based hydration
    if (profileData.weight === 'Over 220 lbs') {
      recommendations.push('Increased hydration recommended - aim for 12+ glasses of water daily.');
    } else if (profileData.weight === 'Under 120 lbs') {
      recommendations.push('Adjusted hydration goal - aim for 7-8 glasses of water daily.');
    }
    
    // Activity-based recommendations
    if (profileData.activityLevel === 'Active') {
      recommendations.push('High activity level detected! Increase hydration and ensure adequate iron intake.');
    } else if (profileData.activityLevel === 'Sedentary') {
      recommendations.push('Consider light exercise to improve circulation and overall health.');
    }
    
    // Height and weight combination
    if (profileData.height && profileData.weight) {
      recommendations.push('Your personalized wellness goals have been adjusted based on your body measurements.');
    }
    
    return recommendations;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  // Always show the Stack (tabs) - let the tab layout handle onboarding visibility

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="results" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  recommendationsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recommendationsModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recommendationsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recommendationsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,107,107,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#222',
  },
  recommendationsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  recommendationsList: {
    marginBottom: 24,
    gap: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76,175,80,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  recommendationsContinueButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationsContinueText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
