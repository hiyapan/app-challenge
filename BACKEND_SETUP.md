# Backend Setup



## Alternative: Local network without ngrok (same Wi-Fi only)



1. Use `start-backend.ps1` to start the backend and display your IP:

   ```powershell
   .\start-backend.ps1
   ```

2. Optionally use `test-connection.ps1` to verify that port 8000 is reachable from other devices and follow the firewall instructions in that script.

3. Run the app either by:
   - Setting `EXPO_PUBLIC_API_BASE_URL` to your local URL (for example `http://192.168.x.x:8000`) and then running `npm start`, **or**
   - Using `start-app.ps1`, which auto-detects your IP and sets `EXPO_PUBLIC_API_BASE_URL` before running `npm start`.

