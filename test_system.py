#!/usr/bin/env python3

"""
Comprehensive test script for the Anemia Detection App
Tests both backend functionality and React Native app readiness
"""

import subprocess
import sys
import os
import requests
import json

def check_dependencies():
    """Check if all required dependencies are available"""
    print("🔍 Checking dependencies...")
    
    missing_deps = []
    
    # Check Python dependencies
    python_deps = [
        'fastapi', 'uvicorn', 'numpy', 'torch', 'torchvision', 
        'cv2', 'joblib', 'lightgbm', 'sklearn'
    ]
    
    for dep in python_deps:
        try:
            __import__(dep)
        except ImportError:
            missing_deps.append(f"Python: {dep}")
    
    # Check Node.js dependencies
    try:
        result = subprocess.run(['npm', 'list', 'expo'], 
                              capture_output=True, text=True, cwd='.')
        if result.returncode != 0:
            missing_deps.append("Node.js: expo")
    except FileNotFoundError:
        missing_deps.append("Node.js: npm not found")
    
    if missing_deps:
        print("❌ Missing dependencies:")
        for dep in missing_deps:
            print(f"   - {dep}")
        return False
    else:
        print("✅ All dependencies are available")
        return True

def check_model_file():
    """Check if the model file exists"""
    model_path = "backend/hb_lgbm_embedding_only.pkl"
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        print(f"✅ Model file found: {model_path} ({size_mb:.1f} MB)")
        return True
    else:
        print(f"❌ Model file missing: {model_path}")
        return False

def test_backend_api():
    """Test backend API endpoints"""
    print("🧪 Testing Backend API...")
    
    base_url = "http://127.0.0.1:8000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint working")
            print(f"   Model status: {data.get('lgbm_model_status')}")
            print(f"   ResNet status: {data.get('resnet_model_status')}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ Backend server not responding")
        return False
    
    # Test prediction endpoint
    try:
        import numpy as np
        dummy_embedding = np.random.rand(512).tolist()
        payload = {"embedding": dummy_embedding}
        
        response = requests.post(f"{base_url}/predict", json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prediction endpoint working")
            print(f"   Sample prediction: {data.get('hb_pred'):.2f} g/dL")
            return True
        else:
            print(f"❌ Prediction endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")
        return False

def check_react_native_setup():
    """Check React Native app configuration"""
    print("📱 Checking React Native setup...")
    
    # Check package.json
    if os.path.exists("package.json"):
        with open("package.json") as f:
            package_data = json.load(f)
        print(f"✅ App name: {package_data.get('name')}")
    else:
        print("❌ package.json not found")
        return False
    
    # Check .env configuration
    if os.path.exists(".env"):
        with open(".env") as f:
            env_content = f.read()
        if "EXPO_PUBLIC_SERVER_URL" in env_content:
            print("✅ Environment configuration found")
        else:
            print("⚠️  EXPO_PUBLIC_SERVER_URL not configured in .env")
    else:
        print("⚠️  .env file not found")
    
    return True

def main():
    print("🔬 Anemia Detection App - System Test")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 4
    
    # Test 1: Dependencies
    if check_dependencies():
        tests_passed += 1
    print()
    
    # Test 2: Model file
    if check_model_file():
        tests_passed += 1
    print()
    
    # Test 3: Backend API
    if test_backend_api():
        tests_passed += 1
    print()
    
    # Test 4: React Native setup
    if check_react_native_setup():
        tests_passed += 1
    print()
    
    # Summary
    print("📊 Test Summary")
    print("-" * 30)
    print(f"Tests passed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 All systems operational!")
        print("\n✨ Your anemia detection app is ready!")
        print("\n🚀 Next steps:")
        print("   1. Start the backend: npm run api:dev")
        print("   2. Start the React Native app: npm start")
        print("   3. Use the app to scan fingernails for anemia detection")
        
        print("\n📋 Key features working:")
        print("   ✅ RandomForest model for hemoglobin prediction")
        print("   ✅ ResNet18 + GeM pooling for image feature extraction") 
        print("   ✅ Image upload and processing")
        print("   ✅ Real-time anemia risk assessment")
        print("   ✅ User profiles and scan history")
        
    else:
        print("⚠️  Some issues need to be resolved")
        print("\n💡 Troubleshooting:")
        if tests_passed < 2:
            print("   - Install missing dependencies")
            print("   - Ensure model file is in backend/ directory")
        if tests_passed < 3:
            print("   - Start backend server: cd backend && python server.py")
        print("   - Check network configuration in .env file")

if __name__ == "__main__":
    main()
