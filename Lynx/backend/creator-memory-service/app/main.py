
# app/main.py

from fastapi import FastAPI, HTTPException, Depends
from starlette.middleware.cors import CORSMiddleware  # Starlette import avoids false Pylance warning
from fastapi.responses import RedirectResponse, Response
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

from .store import init_db, get_db, DB

# ---------------------------------------
# App
# ---------------------------------------
app = FastAPI(
    title="Creator Memory Service",
    version="0.1.0",
    description="Stores and retrieves creator history, preferences, and personalization logic",
)

# ---------------------------------------
# CORS
# ---------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hackathon-friendly
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------
# Utility routes
# ---------------------------------------
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.get("/healthz", include_in_schema=False)
def healthz():
    return {"status": "ok", "service": "creator-memory", "time": datetime.utcnow().isoformat()}

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

# ---------------------------------------
# DTOs (with request examples)
# ---------------------------------------
class PreferenceDTO(BaseModel):
    tone: Optional[Literal["playful","informative","inspirational","edgy","friendly"]] = "friendly"
    caption_length: Optional[Literal["short","medium","long"]] = "short"
    niche: Optional[str] = None
    banned_words: List[str] = []

    class Config:
        schema_extra = {
            "example": {
                "tone": "informative",
                "caption_length": "short",
                "niche": "food-review",
                "banned_words": ["spam"]
            }
        }

class CreatorDTO(BaseModel):
    id: str
    username: Optional[str] = None
    locale: Optional[str] = "en"
    timezone: Optional[str] = "Asia/Singapore"

    class Config:
        schema_extra = {
            "example": {
                "id": "creator_123",
                "username": "@coolkid",
                "locale": "en",
                "timezone": "Asia/Singapore"
            }
        }

class IngestMemoryDTO(BaseModel):
    creator_id: str
    platform: Literal["tiktok"]
    caption: str
    hashtags: List[str] = []
    performance: Optional[dict] = Field(default_factory=dict)

    class Config:
        schema_extra = {
            "example": {
                "creator_id": "creator_123",
                "platform": "tiktok",
                "caption": "Budget ramen hack 🍜",
                "hashtags": ["#ramen", "#budget"],
                "performance": {"views": 1200, "likes": 300}
            }
        }

class MemoryDTO(BaseModel):
    id: int
    creator_id: str
    caption: str
    hashtags: List[str]
    performance: dict
    created_at: datetime

class GenerationWebhookDTO(BaseModel):
    creator_id: str
    suggestion_id: str
    type: Literal["caption","hashtags","both"] = "both"
    suggested_caption: Optional[str] = None
    suggested_hashtags: List[str] = []
    model: Optional[str] = "gpt"
    meta: Optional[dict] = Field(default_factory=dict)

    class Config:
        schema_extra = {
            "example": {
                "creator_id": "creator_123",
                "suggestion_id": "sug_001",
                "type": "both",
                "suggested_caption": "Quick ramen hack 🍜",
                "suggested_hashtags": ["#ramen", "#sgfood"],
                "model": "gpt-4o-mini",
                "meta": {"prompt_tokens": 53}
            }
        }

class FeedbackDTO(BaseModel):
    creator_id: str
    suggestion_id: str
    action: Literal["approved","edited","rejected"]
    final_caption: Optional[str] = None
    final_hashtags: List[str] = []
    reason: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "creator_id": "creator_123",
                "suggestion_id": "sug_001",
                "action": "edited",
                "final_caption": "Budget ramen hack in 30s 🍜",
                "final_hashtags": ["#ramen", "#budget"],
                "reason": "tighten wording"
            }
        }

class PersonalizeQueryDTO(BaseModel):
    creator_id: str

    class Config:
        schema_extra = {
            "example": {
                "creator_id": "creator_123"
            }
        }

class PersonalizeResultDTO(BaseModel):
    creator_id: str
    guardrails: dict
    hints: dict
    examples: List[dict]

# ---------------------------------------
# Startup
# ---------------------------------------
@app.on_event("startup")
def on_startup():
    init_db()

