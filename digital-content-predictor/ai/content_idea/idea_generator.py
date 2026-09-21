"""
Feature 1: Content Idea Recommendation
Takes Category, Product/Service, Target Audience, Goal, Platform
and returns a content idea + content type + best posting times.
"""

import json
import time

from shared.gemini_client import call_gemini, _extract_json
from shared.prompts import CONTENT_IDEA_PROMPT
from shared.posting_times import ALL_PLATFORMS_POSTING

VALID_CONTENT_TYPES = ["Short Video", "Image", "Carousel", "Text Post"]


def generate_content_idea(
    category: str,
    product: str,
    target_audience: str,
    goal: str,
    platform: str,
    retries: int = 2,
) -> dict:
    """
    Returns:
        {
          "recommended_idea": "...",
          "content_type": "Short Video",
          "alternative_ideas": ["...", "...", "..."],
          "best_posting_times": {"TikTok": "...", "Instagram": "...", "Facebook": "..."}
        }
        Returns an empty-shaped dict on failure so the frontend never crashes.
    """
    prompt = CONTENT_IDEA_PROMPT.format(
        category=category,
        product=product,
        target_audience=target_audience,
        goal=goal,
        platform=platform,
    )

    empty_result = {
        "recommended_idea": "",
        "content_type": "",
        "alternative_ideas": [],
        "best_posting_times": {},
    }

    for attempt in range(retries + 1):
        try:
            response = call_gemini(prompt)
            result = _extract_json(response.text)

            if result.get("content_type") not in VALID_CONTENT_TYPES:
                result["content_type"] = "Short Video"

            result["alternative_ideas"] = [
                i for i in result.get("alternative_ideas", []) if isinstance(i, str)
            ]

            result["best_posting_times"] = ALL_PLATFORMS_POSTING

            return result

        except Exception as e:
            print(f"[idea_generator] Attempt {attempt + 1} failed: {e}")
            if attempt < retries:
                time.sleep(3 * (attempt + 1))

    return empty_result


if __name__ == "__main__":
    result = generate_content_idea(
        category="Beauty",
        product="Facial Cleanser",
        target_audience="Women 25-34 interested in skincare",
        goal="Drive Sales",
        platform="TikTok",
    )
    print(result)
