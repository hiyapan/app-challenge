# AnemoDx App

AnemoDx is a mobile app for non-invasive anemia risk screening using fingernail images and a FastAPI backend.

It supports two capture paths:
- Phone camera (works with just the app and backend)
- External ESP32-CAM "NailScan Pro" device

## Documentation

- [Backend setup](BACKEND_SETUP.md)
- [ESP32 / NailScan Pro setup](ESP32_SETUP.md)
- [Demo walkthrough](DEMO_WALKTHROUGH_SCRIPT.md)

## Quick Start (Python backend + ngrok)

You don't need to edit any TypeScript to change URLs; just set `EXPO_PUBLIC_API_BASE_URL` before running the app.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the backend (FastAPI):

   ```powershell
   cd backend
   python server.py
   ```

3. In a new PowerShell window, start ngrok:

   ```powershell
   ngrok http 8000
   ```

   Copy the **https** forwarding URL that ngrok prints (for example, `https://example.ngrok-free.app`).

4. In a third PowerShell window, start the app and point it at the ngrok URL **without editing code**:

   ```powershell
   $env:EXPO_PUBLIC_API_BASE_URL = "https://example.ngrok-free.app"
   npm start
   ```

The app reads `EXPO_PUBLIC_API_BASE_URL` via `config/api.ts`, so you never need to hard-code your IP or tunnel URL in the source.

For alternative setups (like using your local IP on the same Wi-Fi instead of ngrok), see [Backend setup](BACKEND_SETUP.md).
