# AnemoDx Demo Guide

This document summarizes how to demo the AnemoDx system end to end. It is written as a high-level guide rather than a word-for-word script.

## Demo Goals

- Show how AnemoDx enables non-invasive anemia screening from a smartphone.
- Highlight the dual capture pathways: phone camera and NailScan Pro hardware.
- Demonstrate how results are interpreted, tracked, and shared.
- Explain the research foundation, backend model, and validation.

## High-Level Flow

1. Mobile app overview (Wellness dashboard and profiles).
2. Capture flow (phone camera and NailScan Pro).
3. Results and longitudinal tracking (Stats tab and trend chart).
4. Hardware overview (NailScan Pro design and rationale).
5. Backend pipeline and accuracy.

---

## 1. Mobile App Overview

### Wellness Dashboard and Profiles

- When the app opens, the user lands on the Wellness dashboard.
- The dashboard is the central hub for:
  - Starting a hemoglobin scan.
  - Viewing the latest results.
  - Accessing health tools and educational content.
- The app supports multiple profiles so that families or community health workers can track many individuals separately.
  - Each profile has its own color, history, and trend data.

### Health Tools

- The dashboard includes a symptom checker for common anemia-related symptoms such as fatigue, shortness of breath, or cold extremities.
- Additional sections provide guidance on iron-rich foods, lifestyle tips, and wellness habits to support healthy hemoglobin levels.

---

## 2. Capture Flow

### Phone Camera Capture

- On the Capture tab, users can take a fingernail photo using the phone camera.
- A nail positioning overlay guides the finger into the optimal region for consistent framing.
- Camera controls (flash, camera switching) help adapt to different environments.
- This pathway is designed for accessible, at-home monitoring using only a smartphone.

### NailScan Pro Integration

- The Capture screen also exposes an option to use an external ESP32-CAM based device called NailScan Pro.
- NailScan Pro is intended for scenarios that require higher consistency and accuracy, such as:
  - Pregnant individuals.
  - People with chronic anemia.
  - Athletes or others needing precise monitoring.
- When NailScan Pro is selected:
  - The app triggers the scanner over the local network.
  - The hardware captures a standardized image and returns it to the app, which then forwards it to the backend.

---

## 3. Results and Tracking

### Results Screen

- After capture, the image is sent to the FastAPI backend.
- The results screen shows:
  - An anemia risk assessment (Low, Medium, or High) with color coding.
  - A predicted hemoglobin level in grams per deciliter.
  - A reference range tailored by age and gender from the user profile.
  - Optional color analysis details (for transparency about how the model interprets the nail bed image).
- Users can save the result to the active profile to build a longitudinal record.

### Stats Tab and Trend Chart

- The Stats tab aggregates all past scans for a given profile.
- The trend chart displays hemoglobin risk categories over time using color-coded points, allowing the user to see whether outcomes are improving, stable, or worsening.
- A detailed history list shows:
  - Date of each scan.
  - Risk category and hemoglobin level.
  - Thumbnail of the original nail image.
- Export options allow sharing scan history with healthcare professionals.

---

## 4. NailScan Pro Hardware

### Motivation and Design

- Prior research (for example, Yakimov et al.) showed that anemia can be detected from nail bed images using machine learning.
- A key limitation in existing datasets was inconsistent capture conditions:
  - Variable lighting.
  - Different distances and angles.
  - Mixed backgrounds.
- NailScan Pro addresses this by standardizing capture conditions:
  - Integrated LED lighting at fixed angles to reduce shadows.
  - A physical finger guide to control distance and orientation.

### How It Works in the Demo

- NailScan Pro is powered on and connected to the same network as the phone.
- In the Capture tab, the external device option is selected.
- The user places a finger in the positioning guide and taps the capture button inside the app.
- The device:
  - Captures the image under controlled lighting.
  - Sends it back to the app, which forwards it to the backend for analysis.
- The end-to-end capture and prediction cycle typically takes under thirty seconds.

### Positioning in the Product

- The mobile app provides broad accessibility: anyone with a smartphone can perform basic screening.
- NailScan Pro provides standardization and higher consistency for:
  - High-risk individuals.
  - Clinics, schools, or community health programs that need repeatable measurements.

---

## 5. Backend Model and Validation

### Processing Pipeline

- Backend is implemented with FastAPI.
- When an image arrives:
  1. OpenCV is used to preprocess the image.
     - Conversion from RGB to LAB color space separates luminance from color components.
  2. The system extracts a region-of-interest around the nail bed, excluding surrounding skin and background.
  3. The processed patch is passed into a convolutional neural network (PyTorch-based) trained on the Yakimov nail dataset.
  4. The model outputs a predicted hemoglobin value.
  5. The backend maps that value to an anemia risk category based on clinical thresholds.

### Accuracy

- The model achieves approximately 88 percent accuracy in classifying whether an individual is anemic on a held-out test set.
- This performance is comparable to or better than many prior non-invasive anemia approaches based on nail or conjunctiva imaging.
- The system is presented as a screening and wellness monitoring tool, not a replacement for laboratory diagnostics.

### Ongoing Improvements

- Data collection is being extended to include a wider range of skin tones and nail conditions.
- Future iterations may combine image features with symptom reports and basic demographic data to improve robustness.

---

## 6. Key Messages for the Demo

- **Accessibility:** A smartphone-only path allows anyone to perform basic anemia risk screening from home.
- **Standardization:** NailScan Pro adds clinical-style standardization of lighting and positioning for higher consistency.
- **Continuous Tracking:** Profiles, scan history, and trend charts turn isolated measurements into a longitudinal view of hemoglobin-related risk.
- **Evidence-Based:** The approach is grounded in peer-reviewed research and validated on a held-out test set.

---

## 7. Practical Demo Checklist

### App Setup

- [ ] Create 3 sample profiles with realistic names.
- [ ] Save 7–10 scans with a mix of Low, Medium, and High risk results.
- [ ] Ensure at least one profile has enough scans to populate the trend chart.
- [ ] Complete a wellness profile so that reference ranges and personalized tips are enabled.

### Hardware Setup

- [ ] NailScan Pro powered on and connected to the same network as the demo device (see `ESP32_SETUP.md` for Wi-Fi and bearer token setup).
- [ ] Test capture from the hardware path once before the live demo.
- [ ] Verify that the fingernail positioning guide is clean and visible.

### Backend and Technical

- [ ] FastAPI backend running and reachable from the demo device.
- [ ] If using a tunnel (such as ngrok), verify that `EXPO_PUBLIC_API_BASE_URL` is set to the current tunnel URL (see `BACKEND_SETUP.md`).
- [ ] Test both phone camera and NailScan Pro capture paths end to end.
- [ ] Confirm that the Stats tab displays at least one trend chart and a non-empty history list.

This guide can be used as a checklist and talking points reference when preparing and delivering the AnemoDx demo.
- [ ] At least one profile with trend chart showing progression

### Hardware Setup:
- [ ] NailScan Pro powered on
- [ ] WiFi connection established
- [ ] Test capture completed successfully
- [ ] Positioning guide clean and visible

### Technical:
- [ ] Backend server running
- [ ] Phone/tablet fully charged
- [ ] Screen mirroring tested and working
- [ ] Backup screenshots ready

### Key Stats to Mention:
- [ ] 88% classification accuracy on testing set
- [ ] Competitive with 70-85% range in existing literature
- [ ] Standardized capture improves accuracy
- [ ] Mobile app = accessibility, NailScan Pro = accuracy

**Break a leg**
