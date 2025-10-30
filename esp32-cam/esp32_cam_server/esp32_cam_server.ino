#include "esp_camera.h"
#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebServer.h>



const char* ssid = "HawksNest-Guest";
const char* password = "sleepearly";


const char* BEARER_TOKEN = "esp32cam";

const char* mdnsName = "esp32cam";

// Camera pin definitions for AI-Thinker ESP32-CAM
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

// Flash LED pin
#define FLASH_LED_PIN 4

WebServer server(80);


bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Init with high specs for better quality
  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA;  // 1600x1200
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;  // 800x600
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }

  // Sensor adjustments for better image quality
  sensor_t* s = esp_camera_sensor_get();
  if (s != NULL) {
    s->set_brightness(s, 0);                  // -2 to 2
    s->set_contrast(s, 0);                    // -2 to 2
    s->set_saturation(s, 0);                  // -2 to 2
    s->set_whitebal(s, 1);                    // 0 = disable , 1 = enable
    s->set_awb_gain(s, 1);                    // 0 = disable , 1 = enable
    s->set_wb_mode(s, 0);                     // 0 to 4
    s->set_exposure_ctrl(s, 1);               // 0 = disable , 1 = enable
    s->set_aec2(s, 0);                        // 0 = disable , 1 = enable
    s->set_gain_ctrl(s, 1);                   // 0 = disable , 1 = enable
    s->set_agc_gain(s, 0);                    // 0 to 30
    s->set_gainceiling(s, (gainceiling_t)0);  // 0 to 6
    s->set_bpc(s, 0);                         // 0 = disable , 1 = enable
    s->set_wpc(s, 1);                         // 0 = disable , 1 = enable
    s->set_raw_gma(s, 1);                     // 0 = disable , 1 = enable
    s->set_lenc(s, 1);                        // 0 = disable , 1 = enable
    s->set_hmirror(s, 0);                     // 0 = disable , 1 = enable
    s->set_vflip(s, 0);                       // 0 = disable , 1 = enable
    s->set_dcw(s, 1);                         // 0 = disable , 1 = enable
    s->set_colorbar(s, 0);                    // 0 = disable , 1 = enable
  }

  Serial.println("Camera initialized successfully");
  return true;
}

bool checkAuthorization() {
  if (!server.hasHeader("Authorization")) {
    Serial.println("Missing Authorization header");
    return false;
  }

  String authHeader = server.header("Authorization");
  String expectedAuth = "Bearer " + String(BEARER_TOKEN);

  if (authHeader != expectedAuth) {
    Serial.println("Invalid bearer token");
    return false;
  }

  return true;
}



void handleRoot() {
  String html = "<html><body>";
  html += "<h1>ESP32-CAM Server</h1>";
  html += "<p>Status: Online</p>";
  html += "<p>IP: " + WiFi.localIP().toString() + "</p>";
  html += "<p>mDNS: http://" + String(mdnsName) + ".local</p>";
  html += "<p>Endpoints:</p>";
  html += "<ul>";
  html += "<li>GET /capture - Capture with flash (requires Authorization header)</li>";
  html += "<li>GET /preview - Preview without flash (requires Authorization header)</li>";
  html += "<li>GET /stream - MJPEG video stream (requires Authorization header)</li>";
  html += "<li>GET /health - Health check</li>";
  html += "</ul>";
  html += "<p><a href='/stream'>View Stream</a> (requires auth)</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleHealth() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"status\":\"ok\",\"device\":\"ESP32-CAM\"}");
}

void handleCapture() {
 
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Authorization");

  // Handle preflight
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }

  // Check authorization
  if (!checkAuthorization()) {
    server.send(401, "application/json", "{\"error\":\"Unauthorized\"}");
    return;
  }

  // Turn on flash LED at reduced intensity using PWM (0-255)
  analogWrite(FLASH_LED_PIN, 35);  
  delay(100);  // Give flash time to stabilize

  // Capture image
  camera_fb_t* fb = esp_camera_fb_get();
  
  // Turn off flash immediately after capture
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);
  
  if (!fb) {
    Serial.println("Camera capture failed");
    server.send(500, "application/json", "{\"error\":\"Camera capture failed\"}");
    return;
  }

  Serial.printf("Captured image: %d bytes\n", fb->len);

  // Send JPEG
  server.sendHeader("Content-Disposition", "inline; filename=capture.jpg");
  server.send_P(200, "image/jpeg", (const char*)fb->buf, fb->len);

  // Return frame buffer
  esp_camera_fb_return(fb);
}

