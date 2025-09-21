# Anemia Detection App

React Native app with FastAPI backend for hemoglobin prediction using LightGBM and ResNet18 embeddings.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Backend

1. **Install Python dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Place your trained model:**
   - Copy `hb_lgbm_embedding_only.pkl` to the `backend/` directory

### 3. Start the API Server

```bash
npm run api:dev
```

Or manually:
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start the App

```bash
npx expo start
```

## API Endpoints

- **Health Check**: `GET http://192.168.1.25:8000/health`
- **Prediction**: `POST http://192.168.1.25:8000/predict`

### Testing the API

You can test the prediction endpoint with curl:

```bash
curl -X POST "http://192.168.1.25:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"embedding": [/* 512 float values */]}'
```

## Project Structure

```
├── backend/                 # FastAPI server
│   ├── server.py           # Main API server
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
├── lib/                    # API utilities
│   └── api.ts             # API client functions
├── screens/               # React Native screens
│   └── PredictScreen.tsx  # Prediction test screen
└── .env                   # Environment variables
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Troubleshooting

### Stuck in Onboarding Loop?

If you get stuck in the onboarding screen:

1. **Use the exit options**: Tap the **X button** in the top-right corner or the **"Skip for Now"** button
2. **Reset onboarding data**:
   ```bash
   npm run reset-onboarding
   ```
3. **Or restart with clean slate**:
   ```bash
   npm start -- --clear
   ```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
