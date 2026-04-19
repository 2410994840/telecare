from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as analyze_router
from routes.trends import router as trends_router
from routes.schemes import router as schemes_router

app = FastAPI(title="TeleCare AI Service", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(analyze_router)
app.include_router(trends_router)
app.include_router(schemes_router)

@app.get("/health")
def health():
    return {"status": "ok"}
