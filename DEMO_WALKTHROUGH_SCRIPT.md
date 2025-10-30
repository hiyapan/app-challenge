# AnemoDx Demo Walkthrough Script 🎬

**Presenters:** Hiya, Anya, Izzy  
**Duration:** ~6-7 minutes  
**Format:** Demo sections only (no intro/conclusion)

---

## 📱 PART 1: MOBILE APP DEMO

### **HIYA - Wellness Dashboard & Profile Management** (1 minute)

When opening AnemoDx, users are greeted with the Wellness dashboard. This is the personal health hub where users can start a hemoglobin scan, track levels over time, and access health tools. There's a quick info button here that explains how to use the app and interpret results.

One of the most powerful features is multi-profile support. This allows families to track multiple members separately, or enables community health workers to manage dozens of people from a single device. Users can tap here to select which profile they're scanning for and create new profiles. Each profile maintains its own complete scan history and personalized hemoglobin trends.

The dashboard also includes a symptom checker, where users can track common anemia symptoms like fatigue, shortness of breath, or cold hands and feet. There are also educational resources on iron-rich foods and wellness tips to help users maintain healthy hemoglobin levels.

---

### **ANYA - Capture Screen & Dual Methods** (1.5 minutes)

Now here's the capture screen, where the actual hemoglobin measurement happens. AnemoDx offers two different capture methods, and this dual approach addresses both accessibility and accuracy needs.

The first method uses the phone's built-in camera for personal, at-home monitoring. When scrolling down here, users see the camera preview with a nail positioning overlay that guides them to capture the optimal image. There are flash controls and the ability to flip between front and rear cameras, making it user-friendly for self-screening. Users simply position their fingernails in this highlighted region, and the overlay ensures consistent framing for analysis.

This mobile app approach makes hemoglobin monitoring accessible to everyone—anyone with a smartphone can download the app and start tracking their levels immediately at home, for free. This is perfect for general wellness monitoring, occasional check-ins, or for individuals with low-to-moderate anemia risk who want to stay on top of their health.

However, the app also integrates with an external hardware device, which will be demonstrated in a moment. This section at the top allows users to capture images using the dedicated NailScan Pro scanner. This is designed for individuals who need more accurate, frequent monitoring—such as pregnant women, people with chronic anemia, athletes in training, or anyone at higher risk who wants clinical-grade consistency in their measurements.

When a user taps the capture button with either method, the photo is immediately sent to the backend AI model for analysis. Within seconds, comprehensive results appear on screen.

---

### **IZZY - Results Screen & Health Tracking** (2 minutes)

Here's the results screen, where users get their hemoglobin prediction and health insights. The first thing visible is a clear risk assessment—Low, Medium, or High—color-coded for quick understanding. Green means hemoglobin levels are healthy, yellow suggests monitoring iron intake more carefully, and red indicates that medical consultation is recommended.

But the app doesn't just give a vague risk level. It predicts the actual hemoglobin level in grams per deciliter. Notice how both the predicted level and the personalized normal range are displayed right below it. These ranges automatically adjust based on the age and gender information in the user's profile, because hemoglobin levels vary significantly between demographics. For example, women typically have a normal range of twelve to fifteen point five grams per deciliter, while men have thirteen point five to seventeen point five.

The color analysis section shows the exact RGB values extracted from the nail bed image, providing transparency in how the AI model makes its prediction. Below that are personalized recommendations tailored to the specific hemoglobin level—things like iron-rich foods to incorporate into the diet, lifestyle adjustments, and how frequently to rescan for monitoring progress.

Users can save their results to their profile with one tap, creating a longitudinal health record. This is where the real power of AnemoDx comes in—not just a single measurement, but continuous monitoring over time.

Here's the Stats tab. This is where tracking becomes powerful. The visual trend chart displays hemoglobin levels and risk categories across the last ten scans, with color-coded points so users can immediately see whether their levels are improving, staying stable, or declining. This helps users understand the impact of dietary changes, iron supplements, or medical treatments.

