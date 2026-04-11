from pathlib import Path

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel


def main() -> None:
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device.startswith("cuda") else torch.float32

    model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
        device_map=device,
        dtype=dtype,
    )

    wavs, sample_rate = model.generate_custom_voice(
        text=(
            "こんにちは、私の名前は田中です。今日はとても良い天気で、"
            "散歩をしたいと思っています。公園に行き、木々の緑を眺めながら、"
            "花の香りを感じたいです。"
        ),
        language="Japanese",
        speaker="Ono_Anna",
    )

    output_path = Path(__file__).resolve().parent / "output.wav"
    sf.write(output_path, wavs[0], sample_rate)
    print(f"Saved audio to: {output_path}")


if __name__ == "__main__":
    main()
