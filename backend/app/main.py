from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.configs.tts.qwen.config import call_tts
from app.configs.config import get_llm_providers, get_tts_providers
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class VoiceBody(BaseModel):
    name: str
    language: str
    text: str
    instruct: str
    model_name:str


def normalize_tts_model_name(raw_model_name: str) -> str:
    available_models = {
        model
        for provider in get_tts_providers()
        for model in provider.get("models", [])
    }

    candidate = (raw_model_name or "").strip().replace("CustonVoice", "CustomVoice")
    if candidate in available_models:
        return candidate

    if ":" in candidate:
        _, _, suffix = candidate.partition(":")
        suffix = suffix.strip().replace("CustonVoice", "CustomVoice")
        if suffix in available_models:
            return suffix

    raise HTTPException(status_code=400, detail=f"Unsupported TTS model: {raw_model_name}")
    
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
        model_name=normalize_tts_model_name(body.model_name),
    )
    return StreamingResponse(audio_buffer, media_type="audio/wav")
