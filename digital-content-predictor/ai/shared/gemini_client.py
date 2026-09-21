"""
Gemini API client with intelligent key rotation.

Tracks per-key quota state and rotates to the next available key
when one is rate-limited. Uses round-robin distribution and respects
a configurable cooldown before retrying exhausted keys.
"""

import json
import os
import re
import time
from itertools import cycle
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_MODEL = "gemini-3.6-flash"
KEY_COOLDOWN_SECONDS = 900  # 15 minutes

API_KEYS = [
    os.environ.get("GOOGLE_API_KEY_1", ""),
    os.environ.get("GOOGLE_API_KEY_2", ""),
    os.environ.get("GOOGLE_API_KEY_3", ""),
]
API_KEYS = [k for k in API_KEYS if k]

if not API_KEYS:
    raise RuntimeError("No Google API keys configured. Set GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, or GOOGLE_API_KEY_3.")


def _extract_json(text: str) -> dict:
    """Extract JSON from text that may contain markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    return json.loads(text.strip())

# Round-robin iterator
_key_cycle = cycle(range(len(API_KEYS)))
_current_key_idx = next(_key_cycle)

# Per-key state: {idx: {"exhausted": bool, "retry_after": timestamp}}
_key_states = {i: {"exhausted": False, "retry_after": 0.0} for i in range(len(API_KEYS))}


def _get_next_available_key():
    """Find the next key that is not in cooldown. Returns None if all exhausted."""
    now = time.time()
    checked = 0
    while checked < len(API_KEYS):
        idx = next(_key_cycle)
        state = _key_states[idx]
        if not state["exhausted"] or now >= state["retry_after"]:
            _current_key_idx = idx
            return idx
        checked += 1
    return None


def get_client():
    """Get a Gemini client using the current available key."""
    idx = _get_next_available_key()
    if idx is None:
        min_retry = min(s["retry_after"] for s in _key_states.values())
        wait = max(1, int(min_retry - time.time()))
        raise RuntimeError(
            f"All {len(API_KEYS)} API keys exhausted. Retry in {wait}s."
        )
    _current_key_idx = idx
    return genai.Client(api_key=API_KEYS[idx])


def mark_exhausted():
    """Mark the current key as exhausted and rotate to next."""
    global _current_key_idx
    _key_states[_current_key_idx]["exhausted"] = True
    _key_states[_current_key_idx]["retry_after"] = time.time() + KEY_COOLDOWN_SECONDS
    print(
        f"[gemini_client] Key {_current_key_idx + 1}/{len(API_KEYS)} exhausted. "
        f"Cooldown {KEY_COOLDOWN_SECONDS}s."
    )
    _get_next_available_key()


def mark_working():
    """Mark the current key as working (resets its exhausted state)."""
    _key_states[_current_key_idx]["exhausted"] = False
    _key_states[_current_key_idx]["retry_after"] = 0.0


def call_gemini(prompt: str, max_retries: int = None):
    """
    Call Gemini with automatic key rotation on quota exhaustion.

    Uses round-robin to distribute load across keys. When a key hits
    its quota (429 / RESOURCE_EXHAUSTED), marks it exhausted for 15 minutes
    and rotates to the next available key.

    Args:
        prompt: The text prompt to send to Gemini.
        max_retries: Max rotation attempts. Defaults to number of keys × 3.

    Returns:
        The Gemini response object.

    Raises:
        RuntimeError: If all keys are exhausted.
        Exception: Non-quota errors are raised immediately.
    """
    if max_retries is None:
        max_retries = len(API_KEYS) * 3

    last_error = None

    for attempt in range(max_retries):
        try:
            client = get_client()
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            mark_working()
            return response
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                mark_exhausted()
                last_error = e
                continue
            raise

    raise RuntimeError(
        f"All {len(API_KEYS)} API keys exhausted after {max_retries} attempts. "
        f"Last error: {last_error}"
    )
