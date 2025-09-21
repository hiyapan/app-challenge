import * as ImageManipulator from 'expo-image-manipulator';
import { API_BASE } from './config';

function join(base: string, path: string) {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export const API_URL = API_BASE; // Keep for backward compatibility

console.log("Backend URL:", API_URL); // should NOT be undefined anymore

export async function checkHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

async function shrink(uri: string) {
  const { uri: out } = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 224, height: 224 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return out;
}

export async function predictFromImages(uris: string[]) {
  const API_URL = process.env.EXPO_PUBLIC_API_URL!;
  const [u1, u2, u3] = await Promise.all(uris.map(shrink));

  const form = new FormData();
  form.append('n1', { uri: u1, name: 'n1.jpg', type: 'image/jpeg' } as any);
  form.append('n2', { uri: u2, name: 'n2.jpg', type: 'image/jpeg' } as any);
  form.append('n3', { uri: u3, name: 'n3.jpg', type: 'image/jpeg' } as any);

  const ctrl = new AbortController();
  const timeoutMs = 25000;
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}/predict-images`, { method: 'POST', body: form, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
    return await res.json();
  } catch (e: any) {
    clearTimeout(t);
    if (e?.name === 'AbortError') throw new Error(`Request timed out after ${timeoutMs} ms`);
    throw e;
  }
}

// New function for single image prediction
export async function predictFromSingleImage(uri: string) {
  const API_URL = process.env.EXPO_PUBLIC_API_URL!;
  const shrunkUri = await shrink(uri);

  const form = new FormData();
  form.append('n1', { uri: shrunkUri, name: 'nail.jpg', type: 'image/jpeg' } as any);

  const ctrl = new AbortController();
  const timeoutMs = 15000; // Shorter timeout for single image
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}/predict-single-image`, { method: 'POST', body: form, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
    return await res.json();
  } catch (e: any) {
    clearTimeout(t);
    if (e?.name === 'AbortError') throw new Error(`Request timed out after ${timeoutMs} ms`);
    throw e;
  }
}
