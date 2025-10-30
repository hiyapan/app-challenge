import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const { currentTheme, themeOptions, setTheme } = useTheme();
  const [showAbout, setShowAbout] = useState(false);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    Alert.alert('Theme Changed', 'Your color theme has been updated successfully!');
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setTheme('default');
            Alert.alert('Settings Reset', 'All settings have been reset to default values.');
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Settings</ThemedText>
          <ThemedText style={styles.subtitle}>Customize your AnemoDx experience</ThemedText>
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol size={24} name="paintpalette.fill" color={currentTheme.primary} />
            <ThemedText style={styles.sectionTitle}>Color Theme</ThemedText>
          </View>
          <ThemedText style={styles.sectionDescription}>
            Choose your preferred color scheme for the app
          </ThemedText>
          
          <View style={styles.themeGrid}>
            {themeOptions.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.primary },
                  currentTheme.id === theme.id && styles.themeOptionSelected
                ]}
                onPress={() => handleThemeChange(theme.id)}
              >
                <View style={styles.themeOptionContent}>
                  <View style={styles.themeSwatches}>
                    <View style={[styles.themeSwatch, { backgroundColor: theme.primary }]} />
                    <View style={[styles.themeSwatch, { backgroundColor: theme.secondary }]} />
                    <View style={[styles.themeSwatch, { backgroundColor: theme.accent }]} />
                  </View>
                  <ThemedText style={[styles.themeOptionText, theme.id === 'theme4' && { color: '#222' }]}>{theme.name}</ThemedText>
                  {currentTheme.id === theme.id && (
                    <IconSymbol size={20} name="checkmark.circle.fill" color="white" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => setShowAbout(!showAbout)}
          >
            <View style={styles.settingCardHeader}>
              <IconSymbol size={24} name="info.circle.fill" color={currentTheme.secondary} />
              <ThemedText style={styles.settingCardTitle}>About AnemoDx</ThemedText>
              <IconSymbol 
                size={16} 
                name={showAbout ? "chevron.up" : "chevron.down"} 
                color="#666" 
              />
            </View>
          </TouchableOpacity>
          
          {showAbout && (
            <View style={styles.aboutContent}>
              <ThemedText style={styles.aboutText}>
                AnemoDx is an innovative mobile application designed to help with preliminary anemia screening using computer vision technology.
              </ThemedText>
              <ThemedText style={styles.aboutText}>
                <ThemedText style={styles.boldText}>Version:</ThemedText> 1.0.0
              </ThemedText>
              <ThemedText style={styles.aboutText}>
                <ThemedText style={styles.boldText}>Purpose:</ThemedText> Educational tool for anemia awareness and preliminary screening
              </ThemedText>
              <ThemedText style={styles.disclaimerText}>
                ⚠️ This app is not a substitute for professional medical diagnosis. Always consult healthcare professionals for proper medical evaluation.
              </ThemedText>
            </View>
          )}
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol size={24} name="lock.shield.fill" color={currentTheme.accent} />
            <ThemedText style={styles.sectionTitle}>Privacy & Data</ThemedText>
          </View>
          <ThemedText style={styles.sectionDescription}>
            Your privacy is important to us
          </ThemedText>
          
          <View style={styles.privacyCard}>
            <IconSymbol size={20} name="checkmark.seal.fill" color="#4CAF50" />
            <ThemedText style={styles.privacyText}>
              All scan data is stored locally on your device and is never shared with third parties.
            </ThemedText>
          </View>
        </View>


        {/* Reset Settings */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetToDefaults}
          >
            <IconSymbol size={20} name="arrow.counterclockwise.circle.fill" color="#F44336" />
            <ThemedText style={styles.resetButtonText}>Reset to Default Settings</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    marginLeft: 36,
  },
  themeGrid: {
    gap: 12,
  },
  themeOption: {
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeOptionSelected: {
    borderWidth: 3,
    borderColor: '#90EE90',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 15,
  },
  themeSwatches: {
    flexDirection: 'row',
    gap: 6,
  },
  themeSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  settingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#90EE90',
  },
  settingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#222',
  },
  aboutContent: {
    marginTop: 15,
    paddingLeft: 16,
    gap: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  boldText: {
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,152,0,0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E67C00',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(76,175,80,0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3D8B40',
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  supportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  supportCardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244,67,54,0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.2)',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  bottomPadding: {
    height: 100,
  },
});