Below the trend chart, users can browse their complete scan history with thumbnail images, dates, hemoglobin values, and risk levels. Users can also export or share these results with their healthcare providers, making AnemoDx a bridge between self-monitoring and professional medical care.

---

## 🔬 PART 2: RESEARCH FOUNDATION

### **HIYA - Building on Yakimov Research** (45 seconds)

The work behind AnemoDx builds directly on research by Yakimov and colleagues, who demonstrated that non-invasive anemia detection through nail bed image analysis is scientifically viable using machine learning models.

However, one critical limitation was identified in their dataset—significant variance in lighting conditions and nail positioning across different images. Some images were taken in bright lighting, others in dim environments. Some nails were photographed straight-on, others at angles. This inconsistency introduced noise that limited real-world reliability.

This led to the question: what if capture conditions could be standardized to ensure every image had consistent lighting, positioning, and distance? That's what drove the development of the hardware solution.

---

## 🔧 PART 3: NAILSCAN PRO HARDWARE DEMO

### **ANYA - Hardware Design & Use Case** (2 minutes)

Here's the **NailScan Pro**—a custom-built hardware scanner designed specifically to provide clinical-grade accuracy through standardized image capture conditions.

The NailScan Pro is built around an ESP32-CAM module, but it's engineered as a complete capture system that standardizes every variable affecting image quality and model accuracy.

First, the device features integrated LED lighting positioned at precise angles to eliminate shadows and ensure even illumination across the nail bed. This controlled lighting means that whether the user is in a bright room or a dimly lit space, the captured image has identical lighting conditions. This eliminates one of the largest sources of variance that affected previous research.

Second, there's a physical nail positioning guide at the front of the device. Users place their finger into this guide, which ensures that every nail is photographed from the exact same distance and angle. This standardization is critical because subtle variations in perspective can change how colors appear in the image, which directly affects hemoglobin prediction accuracy.

Now, here's the key distinction in how these two methods serve different needs. The mobile app makes hemoglobin monitoring accessible to everyone—it's free, it's on a device people already own, and it's perfect for general wellness tracking. Anyone can download the app and start monitoring their levels at home.

But for individuals who are at higher risk or need more frequent, accurate monitoring—such as pregnant women tracking their iron levels throughout pregnancy, people with diagnosed anemia managing their condition, or athletes who need precise performance monitoring—the NailScan Pro provides that next level of accuracy through standardized conditions. Think of it like the difference between a home blood pressure monitor and one at a doctor's office. Both are useful, but one provides more consistent, reliable measurements when accuracy really matters.

The device is compact and portable, connecting to the mobile app via WiFi. It can be used at home by high-risk individuals, or placed in community settings like school health offices, fitness centers, or community health programs where multiple people can benefit from standardized screening.

---

### **ANYA - NailScan Pro Demonstration** (1 minute)

Here's how it works in practice. First, power on the NailScan Pro and ensure it's connected to the same WiFi network as the phone running the AnemoDx app. In the app, navigate to the Capture tab and select the external device option at the top of the screen.

When ready to scan, place a finger into the positioning guide like this. The guide has soft edges for comfort and clearly indicates where the fingernail should be positioned.

Then tap the "Capture" button in the app. This wirelessly triggers the NailScan Pro to take a photo with the controlled lighting and standardized positioning. The image is immediately transmitted to the phone, which sends it to the backend for analysis, and within seconds, the hemoglobin prediction appears on screen.

This entire process takes less than thirty seconds per person. The consistency provided by the NailScan Pro significantly improves accuracy—this is why the device exists as an option for those who need it, while the mobile app remains accessible for everyone else.

---

## 🧠 PART 4: BACKEND MODEL & VALIDATION

### **IZZY - Machine Learning Pipeline** (1.5 minutes)

Here's what happens behind the scenes when an image is captured. Whether from a phone camera or from the NailScan Pro, the image is sent to the FastAPI backend server. The first step in the pipeline is image preprocessing using OpenCV. Color space transformations are applied, specifically converting from standard RGB to LAB color space, which separates luminance from color information. This makes the model more robust to lighting variations.

