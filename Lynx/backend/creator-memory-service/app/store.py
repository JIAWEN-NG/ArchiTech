from typing import List, Optional, Dict
from dataclasses import dataclass
from datetime import datetime
from collections import Counter
import json, os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_URL = os.getenv("DB_URL", "sqlite:///./b2.sqlite3")
engine = create_engine(DB_URL, connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CreatorORM(Base):
    __tablename__ = "creators"
    id = Column(String, primary_key=True)
    username = Column(String, nullable=True)
    locale = Column(String, default="en")
    timezone = Column(String, default="Asia/Singapore")

class PreferenceORM(Base):
    __tablename__ = "preferences"
    creator_id = Column(String, primary_key=True)
    tone = Column(String, default="friendly")
    caption_length = Column(String, default="short")
    niche = Column(String, nullable=True)
    banned_words = Column(Text, default="[]")

class MemoryORM(Base):
    __tablename__ = "memories"
    id = Column(Integer, primary_key=True, autoincrement=True)
    creator_id = Column(String, index=True)
    caption = Column(Text, default="")
    hashtags = Column(Text, default="[]")
    performance = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

class SuggestionLogORM(Base):
    __tablename__ = "suggestion_logs"
    suggestion_id = Column(String, primary_key=True)
    creator_id = Column(String, index=True)
    suggested_caption = Column(Text, nullable=True)
    suggested_hashtags = Column(Text, default="[]")
    model = Column(String, default="gpt")
    meta = Column(Text, default="{}")
    status = Column(String, default="pending")
    final_caption = Column(Text, nullable=True)
    final_hashtags = Column(Text, default="[]")
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

@dataclass
class Creator: id: str; username: Optional[str]; locale: str; timezone: str
@dataclass
class Preference: tone: str; caption_length: str; niche: Optional[str]; banned_words: List[str]
@dataclass
class Memory: id: int; creator_id: str; caption: str; hashtags: List[str]; performance: Dict; created_at: datetime

class DB:
    def __init__(self):
        self.session = SessionLocal()

    def upsert_creator(self, id, username, locale, timezone):
        s=self.session; obj=s.query(CreatorORM).get(id)
        if not obj:
            obj=CreatorORM(id=id, username=username, locale=locale, timezone=timezone); s.add(obj)
        else:
            obj.username, obj.locale, obj.timezone = username, locale, timezone
        s.commit(); return Creator(obj.id,obj.username,obj.locale,obj.timezone)

    def get_creator(self,id):
        s=self.session; obj=s.query(CreatorORM).get(id)
        return Creator(obj.id,obj.username,obj.locale,obj.timezone) if obj else None

    def get_or_create_preferences(self,cid):
        s=self.session; p=s.query(PreferenceORM).get(cid)
        if not p: p=PreferenceORM(creator_id=cid); s.add(p); s.commit()
        return Preference(p.tone,p.caption_length,p.niche,json.loads(p.banned_words or "[]"))

    def update_preferences(self,cid,patch):
        s=self.session; p=s.query(PreferenceORM).get(cid)
        if not p: p=PreferenceORM(creator_id=cid); s.add(p)
        for k,v in patch.items():
            if v is None: continue
            setattr(p,k,json.dumps(v) if k=="banned_words" else v)
        s.commit(); return p

    def add_memory(self,cid,caption,hashtags,performance):
        s=self.session; m=MemoryORM(creator_id=cid,caption=caption or "",
            hashtags=json.dumps(hashtags or []), performance=json.dumps(performance or {}))
        s.add(m); s.commit()
        return Memory(m.id,m.creator_id,m.caption,json.loads(m.hashtags),json.loads(m.performance),m.created_at)

    def list_memories(self,cid):
        s=self.session
        rows=s.query(MemoryORM).filter(MemoryORM.creator_id==cid).order_by(MemoryORM.created_at.desc()).limit(50).all()
        return [Memory(r.id,r.creator_id,r.caption,json.loads(r.hashtags or "[]"),
                       json.loads(r.performance or "{}"),r.created_at) for r in rows]

    def top_hashtags(self,cid,limit=5):
        tags=[]; [tags.extend(m.hashtags) for m in self.list_memories(cid)]
        return [t for t,_ in Counter(tags).most_common(limit)]

    def log_suggestion(self,cid,sid,sc,sh,model,meta):
        s=self.session; row=s.query(SuggestionLogORM).get(sid)
        if not row:
            row=SuggestionLogORM(suggestion_id=sid,creator_id=cid,suggested_caption=sc,
                                 suggested_hashtags=json.dumps(sh or []),model=model,meta=json.dumps(meta or {}))
            s.add(row)
        else:
            row.suggested_caption=sc
            row.suggested_hashtags=json.dumps(sh or [])
            row.model=model
            row.meta=json.dumps(meta or {})
            row.updated_at=datetime.utcnow()
        s.commit()

    def get_suggestion(self,sid):
        return self.session.query(SuggestionLogORM).get(sid)

    def save_feedback(self,sid,action,fc,fh,reason):
        s=self.session; row=s.query(SuggestionLogORM).get(sid)
        if not row: return
        row.status=action; row.final_caption=fc; row.final_hashtags=json.dumps(fh or [])
        row.reason=reason; row.updated_at=datetime.utcnow(); s.commit()

    def inline_stats(self,cid):
        s=self.session
        total=s.query(MemoryORM).filter(MemoryORM.creator_id==cid).count()
        approved=s.query(SuggestionLogORM).filter(SuggestionLogORM.creator_id==cid,SuggestionLogORM.status=="approved").count()
        edited=s.query(SuggestionLogORM).filter(SuggestionLogORM.creator_id==cid,SuggestionLogORM.status=="edited").count()
        rejected=s.query(SuggestionLogORM).filter(SuggestionLogORM.creator_id==cid,SuggestionLogORM.status=="rejected").count()
        return {"memories":total,"feedback":{"approved":approved,"edited":edited,"rejected":rejected}}

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db=DB()
    try:
        yield db
    finally:
        db.session.close()
