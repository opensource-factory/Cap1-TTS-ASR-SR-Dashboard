import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.configs.config import get_llm_providers
from app.configs.llm import router as llm_router
from app.configs.stream import router as stream_router


os.environ.setdefault("TTS_SERVICE_BASE_URL", "http://127.0.0.1:8001")

app = FastAPI(title="Cap1 LLM Service")
app.include_router(llm_router)
app.include_router(stream_router)

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
    return {"llm": get_llm_providers()}
