# Backend Connection Setup

## Overview
The frontend now connects to the FastAPI backend for real anemia analysis instead of using mock data.

## What Was Fixed

### ✅ 1. HTTP Client Setup
- Created `lib/api.ts` with fetch-based HTTP client
- Implemented `analyzeImages()` function to upload images
- Implemented `checkHealth()` function to verify backend availability

### ✅ 2. API URL Configuration
- Development: `http://localhost:8000` (when `__DEV__` is true)
- Production: `https://your-production-url.com` (configurable)
- Automatically switches based on environment

### ✅ 3. Image Upload Logic
- FormData multipart upload implementation
- Supports 1-3 images
- Properly formats images for React Native
- Calls `/analyze` endpoint

### ✅ 4. Response Handling
- Backend returns: `{ hb_pred, is_anemic, num_images }`
- Frontend transforms to: `{ anemiaRisk, confidence, hemoglobinLevel, recommendations, colorAnalysis }`
- Risk calculation: High (< 10.0 g/dL), Medium (10.0-12.5 g/dL), Low (> 12.5 g/dL)

## Testing the Connection

### Step 1: Start the Backend
```powershell
cd backend
python server.py
# or
python main.py
```

The server should start on `http://localhost:8000`

### Step 2: Verify Backend is Running
```powershell
curl http://localhost:8000/health
```

Expected response:
```json
{
  "ok": true,
  "artifact": "hb_model_full_pipeline.pkl",
  "has_preprocessor": true,
  "threshold": 12.5,
  "device": "cpu",
  ...
}
```

### Step 3: Start the Frontend
```powershell
npm start
# Then press 'a' for Android, 'i' for iOS, or 'w' for web
```

### Step 4: Test the Flow
1. Open the app
2. Navigate to the Capture screen
3. Take a photo of a fingernail
4. Wait for the analysis (should now connect to backend)
5. Results should show real hemoglobin predictions

## Troubleshooting

### Issue: "Backend server is not available"
**Solution:** Ensure backend is running on port 8000

### Issue: "Network request failed" on Android
**Solution:** Android emulator can't access `localhost`. Use your machine's IP:
```typescript
// In lib/api.ts, change:
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:8000'  // e.g., 'http://192.168.1.100:8000'
  : 'https://your-production-url.com';
```

To find your IP on Windows:
```powershell
ipconfig
# Look for "IPv4 Address" under your network adapter
```

### Issue: "Network request failed" on iOS Simulator
**Solution:** iOS simulator can access `localhost` directly, but ensure:
1. Backend is running
2. No firewall blocking port 8000
3. Try `http://127.0.0.1:8000` instead

### Issue: CORS errors (if using web)
**Solution:** Backend already has CORS enabled for all origins. If issues persist, check browser console.

## Backend Requirements

Ensure you have the required Python packages:
```powershell
pip install fastapi uvicorn python-multipart opencv-python torch torchvision numpy joblib
```

## Next Steps

1. **Test with real images** - Try different nail photos
2. **Add loading indicators** - Improve UX during upload
3. **Implement retry logic** - Handle network failures gracefully
4. **Add offline fallback** - Consider caching or offline mode
5. **Deploy backend** - Use a cloud service (AWS, GCP, Azure) for production

## API Documentation

### GET /health
Check backend status
- **Response:** `{ ok: boolean, artifact: string, threshold: number, ... }`

### POST /analyze
Analyze fingernail images
- **Body:** `multipart/form-data` with 1-3 images in `files` field
- **Response:** `{ hb_pred: number, is_anemic: 0|1, num_images: number }`

### POST /predict-images
Alternative endpoint (compatibility)
- **Body:** `multipart/form-data` with `n1`, `n2`, `n3` or `files`
- **Response:** Same as `/analyze`
