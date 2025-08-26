import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScanResult {
  id: string;
  date: string;
  result: 'Low Risk' | 'Medium Risk' | 'High Risk';
  confidence: number;
  imageUri: string;
  colorAnalysis: {
    averageRed: number;
    averageGreen: number;
    averageBlue: number;
    paleness: number;
  };
  recommendations: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  age: string;
  gender: string;
  color: string;
  scans: ScanResult[];
  createdAt: string;
}

interface UserContextType {
  profiles: UserProfile[];
  selectedProfileId: string | null;
  hasCompletedOnboarding: boolean;
  addProfile: (name: string) => Promise<UserProfile>;
  deleteProfile: (profileId: string) => Promise<void>;
  renameProfile: (profileId: string, newName: string) => Promise<void>;
  selectProfile: (profileId: string) => void;
  addScanToProfile: (profileId: string, scan: Omit<ScanResult, 'id' | 'date'>) => Promise<void>;
  getSelectedProfile: () => UserProfile | undefined;
  loadProfiles: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'user_profiles';
const ONBOARDING_KEY = 'onboarding_completed';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const loadProfiles = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loadedProfiles = JSON.parse(stored);
        setProfiles(loadedProfiles);
        
        // If no profile selected, select the first one
        if (loadedProfiles.length > 0 && !selectedProfileId) {
          setSelectedProfileId(loadedProfiles[0].id);
        }
      } else {
        // Create default profile if none exist
        const defaultProfile: UserProfile = {
          id: '1',
          name: 'You',
          age: '',
          gender: '',
          color: '#20B2AA',
          scans: [],
          createdAt: new Date().toISOString(),
        };
        setProfiles([defaultProfile]);
        setSelectedProfileId(defaultProfile.id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([defaultProfile]));
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }, [selectedProfileId]);

  const saveProfiles = async (newProfiles: UserProfile[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  };

  const addProfile = useCallback(async (name: string): Promise<UserProfile> => {
    const colors = ['#2196F3', '#9C27B0', '#FF5722', '#607D8B', '#795548', '#4CAF50', '#FF9800'];
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      age: '',
      gender: '',
      color: colors[profiles.length % colors.length],
      scans: [],
      createdAt: new Date().toISOString(),
    };
    
    const updatedProfiles = [...profiles, newProfile];
    await saveProfiles(updatedProfiles);
    return newProfile;
  }, [profiles]);

  const deleteProfile = useCallback(async (profileId: string) => {
    if (profiles.length <= 1) return; // Don't delete the last profile
    
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    await saveProfiles(updatedProfiles);
    
    // If we deleted the selected profile, select the first remaining one
    if (selectedProfileId === profileId) {
      setSelectedProfileId(updatedProfiles[0]?.id || null);
    }
  }, [profiles, selectedProfileId]);

  const renameProfile = useCallback(async (profileId: string, newName: string) => {
    const updatedProfiles = profiles.map(profile => 
      profile.id === profileId 
        ? { ...profile, name: newName.trim() }
        : profile
    );
    await saveProfiles(updatedProfiles);
  }, [profiles]);

  const selectProfile = useCallback((profileId: string) => {
    setSelectedProfileId(profileId);
  }, []);

  const addScanToProfile = useCallback(async (profileId: string, scanData: Omit<ScanResult, 'id' | 'date'>) => {
    const newScan: ScanResult = {
      ...scanData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updatedProfiles = profiles.map(profile => 
      profile.id === profileId 
        ? { ...profile, scans: [newScan, ...profile.scans] }
        : profile
    );

    await saveProfiles(updatedProfiles);
  }, [profiles]);

  const getSelectedProfile = useCallback(() => {
    return profiles.find(p => p.id === selectedProfileId);
  }, [profiles, selectedProfileId]);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, []);

  const value: UserContextType = {
    profiles,
    selectedProfileId,
    hasCompletedOnboarding,
    addProfile,
    deleteProfile,
    renameProfile,
    selectProfile,
    addScanToProfile,
    getSelectedProfile,
    loadProfiles,
    completeOnboarding,
    checkOnboardingStatus,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
