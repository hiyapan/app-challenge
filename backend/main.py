from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import numpy as np, cv2, os, joblib, torch
import torchvision.transforms as T
from torchvision.models import resnet18, ResNet18_Weights

app = FastAPI(title="HB API")

# --- CORS (dev-friendly; tighten later) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your LAN IP / Expo origin
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- simple request log so you can SEE if the app hits the server ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time
    t0 = time.time()
    ct = request.headers.get("content-type")
    try:
        resp = await call_next(request)
        return resp
    finally:
        dt = int((time.time() - t0) * 1000)
        print(f"{request.method} {request.url.path} ct={ct} -> {dt}ms")

# -------- Load model (works whether pickle is a dict or the model itself) --------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "hb_lgbm_embedding_only.pkl")
THRESH = 12.5

try:
    _loaded = joblib.load(MODEL_PATH)
    if isinstance(_loaded, dict):
        model = _loaded.get("model")
        THRESH = float(_loaded.get("anemia_threshold", THRESH))
        assert model is not None, "export dict missing 'model'"
        print(f"[OK] Loaded dict export; model={type(model).__name__}, THRESH={THRESH}")
    else:
        model = _loaded
        print(f"[OK] Loaded bare model: {type(model).__name__} (no export dict)")
except Exception as e:
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

# -------- Tiny ResNet18 embedder for 3-image -> mean embedding --------
device = "cuda" if torch.cuda.is_available() else "cpu"
weights = ResNet18_Weights.IMAGENET1K_V1
_resnet = resnet18(weights=weights).to(device).eval()
_backbone = torch.nn.Sequential(*list(_resnet.children())[:-1]).eval().to(device)  # up to avgpool (512-d)
_tf = T.Compose([
    T.ToPILImage(),
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def _embed_rgb(rgb_u8: np.ndarray) -> np.ndarray:
    x = _tf(rgb_u8).unsqueeze(0).to(device)      # [1,3,224,224]
    with torch.no_grad(), torch.cuda.amp.autocast(enabled=(device=="cuda")):
        f = _backbone(x).flatten(1)              # [1,512]
        f = torch.nn.functional.normalize(f, dim=1)
    return f.squeeze(0).cpu().numpy()            # (512,)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "lgbm_model_status": "loaded",
        "resnet_model_status": "loaded",
        "model_path": MODEL_PATH,           # show the actual file you loaded
        "anemia_threshold": THRESH,
    }

# --- FLEX endpoint: accepts EITHER files=[...] OR n1/n2/n3; allows 1-3 images ---
@app.post("/analyze")   # keep this route (client-friendly)
@app.post("/predict-images")  # keep your old route too
async def analyze(
    files: Optional[List[UploadFile]] = File(None),
    n1: Optional[UploadFile] = File(None),
    n2: Optional[UploadFile] = File(None),
    n3: Optional[UploadFile] = File(None),
):
    try:
        # unify inputs
        inputs: List[UploadFile] = []
        if files:
            inputs.extend(files)
        for f in (n1, n2, n3):
            if f is not None:
                inputs.append(f)

        if not inputs:
            raise HTTPException(status_code=400, detail="No files uploaded. Send 1–3 images.")

        if len(inputs) > 3:
            # trim politely (or raise)
            inputs = inputs[:3]

        embs = []
        for i, f in enumerate(inputs, 1):
            data = await f.read()
            buf = np.frombuffer(data, np.uint8)
            bgr = cv2.imdecode(buf, cv2.IMREAD_COLOR)
            if bgr is None:
                raise HTTPException(status_code=400, detail=f"Failed to decode {f.filename or f.content_type}")
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            emb = _embed_rgb(rgb)  # (512,)
            embs.append(emb)
            print(f"[DEBUG] img{i} -> emb[:5]={emb[:5]}")

        mean_emb = np.mean(np.stack(embs, axis=0), axis=0, dtype=np.float32).reshape(1, -1)  # (1,512)
        hb = float(model.predict(mean_emb)[0])
        return {"hb_pred": hb, "is_anemic": int(hb < THRESH), "num_images": len(embs)}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://0.0.0.0:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
