<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Notes

- The homepage navbar is rendered from `app/page.js` via `./global_components/Navbar/Navbar`.
- The homepage shell is rendered through `app/global_components/Dashboard/dashboard.jsx`, which is now a thin entry component.
- Dashboard page composition lives in `app/global_components/Dashboard/components/DashboardLayout.jsx`.
- Dashboard state, config loading, derived selector state, `/tts` and `/chat` submissions, and audio URL cleanup live in `app/global_components/Dashboard/components/useDashboardState.js`.
- Dashboard endpoint and prompt-state helpers, including LLM provider/model parsing, live in `app/global_components/Dashboard/components/dashboardUtils.js`.
- `app/global_components/Navbar/Navbar.jsx` is presentational and manages only navbar UI state such as the mobile menu toggle.
- Shared navbar UI is split into `app/global_components/Navbar/components/`.
- `MobileNavbar.jsx` handles the small-screen hamburger menu and uses `public/hamburger.svg`.
- Navbar option mapping helpers and the info endpoint live in `app/global_components/Navbar/navbarUtils.js`.
- The frontend reads the backend info API from `.env.local` using `NEXT_PUBLIC_INFO_API_ENDPOINT`.
- The dashboard state hook currently fetches the `/info` payload and maps:
  - LLM providers/models into the `LLM Name` dropdown
  - TTS providers/models into the `TTS Name` dropdown
  - TTS voice metadata into `Voice Actor` and `Language`
- LLM dropdown values are stored as `provider:model` so the frontend can submit both:
  - `service_name` as the provider, such as `ollama`
  - `model` as the raw backend model id, such as `qwen3.5:0.8b`
- TTS dropdown labels remain `provider / model`, but the submitted TTS value must stay the raw backend model id such as `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice`; do not convert it to a `provider:model` token.
- If the selected language differs from the selected voice actor's preferred language, the navbar shows an accent warning.
- The bottom prompt bar lives in `app/global_components/Promptbar/` and is intentionally compact:
  - It stays fixed near the bottom of the screen inside a sticky footer container.
  - Its width is reduced compared with the main page container.
  - The `Instruct` field is shown only when the selected navbar mode includes TTS.
  - The think toggle is shown when the selected navbar mode includes LLM and uses `public/think_on.svg` and `public/think_off.svg`.
  - The pure LLM mode also shows a stream switch control in the prompt bar.
  - It uses `public/send.svg` while idle and `public/load.svg` while waiting for the API.
- The frontend derives backend endpoints from `NEXT_PUBLIC_INFO_API_ENDPOINT` by replacing `/info` with:
  - `/tts` for TTS-backed submits
  - `/chat` for pure LLM submits
- The frontend currently submits:
  - `POST /tts` with `{ service_name, name, language, text, instruct, model_name, stream }`
  - `POST /chat` with `{ service_name, user_chat, model, reason, stream }`
- The visual conversation area lives in `app/global_components/Visual/` and renders chat-style turns:
  - User prompt/instruct bubble on the right.
  - Generated audio or text response bubble on the left.
  - Each turn stores metadata including voice `name`, `language`, `ttsName`, optional `llmName`, optional think state, optional stream state, token counts when available, and `instruct`.
  - The visual pane owns scrolling and auto-scrolls to the newest turn while the sticky prompt bar stays visible.
- The user chat bubble styling lives in `app/global_components/Visual/components/UserMessageBubble.jsx` and currently uses an explicit purple treatment (`bg-violet-600` with white text and softer white metadata pills) instead of theme-derived white/black background colors.
- Audio responses are fetched as blobs from `/tts`, converted to object URLs in the dashboard layer, and revoked on cleanup.
- LLM responses from `/chat` are rendered as plain text bubbles in the visual conversation area.
- Non-stream `/chat` responses can include `reasoning_content`, `response_metadata`, and `usage_metadata`, and the frontend surfaces token counts from that metadata.
- When `/chat` is called with `stream: true`, the backend returns `application/x-ndjson` events for:
  - thinking deltas
  - content deltas
  - final metadata
- The frontend parses those events and can progressively render both the visible thinking panel and the final answer text while the request is still pending.
