"""
One shared Gemini connection with key rotation, model fallback,
exponential backoff, request queue, caching, and quota tracking.
"""

import json
import os
import random
import threading
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from google import genai

load_dotenv()

MODELS = [
    "gemini-3.1-flash-lite",
]

API_KEYS = [
    os.environ.get("GOOGLE_API_KEY_1", ""),
    os.environ.get("GOOGLE_API_KEY_2", ""),
    os.environ.get("GOOGLE_API_KEY_3", ""),
    os.environ.get("GOOGLE_API_KEY_4", ""),
    os.environ.get("GOOGLE_API_KEY_5", ""),
]
API_KEYS = [k for k in API_KEYS if k]

_current_key_index = 0
_lock = threading.Lock()
_cache = {}
_exhausted_keys = set()
_last_reset_date = datetime.now().date()


def _reset_exhausted_if_new_day():
    global _last_reset_date, _exhausted_keys
    today = datetime.now().date()
    if today > _last_reset_date:
        _exhausted_keys.clear()
        _last_reset_date = today
        print("[gemini_client] New day — cleared exhausted key tracking")


def get_client():
    global _current_key_index
    if _current_key_index >= len(API_KEYS):
        _current_key_index = 0
    return genai.Client(api_key=API_KEYS[_current_key_index])


def rotate_key():
    global _current_key_index
    _current_key_index = (_current_key_index + 1) % len(API_KEYS)
    print(f"[gemini_client] Rotated to key {_current_key_index + 1}/{len(API_KEYS)}")


def _all_keys_exhausted():
    return len(_exhausted_keys) >= len(API_KEYS)


def call_gemini(prompt: str, max_key_rotations: int = None):
    global _current_key_index

    _reset_exhausted_if_new_day()

    if _all_keys_exhausted():
        raise RuntimeError(
            f"All {len(API_KEYS)} API keys are exhausted for today. "
            "Please wait for quota reset (midnight UTC) or add more keys."
        )

    cache_key = hash(prompt)
    if cache_key in _cache:
        print("[gemini_client] Cache hit, returning cached response")
        return _cache[cache_key]

    if max_key_rotations is None:
        max_key_rotations = len(API_KEYS)

    with _lock:
        for rotation in range(max_key_rotations):
            if _all_keys_exhausted():
                break

            current_client = get_client()

            for model_name in MODELS:
                try:
                    response = current_client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config={"response_mime_type": "application/json"},
                    )
                    _current_key_index = 0
                    _cache[cache_key] = response
                    return response
                except Exception as e:
                    error_str = str(e)

                    if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                        key_num = _current_key_index + 1
                        _exhausted_keys.add(_current_key_index)
                        print(f"[gemini_client] Key {key_num} quota exhausted ({len(_exhausted_keys)}/{len(API_KEYS)} keys exhausted)")
                        rotate_key()
                        break

                    if "503" in error_str or "UNAVAILABLE" in error_str or "high demand" in error_str.lower():
                        wait = (5 * (rotation + 1)) + random.uniform(1, 5)
                        print(f"[gemini_client] {model_name} overloaded, waiting {wait:.1f}s...")
                        time.sleep(wait)
                        break

                    if "404" in error_str or "not found" in error_str.lower() or "no longer available" in error_str.lower():
                        print(f"[gemini_client] {model_name} not available, trying next model...")
                        break

                    raise

    raise RuntimeError(
        f"All {len(API_KEYS)} API keys are exhausted for today. "
        "Please wait for quota reset (midnight UTC) or add more keys."
    )


def _extract_json(text: str) -> dict:
    """Extract JSON from text that may contain markdown fences."""
    import re
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    return json.loads(text.strip())
