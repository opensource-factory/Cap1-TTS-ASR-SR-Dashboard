import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel
import io

def get_model(model_name:str = "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"):
    try:
        model = Qwen3TTSModel.from_pretrained(
            model_name,
            device_map = "cuda:0",
            dtype=torch.bfloat16,
            attn_implementation="flash_attention_2"
        )
    except Exception:
        model = Qwen3TTSModel.from_pretrained(
            model_name,
            device_map = "cpu",
            dtype=torch.float32,
        )
    return model

model = get_model()

    

def call_tts(text:str, language:str, speaker:str, instruct:str, model_name:str=None):
    
    
    wavs, sr = model.generate_custom_voice(
        text = text,
        language = language,
        speaker = speaker,
        instruct = instruct
    )
    buffer = io.BytesIO()
    sf.write(buffer, wavs[0], sr, format="WAV")
    buffer.seek(0)
    
    return buffer
    
    
