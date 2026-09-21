"""
Caption & Hashtag Generation
Takes a content idea and writes platform-specific captions + hashtags,
branching on Content Creator vs Business Owner.
"""

import json
import time

from shared.gemini_client import call_gemini, _extract_json
from shared.prompts import CAPTION_PROMPT_CREATOR, CAPTION_PROMPT_BUSINESS
from shared.safety_check import is_content_safe, SafetyCheckUnavailable

VALID_PLATFORMS = ["TikTok", "Instagram", "Facebook"]
VALID_PURPOSES = ["Content Creator", "Business Owner"]


def generate_caption(
    content_idea: str,
    platform: str,
    content_purpose: str = "Content Creator",
    product: str = "",
    retries: int = 2,
) -> dict:
    if platform not in VALID_PLATFORMS:
        platform = "Instagram"

    if content_purpose not in VALID_PURPOSES:
        content_purpose = "Content Creator"

    if content_purpose == "Content Creator":
        prompt = CAPTION_PROMPT_CREATOR.format(
            content_idea=content_idea,
            platform=platform,
        )
    else:
        prompt = CAPTION_PROMPT_BUSINESS.format(
            content_idea=content_idea,
            product=product,
            platform=platform,
        )

    for attempt in range(retries + 1):
        try:
            response = call_gemini(prompt)
            result = _extract_json(response.text)
            caption = result.get("caption", "").strip()
            hashtags = [h.lstrip("#") for h in result.get("hashtags", []) if isinstance(h, str)]

            if not caption:
                raise ValueError("Empty caption returned")

            try:
                safety = is_content_safe(caption)
            except SafetyCheckUnavailable:
                safety = {"safe": True, "reason": "safety check unavailable, skipped"}

            return {"caption": caption, "hashtags": hashtags, "safety": safety}

        except Exception as e:
            print(f"[caption_generator] Attempt {attempt + 1} failed: {e}")
            if attempt < retries:
                time.sleep(3 * (attempt + 1))

    return {"caption": "", "hashtags": [], "safety": {"safe": False, "reason": "generation failed"}}


def generate_captions_for_platforms(
    content_idea: str,
    platforms: list[str],
    content_purpose: str = "Content Creator",
    product: str = "",
) -> dict:
    return {
        platform: generate_caption(content_idea, platform, content_purpose, product)
        for platform in platforms
        if platform in VALID_PLATFORMS
    }


if __name__ == "__main__":
    print(generate_caption(
        content_idea="3 Common Skincare Mistakes Wrecking Your Barrier",
        platform="TikTok",
        content_purpose="Content Creator",
    ))
