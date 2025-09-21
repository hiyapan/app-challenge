import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUserContext } from '@/contexts/UserContext';
import { sendEmbedding, predictFromImages } from '@/lib/api';

interface AnalysisResult {
  hb_pred: number;
  is_anemic: 0 | 1;
  anemiaRisk: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  confidence?: number;
}

export default function ResultsScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { selectedProfileId, addScanToProfile, getSelectedProfile } = useUserContext();

  useEffect(() => {
    if (imageUri) {
      analyzeImage();
    }
  }, [imageUri]);

  const analyzeImage = async () => {
    setIsAnalyzing(true);

    try {
      // Use the new image-based prediction endpoint (pass as array)
      const backendResponse = await predictFromImages([imageUri]);
      
      // Determine risk level based on hemoglobin prediction
      let riskLevel: 'Low' | 'Medium' | 'High';
      if (backendResponse.hb_pred < 10) {
        riskLevel = 'High';
      } else if (backendResponse.hb_pred < 12.5) {
        riskLevel = 'Medium';
      } else {
        riskLevel = 'Low';
      }

      // Generate recommendations based on prediction
      let recommendations: string[];
      if (backendResponse.is_anemic) {
        if (backendResponse.hb_pred < 8) {
          recommendations = [
            'Seek immediate medical attention - severely low hemoglobin',
            'This level requires urgent medical intervention',
            'Do not delay in consulting a healthcare professional',
            'Avoid strenuous activities until treated'
          ];
        } else if (backendResponse.hb_pred < 10) {
          recommendations = [
            'Consult with a healthcare professional immediately',
            'Consider iron-rich foods in your diet',
            'Get a complete blood count (CBC) test',
            'Avoid activities that may worsen fatigue'
          ];
        } else {
          recommendations = [
            'Schedule a check-up with your doctor',
            'Monitor your energy levels and symptoms',
            'Include iron-rich foods like spinach, red meat, and legumes',
            'Consider taking vitamin C to improve iron absorption'
          ];
        }
      } else {
        recommendations = [
          'Maintain a balanced diet rich in iron',
          'Regular health check-ups are recommended',
          'Stay hydrated and get adequate sleep',
          'Continue monitoring your health'
        ];
      }

      const analysis: AnalysisResult = {
        hb_pred: backendResponse.hb_pred,
        is_anemic: backendResponse.is_anemic,
        anemiaRisk: riskLevel,
        recommendations,
        confidence: 85 // Mock confidence for now
      };

      setAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing image:', error);
      console.error('Backend URL:', process.env.EXPO_PUBLIC_API_URL);

      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
          errorMessage = 'Request timed out - server may be slow or unreachable';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network connection error - check your internet';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error - backend may be processing';
        } else {
          errorMessage = error.message;
        }
      }

      // Fallback to mock analysis if backend fails
      const fallbackAnalysis: AnalysisResult = {
        hb_pred: 12.5,
        is_anemic: 0,
        anemiaRisk: 'Low',
        recommendations: [
          `Analysis failed: ${errorMessage}`,
          `Server: ${process.env.EXPO_PUBLIC_API_URL || 'undefined'}`,
          'Try again or check your connection',
          'Consult a healthcare professional for accurate diagnosis'
        ],
        confidence: 0
      };
      setAnalysis(fallbackAnalysis);
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
        confidence: analysis.confidence ?? 0,
        imageUri: imageUri,
        colorAnalysis: { averageRed: 0, averageGreen: 0, averageBlue: 0, paleness: 0 }, // Placeholder values
        recommendations: analysis.recommendations,
        hemoglobinLevel: analysis.hb_pred
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
            <View style={styles.loadingSpinner}>
              <ThemedText style={styles.loadingEmoji}>🔬</ThemedText>
            </View>
            <ThemedText style={styles.loadingText}>Analyzing fingernails...</ThemedText>
            <ThemedText style={styles.loadingSubtext}>
              Compressing image and processing with AI
            </ThemedText>
            <ThemedText style={styles.loadingSteps}>
              • Optimizing image size{'\n'}
              • Extracting features with ResNet18{'\n'}
              • Predicting hemoglobin levels
            </ThemedText>
          </View>
        ) : analysis ? (
          <View style={styles.resultsContainer}>
            <View style={styles.riskContainer}>
              <ThemedText style={styles.riskLabel}>Anemia Risk Assessment</ThemedText>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(analysis.anemiaRisk) }]}>
                <ThemedText style={styles.riskText}>{analysis.anemiaRisk} Risk</ThemedText>
              </View>
              <ThemedText style={styles.confidenceText}>
                Confidence: {analysis.confidence}%
              </ThemedText>
            </View>

            <View style={styles.hemoglobinContainer}>
              <ThemedText style={styles.sectionTitle}>Hemoglobin Level</ThemedText>
              <View style={styles.hemoglobinDisplay}>
                <View style={styles.hemoglobinValue}>
                  <ThemedText style={styles.hemoglobinNumber}>{analysis.hb_pred.toFixed(1)}</ThemedText>
                  <ThemedText style={styles.hemoglobinUnit}>g/dL</ThemedText>
                </View>
                <View style={styles.hemoglobinReference}>
                  <ThemedText style={styles.referenceText}>Normal Range:</ThemedText>
                  <ThemedText style={styles.referenceRange}>
                    Women: 12.0-15.5 g/dL{'\n'}Men: 13.5-17.5 g/dL
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.recommendationsContainer}>
              <ThemedText style={styles.sectionTitle}>Recommendations</ThemedText>
              {analysis.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <IconSymbol size={16} name="checkmark.circle.fill" color="#4CAF50" />
                  <ThemedText style={styles.recommendationText}>{recommendation}</ThemedText>
                </View>
              ))}
            </View>

            <ThemedText style={styles.disclaimer}>
              * This is a preliminary screening tool and not a medical diagnosis. 
              Please consult with a healthcare professional for proper medical evaluation.
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
    borderColor: '#ddd',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 15,
  },
  loadingSteps: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'left',
    lineHeight: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
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
    borderRadius: 10,
    alignItems: 'center',
  },
  hemoglobinValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  hemoglobinNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  hemoglobinUnit: {
    fontSize: 16,
    marginLeft: 5,
    opacity: 0.7,
  },
  hemoglobinReference: {
    alignItems: 'center',
  },
  referenceText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  referenceRange: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginBottom: 20,
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
    borderColor: '#007AFF',
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
  buttonText: {
    color: 'white',
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
