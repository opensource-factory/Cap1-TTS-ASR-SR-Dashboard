# Cap1 TTS ASR SR Dashboard

Cap1 is a local multimodal dashboard for experimenting with text-to-speech, large language models, and combined voice streaming workflows from a single UI. The project is split into a `Next.js` frontend and a `FastAPI` backend, with support for standalone TTS, standalone LLM chat, and a `TTS+LLM` mode that streams generated voice responses back to the interface.

## What It Does

- Run pure `TTS` generation with selectable voice, language, and model.
- Run pure `LLM` chat with optional streaming and reasoning output.
- Run `TTS+LLM` combined generation where the backend produces LLM output and turns it into streamed speech.
- Discover available models and voices dynamically from the backend with `/info`.
- Work with multiple providers defined in `backend/app/configs/config.yaml`.

## Supported Providers

Current providers configured in this repo:

- LLM: `ollama`, `claude`, `gemini`
- TTS: `Qwen`, `Kokoro`

Example configured models:

- LLM: `qwen3-coder-next:latest`, `gemma4:latest`, `qwen3-coder:latest`, `qwen3.5:0.8b`, `gemma4:e4b`, `opus-4.6`, `sonnet-4.6`, `gemini-3-flash-preview`
- TTS: `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice`, `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`, `kokoro`

## Project Structure

```text
.
├── backend/   # FastAPI APIs for /info, /health, /chat, /tts, /stream
├── frontend/  # Next.js dashboard UI
└── README.md
```

## Screenshots

### TTS Dashboard

Shows the TTS-only workflow with model, voice actor, and language selection.

![TTS dashboard](<./images//Screenshot 2026-04-16 at 4.37.32 PM.png>)

### TTS Audio Result

Shows a generated speech response returned as an audio player in the dashboard.

![TTS audio result](<./images/Screenshot 2026-04-16 at 4.38.38 PM.png>)

### LLM Response View

Shows the LLM-only workflow with streamed text response and token metadata.

![LLM response view](<./images/Screenshot 2026-04-16 at 4.39.26 PM.png>)

### Combined TTS + LLM Streaming

Shows the combined voice workflow where the model generates a response and the dashboard streams audio playback while preserving the final transcript.

![Combined streaming view](<./images/Screenshot 2026-04-16 at 4.40.02 PM.png>)

## Getting Started

### Backend

Create and activate a virtual environment, then install PyTorch first and the general dependencies after that:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements_torch.txt
pip install -r requirements_general.txt
```

Run the split services in separate shells:

```bash
cd backend
source .venv/bin/activate
uvicorn app.tts.main:app --reload --host 0.0.0.0 --port 8001
```

```bash
cd backend
source .venv/bin/activate
uvicorn app.llm.main:app --reload --host 0.0.0.0 --port 8000
```

The LLM service expects the TTS service at `http://127.0.0.1:8001` by default. Set `TTS_SERVICE_BASE_URL` if you want to point it elsewhere.

Backend routes exposed by the split services:

- LLM service: `GET /health`, `GET /info`, `POST /chat`, `POST /stream`
- TTS service: `GET /health`, `GET /info`, `POST /tts`

For the legacy all-in-one backend, `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` still works.

### Frontend

Install dependencies, point the frontend at the backend `/info` endpoint, and start the dashboard:

```bash
cd frontend
npm install
printf 'NEXT_PUBLIC_INFO_API_ENDPOINT=http://localhost:8000/info\n' > .env.local
npm run dev
```

The frontend runs with `next dev --webpack`, which is the current project default.

## API Overview

### `GET /info`

Returns the configured LLM and TTS providers, models, and available voices so the frontend can build its selectors dynamically.

### `POST /chat`

Runs LLM inference.

Example payload:

```json
{
  "service_name": "ollama",
  "user_chat": "Tell me a short story in less than 300 words",
  "model": "qwen3-coder-next:latest",
  "stream": true,
  "reason": false
}
```

### `POST /tts`

Runs TTS inference and returns `audio/wav`.

Example payload:

```json
{
  "service_name": "qwen",
  "name": "aiden",
  "language": "english",
  "text": "Hello, how are you?",
  "instruct": "",
  "model_name": "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
  "stream": false
}
```

### `POST /stream`

Runs combined `LLM + TTS` generation and returns an `application/x-ndjson` stream for the dashboard voice experience.

Example payload:

```json
{
  "llm_service_name": "ollama",
  "llm_model": "qwen3.5:0.8b",
  "user_chat": "Tell another story in less than 100 words",
  "reason": false,
  "tts_service_name": "kokoro",
  "name": "af_heart",
  "language": "english",
  "instruct": "",
  "tts_model_name": "kokoro"
}
```

## Configuration Notes

- Provider definitions live in [backend/app/configs/config.yaml](/mnt/data/linux-data/Cap1-TTS-ASR-SR-Dashboard/backend/app/configs/config.yaml:1).
- The frontend derives `/chat`, `/tts`, and `/stream` from `NEXT_PUBLIC_INFO_API_ENDPOINT`, so only the `/info` URL needs to be configured.
- `ollama` requires a reachable local Ollama server if you use the local models declared in the config.
- Some cloud model providers in `config.yaml` may still need real API keys or endpoint values before they can be used.

## Development Notes

- Frontend app code lives under `frontend/app`.
- Backend entrypoint is [backend/app/main.py](/mnt/data/linux-data/Cap1-TTS-ASR-SR-Dashboard/backend/app/main.py:1).
- Python dependencies are split between `requirements_torch.txt` and `requirements_general.txt`.
