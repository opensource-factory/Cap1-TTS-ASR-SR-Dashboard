from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.configs.qwen_config import call_tts
from app.configs.config import get_llm_providers, get_tts_providers
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class VoiceBody(BaseModel):
    name: str
    language: str
    text: str
    instruct: str
    
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
    

@app.post("/tts")
def get_voice(body: VoiceBody):
    audio_buffer = call_tts(
        text=body.text,
        language=body.language,
        speaker=body.name,
        instruct=body.instruct,
    )
    return StreamingResponse(audio_buffer, media_type="audio/wav")