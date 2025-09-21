import * as ImageManipulator from 'expo-image-manipulator';
import { API_BASE } from './config';

function join(base: string, path: string) {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export const API_URL = API_BASE; // Keep for backward compatibility

// Create a timeout controller function for React Native compatibility
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  // Clean up timeout if request completes before timeout
  const originalSignal = controller.signal;
  Object.defineProperty(originalSignal, 'cleanup', {
    value: () => clearTimeout(timeoutId),
    writable: false
  });

  return originalSignal;
}

export async function ping() {
  const url = join(API_BASE, "/health");
  console.log(">>> GET", url);
  const r = await fetch(url);
  console.log(">>> PING status", r.status);
  return r.json();
}

export async function testConnection() {
  try {
    const healthUrl = `${API_URL}/health`;
    console.log('Testing connection to:', healthUrl);
    const r = await fetch(healthUrl, {
      method: "GET",
      signal: createTimeoutSignal(10000), // 10 second timeout
    });

    if (!r.ok) {
      throw new Error(`Health check failed: ${r.status}`);
    }

    const result = await r.json();
    console.log('Backend health check:', result);
    return result;
  } catch (error) {
    console.error('Backend connection failed:', error);
    throw error;
  }
}

export async function sendEmbedding(embedding: number[]) {
  const r = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embedding }),
  });
  if (!r.ok) throw new Error(`Server ${r.status}`);
  return r.json() as Promise<{ hb_pred: number; is_anemic: 0|1 }>;
}

async function compressImage(imageUri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        { resize: { width: 800 } }, // Resize to max width 800px
      ],
      {
        compress: 0.5, // 50% compression
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return imageUri;
  }
}

// STUB VERSION FOR TESTING - send dummy data to test network path only
export async function predictFromImages(uris: string[]) {
  const endpoint = join(API_BASE, "/analyze");      // <-- MUST include /analyze
  console.log(">>> POST", endpoint);
  console.log(">>> [STUB] Testing with dummy file instead of:", uris.length, "real images");

  const form = new FormData();
  // Send 1 dummy part so we test multipart without camera pipeline
  form.append("files", { uri: "file:///dummy.jpg", name: "x.jpg", type: "image/jpeg" } as any);

  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const res = await fetch(endpoint, { method: "POST", body: form, signal: ctl.signal });
    const txt = await res.text();
    console.log(">>> status", res.status, "->", txt);
    return JSON.parse(txt);
  } catch (error) {
    console.error(">>> [STUB] Request failed:", error);
    throw error;
  } finally { 
    clearTimeout(t); 
  }
}

// Legacy function - kept for compatibility
export async function predictFromMultipleImages(imageUris: string[]) {
  return predictFromImages(imageUris);
}
