import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface InfoGuideProps {
  visible: boolean;
  onClose: () => void;
  themeColor: string;
}

export function InfoGuide({ visible, onClose, themeColor }: InfoGuideProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.tipsModalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <ThemedText style={styles.modalTitle}>App Guide & Information</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Learn how to use AnemoDx effectively
              </ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.closeXButton}
              onPress={onClose}
            >
              <IconSymbol size={24} name="xmark" color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.tipsScrollView} showsVerticalScrollIndicator={false}>
            {/* About AnemoDx */}
            <View style={styles.tipModalCard}>
              <IconSymbol size={24} name="heart.text.square.fill" color="#4CAF50" />
              <View style={styles.tipModalContent}>
                <ThemedText style={styles.tipModalTitle}>About AnemoDx</ThemedText>
                <ThemedText style={styles.tipModalText}>
                  AnemoDx uses AI to analyze your fingernail photos to screen for potential anemia indicators. It's a quick, non-invasive preliminary screening tool.
                </ThemedText>
              </View>
            </View>

            {/* How to Take a Scan */}
            <View style={styles.tipModalCard}>
              <IconSymbol size={24} name="camera.fill" color="#2196F3" />
              <View style={styles.tipModalContent}>
                <ThemedText style={styles.tipModalTitle}>How to Take a Scan</ThemedText>
                <ThemedText style={[styles.tipModalText, { fontWeight: '600', marginTop: 4 }]}>
                  Option 1: ESP32-CAM Device
                </ThemedText>
                <ThemedText style={styles.tipModalText}>
                  • Use the external ESP32-CAM for professional-quality scans{`\n`}
                  • Use your LEFT hand for scanning{`\n`}
                  • Place middle finger just below the middle of the green rectangle{`\n`}
                  • Keep fingers close together - the red dot should align with your pointer finger{`\n`}
                  • Optimal lighting and positioning built-in{`\n`}
                  • Tap "Capture from ESP32" button{`\n`}
                  • Best for consistent, accurate results
                </ThemedText>
                <ThemedText style={[styles.tipModalText, { fontWeight: '600', marginTop: 8 }]}>
                  Option 2: Phone Camera
                </ThemedText>
                <ThemedText style={styles.tipModalText}>
                  • Find good lighting (natural daylight is best){`\n`}
                  • Clean your fingernails and remove nail polish{`\n`}
                  • Hold your hand steady in front of camera{`\n`}
                  • Tap the camera button to capture{`\n`}
                  • View your results immediately
                </ThemedText>
              </View>
            </View>

            {/* Understanding Results */}
            <View style={styles.tipModalCard}>
              <IconSymbol size={24} name="chart.bar.fill" color="#FF9800" />
              <View style={styles.tipModalContent}>
                <ThemedText style={styles.tipModalTitle}>Understanding Results</ThemedText>
                <ThemedText style={[styles.tipModalText, { fontWeight: '600', color: '#4CAF50', marginTop: 4 }]}>
                  Low Risk (Green)
                </ThemedText>
                <ThemedText style={styles.tipModalText}>
                  No significant indicators detected. Continue maintaining healthy habits.
                </ThemedText>
                <ThemedText style={[styles.tipModalText, { fontWeight: '600', color: '#FF9800', marginTop: 8 }]}>
                  Medium Risk (Orange)
                </ThemedText>
                <ThemedText style={styles.tipModalText}>
                  Some indicators present. Consider monitoring symptoms and consulting a healthcare provider.
                </ThemedText>
                <ThemedText style={[styles.tipModalText, { fontWeight: '600', color: '#F44336', marginTop: 8 }]}>
                  High Risk (Red)
                </ThemedText>
                <ThemedText style={styles.tipModalText}>
                  Multiple indicators detected. We strongly recommend consulting a healthcare professional.
                </ThemedText>
              </View>
            </View>

            {/* Why Hemoglobin Monitoring Matters */}
            <View style={styles.tipModalCard}>
              <IconSymbol size={24} name="heart.text.square.fill" color="#9C27B0" />
              <View style={styles.tipModalContent}>
                <ThemedText style={styles.tipModalTitle}>Why Monitor Hemoglobin Levels?</ThemedText>
                <ThemedText style={styles.tipModalText}>
                  Hemoglobin monitoring goes beyond just anemia detection—it's a window into your overall health.
                </ThemedText>
                <ThemedText style={[styles.tipModalText, { fontWeight: '600', marginTop: 8 }]}>
                  Early Detection & Prevention:
                </ThemedText>
                <ThemedText style={styles.tipModalText}>
                  • Catch anemia before symptoms become severe{`\n`}
                  • Identify potential iron, B12, or folate deficiencies{`\n`}
                  • Track recovery during treatment{`\n`}
                  • Monitor pregnancy health and fetal development
                </ThemedText>
                <ThemedText style={[styles.tipModalText, { fontWeight: '600', marginTop: 8 }]}>
                  Broader Health Insights:
                </ThemedText>
                <ThemedText style={styles.tipModalText}>
                  • Assess oxygen delivery to organs and tissues{`\n`}
                  • Evaluate cardiovascular and lung function{`\n`}
                  • Screen for chronic diseases and malnutrition{`\n`}
                  • Monitor athletic performance and energy levels{`\n`}
                  • Support surgical planning and recovery
                </ThemedText>
                <ThemedText style={[styles.tipModalText, { fontWeight: '600', marginTop: 8 }]}>
                  Who Benefits Most?
                </ThemedText>
                <ThemedText style={styles.tipModalText}>
                  • Pregnant women and new mothers{`\n`}
                  • Athletes and active individuals{`\n`}
                  • People with chronic conditions{`\n`}
                  • Those with dietary restrictions{`\n`}
                  • Anyone experiencing fatigue or weakness
                </ThemedText>
              </View>
            </View>

            <View style={styles.bufferSpace} />
          </ScrollView>

          <TouchableOpacity 
            style={[styles.gotItButton, { backgroundColor: themeColor }]}
            onPress={onClose}
          >
            <IconSymbol size={18} name="checkmark.circle.fill" color="white" />
            <ThemedText style={styles.gotItButtonText}>Got it!</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  modalTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#222',
  },
  modalSubtitle: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
    fontWeight: '500',
  },
  closeXButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsScrollView: {
    maxHeight: 500,
  },
  tipModalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    gap: 15,
  },
  tipModalContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  tipModalText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  bufferSpace: {
    height: 20,
  },
  gotItButton: {
    backgroundColor: '#20B2AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  gotItButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
