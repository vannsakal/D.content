"""
Standalone hashtag generator — useful when the Backend needs just
hashtags without regenerating the whole caption.
"""

import json
import time

from shared.gemini_client import call_gemini, _extract_json

VALID_PLATFORMS = ["TikTok", "Instagram", "Facebook"]

HASHTAG_PROMPT = """You are a social media hashtag strategist.

Content topic/caption: "{caption}"
Category: {category}
Platform: {platform}

Suggest {num_hashtags} relevant hashtags for this content on {platform}.
Mix broad reach tags with a couple of niche/specific ones.

Return ONLY valid JSON in this format, nothing else:
{{"hashtags": ["tag1", "tag2", ...]}}
"""


def generate_hashtags(
    caption: str,
    platform: str,
    category: str = "General",
    num_hashtags: int = 8,
    retries: int = 2,
) -> list[str]:
    if platform not in VALID_PLATFORMS:
        platform = "Instagram"

    prompt = HASHTAG_PROMPT.format(
        caption=caption.strip(),
        category=category,
        platform=platform,
        num_hashtags=num_hashtags,
    )

    for attempt in range(retries + 1):
        try:
            response = call_gemini(prompt)
            result = _extract_json(response.text)
            hashtags = result.get("hashtags", [])
            return [h for h in hashtags if isinstance(h, str)][:num_hashtags]

        except Exception as e:
            print(f"[hashtag_generator] Attempt {attempt + 1} failed: {e}")
            if attempt < retries:
                time.sleep(3 * (attempt + 1))

    return []


if __name__ == "__main__":
    print(generate_hashtags(
        caption="3 Common Skincare Mistakes Wrecking Your Barrier",
        platform="TikTok",
        category="Beauty",
    ))
