import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUserContext } from '@/contexts/UserContext';

interface AnalysisResult {
  anemiaRisk: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendations: string[];
  colorAnalysis: {
    averageRed: number;
    averageGreen: number;
    averageBlue: number;
    paleness: number;
  };
}

export default function ResultsScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { selectedProfileId, addScanToProfile, getSelectedProfile } = useUserContext();

  useEffect(() => {
    if (imageUri) {
      simulateAnalysis();
    }
  }, [imageUri]);

  const simulateAnalysis = () => {
    setTimeout(() => {
      const mockAnalysis: AnalysisResult = {
        anemiaRisk: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
        confidence: Math.round((Math.random() * 30 + 70) * 100) / 100,
        colorAnalysis: {
          averageRed: Math.round(Math.random() * 255),
          averageGreen: Math.round(Math.random() * 255),
          averageBlue: Math.round(Math.random() * 255),
          paleness: Math.round(Math.random() * 100),
        },
        recommendations: []
      };

      if (mockAnalysis.anemiaRisk === 'High') {
        mockAnalysis.recommendations = [
          'Consult with a healthcare professional immediately',
          'Consider iron-rich foods in your diet',
          'Get a complete blood count (CBC) test',
          'Avoid activities that may worsen fatigue'
        ];
      } else if (mockAnalysis.anemiaRisk === 'Medium') {
        mockAnalysis.recommendations = [
          'Schedule a check-up with your doctor',
          'Monitor your energy levels and symptoms',
          'Include iron-rich foods like spinach, red meat, and legumes',
          'Consider taking vitamin C to improve iron absorption'
        ];
      } else {
        mockAnalysis.recommendations = [
          'Maintain a balanced diet rich in iron',
          'Regular health check-ups are recommended',
          'Stay hydrated and get adequate sleep',
          'Continue monitoring your health'
        ];
      }

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 3000);
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
        recommendations: analysis.recommendations
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
              This may take a few seconds
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

            <View style={styles.colorAnalysisContainer}>
              <ThemedText style={styles.sectionTitle}>Color Analysis</ThemedText>
              <View style={styles.colorMetrics}>
                <View style={styles.colorMetric}>
                  <ThemedText style={styles.colorLabel}>Red</ThemedText>
                  <ThemedText style={styles.colorValue}>{analysis.colorAnalysis.averageRed}</ThemedText>
                </View>
                <View style={styles.colorMetric}>
                  <ThemedText style={styles.colorLabel}>Green</ThemedText>
                  <ThemedText style={styles.colorValue}>{analysis.colorAnalysis.averageGreen}</ThemedText>
                </View>
                <View style={styles.colorMetric}>
                  <ThemedText style={styles.colorLabel}>Blue</ThemedText>
                  <ThemedText style={styles.colorValue}>{analysis.colorAnalysis.averageBlue}</ThemedText>
                </View>
                <View style={styles.colorMetric}>
                  <ThemedText style={styles.colorLabel}>Paleness</ThemedText>
                  <ThemedText style={styles.colorValue}>{analysis.colorAnalysis.paleness}%</ThemedText>
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
  colorAnalysisContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  colorMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 15,
    borderRadius: 10,
  },
  colorMetric: {
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 5,
  },
  colorValue: {
    fontSize: 16,
    fontWeight: '600',
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
