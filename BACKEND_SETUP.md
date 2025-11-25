# Backend Setup

The app talks to a FastAPI backend running on your laptop. The **simplest and most reliable** way to reach it from a physical phone is to use an ngrok tunnel. You **do not** need to edit any TypeScript files to change URLs.

## Recommended: Local backend + ngrok (works on most networks)

1. **Start the backend** from the project root:

   ```powershell
   cd backend
   python server.py
   ```

   This starts the FastAPI backend on `http://localhost:8000`.

2. **Start an ngrok tunnel** in a new PowerShell window:

   ```powershell
   ngrok http 8000
   ```

   Copy the HTTPS forwarding URL that ngrok prints (for example, `https://example.ngrok-free.app`).

3. **Start the app and point it at the ngrok URL** (no code changes):

   ```powershell
   $env:EXPO_PUBLIC_API_BASE_URL = "https://example.ngrok-free.app"
   npm start
   ```

   The app reads `EXPO_PUBLIC_API_BASE_URL` via `config/api.ts`, so you don't have to touch `lib/api.ts` or hard-code your IP.

This setup works whether your phone is on Wi-Fi or cellular, as long as it can reach the ngrok URL.

## Alternative: Local network without ngrok (same Wi-Fi only)

If you prefer to connect directly to your laptop over the local network (and are comfortable adjusting firewall rules), you can:

1. Use `start-backend.ps1` to start the backend and display your IP:

   ```powershell
   .\start-backend.ps1
   ```

2. Optionally use `test-connection.ps1` to verify that port 8000 is reachable from other devices and follow the firewall instructions in that script.

3. Run the app either by:
   - Setting `EXPO_PUBLIC_API_BASE_URL` to your local URL (for example `http://192.168.x.x:8000`) and then running `npm start`, **or**
   - Using `start-app.ps1`, which auto-detects your IP and sets `EXPO_PUBLIC_API_BASE_URL` before running `npm start`.

The ngrok flow above is recommended unless you specifically need a pure local-network-only setup.
