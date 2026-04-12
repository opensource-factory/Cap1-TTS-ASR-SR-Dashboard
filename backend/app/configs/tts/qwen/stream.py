
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
        non_streaming_mode=False,
    )

    buffer = io.BytesIO()
    sf.write(buffer, wavs[0], sr, format="WAV")
    buffer.seek(0)

    while chunk := buffer.read(chunk_size):
        yield chunk
    
    