void handlePreview() {
  // CORS headers
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Authorization");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  // Handle preflight
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }

  // Check authorization
  if (!checkAuthorization()) {
    server.send(401, "application/json", "{\"error\":\"Unauthorized\"}");
    return;
  }

  // Capture image WITHOUT flash for preview
  camera_fb_t* fb = esp_camera_fb_get();
  
  if (!fb) {
    Serial.println("Preview capture failed");
    server.send(500, "application/json", "{\"error\":\"Camera capture failed\"}");
    return;
  }

  // Send JPEG
  server.sendHeader("Content-Disposition", "inline; filename=preview.jpg");
  server.send_P(200, "image/jpeg", (const char*)fb->buf, fb->len);

  // Return frame buffer
  esp_camera_fb_return(fb);
}

void handleStream() {
  // CORS headers
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Authorization");
  
  // Handle preflight
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }
  
  // Check authorization
  if (!checkAuthorization()) {
    server.send(401, "application/json", "{\"error\":\"Unauthorized\"}");
    return;
  }
  
  WiFiClient client = server.client();
  
  // Send MJPEG headers
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: multipart/x-mixed-replace; boundary=frame");
  client.println();
  
  Serial.println("Stream started");
  
  while (client.connected()) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed during stream");
      break;
    }
    
    // Send MJPEG frame
    client.println("--frame");
    client.println("Content-Type: image/jpeg");
    client.print("Content-Length: ");
    client.println(fb->len);
    client.println();
    client.write(fb->buf, fb->len);
    client.println();
    
    esp_camera_fb_return(fb);
    
    // Check if client is still connected
    if (!client.connected()) {
      break;
    }
    
    // Small delay between frames (adjust for frame rate)
    delay(50);  // ~20 FPS
  }
  
  Serial.println("Stream stopped");
}

void handleNotFound() {
  server.send(404, "application/json", "{\"error\":\"Not found\"}");
}



void setup() {
  Serial.begin(115200);
  Serial.println("\n\nESP32-CAM Server Starting...");

  // Initialize flash LED
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);  // Make sure it's off initially
  Serial.println("Flash LED initialized");

  // Initialize camera
  if (!initCamera()) {
    Serial.println("FATAL: Camera initialization failed!");
    while (1) { delay(1000); }
  }

  // Connect to WiFi
  Serial.printf("Connecting to WiFi: %s\n", ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nFATAL: WiFi connection failed!");
    while (1) { delay(1000); }
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Start mDNS
  if (MDNS.begin(mdnsName)) {
    Serial.printf("mDNS started: http://%s.local\n", mdnsName);
    MDNS.addService("http", "tcp", 80);
  } else {
    Serial.println("mDNS failed to start");
  }

  // Setup HTTP routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/health", HTTP_GET, handleHealth);
  server.on("/capture", HTTP_GET, handleCapture);
  server.on("/capture", HTTP_OPTIONS, handleCapture);  // CORS preflight
  server.on("/preview", HTTP_GET, handlePreview);
  server.on("/preview", HTTP_OPTIONS, handlePreview);  // CORS preflight
  server.on("/stream", HTTP_GET, handleStream);
  server.on("/stream", HTTP_OPTIONS, handleStream);  // CORS preflight
  server.onNotFound(handleNotFound);

  // Start server
  server.begin();
  Serial.println("HTTP server started");
  Serial.println("\n=================================");
  Serial.println("ESP32-CAM Ready!");
  Serial.printf("Access via: http://%s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Or via mDNS: http://%s.local\n", mdnsName);
  Serial.printf("Bearer Token: %s\n", BEARER_TOKEN);
  Serial.println("=================================\n");
}



void loop() {
  server.handleClient();
  delay(1);
}
