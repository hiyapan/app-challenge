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
    _RESNET_WEIGHTS = None  # fallback for very old torchvision

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
ART = Path(__file__).resolve().parent / "artifacts" / "hbg_final_model_full_pipeline.pkl"
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

def _extract_white_ref(rgb_u8: np.ndarray) -> np.ndarray:
    """Extract center white reference patch (5% of min dimension)."""
    h, w = rgb_u8.shape[:2]
    size = max(4, int(min(h, w) * 0.05))
    r0, c0 = h // 2 - size // 2, w // 2 - size // 2
    r1, c1 = r0 + size, c0 + size
    return rgb_u8[max(0, r0):min(h, r1), max(0, c0):min(w, c1)]

def _center_crop(img: np.ndarray, low=0.2, high=0.8) -> np.ndarray:
    """Center crop image to [low, high] fraction."""
    h, w = img.shape[:2]
    r0, r1 = int(h * low), int(h * high)
    c0, c1 = int(w * low), int(w * high)
    r1 = max(r1, r0 + 1)
    c1 = max(c1, c0 + 1)
    return img[r0:r1, c0:c1]

def _calculate_hand_crafted_features(nail_images: list, white_ref: np.ndarray, prefix='NAIL') -> np.ndarray:
    """Extract 332-D hand-crafted color features from images vs white reference.
    Args:
        prefix: 'NAIL' or 'SKIN' to match training feature names
    """
    percentiles = tuple(range(5, 95, 5))  # 5, 10, ..., 90
    
    # Center-crop all patches
    nail_crops = [_center_crop(img) for img in nail_images]
    white_crop = _center_crop(white_ref)
    
    # Stack pixels: (N, 3) float32
    nail_pixels = np.vstack([img.reshape(-1, 3) for img in nail_crops]).astype(np.float32)
    white_pixels = white_crop.reshape(-1, 3).astype(np.float32)
    
    # Sample if too many pixels
    if nail_pixels.shape[0] > 80000:
        idx = np.random.choice(nail_pixels.shape[0], 80000, replace=False)
        nail_pixels = nail_pixels[idx]
    if white_pixels.shape[0] > 80000:
        idx = np.random.choice(white_pixels.shape[0], 80000, replace=False)
        white_pixels = white_pixels[idx]
    
    features = {}
    
    # RGB channels
    nR, nG, nB = nail_pixels[:, 0], nail_pixels[:, 1], nail_pixels[:, 2]
    wR, wG, wB = white_pixels[:, 0], white_pixels[:, 1], white_pixels[:, 2]
    
    # Convert to other color spaces
    def to_hls(rgb):
        bgr = rgb.astype(np.uint8)[..., ::-1]
        hls = cv2.cvtColor(bgr.reshape(-1, 1, 3), cv2.COLOR_BGR2HLS).reshape(-1, 3)
        return hls[:, 0].astype(np.float32), hls[:, 1].astype(np.float32), hls[:, 2].astype(np.float32)
    
    def to_hsv(rgb):
        bgr = rgb.astype(np.uint8)[..., ::-1]
        hsv = cv2.cvtColor(bgr.reshape(-1, 1, 3), cv2.COLOR_BGR2HSV).reshape(-1, 3)
        return hsv[:, 0].astype(np.float32), hsv[:, 1].astype(np.float32), hsv[:, 2].astype(np.float32)
    
    def to_lab(rgb):
        bgr = rgb.astype(np.uint8)[..., ::-1]
        lab = cv2.cvtColor(bgr.reshape(-1, 1, 3), cv2.COLOR_BGR2LAB).reshape(-1, 3)
        return lab[:, 0].astype(np.float32), lab[:, 1].astype(np.float32), lab[:, 2].astype(np.float32)
    
    def to_yiq(rgb):
        rgb01 = rgb.astype(np.float32) / 255.0
        M = np.array([[0.299, 0.587, 0.114],
                      [0.5959, -0.2746, -0.3213],
                      [0.2115, -0.5227, 0.3112]], dtype=np.float32)
        yiq = rgb01 @ M.T
        return yiq[:, 0], yiq[:, 1], yiq[:, 2]
    
    nH_hls, nL_hls, nS_hls = to_hls(nail_pixels)
    wH_hls, wL_hls, wS_hls = to_hls(white_pixels)
    
    nH_hsv, nS_hsv, nV_hsv = to_hsv(nail_pixels)
    wH_hsv, wS_hsv, wV_hsv = to_hsv(white_pixels)
    
    nL_lab, nA_lab, nB_lab = to_lab(nail_pixels)
    wL_lab, wA_lab, wB_lab = to_lab(white_pixels)
    
    nY, nI, nQ = to_yiq(nail_pixels)
    wY, wI, wQ = to_yiq(white_pixels)
    
    nGray = nail_pixels.mean(axis=1)
    wGray = white_pixels.mean(axis=1)
    
    # Saturation fraction
    nail_u8 = nail_pixels.astype(np.uint8)
    white_u8 = white_pixels.astype(np.uint8)
    features[f'{prefix}_WHITE_Lab_L_MED'] = float(np.median(wL_lab))
    features[f'{prefix}_WHITE_sat_frac'] = float(np.mean((white_u8.min(axis=1) == 0) | (white_u8.max(axis=1) == 255)))
    features[f'{prefix}_NAIL_sat_frac'] = float(np.mean((nail_u8.min(axis=1) == 0) | (nail_u8.max(axis=1) == 255)))
    features[f'{prefix}_WHITE_gray_MED'] = float(np.median(wGray))
    
    # RGB features normalized by white
    for vals, wvals, name in [(nR, wR, 'R'), (nG, wG, 'G'), (nB, wB, 'B')]:
        features[f'{prefix}_{name}_MEAN'] = float(np.mean(vals) / (np.mean(wvals) + 1e-6))
        features[f'{prefix}_{name}_STD'] = float(np.std(vals) / (np.std(wvals) + 1e-6))
        for p in percentiles:
            features[f'{prefix}_{name}_p={p}'] = float(np.percentile(vals, p) / (np.percentile(wvals, p) + 1e-6))
    
    features[f'{prefix}_R-G_MEAN'] = features[f'{prefix}_R_MEAN'] - features[f'{prefix}_G_MEAN']
    features[f'{prefix}_R-B_MEAN'] = features[f'{prefix}_R_MEAN'] - features[f'{prefix}_B_MEAN']
    features[f'{prefix}_G-B_MEAN'] = features[f'{prefix}_G_MEAN'] - features[f'{prefix}_B_MEAN']
    features[f'{prefix}_R+B_MEAN'] = features[f'{prefix}_R_MEAN'] + features[f'{prefix}_B_MEAN']
    for p in percentiles:
        features[f'{prefix}_R+B_p={p}'] = features[f'{prefix}_R_p={p}'] + features[f'{prefix}_B_p={p}']
    
    # Color space features
    def add_space(n1, n2, n3, w1, w2, w3, space, channels):
        c1, c2, c3 = channels
        features[f'{prefix}_{space}_{c1}_MEDIAN'] = float(np.median(n1) / (np.median(w1) + 1e-6))
        features[f'{prefix}_{space}_{c2}_MEDIAN'] = float(np.median(n2) / (np.median(w2) + 1e-6))
        features[f'{prefix}_{space}_{c3}_MEDIAN'] = float(np.median(n3) / (np.median(w3) + 1e-6))
        for p in percentiles:
            features[f'{prefix}_{space}_{c1}_p={p}'] = float(np.percentile(n1, p) / (np.percentile(w1, p) + 1e-6))
            features[f'{prefix}_{space}_{c2}_p={p}'] = float(np.percentile(n2, p) / (np.percentile(w2, p) + 1e-6))
            features[f'{prefix}_{space}_{c3}_p={p}'] = float(np.percentile(n3, p) / (np.percentile(w3, p) + 1e-6))
    
    add_space(nH_hls, nL_hls, nS_hls, wH_hls, wL_hls, wS_hls, 'HLS', ('H', 'L', 'S'))
    add_space(nH_hsv, nS_hsv, nV_hsv, wH_hsv, wS_hsv, wV_hsv, 'HSV', ('H', 'S', 'V'))
    add_space(nL_lab, nA_lab, nB_lab, wL_lab, wA_lab, wB_lab, 'LAB', ('L', 'A', 'B'))
    
    # YIQ
    features[f'{prefix}_Y_MEDIAN'] = float(np.median(nY) / (np.median(wY) + 1e-6))
    features[f'{prefix}_I_MEDIAN'] = float(np.median(nI) / (np.median(wI) + 1e-6))
    features[f'{prefix}_Q_MEDIAN'] = float(np.median(nQ) / (np.median(wQ) + 1e-6))
    for p in percentiles:
        features[f'{prefix}_Y_p={p}'] = float(np.percentile(nY, p) / (np.percentile(wY, p) + 1e-6))
        features[f'{prefix}_I_p={p}'] = float(np.percentile(nI, p) / (np.percentile(wI, p) + 1e-6))
        features[f'{prefix}_Q_p={p}'] = float(np.percentile(nQ, p) / (np.percentile(wQ, p) + 1e-6))
    
    # Grayscale
    for p in percentiles:
        features[f'{prefix}_gsc_p={p}'] = float(np.percentile(nGray, p) / (np.percentile(wGray, p) + 1e-6))
    
    # Return as sorted array
    return np.array([features[k] for k in sorted(features.keys())], dtype=np.float32)