Next, specific regions of interest are extracted from the image, focusing on the nail bed itself while excluding the surrounding skin, cuticles, and background. This focused analysis ensures that only the clinically relevant nail bed coloration is being evaluated.

The preprocessed nail bed image is then fed into the deep learning model, which is built on a PyTorch framework. The model architecture is a convolutional neural network trained specifically for anemia detection using the Yakimov dataset. The model has learned to identify subtle color variations in the nail bed that correlate with hemoglobin levels—variations that are often imperceptible to the human eye.

The model outputs a hemoglobin prediction in grams per deciliter, which is then classified into anemia risk categories based on clinical thresholds. Hemoglobin levels below twelve grams per deciliter for women or below thirteen for men typically indicate anemia.

---

### **IZZY - Model Validation & Accuracy** (1 minute)

Now for accuracy, because that's what matters when dealing with health data. The model was validated on a testing set and achieved eighty-eight percent classification accuracy for determining whether someone is anemic or not.

To put this in context, this is highly competitive with other non-invasive anemia detection research. Many previous studies using similar nail bed or conjunctiva analysis achieved accuracies in the seventy to eighty-five percent range. The eighty-eight percent accuracy demonstrates that this approach—particularly the standardized image capture from the NailScan Pro—is pushing the boundaries of what's possible with non-invasive hemoglobin monitoring.

This is positioned as a screening and wellness monitoring tool for personal health tracking. For continuous health monitoring, early detection, and tracking trends over time, this accuracy level makes AnemoDx a genuinely useful tool for proactive health management.

Looking ahead, the model is being continuously improved. The training dataset is being expanded to include more diverse skin tones and nail conditions to ensure equitable accuracy across all populations. Multi-modal analysis is also being explored, combining nail bed images with symptom reports and demographic data to further improve prediction accuracy.

---

## 🎯 TRANSITION CUES

**Hiya → Anya:**  
"There are also educational resources on iron-rich foods and wellness tips..." → Anya picks up with "Now here's the capture screen..."

**Anya → Izzy:**  
"Within seconds, comprehensive results appear on screen." → Izzy picks up with "Here's the results screen..."

**Izzy → Hiya:**  
"...making AnemoDx a bridge between self-monitoring and professional medical care." → Hiya picks up with "The work behind AnemoDx builds directly on research..."

**Hiya → Anya:**  
"That's what drove the development of the hardware solution." → Anya picks up with "Here's the NailScan Pro..."

**Anya → Izzy:**  
"...this is why the device exists as an option for those who need it." → Izzy picks up with "Here's what happens behind the scenes..."

---

## 📋 SPEAKER BREAKDOWN

### Hiya's Sections:
1. Wellness dashboard & profile management (1 min)
2. Building on Yakimov research (45 sec)
**Total: ~1.75 minutes**

### Anya's Sections:
1. Capture screen & dual methods (1.5 min)
2. Hardware design & use case (2 min)
3. NailScan Pro demonstration (1 min)
**Total: ~4.5 minutes**

### Izzy's Sections:
1. Results screen & health tracking (2 min)
2. Machine learning pipeline (1.5 min)
3. Model validation & accuracy (1 min)
**Total: ~4.5 minutes**

---

## 💡 CLEAR USE CASE FRAMEWORK

**Mobile App (Accessibility):**
- Anyone with a smartphone
- General wellness monitoring
- Occasional health check-ins
- Low-to-moderate risk individuals
- Free and immediately accessible

**NailScan Pro (Accuracy):**
- Pregnant women monitoring iron throughout pregnancy
- Individuals with diagnosed anemia managing their condition
- Athletes requiring precise performance tracking
- People at higher risk needing frequent, accurate monitoring
- Clinical-grade consistency through standardized conditions

**Key Message:** The mobile app makes hemoglobin monitoring accessible to everyone, while the NailScan Pro provides higher accuracy through standardization for those who need it most.

---

## 🎬 DEMO CHECKLIST

### App Setup:
- [ ] 3 sample profiles with realistic names
- [ ] 7-10 saved scans with varied hemoglobin levels
- [ ] User wellness profile completed
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

**Break a leg! 🚀**
