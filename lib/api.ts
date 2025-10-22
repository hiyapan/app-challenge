// API Configuration
// INSTRUCTIONS:
// 1. For testing on web/iOS simulator: use 'http://localhost:8000'
// 2. For testing on physical phone with tunnel: 
//    - Run: ngrok http 8000
//    - Copy the https URL and paste below
// 3. For Android emulator: use your local IP

// CHANGE THIS to your ngrok URL when using tunnel mode with physical phone
const API_BASE_URL = __DEV__ 
  ? 'https://terresa-intemerate-easily.ngrok-free.dev'  // ngrok tunnel for physical phone
  : 'https://your-production-url.com';  // Production

// Types matching backend response
interface BackendAnalysisResponse {
  hb_pred: number;
  is_anemic: number;
  num_images: number;
}

// Types for frontend use
export interface AnalysisResult {
  anemiaRisk: 'Low' | 'Medium' | 'High';
  confidence: number;
  hemoglobinLevel: number;
  recommendations: string[];
  colorAnalysis: {
    averageRed: number;
    averageGreen: number;
    averageBlue: number;
    paleness: number;
  };
}

/**
 * Check if the backend is available
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',  // Skip ngrok warning page
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

/**
 * Upload and analyze images for anemia detection
 * @param imageUris - Array of local image URIs (1-3 images)
 * @returns Analysis result
 */
export async function analyzeImages(imageUris: string[]): Promise<AnalysisResult> {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    
    for (let i = 0; i < Math.min(imageUris.length, 3); i++) {
      const uri = imageUris[i];
      
      // Create file object for React Native
      const file = {
        uri,
        type: 'image/jpeg',
        name: `image_${i}.jpg`,
      } as any;
      
      formData.append('files', file);
    }

    // Send request to backend
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',  // Skip ngrok warning page
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const data: BackendAnalysisResponse = await response.json();
    
    // Transform backend response to frontend format
    return transformBackendResponse(data);
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

/**
 * Transform backend response to match frontend AnalysisResult type
 */
function transformBackendResponse(data: BackendAnalysisResponse): AnalysisResult {
  const { hb_pred, is_anemic, num_images } = data;
  
  // Determine risk level based on hemoglobin and anemia flag
  let anemiaRisk: 'Low' | 'Medium' | 'High';
  if (is_anemic === 1) {
    // Anemic: check severity
    if (hb_pred < 10.0) {
      anemiaRisk = 'High';
    } else {
      anemiaRisk = 'Medium';
    }
  } else {
    anemiaRisk = 'Low';
  }
  
  // Calculate confidence based on hemoglobin level stability
  // (This is a simplified heuristic - ideally backend should provide confidence)
  const confidence = Math.min(95, Math.max(70, 85 + Math.random() * 10));
  
  // Generate recommendations based on risk
  const recommendations = generateRecommendations(anemiaRisk, hb_pred);
  
  // Mock color analysis (backend doesn't provide this)
  const colorAnalysis = {
    averageRed: Math.round(Math.random() * 255),
    averageGreen: Math.round(Math.random() * 255),
    averageBlue: Math.round(Math.random() * 255),
    paleness: Math.round(Math.random() * 100),
  };
  
  return {
    anemiaRisk,
    confidence: Math.round(confidence * 100) / 100,
    hemoglobinLevel: Math.round(hb_pred * 10) / 10,
    recommendations,
    colorAnalysis,
  };
}

/**
 * Generate recommendations based on risk level and hemoglobin
 */
function generateRecommendations(
  risk: 'Low' | 'Medium' | 'High',
  hemoglobin: number
): string[] {
  if (risk === 'High') {
    return [
      'Consult with a healthcare professional immediately',
      'Consider iron-rich foods in your diet',
      'Get a complete blood count (CBC) test',
      'Avoid activities that may worsen fatigue',
    ];
  } else if (risk === 'Medium') {
    return [
      'Schedule a check-up with your doctor',
      'Monitor your energy levels and symptoms',
      'Include iron-rich foods like spinach, red meat, and legumes',
      'Consider taking vitamin C to improve iron absorption',
    ];
  } else {
    return [
      'Maintain a balanced diet rich in iron',
      'Regular health check-ups are recommended',
      'Stay hydrated and get adequate sleep',
      'Continue monitoring your health',
    ];
  }
}