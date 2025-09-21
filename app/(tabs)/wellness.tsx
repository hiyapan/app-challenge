import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';


interface WellnessMetric {
  id: string;
  title: string;
  icon: string;
  color: string;
  value?: string;
  status?: 'good' | 'warning' | 'alert';
  interactive?: boolean;
}

interface SymptomCheck {
  id: string;
  question: string;
  checked: boolean;
}

export default function WellnessScreen() {
  const { currentTheme, themeOptions, setTheme } = useTheme();
  const [symptoms, setSymptoms] = useState<SymptomCheck[]>([
    { id: '1', question: 'Feeling unusually tired or weak?', checked: false },
    { id: '2', question: 'Shortness of breath during normal activities?', checked: false },
    { id: '3', question: 'Cold hands and feet?', checked: false },
    { id: '4', question: 'Brittle or spoon-shaped fingernails?', checked: false },
    { id: '5', question: 'Unusual cravings for ice, starch, or dirt?', checked: false },
    { id: '6', question: 'Frequent headaches or dizziness?', checked: false },
    { id: '7', question: 'Rapid or irregular heartbeat?', checked: false },
    { id: '8', question: 'Pale skin, nail beds, or inner eyelids?', checked: false },
  ]);

  const [energyLevel, setEnergyLevel] = useState(5);
  const [ironFoods, setIronFoods] = useState([
    { id: '1', name: 'Red meat (beef, lamb)', checked: false, category: 'meat' },
    { id: '2', name: 'Poultry (chicken, turkey)', checked: false, category: 'meat' },
    { id: '3', name: 'Fish (salmon, tuna)', checked: false, category: 'meat' },
    { id: '4', name: 'Spinach & leafy greens', checked: false, category: 'vegetable' },
    { id: '5', name: 'Beans & lentils', checked: false, category: 'legume' },
    { id: '6', name: 'Fortified cereals', checked: false, category: 'grain' },
    { id: '7', name: 'Dark chocolate', checked: false, category: 'treat' },
    { id: '8', name: 'Nuts & seeds', checked: false, category: 'snack' },
    { id: '9', name: 'Eggs', checked: false, category: 'protein' },
    { id: '10', name: 'Quinoa', checked: false, category: 'grain' },
  ]);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [showIronIntakeModal, setShowIronIntakeModal] = useState(false);
  const [showEnergyLevelModal, setShowEnergyLevelModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: '', message: '', icon: 'checkmark.circle.fill', color: '#4CAF50' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [hasSeenInfo, setHasSeenInfo] = useState(false);
  const [showIronFoodsSection, setShowIronFoodsSection] = useState(false);
  const [showPersonalizedTipsModal, setShowPersonalizedTipsModal] = useState(false);
  const [showPersonalizedTipsSection, setShowPersonalizedTipsSection] = useState(false);
  
  // User profile data
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    completed: false
  });

  const getCurrentTheme = () => {
    return currentTheme;
  };

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load profile data and check info status on component mount
  useEffect(() => {
    loadUserProfile();
    checkInfoStatus();
  }, []);

  // Save profile data when it changes
  useEffect(() => {
    if (userProfile.completed) {
      saveUserProfile();
    }
  }, [userProfile]);

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

  const saveUserProfile = async () => {
    try {
      await AsyncStorage.setItem('user_wellness_profile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const checkInfoStatus = async () => {
    try {
      const seenInfo = await AsyncStorage.getItem('has_seen_info');
      if (seenInfo === 'true') {
        setHasSeenInfo(true);
      } else {
        // First time user - show info modal automatically
        setHasSeenInfo(false);
        setShowInfoModal(true);
      }
    } catch (error) {
      console.error('Error checking info status:', error);
      // If error, show info modal to be safe
      setShowInfoModal(true);
    }
  };

  const markInfoAsSeen = async () => {
    try {
      await AsyncStorage.setItem('has_seen_info', 'true');
      setHasSeenInfo(true);
    } catch (error) {
      console.error('Error saving info status:', error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = userProfile.name ? `, ${userProfile.name}` : '';
    if (hour < 12) return `Good Morning${name}`;
    if (hour < 17) return `Good Afternoon${name}`;
    return `Good Evening${name}`;
  };



  const getSymptomStatus = () => {
    const checkedCount = symptoms.filter(s => s.checked).length;
    if (checkedCount === 0) return 'good';
    if (checkedCount <= 2) return 'warning';
    return 'alert';
  };


  const getSymptomValue = () => {
    const checkedCount = symptoms.filter(s => s.checked).length;
    if (checkedCount === 0) return 'No symptoms';
    if (checkedCount === 1) return '1 symptom';
    return `${checkedCount} symptoms`;
  };





  const toggleSymptom = (id: string) => {
    setSymptoms(prev => prev.map(symptom => 
      symptom.id === id ? { ...symptom, checked: !symptom.checked } : symptom
    ));
  };

  const getCheckedCount = () => symptoms.filter(s => s.checked).length;

  const handleSubmitSymptoms = () => {
    const checkedCount = getCheckedCount();
    let message = '';
    let title = '';
    let icon = 'checkmark.circle.fill';
    let color = '#4CAF50';

    if (checkedCount === 0) {
      title = 'Great News!';
      message = 'No anemia symptoms reported. Keep maintaining your healthy lifestyle!';
      icon = 'checkmark.circle.fill';
      color = '#4CAF50';
    } else if (checkedCount <= 2) {
      title = 'Low Risk';
      message = 'You have minimal symptoms. Consider monitoring your diet and energy levels.';
      icon = 'checkmark.circle';
      color = '#FF9800';
    } else if (checkedCount <= 4) {
      title = 'Moderate Risk';
      message = 'You have several symptoms. Consider consulting a healthcare professional and taking an anemia screening test.';
      icon = 'exclamationmark.triangle.fill';
      color = '#FF9800';
    } else {
      title = 'High Risk';
      message = 'You have multiple symptoms that may indicate anemia. We strongly recommend consulting a healthcare professional for proper testing.';
      icon = 'exclamationmark.triangle.fill';
      color = '#F44336';
    }

    showCustomNotification(title, message, icon, color);
  };



  const saveProfile = () => {
    if (userProfile.age && userProfile.gender) {
      setUserProfile(prev => ({ ...prev, completed: true }));
      setShowPersonalizationModal(false);
      // Show personalized tips modal after saving profile
      setTimeout(() => {
        setShowPersonalizedTipsModal(true);
      }, 500);
    } else {
      showCustomNotification('Missing Information', 'Please provide at least your age and gender to save your profile.', 'exclamationmark.triangle.fill', '#FF9800');
    }
  };



  const showCustomNotification = (title: string, message: string, icon: string = 'checkmark.circle.fill', color: string = '#4CAF50') => {
    setNotificationData({ title, message, icon, color });
    setShowNotificationModal(true);
  };

  const getTimeOfDayRecommendation = (energyLevel: number) => {
    const hour = new Date().getHours();
    let timeContext = '';
    
    if (hour >= 5 && hour < 12) {
      timeContext = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeContext = 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      timeContext = 'evening';
    } else {
      timeContext = 'late night';
    }

    if (energyLevel <= 3) {
      switch (timeContext) {
        case 'morning':
          return `Low energy in the morning may indicate poor sleep or low iron. Consider a protein-rich breakfast with iron sources like eggs or fortified cereal.`;
        case 'afternoon':
          return `Afternoon energy crashes are common. Try a light snack with iron and vitamin C, like spinach salad with citrus.`;
        case 'evening':
          return `Low evening energy might mean you need better nutrition throughout the day. Consider iron-rich dinner options.`;
        case 'late night':
          return `Low energy this late could indicate you need more rest. Consider going to bed earlier tonight.`;
        default:
          return `Low energy detected. Focus on iron-rich foods and adequate rest.`;
      }
    } else if (energyLevel >= 7) {
      switch (timeContext) {
        case 'morning':
          return `Great morning energy! Keep it up with a balanced breakfast and stay hydrated throughout the day.`;
        case 'afternoon':
          return `Excellent afternoon energy levels! You're maintaining good nutrition and hydration habits.`;
        case 'evening':
          return `High evening energy is great! Make sure to wind down properly for good sleep tonight.`;
        case 'late night':
          return `High energy late at night might affect sleep. Consider relaxing activities before bed.`;
        default:
          return `Excellent energy levels! Keep up your healthy habits.`;
      }
    } else {
      switch (timeContext) {
        case 'morning':
          return `Moderate morning energy is normal. A nutritious breakfast with iron can help boost your day.`;
        case 'afternoon':
          return `Moderate afternoon energy is typical. Stay hydrated and consider a healthy snack.`;
        case 'evening':
          return `Moderate evening energy is fine. Focus on a good dinner and prepare for restful sleep.`;
        case 'late night':
          return `Moderate energy late at night is normal. Consider winding down for better sleep quality.`;
        default:
          return `Moderate energy is normal. Focus on good nutrition, hydration, and rest.`;
      }
    }
  };

  const updateProfile = (field: string, value: string) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meat': return '#F44336';
      case 'vegetable': return '#4CAF50';
      case 'legume': return '#FF9800';
      case 'grain': return '#9C27B0';
      case 'treat': return '#795548';
      case 'snack': return '#607D8B';
      case 'protein': return '#E91E63';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meat': return 'flame.fill';
      case 'vegetable': return 'leaf.fill';
      case 'legume': return 'circle.fill';
      case 'grain': return 'rectangle.fill';
      case 'treat': return 'heart.fill';
      case 'snack': return 'star.fill';
      case 'protein': return 'oval.fill';
      default: return 'circle.fill';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'alert': return '#F44336';
      default: return '#757575';
    }
  };

  // Generate personalized health messages based on user profile
  const generatePersonalizedHealthMessages = (profile: any) => {
    if (!profile.completed) return [];
    
    const messages: { icon: string, title: string, message: string, color: string }[] = [];

    // Age-based messages
    if (profile.age) {
      switch (profile.age) {
        case '18-25':
          messages.push({
            icon: 'heart.fill',
            title: 'Young Adult Health',
            message: 'Great time to build healthy habits! Focus on iron-rich foods and regular sleep to support your active lifestyle.',
            color: '#4CAF50'
          });
          break;
        case '26-35':
          messages.push({
            icon: 'figure.walk',
            title: 'Prime Years Focus',
            message: 'Balance career and health! Maintain regular iron intake and stay hydrated during busy periods.',
            color: '#2196F3'
          });
          break;
        case '36-45':
          messages.push({
            icon: 'heart.circle.fill',
            title: 'Mid-Life Wellness',
            message: 'Your body\'s needs are changing. Consider regular health check-ups and monitor energy levels closely.',
            color: '#FF9800'
          });
          break;
        case '46-55':
          messages.push({
            icon: 'cross.circle.fill',
            title: 'Preventive Care',
            message: 'Focus on preventive health measures. Regular iron monitoring and balanced nutrition are key.',
            color: '#9C27B0'
          });
          break;
        case '55+':
          messages.push({
            icon: 'star.circle.fill',
            title: 'Golden Years',
            message: 'Iron absorption decreases with age. Consider vitamin C with meals and regular monitoring.',
            color: '#FF5722'
          });
          break;
      }
    }

    // Gender-specific messages
    if (profile.gender === 'Female') {
      messages.push({
        icon: 'heart.text.square.fill',
        title: 'Women\'s Health Focus',
        message: 'Women need 18mg of iron daily (vs 8mg for men). Focus on iron-rich foods, especially during menstruation.',
        color: '#E91E63'
      });
    } else if (profile.gender === 'Male') {
      messages.push({
        icon: 'figure.strengthtraining.traditional',
        title: 'Men\'s Health Focus',
        message: 'Men need 8mg of iron daily. Focus on lean proteins and balanced nutrition to maintain energy levels.',
        color: '#607D8B'
      });
    }

    // Activity level messages
    if (profile.activityLevel) {
      switch (profile.activityLevel) {
        case 'Sedentary':
          messages.push({
            icon: 'figure.seated.side',
            title: 'Boost Your Movement',
            message: 'Light exercise improves circulation and helps iron absorption. Try a 10-minute daily walk!',
            color: '#FF5722'
          });
          break;
        case 'Light':
          messages.push({
            icon: 'figure.walk.motion',
            title: 'Keep Moving',
            message: 'Good start with light activity! Consider adding strength training to improve overall health.',
            color: '#4CAF50'
          });
          break;
        case 'Moderate':
          messages.push({
            icon: 'figure.run',
            title: 'Great Activity Level',
            message: 'Your moderate activity level is excellent! Ensure adequate hydration and iron intake to fuel your workouts.',
            color: '#2196F3'
          });
          break;
        case 'Active':
          messages.push({
            icon: 'figure.strengthtraining.functional',
            title: 'High Performance',
            message: 'High activity increases iron needs! Focus on iron-rich post-workout meals and proper recovery.',
            color: '#9C27B0'
          });
          break;
      }
    }

    // Weight-based hydration messages
    if (profile.weight) {
      switch (profile.weight) {
        case 'Under 120 lbs':
          messages.push({
            icon: 'drop.fill',
            title: 'Hydration Goal',
            message: 'Aim for 7-8 glasses of water daily. Proper hydration supports nutrient absorption.',
            color: '#00BCD4'
          });
          break;
        case '120-150 lbs':
        case '150-180 lbs':
          messages.push({
            icon: 'drop.triangle.fill',
            title: 'Stay Hydrated',
            message: 'Aim for 8-10 glasses of water daily to support healthy blood circulation.',
            color: '#00BCD4'
          });
          break;
        case '180-220 lbs':
        case 'Over 220 lbs':
          messages.push({
            icon: 'drop.keypad.rectangle.fill',
            title: 'Increased Hydration',
            message: 'Aim for 10-12 glasses of water daily to support your body\'s increased needs.',
            color: '#00BCD4'
          });
          break;
      }
    }

    // Height and metabolism message
    if (profile.height) {
      if (profile.height === 'Under 5\'0"' || profile.height === '5\'0" - 5\'4"') {
        messages.push({
          icon: 'ruler.fill',
          title: 'Nutrient Density',
          message: 'Focus on nutrient-dense foods to meet your iron needs efficiently with smaller portions.',
          color: '#795548'
        });
      } else if (profile.height === 'Over 6\'0"') {
        messages.push({
          icon: 'ruler.fill',
          title: 'Increased Needs',
          message: 'Your height may increase nutritional needs. Consider larger portions of iron-rich foods.',
          color: '#795548'
        });
      }
    }

    return messages.slice(0, 3); // Return top 3 most relevant messages
  };

  // Get personalized messages
  const personalizedMessages = generatePersonalizedHealthMessages(userProfile);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeTextContainer}>
              <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
              <ThemedText style={styles.welcomeTitle}>Welcome to AnemoDx</ThemedText>
              <ThemedText style={styles.welcomeSubtitle}>Track your health and monitor anemia risk factors</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.infoButton, { backgroundColor: `${getCurrentTheme().primary}20` }]}
              onPress={() => setShowInfoModal(true)}
            >
              <IconSymbol size={24} name="info.circle.fill" color={getCurrentTheme().primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Anemia Scan Button */}
        <View style={styles.scanSection}>
          <TouchableOpacity
            style={[styles.mainScanButton, { backgroundColor: getCurrentTheme().primary }]}
            onPress={() => router.push('/(tabs)/capture')}
          >
            <View style={styles.scanIconContainer}>
              <IconSymbol size={40} name="camera.fill" color="white" />
            </View>
            <View style={styles.scanContent}>
              <ThemedText style={styles.scanTitle}>Start Anemia Scan</ThemedText>
              <ThemedText style={styles.scanSubtitle}>Take a photo of your fingernail for analysis</ThemedText>
            </View>
            <IconSymbol size={20} name="chevron.right" color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>


        <ThemedText style={styles.wellnessTitle}>Health Tools</ThemedText>

        {/* Symptom Check */}
        <TouchableOpacity style={styles.symptomCheckCard} onPress={() => setShowSymptomModal(true)}>
          <View style={styles.symptomCheckContent}>
            <View style={[styles.symptomCheckIcon, { backgroundColor: getCurrentTheme().primary }]}>
              <IconSymbol size={28} name="stethoscope" color="white" />
            </View>
            <View style={styles.symptomCheckInfo}>
              <ThemedText style={styles.symptomCheckTitle}>Symptom Check</ThemedText>
              <ThemedText style={styles.symptomCheckSubtitle}>
                Quick assessment of anemia-related symptoms
              </ThemedText>
              <ThemedText style={styles.symptomCheckStatus}>
                {getSymptomValue()}
              </ThemedText>
            </View>
            <IconSymbol size={20} name="chevron.right" color="#666" />
          </View>
        </TouchableOpacity>




        <View style={[styles.personalizationBanner, { backgroundColor: `${getCurrentTheme().primary}20`, borderColor: `${getCurrentTheme().primary}40` }]}>
          <View style={styles.bannerContent}>
            <IconSymbol size={20} name="person.circle" color={getCurrentTheme().primary} />
            <View style={styles.bannerText}>
              <ThemedText style={styles.bannerTitle}>
                Personalize Your Information
              </ThemedText>
              <ThemedText style={styles.bannerSubtitle}>
                {userProfile.completed 
                  ? 'Update your personal details and preferences' 
                  : 'Add your details for a personalized experience'
                }
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.personalizeButton, { backgroundColor: getCurrentTheme().primary }]}
            onPress={() => setShowPersonalizationModal(true)}
          >
            <ThemedText style={styles.personalizeButtonText}>
              {userProfile.completed ? 'Update' : 'Setup'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={[styles.tipsButton, { backgroundColor: `${currentTheme.secondary}20`, borderColor: `${currentTheme.secondary}40` }]} onPress={() => setShowTipsModal(true)}>
            <View style={styles.tipsButtonContent}>
              <IconSymbol size={18} name="lightbulb.fill" color={currentTheme.secondary} />
              <ThemedText style={[styles.tipsButtonText, { color: currentTheme.secondary }]}>Health Tips</ThemedText>
            </View>
            <IconSymbol size={16} name="chevron.right" color={currentTheme.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>


      {/* Symptom Check Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSymptomModal}
        onRequestClose={() => setShowSymptomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.symptomModalContent}>
          <TouchableOpacity 
                style={styles.closeXButton}
                onPress={() => setShowSymptomModal(false)}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
              </TouchableOpacity>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <ThemedText style={styles.modalTitle}>Anemia Symptom Check</ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  Check any symptoms you've experienced in the past 2 weeks
                </ThemedText>
              </View>
            </View>
            
            <ScrollView style={styles.symptomScrollView} showsVerticalScrollIndicator={false}>
              {symptoms.map((symptom) => (
                <TouchableOpacity
                  key={symptom.id}
                  style={styles.symptomModalItem}
                  onPress={() => toggleSymptom(symptom.id)}
                >
                  <View style={[styles.checkbox, symptom.checked && styles.checkboxChecked]}>
                    {symptom.checked && (
                      <IconSymbol size={16} name="checkmark" color="white" />
                    )}
                  </View>
                  <ThemedText style={[styles.symptomModalText, symptom.checked && styles.symptomTextChecked]}>
                    {symptom.question}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.symptomModalFooter}>
              <ThemedText style={styles.symptomsCount}>
                {getCheckedCount()} of {symptoms.length} symptoms checked
              </ThemedText>
              
              <TouchableOpacity 
                style={styles.evaluateButton} 
                onPress={() => {
                  handleSubmitSymptoms();
                  setShowSymptomModal(false);
                }}
              >
                <IconSymbol size={18} name="checkmark.circle.fill" color="white" />
                <ThemedText style={styles.evaluateButtonText}>Evaluate Risk</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Iron Foods Checklist Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showIronIntakeModal}
        onRequestClose={() => setShowIronIntakeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ironFoodsModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <ThemedText style={styles.modalTitle}>Iron-Rich Foods</ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  Foods that can help boost your iron levels
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.closeXButton}
                onPress={() => setShowIronIntakeModal(false)}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.ironFoodsScrollView} showsVerticalScrollIndicator={false}>
              {ironFoods.map((food) => (
                <View key={food.id} style={styles.ironFoodInfoItem}>
                  <View style={[styles.foodCategoryIcon, { backgroundColor: getCategoryColor(food.category) }]}>
                    <IconSymbol size={16} name={getCategoryIcon(food.category)} color="white" />
                  </View>
                  <View style={styles.foodInfo}>
                    <ThemedText style={styles.foodName}>
                      {food.name}
                    </ThemedText>
                    <ThemedText style={styles.foodCategory}>
                      {food.category.charAt(0).toUpperCase() + food.category.slice(1)}
                    </ThemedText>
                  </View>
                </View>
              ))}
              
              <View style={styles.ironTipCard}>
                <IconSymbol size={20} name="lightbulb.fill" color="#FF9800" />
                <ThemedText style={styles.ironTipText}>
                  💡 Pro tip: Pair iron-rich foods with vitamin C sources (citrus fruits, bell peppers, strawberries) to boost iron absorption!
                </ThemedText>
              </View>
              
              <View style={styles.ironInfoCard}>
                <IconSymbol size={20} name="info.circle.fill" color="#4CAF50" />
                <ThemedText style={styles.ironInfoText}>
                  Adults need 8-18mg of iron daily. Include a variety of these foods in your regular diet for optimal iron intake.
                </ThemedText>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.simpleCloseButton}
              onPress={() => setShowIronIntakeModal(false)}
            >
              <ThemedText style={styles.simpleCloseButtonText}>Got it!</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Energy Level Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEnergyLevelModal}
        onRequestClose={() => setShowEnergyLevelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Energy Level Rating</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              How are you feeling today? (1-10)
            </ThemedText>
            
            <View style={styles.energyScaleContainer}>
              <View style={styles.energyLabels}>
                <ThemedText style={styles.energyLabelText}>Low Energy</ThemedText>
                <ThemedText style={styles.energyLabelText}>High Energy</ThemedText>
              </View>
              
              <View style={styles.energyButtons}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.energyButton,
                      energyLevel === level && styles.energyButtonSelected,
                      { backgroundColor: level <= 3 ? '#F44336' : level <= 6 ? '#FF9800' : '#4CAF50' }
                    ]}
                    onPress={() => setEnergyLevel(level)}
                  >
                    <ThemedText style={[
                      styles.energyButtonText,
                      energyLevel === level && styles.energyButtonTextSelected
                    ]}>
                      {level}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              
              <ThemedText style={styles.energyDescription}>
                {energyLevel <= 3 
                  ? 'Very low energy - Consider consulting a healthcare professional if this persists.'
                  : energyLevel <= 6 
                  ? 'Moderate energy - Try to get adequate sleep and nutrition.'
                  : 'High energy - Great! Keep up your healthy habits.'
                }
              </ThemedText>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                setShowEnergyLevelModal(false);
                // Show custom notification with time-based recommendations
                const recommendation = getTimeOfDayRecommendation(energyLevel);
                const icon = energyLevel <= 3 ? 'exclamationmark.triangle' : energyLevel >= 7 ? 'star.fill' : 'checkmark.circle';
                const color = energyLevel <= 3 ? '#FF9800' : energyLevel >= 7 ? '#4CAF50' : '#00BCD4';
                
                showCustomNotification(`Energy Logged: ${energyLevel}/10`, recommendation, icon, color);
              }}
            >
              <ThemedText style={styles.closeButtonText}>Log Energy Level</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Notification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showNotificationModal}
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationModalContent}>
            <View style={[styles.notificationIcon, { backgroundColor: notificationData.color }]}>
              <IconSymbol size={32} name={notificationData.icon as any} color="white" />
            </View>
            
            <ThemedText style={styles.notificationTitle}>
              {notificationData.title}
            </ThemedText>
            
            <ThemedText style={styles.notificationMessage}>
              {notificationData.message}
            </ThemedText>
            
            <TouchableOpacity 
              style={[styles.notificationButton, { backgroundColor: notificationData.color }]}
              onPress={() => setShowNotificationModal(false)}
            >
              <ThemedText style={styles.notificationButtonText}>Got it!</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Recommendations Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRecommendationsModal}
        onRequestClose={() => setShowRecommendationsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.recommendationsModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <IconSymbol size={24} name="sparkles" color="#20B2AA" />
                <ThemedText style={styles.modalTitle}>Personalized Recommendations</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.closeXButton}
                onPress={() => setShowRecommendationsModal(false)}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.recommendationsScrollView} showsVerticalScrollIndicator={false}>
              {recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <View style={styles.recommendationIcon}>
                    <IconSymbol 
                      size={16} 
                      name={index % 2 === 0 ? "drop.fill" : "heart.fill"} 
                      color="white" 
                    />
                  </View>
                  <ThemedText style={styles.recommendationText}>
                    {recommendation}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.gotItButton} 
              onPress={() => setShowRecommendationsModal(false)}
            >
              <IconSymbol size={18} name="checkmark.circle.fill" color="white" />
              <ThemedText style={styles.gotItButtonText}>Got it!</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tips Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTipsModal}
        onRequestClose={() => setShowTipsModal(false)}
      >

        <View style={styles.modalOverlay}>
          <View style={styles.tipsModalContent}>
          <TouchableOpacity 
                style={styles.closeXButton}
                onPress={() => setShowTipsModal(false)}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
        </TouchableOpacity>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <ThemedText style={styles.modalTitle}>Health Tips</ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  Tips to support your wellness journey
                </ThemedText>
              </View>
            </View>

            <ScrollView style={styles.tipsScrollView} showsVerticalScrollIndicator={false}>
              {/* Iron Rich Foods Dropdown - Moved to Top */}
              <TouchableOpacity 
                style={styles.ironFoodsDropdown} 
                onPress={() => setShowIronFoodsSection(!showIronFoodsSection)}
              >
                <View style={styles.ironFoodsHeader}>
                  <IconSymbol size={24} name="fork.knife" color="#4CAF50" />
                  <ThemedText style={styles.ironFoodsDropdownTitle}>Iron-Rich Foods</ThemedText>
                  <IconSymbol 
                    size={16} 
                    name={showIronFoodsSection ? "chevron.up" : "chevron.down"} 
                    color="#666" 
                  />
                </View>
              </TouchableOpacity>

              {showIronFoodsSection && (
                <View style={styles.ironFoodsSection}>
                  {ironFoods.map((food) => (
                    <View key={food.id} style={styles.ironFoodInfoItem}>
                      <View style={[styles.foodCategoryIcon, { backgroundColor: getCategoryColor(food.category) }]}>
                        <IconSymbol size={16} name={getCategoryIcon(food.category)} color="white" />
                      </View>
                      <View style={styles.foodInfo}>
                        <ThemedText style={styles.foodName}>
                          {food.name}
                        </ThemedText>
                        <ThemedText style={styles.foodCategory}>
                          {food.category.charAt(0).toUpperCase() + food.category.slice(1)}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.ironTipCard}>
                    <IconSymbol size={20} name="lightbulb.fill" color="#FF9800" />
                    <ThemedText style={styles.ironTipText}>
                      💡 Pro tip: Pair iron-rich foods with vitamin C sources (citrus fruits, bell peppers, strawberries) to boost iron absorption!
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Personalized Tips Dropdown */}
              <TouchableOpacity 
                style={styles.personalizedTipsDropdown} 
                onPress={() => setShowPersonalizedTipsSection(!showPersonalizedTipsSection)}
              >
                <View style={styles.personalizedTipsHeader}>
                  <IconSymbol size={24} name="star.circle.fill" color={getCurrentTheme().accent} />
                  <ThemedText style={styles.personalizedTipsDropdownTitle}>Your Personalized Tips</ThemedText>
                  <IconSymbol 
                    size={16} 
                    name={showPersonalizedTipsSection ? "chevron.up" : "chevron.down"} 
                    color="#666" 
                  />
                </View>
              </TouchableOpacity>

              {showPersonalizedTipsSection && personalizedMessages.length > 0 && (
                <View style={styles.personalizedTipsSection}>
                  {personalizedMessages.map((message, index) => (
                    <View key={index} style={[styles.personalizedMessageCard, { borderLeftColor: message.color }]}>
                      <View style={[styles.personalizedMessageIcon, { backgroundColor: `${message.color}15` }]}>
                        <IconSymbol size={20} name={message.icon as any} color={message.color} />
                      </View>
                      <View style={styles.personalizedMessageContent}>
                        <ThemedText style={styles.personalizedMessageTitle}>{message.title}</ThemedText>
                        <ThemedText style={styles.personalizedMessageText}>{message.message}</ThemedText>
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.personalizedTipCard}>
                    <IconSymbol size={20} name="info.circle.fill" color={getCurrentTheme().accent} />
                    <ThemedText style={styles.personalizedTipText}>
                      These tips are based on your profile information. Update your profile to get more personalized recommendations!
                    </ThemedText>
                  </View>
                </View>
              )}

              {showPersonalizedTipsSection && personalizedMessages.length === 0 && (
                <View style={styles.personalizedTipsSection}>
                  <View style={styles.noTipsCard}>
                    <IconSymbol size={20} name="person.circle" color="#999" />
                    <ThemedText style={styles.noTipsText}>
                      Complete your profile to see personalized health tips tailored just for you!
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Buffer Space */}
              <View style={styles.bufferSpace} />

              <View style={styles.tipModalCard}>
                <IconSymbol size={24} name="sun.max.fill" color="#FF9800" />
                <View style={styles.tipModalContent}>
                  <ThemedText style={styles.tipModalTitle}>Vitamin C Boost</ThemedText>
                  <ThemedText style={styles.tipModalText}>
                    Pair iron-rich foods with vitamin C sources like citrus fruits, strawberries, and bell peppers to improve iron absorption.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.tipModalCard}>
                <IconSymbol size={24} name="figure.walk" color="#2196F3" />
                <View style={styles.tipModalContent}>
                  <ThemedText style={styles.tipModalTitle}>Stay Active</ThemedText>
                  <ThemedText style={styles.tipModalText}>
                    Regular exercise improves circulation and overall health. Aim for at least 30 minutes of moderate activity daily.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.tipModalCard}>
                <IconSymbol size={24} name="drop.fill" color="#00BCD4" />
                <View style={styles.tipModalContent}>
                  <ThemedText style={styles.tipModalTitle}>Stay Hydrated</ThemedText>
                  <ThemedText style={styles.tipModalText}>
                    Proper hydration supports healthy blood flow and nutrient transport. Aim for 8 glasses of water daily.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.tipModalCard}>
                <IconSymbol size={24} name="moon.fill" color="#6B73FF" />
                <View style={styles.tipModalContent}>
                  <ThemedText style={styles.tipModalTitle}>Quality Sleep</ThemedText>
                  <ThemedText style={styles.tipModalText}>
                    Get 7-8 hours of quality sleep each night. Good sleep helps your body recover and maintain healthy iron levels. Poor sleep can worsen anemia symptoms.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.tipModalCard}>
                <IconSymbol size={24} name="drop.fill" color="#00BCD4" />
                <View style={styles.tipModalContent}>
                  <ThemedText style={styles.tipModalTitle}>Hydration Guidelines</ThemedText>
                  <ThemedText style={styles.tipModalText}>
                    Drink 8-10 glasses of water daily to support healthy blood circulation and help transport nutrients effectively throughout your body.
                  </ThemedText>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Personalization Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPersonalizationModal}
        onRequestClose={() => setShowPersonalizationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView 
            contentContainerStyle={styles.personalizationModalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.personalizationModalContent}>
              <ThemedText style={styles.modalTitle}>Profile Settings</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Personalize your experience with better recommendations
              </ThemedText>
              
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Name (optional)</ThemedText>
                <TextInput
                  style={styles.nameInput}
                  value={userProfile.name}
                  onChangeText={(text) => updateProfile('name', text)}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <ThemedText style={styles.inputHint}>
                  We'll use this to personalize your greetings
                </ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Age *</ThemedText>
                <View style={styles.ageButtons}>
                  {['18-25', '26-35', '36-45', '46-55', '55+'].map((range) => (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.optionButton,
                        userProfile.age === range && styles.optionButtonSelected
                      ]}
                      onPress={() => updateProfile('age', range)}
                    >
                      <ThemedText style={[
                        styles.optionButtonText,
                        userProfile.age === range && styles.optionButtonTextSelected
                      ]}>
                        {range}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Gender *</ThemedText>
                <View style={styles.genderButtons}>
                  {['Female', 'Male', 'Other'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.optionButton,
                        userProfile.gender === gender && styles.optionButtonSelected
                      ]}
                      onPress={() => updateProfile('gender', gender)}
                    >
                      <ThemedText style={[
                        styles.optionButtonText,
                        userProfile.gender === gender && styles.optionButtonTextSelected
                      ]}>
                        {gender}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Weight (optional)</ThemedText>
                <View style={styles.weightButtons}>
                  {['Under 120 lbs', '120-150 lbs', '150-180 lbs', '180-220 lbs', 'Over 220 lbs'].map((range) => (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.optionButton,
                        userProfile.weight === range && styles.optionButtonSelected
                      ]}
                      onPress={() => updateProfile('weight', range)}
                    >
                      <ThemedText style={[
                        styles.optionButtonText,
                        userProfile.weight === range && styles.optionButtonTextSelected
                      ]}>
                        {range}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Height (optional)</ThemedText>
                <View style={styles.heightButtons}>
                  {['Under 5\'0"', '5\'0" - 5\'4"', '5\'4" - 5\'8"', '5\'8" - 6\'0"', 'Over 6\'0"'].map((range) => (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.optionButton,
                        userProfile.height === range && styles.optionButtonSelected
                      ]}
                      onPress={() => updateProfile('height', range)}
                    >
                      <ThemedText style={[
                        styles.optionButtonText,
                        userProfile.height === range && styles.optionButtonTextSelected
                      ]}>
                        {range}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Activity Level (optional)</ThemedText>
                <View style={styles.activityButtons}>
                  {['Sedentary', 'Light', 'Moderate', 'Active'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.optionButton,
                        userProfile.activityLevel === level && [styles.optionButtonSelected, { backgroundColor: getCurrentTheme().primary, borderColor: getCurrentTheme().primary }]
                      ]}
                      onPress={() => updateProfile('activityLevel', level)}
                    >
                      <ThemedText style={[
                        styles.optionButtonText,
                        userProfile.activityLevel === level && styles.optionButtonTextSelected
                      ]}>
                        {level}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>



              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.skipButton} 
                  onPress={() => setShowPersonalizationModal(false)}
                >
                  <ThemedText style={styles.skipButtonText}>Skip for Now</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveProfileButton} 
                  onPress={saveProfile}
                >
                  <ThemedText style={styles.saveProfileButtonText}>Save Profile</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showInfoModal}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <TouchableOpacity 
              style={styles.closeXButton}
              onPress={() => setShowInfoModal(false)}
              >
            <IconSymbol size={24} name="xmark" color="#666" />
            </TouchableOpacity>


            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.infoHeaderContent}>
                <Image 
                            source={require('@/assets/images/logo_without_text.png')} 
                            style={{ width: 130, height: 130, backgroundColor: "transparent"}}
                            resizeMode="contain"
                />
              </View>

              <ThemedText style={styles.infoModalTitle}>Welcome to AnemoDx</ThemedText>
              <ThemedText style={styles.infoModalSubtitle}>
                Learn about anemia and how our app can help with early detection
              </ThemedText>

              <View style={styles.infoStepContainer}>
                <View style={styles.infoStepHeader}>
                  <IconSymbol size={24} name="camera.fill" color="#20B2AA" />
                  <ThemedText style={styles.infoStepTitle}>How It Works</ThemedText>
                </View>
                <ThemedText style={styles.infoStepText}>
                  Simply take a photo of your fingernail and get instant analysis results based on color analysis.
                </ThemedText>
              </View>

              <View style={styles.infoStepContainer}>
                <View style={styles.infoStepHeader}>
                  <IconSymbol size={24} name="eye.fill" color="#4CAF50" />
                  <ThemedText style={styles.infoStepTitle}>What We Look For</ThemedText>
                </View>
                <ThemedText style={styles.infoStepText}>
                  • Nail bed color and saturation{'\n'}
                  • Paleness indicators{'\n'}
                  • Color variations that may suggest iron deficiency
                </ThemedText>
              </View>

              <View style={styles.infoStepContainer}>
                <View style={styles.infoStepHeader}>
                  <IconSymbol size={24} name="exclamationmark.triangle.fill" color="#FFA500" />
                  <ThemedText style={styles.infoStepTitle}>Important Notice</ThemedText>
                </View>
                <ThemedText style={styles.infoStepText}>
                  This app provides preliminary screening only. Always consult healthcare professionals for proper medical diagnosis and treatment.
                </ThemedText>
              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Personalized Tips Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPersonalizedTipsModal}
        onRequestClose={() => setShowPersonalizedTipsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.personalizedTipsModalContent}>
            <View style={styles.personalizedTipsModalHeader}>
              <View style={styles.personalizedTipsHeaderSpacer} />
              <ThemedText style={styles.personalizedTipsModalTitle}>Personalized Health Tips</ThemedText>
              <TouchableOpacity 
                style={styles.closeXButton}
                onPress={() => setShowPersonalizedTipsModal(false)}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.modalSubtitle}>
              Based on your profile, here are some personalized wellness tips:
            </ThemedText>

            <ScrollView style={styles.personalizedTipsScrollView} showsVerticalScrollIndicator={false}>
              {personalizedMessages.map((message, index) => (
                <View key={index} style={[styles.personalizedMessageCard, { backgroundColor: `${message.color}20` }]}>
                  <View style={styles.personalizedMessageContent}>
                    <ThemedText style={[styles.personalizedMessageTitle, { textAlign: 'center' }]}>{message.title}</ThemedText>
                    <ThemedText style={[styles.personalizedMessageText, { textAlign: 'center' }]}>{message.message}</ThemedText>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.personalizedTipsCloseButton, { backgroundColor: getCurrentTheme().primary }]}
              onPress={() => setShowPersonalizedTipsModal(false)}
            >
              <IconSymbol size={18} name="checkmark.circle.fill" color="white" />
              <ThemedText style={styles.personalizedTipsCloseButtonText}>Got it!</ThemedText>
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
    paddingTop: 70,
  },
  closeButton1: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "transparent", // remove background
    padding: 5, // so it's tappable but invisible background
    zIndex: 10,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 30,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
  },
  welcomeTextContainer: {
    alignItems: 'center',
  },
  infoButton: {
    position: 'absolute',
    right: 0,
    top: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(32,178,170,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
    paddingVertical: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  scanSection: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  mainScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20B2AA',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scanIconContainer: {
    marginRight: 20,
  },
  scanContent: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  scanSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  wellnessTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  scanButtonContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: '#20B2AA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 30,
    gap: 10,
  },
  metricCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '47%',
    minHeight: 100,
  },
  interactiveCard: {
    borderWidth: 1,
    borderColor: '#20B2AA',
    borderStyle: 'dashed',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#20B2AA',
    borderColor: '#20B2AA',
  },
  bottomButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 100,
    gap: 15,
  },
  tipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,193,7,0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.2)',
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(76,175,80,0.1)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  tipsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  statsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
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
    borderLeftWidth: 3,
    borderLeftColor: '#20B2AA',
  },
  tipModalContent: {
    flex: 1,
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
  tapHint: {
    fontSize: 10,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 2,
  },
  dailyResetContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#20B2AA',
    gap: 5,
  },
  resetButtonText: {
    color: '#20B2AA',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#222',
    paddingTop: 10,
  },
  modalSubtitle: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
    fontWeight: '500',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 20,
  },
  counterButton: {
    backgroundColor: '#20B2AA',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterDisplay: {
    alignItems: 'center',
    gap: 8,
  },
  counterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  counterLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  ironMealsList: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  ironMealsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 10,
  },
  ironMealsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
    color: '#333',
  },
  ironTip: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '500',
  },
  energyScaleContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  energyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  energyLabelText: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  energyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 15,
  },
  energyButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  energyButtonSelected: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  energyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  energyButtonTextSelected: {
    fontWeight: '900',
  },
  energyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    fontStyle: 'italic',
    color: '#555',
  },
  recommendationsModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  recommendationsScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(32,178,170,0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    gap: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#20B2AA',
  },
  recommendationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#20B2AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    fontWeight: '500',
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
  ironFoodsModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '85%',
  },
  ironFoodsScrollView: {
    maxHeight: 400,
    marginBottom: 20,
  },
  ironFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  foodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  foodNameChecked: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  foodCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  ironTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,152,0,0.1)',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    gap: 10,
  },
  ironTipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    fontStyle: 'italic',
  },
  ironFoodsFooter: {
    alignItems: 'center',
  },
  foodsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontWeight: '500',
  },
  notificationModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
    maxWidth: 400,
  },
  notificationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  notificationMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    color: '#555',
    paddingHorizontal: 10,
  },
  notificationButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  notificationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  symptomModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
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
  closeXButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  symptomModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  symptomModalText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 15,
    color: '#333',
  },
  symptomModalFooter: {
    alignItems: 'center',
  },
  symptomsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontWeight: '500',
  },
  symptomTextChecked: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  evaluateButton: {
    backgroundColor: '#20B2AA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    marginBottom: 10,
  },
  evaluateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  personalizationBanner: {
    backgroundColor: 'rgba(32,178,170,0.1)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(32,178,170,0.2)',
    shadowColor: 'rgba(32,178,170,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  personalizeButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  personalizeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  personalizationModalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  personalizationModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  nameInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  inputHint: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  symptomCheckCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  symptomCheckContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomCheckIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  symptomCheckInfo: {
    flex: 1,
  },
  symptomCheckTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  symptomCheckSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  symptomCheckStatus: {
    fontSize: 12,
    color: '#20B2AA',
    fontWeight: '500',
  },
  healthInfoSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  infoCardDescription: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  ironFoodInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
    borderRadius: 10,
  },
  foodCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  ironInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(76,175,80,0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    gap: 10,
  },
  ironInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    flex: 1,
  },
  simpleCloseButton: {
    backgroundColor: '#20B2AA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  simpleCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  weightButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heightButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  optionButtonSelected: {
    backgroundColor: '#20B2AA',
    borderColor: '#20B2AA',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionButtonTextSelected: {
    color: 'white',
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },
  saveProfileButton: {
    flex: 1,
    backgroundColor: '#20B2AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveProfileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '85%',
  },
  infoHeaderContent: {
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  infoHeaderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#20B2AA',
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 40,
    paddingVertical: 5,
  },
  infoModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  infoModalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  infoStepContainer: {
    marginBottom: 25,
  },
  infoStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoStepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  infoStepText: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 34,
    color: '#333',
  },
  infoCloseButton: {
    backgroundColor: '#20B2AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  infoCloseButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  themeButtons: {
    gap: 8,
  },
  themeButton: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  themeButtonSelected: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
  },
  themeColorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  themeButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  themeSettingsCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  themeSettingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  themeSettingsTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeSettingsDescription: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  themeModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  themeOptionsScrollView: {
    maxHeight: 400,
  },
  themeOption: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  themeOptionSelected: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 15,
  },
  themeOptionSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  ironFoodsDropdown: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  ironFoodsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ironFoodsDropdownTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  ironFoodsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76,175,80,0.2)',
  },
  bufferSpace: {
    height: 20,
  },
  themeSwatches: {
    flexDirection: 'row',
    gap: 4,
  },
  themeSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  personalizedTipsModalContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  personalizedTipsScrollView: {
    maxHeight: 400,
    marginBottom: 20,
  },
  personalizedTipsCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  personalizedTipsCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  personalizedTipsDropdown: {
    backgroundColor: 'rgba(32,178,170,0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(32,178,170,0.3)',
  },
  personalizedTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personalizedTipsDropdownTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#20B2AA',
  },
  personalizedTipsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(32,178,170,0.2)',
  },
  personalizedTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(32,178,170,0.1)',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    gap: 10,
  },
  personalizedTipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    fontStyle: 'italic',
  },
  noTipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(153,153,153,0.1)',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  noTipsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  personalizedMessageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 15,
    minHeight: 100,
  },
  personalizedMessageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  personalizedMessageContent: {
    flex: 1,
  },
  personalizedMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  personalizedMessageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  personalizedTipsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  personalizedTipsHeaderSpacer: {
    width: 32, // Same as close button width to balance the title
  },
  personalizedTipsModalTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
  },
});
