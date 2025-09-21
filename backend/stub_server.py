from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from typing import List, Optional

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time
    t0 = time.time()
    ct = request.headers.get("content-type")
    resp = await call_next(request)
    print(f"{request.method} {request.url.path} ct={ct} -> {resp.status_code} {int((time.time()-t0)*1000)}ms")
    return resp

@app.get("/health")
def health():
    return {"status": "ok", "mode": "stub_testing"}

# --- TEMP STUB: accepts 0–3 files and responds instantly
@app.post("/analyze")
@app.post("/predict-images")
async def analyze_stub(files: Optional[List[UploadFile]] = File(None),
                       n1: Optional[UploadFile] = File(None),
                       n2: Optional[UploadFile] = File(None),
                       n3: Optional[UploadFile] = File(None)):
    n = (len(files) if files else 0) + sum(f is not None for f in (n1, n2, n3))
    print(f"[STUB] Received {n} files")
    return {"ok": True, "num_images": n, "hb_pred": 13.2, "is_anemic": 0}

if __name__ == "__main__":
    import uvicorn
    print("Starting STUB server on http://0.0.0.0:8002")
    uvicorn.run(app, host="0.0.0.0", port=8002)