# ---------------------------------------
# Routes (with response examples)
# ---------------------------------------
@app.put(
    "/creators/{creator_id}",
    response_model=CreatorDTO,
    responses={
        200: {
            "description": "Creator upserted",
            "content": {
                "application/json": {
                    "example": {
                        "id": "creator_123",
                        "username": "@coolkid",
                        "locale": "en",
                        "timezone": "Asia/Singapore"
                    }
                }
            }
        },
        400: {"description": "Bad request"}
    },
)
def upsert_creator(creator_id: str, payload: CreatorDTO, db: DB = Depends(get_db)):
    obj = db.upsert_creator(creator_id, payload.username, payload.locale, payload.timezone)
    return CreatorDTO(id=obj.id, username=obj.username, locale=obj.locale, timezone=obj.timezone)

@app.get(
    "/creators/{creator_id}",
    response_model=CreatorDTO,
    responses={
        200: {
            "description": "Creator record",
            "content": {
                "application/json": {
                    "example": {
                        "id": "creator_123",
                        "username": "@coolkid",
                        "locale": "en",
                        "timezone": "Asia/Singapore"
                    }
                }
            }
        },
        404: {"description": "Creator not found"},
    },
)
def get_creator(creator_id: str, db: DB = Depends(get_db)):
    obj = db.get_creator(creator_id)
    if not obj:
        raise HTTPException(404, "Creator not found")
    return CreatorDTO(id=obj.id, username=obj.username, locale=obj.locale, timezone=obj.timezone)

@app.get(
    "/creators/{creator_id}/preferences",
    response_model=PreferenceDTO,
    responses={
        200: {
            "description": "Current preferences",
            "content": {
                "application/json": {
                    "example": {
                        "tone": "informative",
                        "caption_length": "short",
                        "niche": "food-review",
                        "banned_words": ["spam"]
                    }
                }
            }
        },
        404: {"description": "Creator not found"},
    },
)
def get_preferences(creator_id: str, db: DB = Depends(get_db)):
    p = db.get_or_create_preferences(creator_id)
    return PreferenceDTO(
        tone=p.tone, caption_length=p.caption_length, niche=p.niche, banned_words=p.banned_words
    )

@app.put(
    "/creators/{creator_id}/preferences",
    response_model=PreferenceDTO,
    responses={
        200: {
            "description": "Updated preferences",
            "content": {
                "application/json": {
                    "example": {
                        "tone": "informative",
                        "caption_length": "short",
                        "niche": "food-review",
                        "banned_words": ["spam"]
                    }
                }
            }
        }
    },
)
def put_preferences(creator_id: str, payload: PreferenceDTO, db: DB = Depends(get_db)):
    p = db.update_preferences(creator_id, payload.dict())
    return PreferenceDTO(
        tone=p.tone, caption_length=p.caption_length, niche=p.niche, banned_words=p.banned_words
    )

@app.post(
    "/memories/ingest",
    response_model=MemoryDTO,
    responses={
        200: {
            "description": "Memory ingested",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "creator_id": "creator_123",
                        "caption": "Budget ramen hack 🍜",
                        "hashtags": ["#ramen", "#budget"],
                        "performance": {"views": 1200, "likes": 300},
                        "created_at": "2025-08-29T11:22:33.123456"
                    }
                }
            }
        },
        404: {"description": "Creator not found"},
    },
)
def ingest_memory(payload: IngestMemoryDTO, db: DB = Depends(get_db)):
    if not db.get_creator(payload.creator_id):
        raise HTTPException(404, "Creator not found")
    m = db.add_memory(payload.creator_id, payload.caption, payload.hashtags, payload.performance or {})
    return MemoryDTO(
        id=m.id, creator_id=m.creator_id, caption=m.caption,
        hashtags=m.hashtags, performance=m.performance, created_at=m.created_at
    )

