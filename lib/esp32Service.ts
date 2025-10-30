import { File, Paths } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

// ESP32-CAM settings - user should update these
export interface ESP32Config {
  baseUrl: string;  // e.g., "http://192.168.1.50" or "http://esp32cam.local"
  bearerToken: string;
}

// Default config - user should update via settings or hardcode
const DEFAULT_CONFIG: ESP32Config = {
  baseUrl: 'http://192.168.1.8',  // Your ESP32-CAM IP
  bearerToken: 'esp32cam',  // Match the token in Arduino sketch
};

let currentConfig: ESP32Config = { ...DEFAULT_CONFIG };

export function getESP32Config(): ESP32Config {
  return { ...currentConfig };
}

export function setESP32Config(config: Partial<ESP32Config>) {
  currentConfig = { ...currentConfig, ...config };
}

export function resetESP32Config() {
  currentConfig = { ...DEFAULT_CONFIG };
}

export interface ESP32CaptureResult {
  success: true;
  imageUri: string;  // file:// URI of the captured image
}

export interface ESP32ErrorResult {
  success: false;
  error: string;
  code?: 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'CAMERA_ERROR' | 'SAVE_ERROR' | 'UNKNOWN';
}

export type ESP32Result = ESP32CaptureResult | ESP32ErrorResult;

/**
 * Check if the ESP32-CAM is reachable
 * @param config Optional config override
 * @returns true if ESP32 is online and responding
 */
export async function checkESP32Health(config?: ESP32Config): Promise<boolean> {
  const { baseUrl } = config || currentConfig;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('ESP32 health check failed:', error);
    return false;
  }
}

/**
 * Capture a photo from ESP32-CAM and save it locally
 * @param config Optional config override
 * @returns ESP32Result with imageUri on success or error details on failure
 */
export async function captureFromESP32(config?: ESP32Config): Promise<ESP32Result> {
  const { baseUrl, bearerToken } = config || currentConfig;
  
  try {
    console.log(`Fetching image from ${baseUrl}/capture`);
    
    // Use expo/fetch to download and File to write
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const expoResponse = await expoFetch(`${baseUrl}/capture`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!expoResponse.ok) {
      if (expoResponse.status === 401) {
        return {
          success: false,
          error: 'Unauthorized: Invalid bearer token',
          code: 'UNAUTHORIZED',
        };
      }
      return {
        success: false,
        error: `ESP32 error ${expoResponse.status}`,
        code: 'CAMERA_ERROR',
      };
    }
    
    console.log('Fetched image, converting to bytes...');
    const bytes = await expoResponse.bytes();
    console.log(`Got ${bytes.length} bytes`);
    
    const file = new File(Paths.cache, `esp32_${Date.now()}.jpg`);
    console.log(`Writing to ${file.uri}...`);
    file.write(bytes);
    console.log('Write complete!');
    
    return {
      success: true,
      imageUri: file.uri,
    };
    
  } catch (error: any) {
    console.error('ESP32 capture failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Parse error type
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return {
        success: false,
        error: 'Connection timeout: Could not reach ESP32-CAM. Check IP address and network.',
        code: 'NETWORK_ERROR',
      };
    }
    
    if (error?.message?.includes('Network request failed')) {
      return {
        success: false,
        error: 'Network error: ESP32-CAM not reachable. Ensure you are on the same WiFi.',
        code: 'NETWORK_ERROR',
      };
    }
    
    if (error?.message?.includes('write') || error?.message?.includes('file') || error?.message?.includes('exists')) {
      return {
        success: false,
        error: `File error: ${error?.message || 'Failed to save image'}`,
        code: 'SAVE_ERROR',
      };
    }
    
    return {
      success: false,
      error: `Unexpected error: ${error?.message || JSON.stringify(error)}`,
      code: 'UNKNOWN',
    };
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Test connection and get ESP32 info
 */
export async function getESP32Info(config?: ESP32Config): Promise<{
  online: boolean;
  ip?: string;
  device?: string;
}> {
  const { baseUrl } = config || currentConfig;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return {
        online: true,
        device: data.device || 'ESP32-CAM',
        ip: baseUrl.replace(/^https?:\/\//, ''),
      };
    }
    
    return { online: false };
  } catch (error) {
    return { online: false };
  }
}
