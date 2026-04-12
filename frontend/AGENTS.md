<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Notes

- The homepage navbar is rendered from `app/page.js` via `./global_components/Navbar/Navbar`.
- The homepage shell is now rendered through `app/global_components/Dashboard/dashboard.jsx`, which coordinates navbar state, the prompt bar, the visual chat history, and `/tts` submissions.
- Navbar state and data fetching live in `app/global_components/Navbar/Navbar.jsx`.
- Shared navbar UI is split into `app/global_components/Navbar/components/`.
- `MobileNavbar.jsx` handles the small-screen hamburger menu and uses `public/hamburger.svg`.
- Navbar option mapping helpers and the info endpoint live in `app/global_components/Navbar/navbarUtils.js`.
- The frontend reads the backend info API from `.env.local` using `NEXT_PUBLIC_INFO_API_ENDPOINT`.
- The navbar currently fetches the `/info` payload and maps:
  - LLM providers/models into the `LLM Name` dropdown
  - TTS providers/models into the `TTS Name` dropdown
  - TTS voice metadata into `Voice Actor` and `Language`
- TTS dropdown labels remain `provider / model`, but the submitted TTS value must stay the raw backend model id such as `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice`; do not convert it to a `provider:model` token.
- If the selected language differs from the selected voice actor's preferred language, the navbar shows an accent warning.
- The bottom prompt bar lives in `app/global_components/Promptbar/` and is intentionally compact:
  - It stays anchored near the bottom of the screen.
  - Its width is reduced compared with the main page container.
  - The `Instruct` field is shown only when the selected navbar mode includes TTS.
  - It uses `public/send.svg` while idle and `public/load.svg` while waiting for the API.
- The frontend derives the backend `POST /tts` endpoint from `NEXT_PUBLIC_INFO_API_ENDPOINT` by replacing `/info` with `/tts`.
- The visual conversation area lives in `app/global_components/Visual/` and renders chat-style turns:
  - User prompt/instruct bubble on the right.
  - Generated audio bubble on the left.
  - Each turn stores metadata including voice `name`, `language`, `ttsName`, and `instruct`.
- The user chat bubble styling lives in `app/global_components/Visual/components/UserMessageBubble.jsx` and currently uses an explicit purple treatment (`bg-violet-600` with white text and softer white metadata pills) instead of theme-derived white/black background colors.
- Audio responses are fetched as blobs from `/tts`, converted to object URLs in the dashboard layer, and revoked on cleanup.
