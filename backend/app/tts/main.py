from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.configs.config import get_tts_providers
from app.configs.tts import router as tts_router


app = FastAPI(title="Cap1 TTS Service")
app.include_router(tts_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": 200, "message": "OK"}


@app.get("/info")
def get_info():
    return {"tts": get_tts_providers()}
