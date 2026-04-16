from fastapi import FastAPI
from app.configs.config import get_llm_providers, get_tts_providers
from app.configs.llm import router as llm_router
from app.configs.stream import router as stream_router
from app.configs.tts import router as tts_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(llm_router)
app.include_router(stream_router)
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
    llm = get_llm_providers()
    tts = get_tts_providers()
    
    return {'llm':llm, 'tts':tts}
