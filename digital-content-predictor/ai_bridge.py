"""
HTTP bridge so the Node backend can run both Python pipelines in one call:
  - predict_ml_plan            (predictor.py)  -> performance / platform / time / platform_predictions
  - generate_combined_response (ai_service.py) -> idea / title / captions / ideas+alternates

Run from the repo root (so `ml.*`, `content_idea.*`, `shared.*` all import):
    pip install fastapi uvicorn
    uvicorn ai_bridge:app --host 127.0.0.1 --port 8000
"""

import sys
from pathlib import Path
from typing import List, Literal, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# This file is assumed to sit at the repo root, next to ./ai and ./ml.
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "backend" / "app"))          # makes `ml.*` importable
sys.path.insert(0, str(ROOT / "ai"))   # makes ai_service.py's own imports (content_idea, caption, hashtag, shared) importable

from ai_service import AIService  # resolves to ./ai/ai_service.py
from ml.prediction.predictor import predict_ml_plan  # resolves to ./ml/prediction/predictor.py

app = FastAPI()
ai = AIService()


@app.get("/")
def health():
    return {"status": "ok"}


class PlanInput(BaseModel):
    plan_purpose: Literal["Content Creator", "Business", "Existing Content"]
    product_name: str
    product_category: str
    product_description: Optional[str] = None
    demographics_age: str
    demographics_gender: Optional[Literal["Women", "Men", "All"]] = "All"
    interests: List[str] = Field(min_length=1)
    audience_description: Optional[str] = None
    plan_goal: str
    plan_channel: Literal["TikTok", "Instagram", "Facebook"]


def build_target_audience(p: PlanInput) -> str:
    """Flatten the audience fields into the single string ai_service expects."""
    gender = "people of all genders" if p.demographics_gender in (None, "All") else p.demographics_gender
    text = f"{gender} aged {p.demographics_age}, interested in {', '.join(p.interests)}"
    if p.audience_description:
        text += f". {p.audience_description}"
    return text


@app.post("/recommendation")
def recommendation(p: PlanInput):
    # ai_service only knows "Content Creator" / "Business Owner"
    content_purpose = "Business Owner" if p.plan_purpose == "Business" else "Content Creator"

    # 1. ML (fast, no API quota). predictor ignores the non-ML fields (age, interests, ...)
    try:
        ml = predict_ml_plan(p.model_dump())  # use p.dict() on pydantic v1
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML prediction failed: {e}")

    # 2. Gemini content generation (retries internally, then returns an empty response)
    content = ai.generate_combined_response(
        category=p.product_category,
        product=p.product_name,
        target_audience=build_target_audience(p),
        goal=p.plan_goal,
        platform=p.plan_channel,
        content_purpose=content_purpose,
    )
    if not content.get("idea"):
        raise HTTPException(status_code=502, detail="AI generation returned an empty result")

    return {"ml": ml, "ai": content}