async def _upload_to_rgb(u: UploadFile) -> np.ndarray:
    buf = np.frombuffer(await u.read(), np.uint8)
    bgr = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if bgr is None:
        raise HTTPException(status_code=400, detail=f"Failed to decode {u.filename}")
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

def _expected_in_dim() -> int:
    if pre is None:
        return 512
    try:
        scaler = getattr(pre, "named_steps", {}).get("scaler", None)
        if scaler is not None and hasattr(scaler, "n_features_in_"):
            return int(scaler.n_features_in_)
    except Exception:
        pass
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

def _extract_nail_and_skin_regions(rgb_image: np.ndarray):
    """Extract nail and skin regions from image using fixed crops.
    Assumes user frames hand sideways with nails on left, palm/skin on right.
    """
    h, w = rgb_image.shape[:2]
    
    # Nail region: smaller, more centered box on left (fingernails only)
    nail_y_start = int(h * 0.30)
    nail_y_end = int(h * 0.70)
    nail_x_start = int(w * 0.10)
    nail_x_end = int(w * 0.35)
    nail_region = rgb_image[nail_y_start:nail_y_end, nail_x_start:nail_x_end]
    
    # Skin region: smaller, more centered box on right (palm/finger skin only)
    skin_y_start = int(h * 0.30)
    skin_y_end = int(h * 0.70)
    skin_x_start = int(w * 0.65)
    skin_x_end = int(w * 0.90)
    skin_region = rgb_image[skin_y_start:skin_y_end, skin_x_start:skin_x_end]
    
    return nail_region, skin_region

