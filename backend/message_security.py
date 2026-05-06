"""Message content validation helpers for chat safety."""

from __future__ import annotations

import re


EMAIL_PATTERN = re.compile(r"\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b", re.IGNORECASE)
HANDLE_PATTERN = re.compile(r"(?<!\w)@[a-zA-Z0-9_.]{3,}\b")
PHONE_PATTERN = re.compile(r"(?:\+?\d(?:[\s().-]*\d){7,})")
URL_PATTERN = re.compile(r"\b(?:https?://|www\.)\S+", re.IGNORECASE)
CONTACT_KEYWORDS_PATTERN = re.compile(
    r"\b(?:whatsapp|telegram|signal|skype|discord|instagram|facebook|snapchat|email|e-mail|phone|call me|text me)\b",
    re.IGNORECASE,
)


def detect_contact_sharing(text: str) -> str | None:
    """Return a short reason when a message appears to share contact details."""
    content = (text or "").strip()
    if not content:
        return None

    if EMAIL_PATTERN.search(content):
        return "email address"

    if HANDLE_PATTERN.search(content):
        return "social handle"

    if URL_PATTERN.search(content):
        return "link or website"

    if CONTACT_KEYWORDS_PATTERN.search(content):
        return "contact details"

    if PHONE_PATTERN.search(content):
        digit_count = sum(char.isdigit() for char in content)
        if digit_count >= 8:
            return "phone number"

    return None


def validate_message_text(text: str) -> tuple[bool, str | None]:
    """Validate chat text and block obvious contact sharing attempts."""
    content = (text or "").strip()
    if not content:
        return False, "Message text is required"

    reason = detect_contact_sharing(content)
    if reason:
        return False, f"Please do not share {reason} in messages."

    return True, None