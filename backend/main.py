# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Iterable
from pathlib import Path
import os, joblib, numpy as np, cv2, torch
import torchvision.transforms as T
from torchvision.models import resnet18

# --- torchvision weights (new & old API compatibility) ---
try:
    from torchvision.models import ResNet18_Weights
    _RESNET_WEIGHTS = ResNet18_Weights.IMAGENET1K_V1
except Exception:
    _RESNET_WEIGHTS = None  # fallback to pretrained=True for very old torchvision

# ---------------- FastAPI app ----------------
app = FastAPI(title="AnemoDx Inference")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time
    t0 = time.time()
    ct = request.headers.get("content-type")
    resp = await call_next(request)
    dt = int((time.time() - t0) * 1000)
    print(f"{request.method} {request.url.path} ct={ct} -> {resp.status_code} {dt}ms")
    return resp

# -------------- Load artifact --------------
# Expect: backend/artifacts/hb_model_full_pipeline.pkl
ART = (Path(__file__).resolve().parent / "artifacts" / "hb_model_full_pipeline.pkl")
if not ART.exists():
    raise RuntimeError(f"Artifact not found at: {ART}")

_loaded = joblib.load(ART)
if isinstance(_loaded, dict):
    model = _loaded["model"]
    pre   = _loaded.get("preprocessor")   # may be None
    THRESH = float(_loaded.get("hb_threshold", 12.5))
else:
    model = _loaded
    pre   = None
    THRESH = 12.5

# -------------- Embedding backbone --------------
device = "cuda" if torch.cuda.is_available() else "cpu"
if _RESNET_WEIGHTS is not None:
    _resnet = resnet18(weights=_RESNET_WEIGHTS).to(device).eval()
else:
    _resnet = resnet18(pretrained=True).to(device).eval()

# Up to avgpool (512-d), then L2-normalize
_backbone = torch.nn.Sequential(*list(_resnet.children())[:-1]).eval().to(device)
_tf = T.Compose([
    T.ToPILImage(),
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@torch.no_grad()
def _embed_rgb(rgb_u8: np.ndarray) -> np.ndarray:
    x = _tf(rgb_u8).unsqueeze(0).to(device)      # [1,3,224,224]
    with torch.cuda.amp.autocast(enabled=(device == "cuda")):
        f = _backbone(x).flatten(1)              # [1,512]
        f = torch.nn.functional.normalize(f, dim=1)
    return f.squeeze(0).cpu().numpy()            # (512,)

async def _upload_to_rgb(u: UploadFile) -> np.ndarray:
    buf = np.frombuffer(await u.read(), np.uint8)
    bgr = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if bgr is None:
        raise HTTPException(status_code=400, detail=f"Failed to decode {u.filename}")
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

def _expected_in_dim() -> int:
    """What feature length the preprocessor expects (pre-PCA)."""
    if pre is None:
        return 512
    try:
        scaler = getattr(pre, "named_steps", {}).get("scaler", None)
        if scaler is not None and hasattr(scaler, "n_features_in_"):
            return int(scaler.n_features_in_)
    except Exception:
        pass
    # Fallback assumption: pure 512-D embeddings
    return 512

def _pca_out_dim() -> Optional[int]:
    if pre is None:
        return None
    try:
        pca = getattr(pre, "named_steps", {}).get("pca", None)
        if pca is not None:
            return int(getattr(pca, "n_components_", getattr(pca, "n_components", None)))
    except Exception:
        pass
    return None

def _predict_from_embeddings(embs: Iterable[np.ndarray]) -> float:
    """Average 512-D embeddings, apply preprocessor (if any), then predict."""
    embs = list(embs)
    if not embs:
        raise HTTPException(status_code=400, detail="No embeddings provided")

    mean_emb = np.mean(np.stack(embs, axis=0), axis=0, dtype=np.float32).reshape(1, -1)

    exp_in = _expected_in_dim()
    got_in = mean_emb.shape[1]
    if got_in != exp_in:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Feature dimension mismatch: got {got_in}, expected {exp_in}. "
                f'Check that artifact "{ART.name}" was trained on pure 512-D embeddings.'
            ),
        )

    X = pre.transform(mean_emb) if pre is not None else mean_emb
    hb = float(model.predict(X)[0])
    return hb

# -------------- Endpoints --------------
@app.get("/health")
def health():
    return {
        "ok": True,
        "artifact": ART.name,
        "artifact_path": str(ART),
        "has_preprocessor": pre is not None,
        "threshold": THRESH,
        "device": device,
        "expected_input_dim": _expected_in_dim(),
        "pca_components": _pca_out_dim(),
    }

@app.post("/analyze")
async def analyze(files: Optional[List[UploadFile]] = File(None)):
    """
    Send 1–3 images via multipart form with field name 'files'.
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="Send 1–3 images via 'files'")
        sel = files[:3]
        embs = []
        for f in sel:
            rgb = await _upload_to_rgb(f)
            embs.append(_embed_rgb(rgb))
        hb = _predict_from_embeddings(embs)
        return {"hb_pred": hb, "is_anemic": int(hb < THRESH), "num_images": len(sel)}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.post("/predict-images")
async def predict_images(
    n1: UploadFile = File(None),
    n2: UploadFile = File(None),
    n3: UploadFile = File(None),
    files: Optional[List[UploadFile]] = File(None),
):
    """
    Compatibility: accepts n1/n2/n3 OR 'files' array (1–3 images).
    """
    try:
        imgs: List[UploadFile] = []
        for u in (n1, n2, n3):
            if u is not None:
                imgs.append(u)
        if files:
            imgs.extend(files)
        if not imgs:
            raise HTTPException(status_code=400, detail="Provide n1/n2/n3 or 'files' (1–3 images)")
        imgs = imgs[:3]
        embs = []
        for f in imgs:
            rgb = await _upload_to_rgb(f)
            embs.append(_embed_rgb(rgb))
        hb = _predict_from_embeddings(embs)
        return {"hb_pred": hb, "is_anemic": int(hb < THRESH), "num_images": len(imgs)}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

# Local runner (optional)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
