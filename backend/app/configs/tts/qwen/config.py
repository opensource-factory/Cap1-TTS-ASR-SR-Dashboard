import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel
import io
from typing import Iterator

def get_model(model_name:str):
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


def call_tts(text:str, language:str, speaker:str, instruct:str, model_name:str=None):
    
    if model_name is None:
        return "No model selected"
    
    
    model = get_model(model_name=model_name) 
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


def stream_tts(
    text: str,
    language: str,
    speaker: str,
    instruct: str,
    model_name: str = None,
    chunk_size: int = 4096,
) -> Iterator[bytes]:
    if model_name is None:
        raise ValueError("No model selected")

    model = get_model(model_name=model_name)
    wavs, sr = model.generate_custom_voice(
        text=text,
        language=language,
        speaker=speaker,
        instruct=instruct,
        # Per the official Qwen3-TTS implementation, this only simulates
        # streaming text input; Python package generation still returns
        # the full waveform before decode.
        non_streaming_mode=False,
    )

    buffer = io.BytesIO()
    sf.write(buffer, wavs[0], sr, format="WAV")
    buffer.seek(0)

    while chunk := buffer.read(chunk_size):
        yield chunk
    
    
