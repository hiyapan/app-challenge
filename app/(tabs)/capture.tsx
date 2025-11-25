import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { InfoGuide } from '../../components/InfoGuide';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserContext } from '../../contexts/UserContext';
import { captureFromESP32, checkESP32Health } from '../../lib/esp32Service';

export default function CaptureScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [showHandGuide, setShowHandGuide] = useState(true);
  const [isCapturingESP32, setIsCapturingESP32] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { profiles, selectedProfileId, selectProfile, getSelectedProfile, loadProfiles, addProfile } = useUserContext();
  const { currentTheme } = useTheme();

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    setFlash(current => {
      switch (current) {
        case 'off': return 'on';
        case 'on': return 'auto';
        case 'auto': return 'off';
        default: return 'off';
      }
    });
  }

  function getFlashIcon() {
    switch (flash) {
      case 'on': return 'bolt.fill';
      case 'auto': return 'bolt.badge.a.fill';
      case 'off': 
      default: return 'bolt.slash.fill';
    }
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo) {
          router.push({
            pathname: '/results',
            params: { imageUri: photo.uri }
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  }

  async function captureFromESP32Device() {
    setIsCapturingESP32(true);
    
    try {
      // First check if ESP32 is reachable
      const isHealthy = await checkESP32Health();
      
      if (!isHealthy) {
        Alert.alert(
          'ESP32-CAM Not Found',
          'Could not reach ESP32-CAM. Please check:\n\n' +
          '1. ESP32 is powered on\n' +
          '2. Connected to same WiFi network\n' +
          '3. IP address is correct in lib/esp32Service.ts',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Capture image from ESP32
      const result = await captureFromESP32();
      
      if (result.success) {
        // Go directly to results
        router.push({
          pathname: '/results',
          params: { imageUri: result.imageUri }
        });
      } else {
        // Show specific error
        Alert.alert(
          'Capture Failed',
          result.error,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unexpected error while capturing from ESP32-CAM',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturingESP32(false);
    }
  }


  const createNewProfile = async () => {
    if (newProfileName.trim()) {
      try {
        const newProfile = await addProfile(newProfileName.trim());
        selectProfile(newProfile.id);
        setNewProfileName('');
        setShowAddProfileModal(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    }
  };

  const selectedProfile = getSelectedProfile();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.profileSelector, { backgroundColor: `${currentTheme.primary}15`, borderColor: `${currentTheme.primary}30` }]} 
          onPress={() => setShowProfileSelector(true)}
        >
          <View style={[styles.profileAvatar, { backgroundColor: currentTheme.primary }]}>
            <IconSymbol size={16} name="person.fill" color="white" />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>Scanning for:</ThemedText>
            <ThemedText style={[styles.profileNameSelected, { color: currentTheme.primary }]}>{selectedProfile?.name || 'Select Profile'}</ThemedText>
          </View>
          <IconSymbol size={16} name="chevron.down" color={currentTheme.secondary} />
        </TouchableOpacity>
      </View>
      
      {/* ESP32 Device Scan Section */}
      <View style={[styles.esp32Section, { backgroundColor: `${currentTheme.accent}15`, borderColor: `${currentTheme.accent}40` }]}>
        <View style={styles.esp32Header}>
          <IconSymbol size={24} name="sensor.fill" color={currentTheme.accent} />
          <ThemedText style={[styles.esp32SectionTitle, { color: currentTheme.accent }]}>Scan with Device</ThemedText>
        </View>
        <ThemedText style={styles.esp32Description}>
          Use ESP32-CAM external device for scanning
        </ThemedText>
        <TouchableOpacity 
          style={[styles.esp32Button, { backgroundColor: currentTheme.accent, borderColor: currentTheme.primary }]}
          onPress={captureFromESP32Device}
          disabled={isCapturingESP32}
        >
          {isCapturingESP32 ? (
            <>
              <ActivityIndicator size="small" color="white" style={styles.esp32ButtonIcon} />
              <ThemedText style={styles.esp32ButtonText}>Capturing...</ThemedText>
            </>
          ) : (
            <>
              <IconSymbol size={20} name="camera.fill" color="white" style={styles.esp32ButtonIcon} />
              <ThemedText style={styles.esp32ButtonText}>Capture</ThemedText>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.infoButton, { backgroundColor: `${currentTheme.primary}15`, borderColor: `${currentTheme.primary}30` }]}
          onPress={() => setShowInfoModal(true)}
        >
          <IconSymbol size={18} name="info.circle.fill" color={currentTheme.primary} />
          <ThemedText style={[styles.infoButtonText, { color: currentTheme.primary }]}>Capture Instructions</ThemedText>
        </TouchableOpacity>
      </View>
      
      {/* Phone Camera Section */}
      <View style={styles.phoneCameraSection}>
        <View style={styles.phoneCameraHeader}>
          <IconSymbol size={20} name="camera.fill" color={currentTheme.primary} />
          <ThemedText style={[styles.phoneCameraTitle, { color: currentTheme.primary }]}>Scan with Phone Camera</ThemedText>
        </View>
      </View>
      
      <CameraView 
        style={styles.camera} 
        facing={facing}
        flash={flash}
        ref={cameraRef}
      >
        {/* Region overlay boxes */}
        <View style={styles.regionsOverlay}>
          {/* Nail region box (top) */}
          <View style={[styles.regionBox, styles.nailRegionBox]}>
            <ThemedText style={styles.regionLabel}>NAILS</ThemedText>
          </View>
        </View>
        
        
        <View style={styles.buttonContainer}>
          <View style={styles.leftControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <IconSymbol size={24} name={getFlashIcon()} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <IconSymbol size={24} name="camera.rotate" color="white" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <View style={styles.rightControls}>
            <ThemedText style={styles.flashModeText}>
              {flash.toUpperCase()}
            </ThemedText>
          </View>
        </View>
      </CameraView>

      {/* Profile Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProfileSelector}
        onRequestClose={() => setShowProfileSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.profileModalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Profile</ThemedText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowProfileSelector(false)}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.profileList} showsVerticalScrollIndicator={false}>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={[
                    styles.profileOption,
                    selectedProfileId === profile.id && styles.selectedProfileOption
                  ]}
                  onPress={() => {
                    selectProfile(profile.id);
                    setShowProfileSelector(false);
                  }}
                >
                  <View style={[styles.profileOptionAvatar, { backgroundColor: profile.color }]}>
                    <IconSymbol size={20} name="person.fill" color="white" />
                  </View>
                  <View style={styles.profileOptionInfo}>
                    <ThemedText style={styles.profileOptionName}>{profile.name}</ThemedText>
                    <ThemedText style={styles.profileOptionScans}>
                      {profile.scans.length} scan{profile.scans.length !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                  {selectedProfileId === profile.id && (
                    <IconSymbol size={20} name="checkmark.circle.fill" color={currentTheme.accent} />
                  )}
                </TouchableOpacity>
              ))}
              
              {/* Add Profile Option */}
              <TouchableOpacity
                style={[styles.addProfileOption, { borderColor: `${currentTheme.primary}40` }]}
                onPress={() => {
                  setShowProfileSelector(false);
                  setShowAddProfileModal(true);
                }}
              >
                <View style={[styles.addProfileAvatar, { backgroundColor: currentTheme.accent }]}>
                  <IconSymbol size={20} name="plus" color="white" />
                </View>
                <View style={styles.profileOptionInfo}>
                  <ThemedText style={[styles.addProfileName, { color: currentTheme.primary }]}>Add New Profile</ThemedText>
                  <ThemedText style={styles.addProfileDescription}>Create a new profile for scanning</ThemedText>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>

      {/* Info Guide Modal */}
      <InfoGuide 
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        themeColor={currentTheme.primary}
      />

      {/* Add Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddProfileModal}
        onRequestClose={() => setShowAddProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.addProfileModalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add New Profile</ThemedText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAddProfileModal(false)}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.addProfileForm}>
              <ThemedText style={styles.inputLabel}>Profile Name</ThemedText>
              <TextInput
                style={[styles.nameInput, { borderColor: currentTheme.primary }]}
                value={newProfileName}
                onChangeText={setNewProfileName}
                placeholder="Enter profile name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={createNewProfile}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: currentTheme.primary }]}
                onPress={() => setShowAddProfileModal(false)}
              >
                <ThemedText style={[styles.cancelButtonText, { color: currentTheme.primary }]}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.createButton, { backgroundColor: currentTheme.primary }]}
                onPress={createNewProfile}
              >
                <ThemedText style={styles.createButtonText}>Create Profile</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20B2AA',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  esp32Section: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  esp32Header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  esp32SectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  esp32Description: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 15,
  },
  phoneCameraSection: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  phoneCameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  phoneCameraTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 90,
    overflow: 'hidden',
    minHeight: 300,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetArea: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetCorners: {
    width: 150,
    height: 150,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 75,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftControls: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  rightControls: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  controlButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  flashModeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  handGuideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingTop: 60,
    zIndex: 100,
  },
  handGuideContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: -120,
  },
  handImage: {
    width: 320,
    height: 320,
    opacity: 0.5,
    transform: [{ rotate: '-90deg' }],
  },
  guideText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  regionsOverlay: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  regionBox: {
    borderWidth: 3,
    borderColor: 'rgba(32,178,170,0.9)',
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  nailRegionBox: {
    height: '35%',  // Top box for nails
    justifyContent: 'center',
    alignItems: 'center',
  },
  skinRegionBox: {
    height: '35%',  // Bottom box for skin
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    flex: 1,
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  profileNameSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20B2AA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModalContent: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  profileList: {
    maxHeight: 300,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedProfileOption: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  profileOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileOptionInfo: {
    flex: 1,
  },
  profileOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileOptionScans: {
    fontSize: 12,
    opacity: 0.7,
  },
  addProfileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addProfileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addProfileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  addProfileDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  addProfileModalContent: {
    borderRadius: 20,
    padding: 25,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addProfileForm: {
    marginVertical: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  nameInput: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  esp32Button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  esp32ButtonIcon: {
    marginRight: 8,
  },
  esp32ButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    gap: 8,
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  previewCloseButton: {
    padding: 5,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  previewRetakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  previewRetakeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewUseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  previewUseText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
