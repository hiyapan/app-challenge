# Hemoglobin Prediction API

FastAPI backend for predicting hemoglobin levels from 512-D ResNet18 embeddings using a trained LightGBM model.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Place your trained model:**
   - Copy `hb_lgbm_embedding_only.pkl` to the `backend/` directory
   - The server will automatically load this model on startup

## Running the Server

### Development Mode (with auto-reload):
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode:
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### `POST /predict`
Predict hemoglobin level from embedding.

**Request:**
```json
{
  "embedding": [/* 512 float values */]
}
```

**Response:**
```json
{
  "hb_pred": 13.2,
  "is_anemic": 0
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

## Notes

- Expects 512-dimensional embeddings (ResNet18 output)
- Returns `is_anemic: 1` if predicted Hb < 12.5 g/dL, otherwise `0`
- CORS is open for development - restrict origins in production
