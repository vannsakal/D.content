"""
Unified AI service for Meateka backend.
Backend team imports this ONE file to access all AI features.

Usage:
    from ai_service import AIService

    ai = AIService()

    # Main method: returns format matching backend team's API contract
    response = ai.generate_combined_response(category, product, target_audience, goal, platform, content_purpose)

    # Optimized method: same output, 1 API call instead of 4
    response = ai.generate_single_request(category, product, target_audience, goal, platform, content_purpose)
"""

import time

from content_idea.idea_generator import generate_content_idea
from caption.caption_generator import generate_caption, generate_captions_for_platforms
from hashtag.hashtag_generator import generate_hashtags
from shared.safety_check import is_content_safe
from shared.gemini_client import call_gemini, _extract_json
from shared.posting_times import ALL_PLATFORMS_POSTING
from shared.prompts import COMBINED_CONTENT_PROMPT_CREATOR, COMBINED_CONTENT_PROMPT_BUSINESS


class AIService:
    """Single entry point for all AI content generation features."""

    def generate_combined_response(
        self,
        category: str,
        product: str,
        target_audience: str,
        goal: str,
        platform: str,
        content_purpose: str = "Content Creator",
    ) -> dict:
        """
        Generate complete content plan in backend team's expected format.

        Args:
            category: Content category (e.g., "Beauty", "Food", "Gaming")
            product: Product or service name
            target_audience: Target audience description
            goal: "Maximize Reach", "Drive Sales", "Increase Followers", "Brand Awareness"
            platform: Primary platform ("TikTok", "Instagram", "Facebook")
            content_purpose: "Content Creator" or "Business Owner"

        Returns:
            {
              "idea": str,
              "title": str,
              "posting_times": {"TikTok": str, "Instagram": str, "Facebook": str},
              "captions": [
                {"platform": str, "caption": str, "hashtag": str},
                ...
              ],
              "ideas": [
                {
                  "idea_name": str,
                  "content_type": str,
                  "alternates": [
                    {"idea_name": str, "content_type": str},
                    ...
                  ]
                }
              ]
            }
        """
        idea_result = generate_content_idea(category, product, target_audience, goal, platform)

        if not idea_result.get("recommended_idea"):
            return self._empty_response()

        captions_result = generate_captions_for_platforms(
            content_idea=idea_result["recommended_idea"],
            platforms=["TikTok", "Instagram", "Facebook"],
            content_purpose=content_purpose,
            product=product,
        )

        return self._format_response(idea_result, captions_result)

    def generate_single_request(
        self,
        category: str,
        product: str,
        target_audience: str,
        goal: str,
        platform: str,
        content_purpose: str = "Content Creator",
    ) -> dict:
        """
        Generate complete content plan in ONE API call (optimized).

        Same output format as generate_combined_response(), but uses 1 API call
        instead of 4. Saves 75% of API quota.

        Args:
            category: Content category (e.g., "Beauty", "Food", "Gaming")
            product: Product or service name
            target_audience: Target audience description
            goal: "Maximize Reach", "Drive Sales", "Increase Followers", "Brand Awareness"
            platform: Primary platform ("TikTok", "Instagram", "Facebook")
            content_purpose: "Content Creator" or "Business Owner"

        Returns:
            Same format as generate_combined_response()
        """
        if content_purpose == "Business Owner":
            prompt = COMBINED_CONTENT_PROMPT_BUSINESS.format(
                category=category,
                product=product,
                target_audience=target_audience,
                goal=goal,
                platform=platform,
            )
        else:
            prompt = COMBINED_CONTENT_PROMPT_CREATOR.format(
                category=category,
                product=product,
                target_audience=target_audience,
                goal=goal,
                platform=platform,
            )

        for attempt in range(3):
            try:
                response = call_gemini(prompt)
                result = _extract_json(response.text)

                if not result.get("recommended_idea"):
                    return self._empty_response()

                result["best_posting_times"] = ALL_PLATFORMS_POSTING

                captions = result.get("captions", {})
                return self._format_single_response(result, captions)

            except Exception as e:
                print(f"[ai_service] Attempt {attempt + 1} failed: {e}")
                if attempt < 2:
                    time.sleep(3 * (attempt + 1))

        return self._empty_response()

    def _format_single_response(self, result: dict, captions: dict) -> dict:
        """Format single-request response to backend format."""

        captions_list = []
        for platform_name in ["TikTok", "Instagram", "Facebook"]:
            cap_data = captions.get(platform_name, {})
            caption_text = cap_data.get("caption", "")
            hashtags_list = cap_data.get("hashtags", [])
            hashtag_str = " ".join(f"#{h}" for h in hashtags_list)

            captions_list.append({
                "platform": platform_name,
                "caption": caption_text,
                "hashtag": hashtag_str,
            })

        alternates = []
        for alt_text in result.get("alternative_ideas", []):
            alternates.append({
                "idea_name": alt_text,
                "content_type": result.get("content_type", ""),
            })

        return {
            "idea": result.get("recommended_idea", ""),
            "title": result.get("content_type", ""),
            "posting_times": result.get("best_posting_times", {}),
            "captions": captions_list,
            "ideas": [
                {
                    "idea_name": result.get("recommended_idea", ""),
                    "content_type": result.get("content_type", ""),
                    "alternates": alternates,
                }
            ],
        }

    def generate_content_plan(
        self,
        category: str,
        product: str,
        target_audience: str,
        goal: str,
        platform: str,
        content_purpose: str = "Content Creator",
    ) -> dict:
        """Legacy method: returns internal format (for Gradio testing)."""
        idea = generate_content_idea(category, product, target_audience, goal, platform)

        if not idea.get("recommended_idea"):
            return {"idea": idea, "captions": {}}

        captions = generate_captions_for_platforms(
            content_idea=idea["recommended_idea"],
            platforms=["TikTok", "Instagram", "Facebook"],
            content_purpose=content_purpose,
            product=product,
        )

        return {"idea": idea, "captions": captions}

    def generate_content_idea(self, category: str, product: str, target_audience: str, goal: str, platform: str, retries: int = 2) -> dict:
        """Generate a content idea with posting times."""
        return generate_content_idea(category, product, target_audience, goal, platform, retries)

    def generate_caption(self, content_idea: str, platform: str, content_purpose: str = "Content Creator", product: str = "", retries: int = 2) -> dict:
        """Generate a caption for a single platform."""
        return generate_caption(content_idea, platform, content_purpose, product, retries)

    def generate_all_platforms(self, content_idea: str, content_purpose: str = "Content Creator", product: str = "") -> dict:
        """Generate captions for all 3 platforms."""
        return generate_captions_for_platforms(content_idea, ["TikTok", "Instagram", "Facebook"], content_purpose, product)

    def generate_hashtags(self, caption: str, platform: str, category: str = "General", num_hashtags: int = 8, retries: int = 2) -> list:
        """Generate hashtags for a caption."""
        return generate_hashtags(caption, platform, category, num_hashtags, retries)

    def check_safety(self, text: str, retries: int = 1) -> dict:
        """Check if content is safe."""
        return is_content_safe(text, retries)

    def _format_response(self, idea_result: dict, captions_result: dict) -> dict:
        """Convert internal format to backend team's expected format."""

        captions_list = []
        for platform_name in ["TikTok", "Instagram", "Facebook"]:
            cap_data = captions_result.get(platform_name, {})
            caption_text = cap_data.get("caption", "")
            hashtags_list = cap_data.get("hashtags", [])
            hashtag_str = " ".join(f"#{h}" for h in hashtags_list)

            captions_list.append({
                "platform": platform_name,
                "caption": caption_text,
                "hashtag": hashtag_str,
            })

        alternates = []
        for i, alt_text in enumerate(idea_result.get("alternative_ideas", [])):
            alternates.append({
                "idea_name": alt_text,
                "content_type": idea_result.get("content_type", ""),
            })

        return {
            "idea": idea_result.get("recommended_idea", ""),
            "title": idea_result.get("content_type", ""),
            "posting_times": idea_result.get("best_posting_times", {}),
            "captions": captions_list,
            "ideas": [
                {
                    "idea_name": idea_result.get("recommended_idea", ""),
                    "content_type": idea_result.get("content_type", ""),
                    "alternates": alternates,
                }
            ],
        }

    def _empty_response(self) -> dict:
        """Return empty response in backend format."""
        return {
            "idea": "",
            "title": "",
            "posting_times": {},
            "captions": [
                {"platform": "TikTok", "caption": "", "hashtag": ""},
                {"platform": "Instagram", "caption": "", "hashtag": ""},
                {"platform": "Facebook", "caption": "", "hashtag": ""},
            ],
            "ideas": [
                {
                    "idea_name": "",
                    "content_type": "",
                    "alternates": [],
                }
            ],
        }
