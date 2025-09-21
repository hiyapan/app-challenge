#!/usr/bin/env node

/**
 * Utility script to reset onboarding status for development/debugging
 * 
 * This script helps when you get stuck in the onboarding loop during development.
 * Run with: node scripts/reset-onboarding.js
 */

const { execSync } = require('child_process');

console.log('🔄 Resetting onboarding status...');

try {
  // For React Native, we need to clear AsyncStorage
  // This requires the app to be running or simulator/device to be connected
  console.log('📱 Attempting to clear AsyncStorage...');
  
  // Clear AsyncStorage keys for onboarding
  const adbCommand = 'adb shell "run-as com.anonymous.anemia-app rm -rf /data/data/com.anonymous.anemia-app/databases/RKStorage"';
  
  try {
    execSync(adbCommand, { stdio: 'inherit' });
    console.log('✅ Android AsyncStorage cleared successfully');
  } catch (androidError) {
    console.log('⚠️  Android device not found or app not installed');
  }

  // For iOS simulator
  const iosCommand = 'xcrun simctl get_app_container booted com.anonymous.anemia-app data';
  
  try {
    const containerPath = execSync(iosCommand, { encoding: 'utf8' }).trim();
    execSync(`rm -rf "${containerPath}/Documents/RCTAsyncLocalStorage_V1"`, { stdio: 'inherit' });
    console.log('✅ iOS Simulator AsyncStorage cleared successfully');
  } catch (iosError) {
    console.log('⚠️  iOS simulator not found or app not installed');
  }

  console.log('\n📋 Alternative manual steps:');
  console.log('1. Uninstall and reinstall the app');
  console.log('2. Or add this to your app code temporarily:');
  console.log('   AsyncStorage.removeItem("onboarding_completed")');
  console.log('3. In the app, you can now tap the X button to skip onboarding');
  
} catch (error) {
  console.error('❌ Error resetting onboarding:', error.message);
  console.log('\n📋 Manual steps:');
  console.log('1. Uninstall and reinstall the app');
  console.log('2. Or use the X button in the top-right corner of onboarding');
  console.log('3. Or use the "Skip for Now" button');
}

console.log('\n🎉 If the app is still stuck, try restarting the development server:');
console.log('   npm start -- --clear');
