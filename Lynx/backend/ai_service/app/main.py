from dotenv import load_dotenv
load_dotenv()  # loads variables from .env into process env
import os
from typing import List, Optional, Literal, Any, Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

# ------------------------------
# Config
# ------------------------------
HF_API_KEY = os.getenv("HF_API_KEY", "").strip()

# Good free choices:
# - HuggingFaceH4/zephyr-7b-beta (recommended default)
# - mistralai/Mistral-7B-Instruct-v0.3
HF_MODEL = os.getenv("HF_MODEL", "HuggingFaceH4/zephyr-7b-beta").strip()

def _hf_url_for(model: str) -> str:
    return f"https://api-inference.huggingface.co/models/{model}"

HF_URL = os.getenv("HF_URL", _hf_url_for(HF_MODEL)).strip()

APP_ENV = os.getenv("APP_ENV", "dev")
PORT = int(os.getenv("PORT", "3002"))

# ------------------------------
# App
# ------------------------------
app = FastAPI(title="Caption & Trends AI Service", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Schemas
# ------------------------------
class Message(BaseModel):
    # Accept incoming JSON key "from" while using Python-safe name from_
    text: str
    from_: Literal["user", "bot"] = Field(alias="from")

    class Config:
        # allow population by field alias (so {"from": "..."} works)
        populate_by_name = True

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    previousMessages: List[Message] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str
    captions: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None
    trends: Optional[List[str]] = None

class CaptionRequest(BaseModel):
    topic: str
    tone: Optional[str] = None
    niche: Optional[str] = None
    count: int = 5

class CaptionResponse(BaseModel):
    captions: List[str]

class TrendsResponse(BaseModel):
    trends: List[str]

class IdeaRequest(BaseModel):
    topic: str
    style: Optional[str] = None
    audience: Optional[str] = None
    platform: Optional[Literal["tiktok","instagram","youtube","facebook"]] = "tiktok"

class IdeasResponse(BaseModel):
    ideas: List[str]

# ------------------------------
# Prompting helpers
# ------------------------------
def build_prompt(user_message: str, context: Optional[str], history: List[Message]) -> str:
    # Compress recent history into a short conversation transcript
    lines = []
    for m in history[-6:]:
        role = "User" if m.from_ == "user" else "Assistant"
        lines.append(f"{role}: {m.text}")
    history_block = "\n".join(lines) if lines else "No prior context."

    wants_captions = (context or "").lower().startswith("tiktok_caption") or "caption" in user_message.lower()
    task = (
        "Generate 3 catchy, on-brand TikTok caption options with strong hooks and a line of suggested hashtags."
        if wants_captions
        else "Suggest 5 timely trend ideas/formats the creator could try, each 1 sentence max with a suggested hashtag."
    )

    sys = (
        "You are an expert short-form content strategist. "
        "Be punchy and concrete. Keep each line short. "
        "Avoid quotes around outputs. Use emojis sparingly but effectively. "
        "If the user asks for captions, produce exactly 3 numbered caption options followed by a 'Hashtags:' line. "
        "If the user asks for trends, produce exactly 5 bullet-point trend suggestions with a suggested hashtag for each."
    )

    prompt = (
        f"{sys}\n\n"
        f"Recent conversation:\n{history_block}\n\n"
        f"Task: {task}\n"
        f"User: {user_message}\n"
        f"Assistant:"
    )
    return prompt

def craft_caption_prompt(topic: str, tone: Optional[str], niche: Optional[str], count: int) -> str:
    tone = tone or "engaging"
    niche = niche or "TikTok"
    return (
        f"You are an expert {niche} copywriter. "
        f"Write {count} concise TikTok captions in a {tone} tone for the topic: {topic!r}. "
        "Each caption must be ≤120 characters, include 1–3 relevant hashtags (avoid #fyp spam), "
        "and optionally a short CTA. Return as a simple list."
    )

def craft_trend_prompt(niche: Optional[str]) -> str:
    niche = niche or "general TikTok"
    return (
        f"List 7 timely content trends in {niche}. For each, give a 3–6 word title only. "
        "Avoid dates; be evergreen but relevant."
    )

def extract_list_lines(text: str, limit: int = 10) -> List[str]:
    raw = [l.strip() for l in text.splitlines() if l.strip()]
    out: List[str] = []
    for l in raw:
        l = l.lstrip("-•*0123456789.) ").strip()
        out.append(l)
    # De-dupe
    seen = set()
    deduped = []
    for s in out:
        if s not in seen:
            seen.add(s)
            deduped.append(s)
    return deduped[:limit]

# ------------------------------
# HF client
# ------------------------------
async def hf_generate(prompt: str, max_new_tokens: int = 220) -> Optional[str]:
    if not HF_API_KEY:
        return None  # No key configured, caller should fallback

    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_new_tokens,
            "temperature": 0.8,
            "top_p": 0.9,
            "repetition_penalty": 1.05,
            "return_full_text": False,
        },
        "options": {
            "use_cache": True,
            "wait_for_model": True
        }
    }
    timeout = httpx.Timeout(60.0, read=60.0, write=30.0, connect=15.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            r = await client.post(HF_URL, headers=headers, json=payload)
            # many HF free models may 503 while spinning up; treat as soft-fail
            if r.status_code >= 400:
                return None
            data = r.json()
        except Exception:
            return None

    # HF responses vary: list of dicts with "generated_text", or a dict
    if isinstance(data, list) and data and isinstance(data[0], dict):
        text = data[0].get("generated_text") or data[0].get("summary_text")
        return text
    if isinstance(data, dict):
        return data.get("generated_text") or data.get("summary_text")
    return None

def offline_fallback(user_message: str) -> str:
    lower = user_message.lower()
    if "trend" in lower:
        return "\n".join([
            "• Behind-the-scenes 10s cut with a reveal — try #BTS",
            "• 'I tried X so you don’t have to' quick review — try #HonestReview",
            "• 3 fast tips with on-screen text — try #ProTips",
            "• 'Day in the life' montage with time stamps — try #DayInMyLife",
            "• Before/After transformation with beat drop — try #GlowUp",
        ])
    return (
        "1) Stop scrolling! You won’t believe this… 🔥\n"
        "2) POV: You finally try the hack everyone’s talking about 👀\n"
        "3) This changed my results in 7 days. Here’s how ⬇️\n"
        "Hashtags: #viral #howto #creator"
    )

# ------------------------------
# Routes
# ------------------------------
@app.get("/")
def root():
    return {"ok": True, "message": "AI service running. See /health."}

@app.get("/debug/env")
def debug_env():
    # show if key is present without leaking it
    key = os.getenv("HF_API_KEY", "")
    masked = f"{key[:7]}…{key[-4:]}" if key else ""
    return {
        "HF_MODEL": os.getenv("HF_MODEL", ""),
        "HF_API_KEY_present": bool(key),
        "HF_API_KEY_masked": masked
    }

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-service", "env": APP_ENV, "model": HF_MODEL}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # simple intent routing (captions/trends vs general chat)
    wants_captions = (req.context or "").lower().startswith("tiktok_caption") or "caption" in req.message.lower()
    wants_trends = any(k in req.message.lower() for k in ["trend", "trending", "ideas", "content ideas"])

    if wants_captions:
        prompt = craft_caption_prompt(req.message, "engaging", req.context or "TikTok", 5)
        gen = await hf_generate(prompt) or offline_fallback("captions")
        captions = extract_list_lines(gen, limit=5)
        return ChatResponse(reply="Here are caption ideas 👇", captions=captions)

    if wants_trends:
        prompt = craft_trend_prompt(req.context or "TikTok")
        gen = await hf_generate(prompt) or offline_fallback("trend ideas")
        trends = extract_list_lines(gen, limit=7)
        return ChatResponse(reply="Here are trend ideas 👇", trends=trends[:5])

    # default: general assistant reply
    prompt = build_prompt(req.message, req.context, req.previousMessages or [])
    text = await hf_generate(prompt) or offline_fallback(req.message)
    text = text.strip()
    if len(text) > 2200:
        text = text[:2200].rstrip() + "…"
    return ChatResponse(reply=text)

@app.post("/api/captions/generate", response_model=CaptionResponse)
async def captions_generate(req: CaptionRequest):
    prompt = craft_caption_prompt(req.topic, req.tone, req.niche, req.count)
    gen = await hf_generate(prompt) or offline_fallback("captions")
    captions = extract_list_lines(gen, limit=req.count or 5)
    if not captions:
        captions = [gen.strip()]
    return CaptionResponse(captions=captions[: req.count])

@app.get("/api/trends", response_model=TrendsResponse)
async def get_trends(niche: Optional[str] = None):
    prompt = craft_trend_prompt(niche)
    gen = await hf_generate(prompt) or offline_fallback("trend ideas")
    trends = extract_list_lines(gen, limit=7)
    if not trends:
        trends = [
            "30-sec micro-storytime",
            "Before/After quick cuts",
            "First-person POV reactions",
            "Daily mini-vlog routine",
            "Duet challenge spin-offs",
            "Superfast recipe edits",
            "Mini explainers with captions",
        ]
    return TrendsResponse(trends=trends[:7])

# Optional explicit idea endpoint (handy later)
@app.post("/api/creative/ideas", response_model=IdeasResponse)
async def creative_ideas(req: IdeaRequest):
    seed = f"Platform: {req.platform}. Audience: {req.audience or 'general'}. Style: {req.style or 'default'}. Topic: {req.topic}."
    prompt = (
        "Suggest 5 creative short-form content ideas. "
        "Each idea must be a single-line, concrete, and include one suggested hashtag.\n"
        f"{seed}\nIdeas:"
    )
    text = await hf_generate(prompt) or offline_fallback("trend ideas")
    ideas = [line.lstrip("-•*0123456789.) ").strip() for line in text.splitlines() if line.strip()]
    return IdeasResponse(ideas=ideas[:5])

# Entrypoint for local run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
