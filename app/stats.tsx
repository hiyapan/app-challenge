import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ScanResult {
  id: string;
  date: string;
  result: 'Low Risk' | 'Medium Risk' | 'High Risk';
  confidence: number;
  userId?: string;
  userName?: string;
}

interface UserProfile {
  id: string;
  name: string;
  age: string;
  gender: string;
  color: string;
  scans: ScanResult[];
}

export default function StatsScreen() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Mock data for demonstration
  const [users] = useState<UserProfile[]>([
    {
      id: '1',
      name: 'You',
      age: '26-35',
      gender: 'Female',
      color: '#FF6B6B',
      scans: [
        { id: '1', date: '2024-01-15', result: 'Low Risk', confidence: 85 },
        { id: '2', date: '2024-01-10', result: 'Medium Risk', confidence: 72 },
        { id: '3', date: '2024-01-05', result: 'Low Risk', confidence: 90 },
      ]
    },
    {
      id: '2', 
      name: 'Family Member',
      age: '55+',
      gender: 'Male',
      color: '#4CAF50',
      scans: [
        { id: '4', date: '2024-01-12', result: 'High Risk', confidence: 78 },
        { id: '5', date: '2024-01-08', result: 'Medium Risk', confidence: 65 },
      ]
    }
  ]);

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
    Alert.alert(
      'Add New Profile',
      'Create a new user profile to track separate scan histories.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add Profile', onPress: () => {
          Alert.alert('Feature Coming Soon', 'Multiple user profiles will be available in a future update.');
        }}
      ]
    );
  };

  const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser) : users[0];

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol size={24} name="chevron.left" color="#FF6B6B" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Scan History & Stats</ThemedText>
        </View>

        {/* User Selector */}
        <View style={styles.userSelectorContainer}>
          <ThemedText style={styles.sectionTitle}>Select Profile</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userScrollView}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userCard,
                  { borderColor: user.color },
                  selectedUser === user.id && styles.selectedUserCard
                ]}
                onPress={() => setSelectedUser(user.id)}
              >
                <View style={[styles.userAvatar, { backgroundColor: user.color }]}>
                  <IconSymbol size={20} name="person.fill" color="white" />
                </View>
                <ThemedText style={styles.userName}>{user.name}</ThemedText>
                <ThemedText style={styles.userInfo}>{user.scans.length} scans</ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addUserCard} onPress={addNewProfile}>
              <IconSymbol size={24} name="plus.circle.fill" color="#FF6B6B" />
              <ThemedText style={styles.addUserText}>Add Profile</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Stats Overview */}
        {selectedUserData && (
          <View style={styles.statsContainer}>
            <ThemedText style={styles.sectionTitle}>
              {selectedUserData.name === 'You' ? 'Your Stats' : `${selectedUserData.name}'s Stats`}
            </ThemedText>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{selectedUserData.scans.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Total Scans</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <ThemedText style={[styles.statNumber, { color: getResultColor(selectedUserData.scans[0]?.result || 'Low Risk') }]}>
                  {selectedUserData.scans[0]?.result || 'No Data'}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Latest Result</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>
                  {Math.round(selectedUserData.scans.reduce((avg, scan) => avg + scan.confidence, 0) / selectedUserData.scans.length) || 0}%
                </ThemedText>
                <ThemedText style={styles.statLabel}>Avg Confidence</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Scan History */}
        {selectedUserData && (
          <View style={styles.historyContainer}>
            <ThemedText style={styles.sectionTitle}>Scan History</ThemedText>
            
            {selectedUserData.scans.map((scan) => (
              <View key={scan.id} style={styles.scanCard}>
                <View style={styles.scanHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: getResultColor(scan.result) }]}>
                    <IconSymbol size={16} name={getRiskIcon(scan.result)} color="white" />
                  </View>
                  <View style={styles.scanInfo}>
                    <ThemedText style={styles.scanResult}>{scan.result}</ThemedText>
                    <ThemedText style={styles.scanDate}>{new Date(scan.date).toLocaleDateString()}</ThemedText>
                  </View>
                  <ThemedText style={styles.confidence}>{scan.confidence}%</ThemedText>
                </View>
              </View>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userSelectorContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 15,
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
    backgroundColor: 'rgba(255,107,107,0.1)',
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
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    minWidth: 100,
  },
  addUserText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 5,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
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
    backgroundColor: '#FF6B6B',
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
});