import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUserContext, ScanResult, UserProfile } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function StatsScreen() {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showUserOptionsModal, setShowUserOptionsModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [userToRename, setUserToRename] = useState<UserProfile | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [renameUserName, setRenameUserName] = useState('');
  const [showScanDetail, setShowScanDetail] = useState<ScanResult | null>(null);
  
  const { profiles, selectedProfileId, selectProfile, addProfile, deleteProfile, renameProfile, loadProfiles } = useUserContext();
  const { currentTheme } = useTheme();

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Low Risk': return '#4CAF50';
      case 'Medium Risk': return '#FF9800';  
      case 'High Risk': return '#F44336';
      default: return '#757575';
    }
  };

  const getRiskIcon = (result: string) => {
    switch (result) {
      case 'Low Risk': return 'checkmark.circle.fill';
      case 'Medium Risk': return 'exclamationmark.triangle.fill';
      case 'High Risk': return 'xmark.circle.fill';
      default: return 'circle.fill';
    }
  };

  const addNewProfile = () => {
    setShowAddUserModal(true);
  };

  const createNewUser = async () => {
    if (newUserName.trim()) {
      try {
        const newProfile = await addProfile(newUserName.trim());
        selectProfile(newProfile.id);
        setNewUserName('');
        setShowAddUserModal(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    }
  };

  const handleLongPressUser = (user: UserProfile) => {
    if (user.name !== 'You') { // Don't allow deleting the main user
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteProfile(userToDelete.id);
        setUserToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to delete profile. Please try again.');
      }
    }
  };

  const selectedUserData = selectedProfileId ? profiles.find(u => u.id === selectedProfileId) : profiles[0];

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Scan History & Stats</ThemedText>
          <ThemedText style={styles.subtitle}>Track anemia screening results across multiple users</ThemedText>
        </View>

        {/* User Selector */}
        <View style={styles.userSelectorContainer}>
          <ThemedText style={styles.sectionTitle}>Select Profile</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userScrollView}>
            {profiles.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userCard,
                  { borderColor: user.color },
                  selectedProfileId === user.id && styles.selectedUserCard
                ]}
                onPress={() => selectProfile(user.id)}
                onLongPress={() => handleLongPressUser(user)}
              >
                <View style={[styles.userAvatar, { backgroundColor: user.color }]}>
                  <IconSymbol size={20} name="person.fill" color="white" />
                </View>
                <ThemedText style={styles.userName}>{user.name}</ThemedText>
                <ThemedText style={styles.userInfo}>{user.scans.length} scans</ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.addUserCard, { borderColor: currentTheme.primary }]} onPress={addNewProfile}>
              <IconSymbol size={24} name="plus.circle.fill" color={currentTheme.primary} />
              <ThemedText style={[styles.addUserText, { color: currentTheme.primary }]}>Add Profile</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Stats Overview */}
        {selectedUserData && (
          <View style={styles.statsContainer}>
            <ThemedText style={styles.sectionTitle}>
              {selectedUserData.name === 'You' ? 'Your Stats' : `${selectedUserData.name}'s Stats`}
            </ThemedText>
            
            <View style={styles.statsBackground}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <ThemedText style={[styles.statNumber, styles.firstStatNumber, { color: currentTheme.primary }]}>{selectedUserData.scans.length}</ThemedText>
                  <ThemedText style={styles.statLabel}>Total Scans</ThemedText>
                </View>
                
                <View style={styles.statCard}>
                  <ThemedText style={[styles.statNumber, { color: getResultColor(selectedUserData.scans[0]?.result || 'Low Risk') }]}>
                    {selectedUserData.scans[0]?.result || 'No Data'}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Latest Result</ThemedText>
                </View>
                
                <View style={styles.statCard}>
                  <ThemedText style={[styles.statNumber, { color: currentTheme.primary }]}>
                    {Math.round(selectedUserData.scans.reduce((avg, scan) => avg + scan.confidence, 0) / selectedUserData.scans.length) || 0}%
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Avg Confidence</ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Scan History */}
        {selectedUserData && (
          <View style={styles.historyContainer}>
            <ThemedText style={styles.sectionTitle}>Scan History</ThemedText>
            
            {selectedUserData.scans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                style={[styles.scanCard, { 
                  backgroundColor: `${currentTheme.primary}10`,
                  borderLeftWidth: 4,
                  borderLeftColor: getResultColor(scan.result),
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.08)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }]}
                onPress={() => setShowScanDetail(scan)}
              >
                <View style={[styles.scanHeader, { 
                  backgroundColor: `${getResultColor(scan.result)}15`,
                  borderRadius: 8,
                  padding: 12,
                  margin: -3,
                }]}>
                  {scan.imageUri && (
                    <Image source={{ uri: scan.imageUri }} style={styles.scanImage} />
                  )}
                  <View style={[styles.resultIcon, { backgroundColor: getResultColor(scan.result) }]}>
                    <IconSymbol size={16} name={getRiskIcon(scan.result)} color="white" />
                  </View>
                  <View style={styles.scanInfo}>
                    <ThemedText style={[styles.scanResult, { color: getResultColor(scan.result) }]}>{scan.result}</ThemedText>
                    <ThemedText style={styles.scanDate}>{new Date(scan.date).toLocaleDateString()}</ThemedText>
                  </View>
                  <View style={styles.scanActions}>
                    <ThemedText style={styles.confidence}>{scan.confidence}%</ThemedText>
                    <IconSymbol size={16} name="chevron.right" color="#666" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {selectedUserData.scans.length === 0 && (
              <View style={styles.emptyState}>
                <IconSymbol size={48} name="camera.viewfinder" color="#ccc" />
                <ThemedText style={styles.emptyText}>No scans yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>Take your first scan to see results here</ThemedText>
                <TouchableOpacity style={styles.startScanButton} onPress={() => router.push('/(tabs)/capture')}>
                  <ThemedText style={styles.startScanButtonText}>Start First Scan</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}


        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Scan Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!showScanDetail}
        onRequestClose={() => setShowScanDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.scanDetailModalContent}>
            <View style={styles.scanDetailHeader}>
              <ThemedText style={styles.modalTitle}>Scan Details</ThemedText>
              <TouchableOpacity 
                style={styles.closeXButton}
                onPress={() => setShowScanDetail(null)}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
              </TouchableOpacity>
            </View>
            
            {showScanDetail && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.scanDetailScroll}>
                {/* Image */}
                {showScanDetail.imageUri && (
                  <View style={styles.scanDetailImageContainer}>
                    <Image source={{ uri: showScanDetail.imageUri }} style={styles.scanDetailImage} />
                  </View>
                )}
                
                {/* Risk Assessment */}
                <View style={styles.scanDetailSection}>
                  <ThemedText style={styles.scanDetailSectionTitle}>Risk Assessment</ThemedText>
                  <View style={styles.scanDetailRiskContainer}>
                    <View style={[styles.scanDetailRiskBadge, { backgroundColor: getResultColor(showScanDetail.result) }]}>
                      <IconSymbol size={24} name={getRiskIcon(showScanDetail.result)} color="white" />
                      <ThemedText style={styles.scanDetailRiskText}>{showScanDetail.result}</ThemedText>
                    </View>
                    <ThemedText style={styles.scanDetailConfidence}>Confidence: {showScanDetail.confidence}%</ThemedText>
                  </View>
                </View>
                
                {/* Date */}
                <View style={styles.scanDetailSection}>
                  <ThemedText style={styles.scanDetailSectionTitle}>Scan Date</ThemedText>
                  <ThemedText style={styles.scanDetailDate}>
                    {new Date(showScanDetail.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </ThemedText>
                </View>
                
                {/* Hemoglobin Level */}
                {showScanDetail.hemoglobinLevel && (
                  <View style={styles.scanDetailSection}>
                    <ThemedText style={styles.scanDetailSectionTitle}>Hemoglobin Level</ThemedText>
                    <View style={styles.hemoglobinContainer}>
                      <View style={styles.hemoglobinValue}>
                        <ThemedText style={styles.hemoglobinNumber}>{showScanDetail.hemoglobinLevel}</ThemedText>
                        <ThemedText style={styles.hemoglobinUnit}>g/dL</ThemedText>
                      </View>
                      <View style={styles.hemoglobinReferenceContainer}>
                        <ThemedText style={styles.hemoglobinReferenceTitle}>Normal Range:</ThemedText>
                        <ThemedText style={styles.hemoglobinReferenceText}>
                          Women: 12.0-15.5 g/dL{'\n'}Men: 13.5-17.5 g/dL
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}
                
                {/* Recommendations */}
                {showScanDetail.recommendations && showScanDetail.recommendations.length > 0 && (
                  <View style={styles.scanDetailSection}>
                    <ThemedText style={styles.scanDetailSectionTitle}>Recommendations</ThemedText>
                    {showScanDetail.recommendations.map((recommendation, index) => (
                      <View key={index} style={styles.scanDetailRecommendationItem}>
                        <IconSymbol size={16} name="checkmark.circle.fill" color="#4CAF50" />
                        <ThemedText style={styles.scanDetailRecommendationText}>{recommendation}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.scanDetailDisclaimer}>
                  <ThemedText style={styles.scanDetailDisclaimerText}>
                    * This is a preliminary screening tool and not a medical diagnosis. Please consult with a healthcare professional for proper medical evaluation.
                  </ThemedText>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalIcon}>
              <IconSymbol size={48} name="trash.fill" color="#F44336" />
            </View>
            
            <ThemedText style={styles.deleteModalTitle}>Delete Profile</ThemedText>
            <ThemedText style={styles.deleteModalMessage}>
              Are you sure you want to delete "{userToDelete?.name}"?
              {userToDelete?.scans && userToDelete.scans.length > 0 && (
                `\n\nThis will permanently delete ${userToDelete.scans.length} scan${userToDelete.scans.length !== 1 ? 's' : ''} associated with this profile.`
              )}
            </ThemedText>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.deleteCancelButton}
                onPress={() => {
                  setUserToDelete(null);
                  setShowDeleteModal(false);
                }}
              >
                <ThemedText style={styles.deleteCancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteUser}
              >
                <IconSymbol size={18} name="trash.fill" color="white" />
                <ThemedText style={styles.deleteConfirmButtonText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddUserModal}
        onRequestClose={() => setShowAddUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addUserModalContent}>
            <ThemedText style={styles.modalTitle}>Add New Profile</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Create a profile to track separate scan histories
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Profile Name</ThemedText>
              <TextInput
                style={styles.textInput}
                value={newUserName}
                onChangeText={setNewUserName}
                placeholder='Enter name (e.g., "Mom", "John", "Child 1")'
                placeholderTextColor="#999"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={createNewUser}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setNewUserName('');
                  setShowAddUserModal(false);
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.createButton, !newUserName.trim() && styles.createButtonDisabled]}
                onPress={createNewUser}
                disabled={!newUserName.trim()}
              >
                <ThemedText style={styles.createButtonText}>Create Profile</ThemedText>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.quickNameButton}
              onPress={() => {
                const quickNames = ['Mom', 'Dad', 'Child', 'Spouse', 'Parent'];
                const randomName = quickNames[Math.floor(Math.random() * quickNames.length)];
                setNewUserName(randomName);
              }}
            >
              <ThemedText style={styles.quickNameButtonText}>Suggest Random Name</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  userSelectorContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 15,
    color: '#ddd',
    opacity: 0.9,
  },
  userScrollView: {
    paddingLeft: 20,
  },
  userCard: {
    alignItems: 'center',
    padding: 15,
    marginRight: 15,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 100,
  },
  selectedUserCard: {
    backgroundColor: 'rgba(32,178,170,0.1)',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  addUserCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginRight: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#20B2AA',
    borderStyle: 'dashed',
    minWidth: 100,
  },
  addUserText: {
    fontSize: 12,
    color: '#20B2AA',
    fontWeight: '600',
    marginTop: 5,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsBackground: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 14,
  },
  firstStatNumber: {
    marginBottom: 24,
  },
  statLabel: {
    fontSize: 12,
    color: '#ddd',
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 12,
  },
  historyContainer: {
    paddingHorizontal: 20,
  },
  scanCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  scanInfo: {
    flex: 1,
  },
  scanResult: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  scanDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  confidence: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  startScanButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startScanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUserModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
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
    marginBottom: 25,
    textAlign: 'center',
    color: '#555',
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  textInputContainer: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  textInputPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#20B2AA',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickNameButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(32,178,170,0.1)',
  },
  quickNameButtonText: {
    color: '#20B2AA',
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  scanImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  scanActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // Scan Detail Modal Styles
  scanDetailModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scanDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeXButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scanDetailScroll: {
    maxHeight: 500,
  },
  scanDetailImageContainer: {
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 15,
    padding: 20,
  },
  scanDetailImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  scanDetailSection: {
    marginBottom: 20,
  },
  scanDetailSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  scanDetailRiskContainer: {
    alignItems: 'center',
  },
  scanDetailRiskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
    gap: 8,
  },
  scanDetailRiskText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanDetailConfidence: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  scanDetailDate: {
    fontSize: 16,
    color: '#555',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
  },
  hemoglobinContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 20,
    borderRadius: 12,
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
  hemoglobinReferenceContainer: {
    alignItems: 'center',
  },
  hemoglobinReferenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  hemoglobinReferenceText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  scanDetailRecommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: 'rgba(76,175,80,0.1)',
    padding: 12,
    borderRadius: 10,
  },
  scanDetailRecommendationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  scanDetailDisclaimer: {
    backgroundColor: 'rgba(255,152,0,0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  scanDetailDisclaimerText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  wellnessContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  wellnessSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    textAlign: 'center',
  },
  wellnessGrid: {
    gap: 15,
  },
  wellnessCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  wellnessCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  wellnessCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  wellnessCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 15,
  },
  wellnessActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(32,178,170,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32,178,170,0.2)',
  },
  wellnessActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20B2AA',
  },
  wellnessNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(108,117,125,0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    gap: 10,
  },
  wellnessNoteText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#666',
    flex: 1,
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244,67,54,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  deleteModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    color: '#666',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