@app.get(
    "/memories/{creator_id}",
    response_model=List[MemoryDTO],
    responses={
        200: {
            "description": "List of recent memories",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "creator_id": "creator_123",
                            "caption": "Budget ramen hack 🍜",
                            "hashtags": ["#ramen", "#budget"],
                            "performance": {"views": 1200, "likes": 300},
                            "created_at": "2025-08-29T11:22:33.123456"
                        }
                    ]
                }
            }
        },
        404: {"description": "Creator not found"},
    },
)
def list_memories(creator_id: str, db: DB = Depends(get_db)):
    if not db.get_creator(creator_id):
        raise HTTPException(404, "Creator not found")
    return [
        MemoryDTO(
            id=m.id, creator_id=m.creator_id, caption=m.caption,
            hashtags=m.hashtags, performance=m.performance, created_at=m.created_at
        )
        for m in db.list_memories(creator_id)
    ]

@app.post(
    "/webhooks/generation",
    responses={
        200: {
            "description": "Suggestion logged",
            "content": {"application/json": {"example": {"ok": True}}}
        },
        404: {"description": "Creator not found"},
    },
)
def log_generation(payload: GenerationWebhookDTO, db: DB = Depends(get_db)):
    if not db.get_creator(payload.creator_id):
        raise HTTPException(404, "Creator not found")
    db.log_suggestion(
        payload.creator_id, payload.suggestion_id,
        payload.suggested_caption, payload.suggested_hashtags,
        payload.model, payload.meta
    )
    return {"ok": True}

@app.post(
    "/feedback",
    responses={
        200: {
            "description": "Feedback recorded (and memory stored if approved/edited)",
            "content": {"application/json": {"example": {"ok": True}}}
        },
        404: {"description": "Unknown suggestion_id or creator mismatch"},
    },
)
def submit_feedback(payload: FeedbackDTO, db: DB = Depends(get_db)):
    log = db.get_suggestion(payload.suggestion_id)
    if not log or log.creator_id != payload.creator_id:
        raise HTTPException(404, "Unknown suggestion_id for this creator")
    db.save_feedback(
        payload.suggestion_id, payload.action,
        payload.final_caption, payload.final_hashtags, payload.reason
    )
    if payload.action in ("approved", "edited"):
        db.add_memory(payload.creator_id, payload.final_caption or "", payload.final_hashtags or [], {})
    return {"ok": True}

@app.post(
    "/personalize/suggestions",
    response_model=PersonalizeResultDTO,
    responses={
        200: {
            "description": "Personalization payload for FE/B1",
            "content": {
                "application/json": {
                    "example": {
                        "creator_id": "creator_123",
                        "guardrails": {
                            "tone": "informative",
                            "caption_length": "short",
                            "banned_words": ["spam"]
                        },
                        "hints": {
                            "preferred_hashtags": ["#ramen", "#budget"],
                            "niche": "food-review"
                        },
                        "examples": [
                            {
                                "caption": "Budget ramen hack 🍜",
                                "hashtags": ["#ramen", "#budget"],
                                "created_at": "2025-08-29T11:22:33.123456"
                            }
                        ]
                    }
                }
            }
        },
        404: {"description": "Creator not found"},
    },
)
def personalize(q: PersonalizeQueryDTO, db: DB = Depends(get_db)):
    p = db.get_or_create_preferences(q.creator_id)
    memories = db.list_memories(q.creator_id)
    top_hashtags = db.top_hashtags(q.creator_id, limit=5)
    guardrails = {
        "tone": p.tone,
        "caption_length": p.caption_length,
        "banned_words": p.banned_words,
    }
    hints = {
        "preferred_hashtags": [h for h in top_hashtags if h not in p.banned_words],
        "niche": p.niche,
    }
    examples = [
        {"caption": m.caption, "hashtags": m.hashtags, "created_at": m.created_at.isoformat()}
        for m in memories[:3]
    ]
    return PersonalizeResultDTO(
        creator_id=q.creator_id, guardrails=guardrails, hints=hints, examples=examples
    )

@app.get(
    "/analytics/inline",
    responses={
        200: {
            "description": "Tiny analytics summary",
            "content": {
                "application/json": {
                    "example": {
                        "memories": 3,
                        "feedback": {"approved": 1, "edited": 1, "rejected": 0}
                    }
                }
            }
        }
    },
)
def inline_analytics(creator_id: str, db: DB = Depends(get_db)):
    return db.inline_stats(creator_id)
