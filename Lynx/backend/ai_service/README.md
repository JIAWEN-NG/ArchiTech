# Python AI Backend (FastAPI)

A tiny FastAPI service that powers TikTok caption + trend suggestions for your Lynx frontend.

## Quick start

1) **Create a virtual env & install deps**

```bash
cd python-ai-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

2) **(Optional) Add a free Hugging Face API key**

- Create a free account: https://huggingface.co/
- Get a token: https://huggingface.co/settings/tokens
- Set environment variables:
  - `HF_API_KEY`: your token
  - `HF_MODEL` (optional): defaults to `mistralai/Mistral-7B-Instruct-v0.2`
  - `HF_URL`   (optional): fully qualified Inference API URL if you prefer another endpoint

3) **Run**

```bash
uvicorn app.main:app --host 0.0.0.0 --port 3001
```

4) **Test**

```bash
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{
  "message": "Give me 3 viral captions for a morning gym vlog",
  "context": "tiktok_caption_generation",
  "previousMessages": []
}'
```

> No HF key? The service still works with a deterministic offline fallback.

## Endpoints

- `GET  /health` – liveness check
- `POST /api/chat` – main endpoint the frontend calls, returns `{ reply: string }`
- `POST /api/creative/ideas` – (optional) returns `{ ideas: string[] }`

## Notes

- CORS is wide open for dev ease. Lock down in production.
- This service intentionally keeps the response as a single string so it plugs straight into your existing `ChatPanel.tsx` logic.