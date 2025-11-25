# ESP32-CAM / NailScan Pro Setup

This guide explains how to set up the ESP32-CAM ("NailScan Pro") hardware using the Arduino IDE and connect it to the AnemoDx app.

The ESP32 side is intentionally simple: you only configure Wi-Fi credentials, an optional mDNS name, and a bearer token in the Arduino sketch, then upload it.

## 1. Flash the ESP32-CAM firmware

1. Open the Arduino IDE.
2. Install the **ESP32** board support package if you haven't already (via Boards Manager).
3. In the project folder, open the sketch:

   ```
   esp32-cam/esp32_cam_server/esp32_cam_server.ino
   ```

4. At the top of the file, update these values to match your Wi-Fi network and desired auth token:

   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";

   const char* BEARER_TOKEN = "esp32cam";  // must match the app config

   const char* mdnsName = "esp32cam";      // optional, used for http://esp32cam.local
   ```

5. Select the correct **board** (e.g., `AI Thinker ESP32-CAM`) and **port** in the Arduino IDE.
6. Click **Upload** to flash the firmware to the ESP32-CAM.

## 2. Confirm the ESP32-CAM is online

1. Open the Arduino **Serial Monitor** at 115200 baud.
2. Reset/power-cycle the ESP32-CAM.
3. Wait for messages like:

   - `WiFi connected!`
   - `IP address: 192.168.x.x`
   - `mDNS started: http://esp32cam.local`
   - `Bearer Token: esp32cam`

4. In a browser on the **same Wi-Fi network**, visit either:

   - `http://<ESP32_IP_ADDRESS>/` (for example `http://192.168.1.50/`), or
   - `http://<mdnsName>.local/` (for example `http://esp32cam.local/`).

You should see the "ESP32-CAM Server" status page and the available endpoints.

## 3. Match the app configuration

The mobile app talks to the ESP32-CAM using `lib/esp32Service.ts`.

By default, it assumes:

```ts
const DEFAULT_CONFIG: ESP32Config = {
  baseUrl: 'http://192.168.1.50', // update to match your ESP32 IP or mDNS name
  bearerToken: 'esp32cam',        // must match BEARER_TOKEN in the sketch
};
```

Update `baseUrl` in `lib/esp32Service.ts` to match how you access the device:

- If you use the numeric IP shown in Serial Monitor:
  - `baseUrl: 'http://192.168.1.50'`
- If mDNS works on your network:
  - `baseUrl: 'http://esp32cam.local'` (or whatever `mdnsName` you set).

The `bearerToken` value **must** match `BEARER_TOKEN` in the Arduino sketch or the app will get `Unauthorized` errors.

## 4. Using ESP32-CAM from the app

1. Make sure:
   - The FastAPI backend is running and reachable.
   - The ESP32-CAM is powered on and connected to the **same Wi-Fi** as your phone.
   - `baseUrl` and `bearerToken` are correctly set as described above.

2. In the app, go to the **Capture** tab.
3. Under **Scan with Device**, tap **Capture**.

The app will:

- Call `GET <baseUrl>/health` to check if the ESP32-CAM is online.
- Call `GET <baseUrl>/capture` with the `Authorization: Bearer <token>` header.
- Save the returned JPEG into a local file and forward it to the backend analysis.

If something fails, the app will show a specific error message (for example, network error, unauthorized, or save error).

## 5. Troubleshooting

- **"ESP32-CAM Not Found" alert**
  - Double-check the `baseUrl` in `lib/esp32Service.ts`.
  - Ensure the phone and ESP32 are on the same Wi-Fi.
  - Confirm you can open `http://<baseUrl>/health` from a browser on the phone or laptop.

- **"Unauthorized: Invalid bearer token"**
  - Make sure `BEARER_TOKEN` in `esp32_cam_server.ino` matches `bearerToken` in `lib/esp32Service.ts`.

- **Wi-Fi or mDNS issues**
  - If `http://esp32cam.local` does not resolve, use the numeric IP shown in Serial Monitor.
  - Some networks block mDNS or isolate devices; in that case, stick to the numeric IP on a standard home/office Wi-Fi.

This setup keeps the ESP32 side simple: configure Wi-Fi and token in Arduino, update the one `baseUrl` in the app once, and then use the "Scan with Device" flow from the Capture screen.