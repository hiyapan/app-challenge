import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Share } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUserContext } from '@/contexts/UserContext';
import { analyzeImages, AnalysisResult, checkHealth } from '@/lib/api';

interface SymptomCheck {
  id: string;
  question: string;
  checked: boolean;
}

export default function ResultsScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomCheck[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { selectedProfileId, addScanToProfile, getSelectedProfile } = useUserContext();

  useEffect(() => {
    if (imageUri) {
      performAnalysis();
      loadSymptoms();
      loadUserProfile();
    }
  }, [imageUri]);

  const loadSymptoms = async () => {
    try {
      const symptomsData = await AsyncStorage.getItem('user_symptoms');
      if (symptomsData) {
        const parsedSymptoms = JSON.parse(symptomsData);
        setSymptoms(parsedSymptoms);
      }
    } catch (error) {
      console.error('Error loading symptoms:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('user_wellness_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const getNormalRange = () => {
    if (!userProfile || !userProfile.gender || !userProfile.age) {
      return 'Women: 12.0-15.5 g/dL\nMen: 13.5-17.5 g/dL';
    }

    const gender = userProfile.gender;
    const age = userProfile.age;

    // Adults (using simplified clinical references)
    if (gender === 'Female') {
      // Post-menopausal women (typically 55+)
      if (age === '55+') {
        return '12.0-16.0 g/dL';
      }
      return '12.0-15.5 g/dL';
    } else if (gender === 'Male') {
      // Older men may have slightly lower ranges
      if (age === '55+') {
        return '12.5-17.0 g/dL';
      }
      return '13.5-17.5 g/dL';
    }

    // Default for 'Other' or unspecified
    return '12.0-17.5 g/dL';
  };

  const getRangeLabel = () => {
    if (!userProfile || !userProfile.gender) return 'Normal Range';
    switch (userProfile.gender) {
      case 'Female':
        return 'Normal Range (Women)';
      case 'Male':
        return 'Normal Range (Men)';
      default:
        return 'Normal Range';
    }
  };

  const performAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // Check if backend is available
      const isHealthy = await checkHealth();
      if (!isHealthy) {
        throw new Error('Backend server is not available. Please ensure the backend is running.');
      }

      // Send image to backend for analysis
      const result = await analyzeImages([imageUri]);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      Alert.alert(
        'Analysis Failed',
        errorMessage + '\n\nWould you like to retry?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
          { text: 'Retry', onPress: () => performAnalysis() }
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return '#FF4444';
      case 'Medium': return '#FFA500';
      case 'Low': return '#4CAF50';
      default: return '#666';
    }
  };

  const retakePhoto = () => {
    router.back();
  };

  const saveResults = async () => {
    if (!analysis || !imageUri || !selectedProfileId) {
      router.push('/');
      return;
    }

    setIsSaving(true);
    try {
      await addScanToProfile(selectedProfileId, {
        result: analysis.anemiaRisk === 'High' ? 'High Risk' : 
               analysis.anemiaRisk === 'Medium' ? 'Medium Risk' : 'Low Risk',
        confidence: analysis.confidence,
        imageUri: imageUri,
        colorAnalysis: analysis.colorAnalysis,
        recommendations: analysis.recommendations,
        hemoglobinLevel: analysis.hemoglobinLevel
      });
      
      router.push('/(tabs)/stats');
    } catch (error) {
      console.error('Error saving scan:', error);
      router.push('/');
    } finally {
      setIsSaving(false);
    }
  };

  if (!imageUri) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No image provided</ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const selectedProfile = getSelectedProfile();

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Analysis Results</ThemedText>
        
        {selectedProfile && (
          <View style={styles.profileIndicator}>
            <View style={[styles.profileIndicatorAvatar, { backgroundColor: selectedProfile.color }]}>
              <IconSymbol size={14} name="person.fill" color="white" />
            </View>
            <ThemedText style={styles.profileIndicatorText}>Scan for {selectedProfile.name}</ThemedText>
          </View>
        )}
        
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.capturedImage} />
        </View>

        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Analyzing image...</ThemedText>
            <ThemedText style={styles.loadingSubtext}>
              Connecting to backend server...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <IconSymbol size={48} name="exclamationmark.triangle.fill" color="#FF4444" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={performAnalysis}>
              <ThemedText style={styles.retryButtonText}>Retry Analysis</ThemedText>
            </TouchableOpacity>
          </View>
        ) : analysis ? (
          <View style={styles.resultsContainer}>
            <View style={styles.riskContainer}>
              <ThemedText style={styles.riskLabel}>Anemia Risk Assessment</ThemedText>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(analysis.anemiaRisk) }]}>
                <ThemedText style={styles.riskText}>{analysis.anemiaRisk} Risk</ThemedText>
              </View>
            </View>

            <View style={styles.hemoglobinContainer}>
              <ThemedText style={styles.sectionTitle}>Hemoglobin Level</ThemedText>
              <View style={styles.hemoglobinDisplay}>
                <View style={styles.hemoglobinValue}>
                  <ThemedText style={styles.hemoglobinNumber}>{analysis.hemoglobinLevel}</ThemedText>
                  <ThemedText style={styles.hemoglobinUnit}>g/dL</ThemedText>
                </View>
                <View style={styles.hemoglobinReference}>
                  <ThemedText style={styles.referenceText}>{getRangeLabel()}:</ThemedText>
                  <ThemedText style={styles.referenceRange}>
                    {getNormalRange()}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Self-Reported Symptoms Section */}
            {symptoms.filter(s => s.checked).length > 0 && (
              <View style={styles.symptomsContainer}>
                <ThemedText style={styles.sectionTitle}>Self-Reported Symptoms</ThemedText>
                <ThemedText style={styles.symptomsSummary}>
                  You reported {symptoms.filter(s => s.checked).length} symptom{symptoms.filter(s => s.checked).length > 1 ? 's' : ''}:
                </ThemedText>
                {symptoms.filter(s => s.checked).slice(0, 3).map((symptom) => (
                  <View key={symptom.id} style={styles.symptomItem}>
                    <IconSymbol size={14} name="circle.fill" color="#FF9800" />
                    <ThemedText style={styles.symptomText}>{symptom.question}</ThemedText>
                  </View>
                ))}
                {symptoms.filter(s => s.checked).length > 3 && (
                  <ThemedText style={styles.moreSymptoms}>
                    +{symptoms.filter(s => s.checked).length - 3} more symptom{symptoms.filter(s => s.checked).length - 3 > 1 ? 's' : ''}
                  </ThemedText>
                )}
              </View>
            )}

            <View style={styles.recommendationsContainer}>
              <ThemedText style={styles.sectionTitle}>Recommendations</ThemedText>
              <ThemedText style={styles.recommendationSummary}>
                {analysis.anemiaRisk === 'Low' && symptoms.filter(s => s.checked).length === 0
                  ? 'Your results look good! Continue maintaining a balanced diet rich in iron and monitoring your wellness.'
                  : analysis.anemiaRisk === 'Low' && symptoms.filter(s => s.checked).length > 0
                  ? `The scan shows low risk, but based on your ${symptoms.filter(s => s.checked).length} reported symptom${symptoms.filter(s => s.checked).length > 1 ? 's' : ''}, consider monitoring your energy levels and diet closely.`
                  : analysis.anemiaRisk === 'Medium' && symptoms.filter(s => s.checked).length > 0
                  ? `Based on your scan results and ${symptoms.filter(s => s.checked).length} reported symptom${symptoms.filter(s => s.checked).length > 1 ? 's' : ''}, focus on increasing iron-rich foods, staying hydrated, and getting adequate rest. Continue monitoring your wellness.`
                  : analysis.anemiaRisk === 'Medium'
                  ? 'Focus on iron-rich foods like leafy greens, lean meats, and legumes. Stay hydrated and maintain good sleep habits. Monitor your levels regularly.'
                  : analysis.anemiaRisk === 'High'
                  ? 'Multiple indicators suggest focused attention on wellness. Prioritize iron-rich nutrition, hydration, and adequate rest. Consider consulting with a healthcare professional for medical guidance.'
                  : 'Consider increasing iron intake through diet and monitoring your symptoms regularly.'}
              </ThemedText>
              {analysis.recommendations.slice(0, 2).map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <IconSymbol size={16} name="checkmark.circle.fill" color="#4CAF50" />
                  <ThemedText style={styles.recommendationText}>{recommendation}</ThemedText>
                </View>
              ))}
            </View>

            <ThemedText style={styles.disclaimer}>
              * This tool is designed for hemoglobin monitoring purposes. Please consult with a healthcare professional for medical diagnosis and treatment.
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={retakePhoto}>
            <IconSymbol size={20} name="camera.fill" color="#007AFF" />
            <ThemedText style={styles.secondaryButtonText}>Retake Photo</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={saveResults}>
            <IconSymbol size={20} name="checkmark" color="white" />
            <ThemedText style={styles.primaryButtonText}>Done</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  capturedImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#aaa',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
    color: '#FF4444',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  riskContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  riskLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  riskBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  riskText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 14,
    opacity: 0.7,
  },
  hemoglobinContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  hemoglobinDisplay: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 20,
    paddingTop: 35,
    paddingBottom: 25,
    borderRadius: 10,
    alignItems: 'center',
    overflow: 'visible',
  },
  hemoglobinValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
    paddingTop: 0,
    minHeight: 50,
  },
  hemoglobinNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    lineHeight: 42,
  },
  hemoglobinUnit: {
    fontSize: 16,
    marginLeft: 5,
    opacity: 0.7,
    marginBottom: 2,
  },
  hemoglobinReference: {
    alignItems: 'center',
  },
  referenceText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    opacity: 0.7,
  },
  referenceRange: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
  symptomsContainer: {
    marginBottom: 25,
    backgroundColor: 'rgba(255,152,0,0.1)',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  symptomsSummary: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.9,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 5,
    gap: 10,
  },
  symptomText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  moreSymptoms: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 4,
    paddingLeft: 15,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 10,
    opacity: 0.9,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0056CC',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 40,
    borderRadius: 20,
    marginBottom: 20,
  },
  profileIndicatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  profileIndicatorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#20B2AA',
  },
});