def _predict_from_images(rgb_images: list) -> float:
    """Extract embeddings and predict (embeddings-only model)."""
    if not rgb_images:
        raise HTTPException(status_code=400, detail="No images provided")
    
    # Rotate images 90° clockwise if portrait (assume users hold phone upright)
    rotated_images = []
    for img in rgb_images:
        h, w = img.shape[:2]
        if h > w:  # Portrait mode - rotate to landscape
            img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        rotated_images.append(img)
    
    # Extract 512-D embeddings for each full image
    embs = [_embed_rgb(img) for img in rotated_images]
    mean_emb = np.mean(np.stack(embs, axis=0), axis=0, dtype=np.float32).reshape(1, -1)
    
    # Debug logging
    print(f"Embedding stats: mean={np.mean(mean_emb):.3f}, std={np.std(mean_emb):.3f}")
    
    # Apply preprocessing pipeline (scaler + PCA)
    X = pre.transform(mean_emb) if pre is not None else mean_emb
    pred = float(model.predict(X)[0])
    print(f"Prediction: {pred:.2f} g/dL")
    return pred

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
    try:
        if not files:
            raise HTTPException(status_code=400, detail="Send 1–3 images via 'files'")
        rgb_images = []
        for f in files[:3]:
            rgb = await _upload_to_rgb(f)
            rgb_images.append(rgb)
        hb = _predict_from_images(rgb_images)
        return {"hb_pred": hb, "is_anemic": int(hb < THRESH), "num_images": len(rgb_images)}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.post("/predict-images")
async def predict_images(n1: UploadFile = File(None),
                         n2: UploadFile = File(None),
                         n3: UploadFile = File(None),
                         files: Optional[List[UploadFile]] = File(None)):
    try:
        imgs: List[UploadFile] = [u for u in (n1, n2, n3) if u is not None]
        if files:
            imgs.extend(files)
        if not imgs:
            raise HTTPException(status_code=400, detail="Provide n1/n2/n3 or 'files' (1–3 images)")
        imgs = imgs[:3]
        rgb_images = []
        for f in imgs:
            rgb = await _upload_to_rgb(f)
            rgb_images.append(rgb)
        hb = _predict_from_images(rgb_images)
        return {"hb_pred": hb, "is_anemic": int(hb < THRESH), "num_images": len(rgb_images)}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
