from groq import Groq
from fastapi import HTTPException

from app.config import settings
from app.data import get_lesson


SYSTEM_PROMPT = """You are Inochi Tutor (命), a calm, precise biology teacher for university students.
Explain clearly. Prefer accurate physiology and anatomy over fluff.
Use short paragraphs. If asked for an analogy, give one concrete comparison.
If asked to quiz, ask one focused question and wait.
If a 3D structure is selected, answer about that structure first: name it, describe what it is, and what to notice on the model.
If asked what to learn next, recommend another lesson or 3D model in the current catalogue (Heart, Skeleton, Nervous System, Digestive, Respiratory, Urinary, Endocrine, Reproductive).
Do not invent citations."""


def _context_blurb(module_id: str | None, lesson_id: str | None, selected_part: str | None) -> str:
    if not module_id or not lesson_id:
        base = "The student is exploring a 3D anatomy model."
    else:
        found = get_lesson(module_id, lesson_id)
        if not found:
            base = f"The student mentioned module={module_id} lesson={lesson_id}."
        else:
            module, lesson = found
            base = (
                f"Current module: {module['title']}. "
                f"Current lesson: {lesson['title']}. "
                f"3D model file: {module.get('glb_url', '')}."
            )
    if selected_part:
        return (
            f"{base} "
            f"The student has SELECTED this structure in the 3D model: {selected_part}. "
            "Treat that as the topic unless they clearly ask about something else. "
            "Name the structure, explain its anatomy and function, and point out what to look for on the model."
        )
    return (
        f"{base} "
        "No structure is selected yet. If the question is vague, ask them to click a part on the 3D model."
    )


def complete_chat(
    text: str,
    history: list[dict],
    module_id: str | None,
    lesson_id: str | None,
    selected_part: str | None = None,
) -> str:
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not set. Add it to backend/.env to enable the AI Tutor.",
        )

    client = Groq(api_key=settings.groq_api_key)
    messages: list[dict[str, str]] = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{_context_blurb(module_id, lesson_id, selected_part)}"},
    ]
    for item in history[-16:]:
        role = item.get("role")
        if role not in {"user", "assistant"}:
            continue
        messages.append({"role": role, "content": str(item.get("text", ""))})
    messages.append({"role": "user", "content": text})

    try:
        completion = client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            temperature=0.4,
            max_tokens=700,
        )
    except Exception as exc:  # noqa: BLE001 — surface Groq failures as 502
        raise HTTPException(status_code=502, detail=f"Groq request failed: {exc}") from exc

    content = completion.choices[0].message.content if completion.choices else None
    if not content:
        raise HTTPException(status_code=502, detail="Groq returned an empty reply.")
    return content
