import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface OnboardingScreenProps {
  onGetStarted: () => void;
  onSetupProfile: () => void;
}

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ onGetStarted, onSetupProfile }: OnboardingScreenProps) {
  console.log("Hello from Onboarding!")
  const features = [
    {
      icon: 'camera.fill',
      title: 'How It Works',
      description: 'Simply take a photo of your fingernail and get instant analysis results based on color analysis.',
      color: '#FF6B6B'
    },
    {
      icon: 'eye.fill',
      title: 'What We Look For',
      description: 'Nail bed color and saturation, paleness indicators, and color variations that may suggest iron deficiency.',
      color: '#4CAF50'
    },
    {
      icon: 'person.2.fill',
      title: 'Multiple Users',
      description: 'Create profiles for family members and track each person\'s screening history separately.',
      color: '#2196F3'
    },
    {
      icon: 'chart.line.uptrend.xyaxis',
      title: 'Track Progress',
      description: 'Monitor anemia screening results over time with detailed statistics and wellness insights.',
      color: '#9C27B0'
    }
  ];

  const stats = [
    {
      number: '1M+',
      label: 'People affected by anemia worldwide'
    },
    {
      number: '30%',
      label: 'Go undiagnosed'
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo_transparent.png')} 
            style={{ width: 120, height: 120}}
            resizeMode="contain"
          />
          </View>
          <ThemedText style={styles.appTitle}>Welcome to AnemoDx</ThemedText>
          <ThemedText style={styles.appSubtitle}>
            Learn about anemia and how our app can help with early detection
          </ThemedText>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <IconSymbol size={28} name={feature.icon as any} color="white" />
              </View>
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{stat.number}</ThemedText>
                <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeSection}>
          <View style={styles.noticeIcon}>
            <IconSymbol size={24} name="exclamationmark.triangle.fill" color="#FF9800" />
          </View>
          <ThemedText style={styles.noticeTitle}>Important Medical Disclaimer</ThemedText>
          <ThemedText style={styles.noticeText}>
            This app is a preliminary screening tool and should not replace professional medical diagnosis. 
            Always consult with a healthcare provider for proper medical evaluation and treatment.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.setupProfileButton} onPress={onSetupProfile}>
          <ThemedText style={styles.setupProfileText}>Setup Your Profile</ThemedText>
          <IconSymbol size={20} name="person.circle.fill" color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={onGetStarted}>
          <ThemedText style={styles.skipText}>Skip for Now</ThemedText>
        </TouchableOpacity>
        
        <ThemedText style={styles.agreementText}>
          By continuing, you agree to use this app for educational purposes only.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    padding: 30,
    backgroundColor: '#FF6B6B',
    borderRadius: 80,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#222',
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  noticeSection: {
    backgroundColor: 'rgba(255,152,0,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,152,0,0.2)',
  },
  noticeIcon: {
    alignSelf: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(255,152,0,0.1)',
    borderRadius: 20,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#F57C00',
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  setupProfileButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  setupProfileText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  agreementText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    lineHeight: 16,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
    lineHeight: 38,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 18,
    color: '#666',
  },
});
