import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ProfileSetupScreenProps {
  onComplete: (profileData: ProfileData) => void;
  onSkip: () => void;
}

export interface ProfileData {
  age: string;
  weight: string;
  height: string;
  gender: string;
  activityLevel: string;
}

export default function ProfileSetupScreen({ onComplete, onSkip }: ProfileSetupScreenProps) {
  const [profileData, setProfileData] = useState<ProfileData>({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: ''
  });

  const updateProfile = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    if (profileData.age && profileData.gender) {
      onComplete(profileData);
    }
  };

  const isComplete = profileData.age && profileData.gender;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <IconSymbol size={60} name="person.circle.fill" color="white" />
          </View>
          <ThemedText style={styles.title}>Personalize Your Experience</ThemedText>
          <ThemedText style={styles.subtitle}>
            Help us provide better recommendations tailored just for you
          </ThemedText>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Age */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Age Range *</ThemedText>
            <View style={styles.buttonGrid}>
              {['18-25', '26-35', '36-45', '46-55', '55+'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.optionButton,
                    profileData.age === range && styles.optionButtonSelected
                  ]}
                  onPress={() => updateProfile('age', range)}
                >
                  <ThemedText style={[
                    styles.optionButtonText,
                    profileData.age === range && styles.optionButtonTextSelected
                  ]}>
                    {range}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Gender *</ThemedText>
            <View style={styles.buttonGrid}>
              {['Female', 'Male', 'Other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.optionButton,
                    profileData.gender === gender && styles.optionButtonSelected
                  ]}
                  onPress={() => updateProfile('gender', gender)}
                >
                  <ThemedText style={[
                    styles.optionButtonText,
                    profileData.gender === gender && styles.optionButtonTextSelected
                  ]}>
                    {gender}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Weight Range</ThemedText>
            <View style={styles.buttonGrid}>
              {['Under 120 lbs', '120-150 lbs', '150-180 lbs', '180-220 lbs', 'Over 220 lbs'].map((weight) => (
                <TouchableOpacity
                  key={weight}
                  style={[
                    styles.optionButton,
                    profileData.weight === weight && styles.optionButtonSelected
                  ]}
                  onPress={() => updateProfile('weight', weight)}
                >
                  <ThemedText style={[
                    styles.optionButtonText,
                    profileData.weight === weight && styles.optionButtonTextSelected
                  ]}>
                    {weight}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Height */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Height Range</ThemedText>
            <View style={styles.buttonGrid}>
              {['Under 5\'2"', '5\'2" - 5\'6"', '5\'6" - 5\'10"', 'Over 5\'10"'].map((height) => (
                <TouchableOpacity
                  key={height}
                  style={[
                    styles.optionButton,
                    profileData.height === height && styles.optionButtonSelected
                  ]}
                  onPress={() => updateProfile('height', height)}
                >
                  <ThemedText style={[
                    styles.optionButtonText,
                    profileData.height === height && styles.optionButtonTextSelected
                  ]}>
                    {height}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Activity Level */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Activity Level</ThemedText>
            <View style={styles.buttonGrid}>
              {['Sedentary', 'Light', 'Moderate', 'Active'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    profileData.activityLevel === level && styles.optionButtonSelected
                  ]}
                  onPress={() => updateProfile('activityLevel', level)}
                >
                  <ThemedText style={[
                    styles.optionButtonText,
                    profileData.activityLevel === level && styles.optionButtonTextSelected
                  ]}>
                    {level}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <IconSymbol size={20} name="lightbulb.fill" color="#FF9800" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Why do we ask?</ThemedText>
              <ThemedText style={styles.infoText}>
                This information helps us provide personalized hydration goals, health recommendations, and risk assessments tailored specifically to you.
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.completeButton, !isComplete && styles.completeButtonDisabled]} 
          onPress={handleComplete}
          disabled={!isComplete}
        >
          <ThemedText style={styles.completeButtonText}>Complete Setup</ThemedText>
          <IconSymbol size={20} name="checkmark.circle.fill" color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipSetupButton} onPress={onSkip}>
          <ThemedText style={styles.skipSetupText}>Skip for Now</ThemedText>
        </TouchableOpacity>
        
        <ThemedText style={styles.requirementText}>
          * Age and gender are required for basic recommendations
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
    paddingBottom: 140,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 60,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formSection: {
    gap: 30,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    minWidth: 100,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  optionButtonTextSelected: {
    color: 'white',
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,152,0,0.05)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,152,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#F57C00',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
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
  completeButton: {
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
    gap: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  skipSetupButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  skipSetupText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  requirementText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
