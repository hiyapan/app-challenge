#!/usr/bin/env python3
"""
Simple test script to verify the backend server is working correctly.
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health endpoint."""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint working")
            print(f"   Model: {data.get('artifact', 'Unknown')}")
            print(f"   Device: {data.get('device', 'Unknown')}")
            print(f"   Threshold: {data.get('threshold', 'Unknown')}")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("   Make sure the server is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_analyze_endpoint():
    """Test the analyze endpoint with a dummy image."""
    print("\n🔍 Testing analyze endpoint...")
    try:
        # Create a simple test image (1x1 pixel PNG)
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0bIDAT\x08\x1dc\xf8\x0f\x00\x00\x01\x00\x01|\r\xe7\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'files': ('test.png', test_image_data, 'image/png')}
        response = requests.post(f"{BASE_URL}/analyze", files=files, timeout=30)
        
        if response.status_code == 200:
            print("✅ Analyze endpoint accessible")
            # Note: This will likely fail with quality/hand detection warnings
            # but that shows the system is working correctly
            return True
        elif response.status_code == 400:
            data = response.json()
            if "quality" in data.get("detail", "").lower() or "hand" in data.get("detail", "").lower():
                print("✅ Analyze endpoint working (quality checks active)")
                print(f"   Expected rejection: {data.get('detail', 'Unknown error')}")
                return True
            else:
                print(f"⚠️  Analyze endpoint returned 400: {data.get('detail', 'Unknown error')}")
                return False
        else:
            print(f"❌ Analyze endpoint failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
            return False
    except requests.exceptions.Timeout:
        print("❌ Analyze endpoint timeout (server may be processing)")
        return False
    except Exception as e:
        print(f"❌ Analyze endpoint error: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Testing Backend Server")
    print("=" * 40)
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    
    if health_ok:
        # Test analyze endpoint
        analyze_ok = test_analyze_endpoint()
        
        print("\n" + "=" * 40)
        if health_ok and analyze_ok:
            print("🎉 Backend tests completed successfully!")
            print("   Your backend is ready to use.")
        else:
            print("⚠️  Some tests had issues, but this may be expected.")
            print("   Check the details above.")
    else:
        print("\n" + "=" * 40)
        print("❌ Backend server is not accessible.")
        print("   Please start the server with: python server.py")

if __name__ == "__main__":
    main()
