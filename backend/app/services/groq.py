import json
import re

from groq import Groq
from fastapi import HTTPException

from app.config import settings
from app.data import get_lesson
from app.services.evidence import gather_evidence

SYSTEM_PROMPT = """You are Inochi Tutor (命), an agentic anatomy teacher inside a 3D lab.
You can MOVE the 3D model by returning actions. You explain structures and how they work.

Rules:
- Reply with JSON only. No markdown fences.
- Prefer accurate anatomy and physiology. Short paragraphs.
- If a structure is selected, teach that structure unless the student clearly asks about something else.
- You may ONLY cite papers listed under PROVIDED PAPERS. Never invent authors, titles, years, or DOIs.
- Mention 1-2 papers in the prose as (Lead et al., Year) when they are relevant.
- Use actions to help the student see the structure: select it, focus the camera, hide parts that cover it, or rotate for a clearer view.
- Use part names exactly from AVAILABLE PARTS. If none match, skip that action.
- Do not hide every part. Leave enough context to stay oriented.

JSON shape:
{
  "text": "student-facing explanation",
  "actions": [
    {"type": "select", "part": "Liver"},
    {"type": "focus", "part": "Liver"},
    {"type": "hide", "part": "Stomach"},
    {"type": "show_all"},
    {"type": "rotate", "yaw": 0.5, "pitch": 0.1},
    {"type": "reset"}
  ]
}
Allowed action types: select, focus, hide, show, show_all, rotate, reset.
yaw/pitch are radians, typically between -1.2 and 1.2.
"""


def _context_blurb(
    module_id: str | None,
    lesson_id: str | None,
    selected_part: str | None,
    part_names: list[str],
) -> str:
    if not module_id or not lesson_id:
        base = "The student is exploring a 3D anatomy model."
        module_title = None
    else:
        found = get_lesson(module_id, lesson_id)
        if not found:
            base = f"The student mentioned module={module_id} lesson={lesson_id}."
            module_title = None
        else:
            module, lesson = found
            module_title = str(module.get("title") or "")
            base = (
                f"Current module: {module['title']}. "
                f"Current lesson: {lesson['title']}. "
                f"3D model file: {module.get('glb_url', '')}."
            )
    selected = (
        f"The student has SELECTED this structure: {selected_part}."
        if selected_part
        else "No structure is selected yet."
    )
    parts = ", ".join(part_names[:80]) if part_names else "(none listed)"
    return f"{base} {selected}\nAVAILABLE PARTS: {parts}\nMODULE_TITLE: {module_title or ''}"


def _parse_agent_payload(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE).strip()
    try:
        payload = json.loads(text)
        if isinstance(payload, dict):
            return payload
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if match:
        try:
            payload = json.loads(match.group(0))
            if isinstance(payload, dict):
                return payload
        except json.JSONDecodeError:
            pass
    return {"text": raw.strip(), "actions": []}


def complete_chat(
    text: str,
    history: list[dict],
    module_id: str | None,
    lesson_id: str | None,
    selected_part: str | None = None,
    part_names: list[str] | None = None,
) -> dict:
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not set. Add it to backend/.env to enable the AI Tutor.",
        )

    names = [name for name in (part_names or []) if name][:80]
    module_title = None
    if module_id and lesson_id:
        found = get_lesson(module_id, lesson_id)
        if found:
            module_title = str(found[0].get("title") or "")

    papers, images = gather_evidence(text, selected_part, module_title)
    paper_lines = "\n".join(
        f"- [{index}] {item['lead']} et al., {item['year']}. {item['title']} {item['venue']}. {item['url']}"
        for index, item in enumerate(papers)
    ) or "- none found"
    image_lines = "\n".join(
        f"- [{index}] {item['caption']} ({item['source']}) {item['source_url']}"
        for index, item in enumerate(images)
    ) or "- none found"

    client = Groq(api_key=settings.groq_api_key)
    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": (
                f"{SYSTEM_PROMPT}\n\n{_context_blurb(module_id, lesson_id, selected_part, names)}\n\n"
                f"PROVIDED PAPERS (cite only these):\n{paper_lines}\n\n"
                f"PROVIDED IMAGES (already attached in the UI):\n{image_lines}"
            ),
        },
    ]
    for item in history[-12:]:
        role = item.get("role")
        if role not in {"user", "assistant"}:
            continue
        messages.append({"role": role, "content": str(item.get("text", ""))})
    messages.append({"role": "user", "content": text})

    try:
        completion = client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            temperature=0.3,
            max_tokens=900,
            response_format={"type": "json_object"},
        )
    except Exception:
        try:
            completion = client.chat.completions.create(
                model=settings.groq_model,
                messages=messages,
                temperature=0.3,
                max_tokens=900,
            )
        except Exception as exc:  # noqa: BLE001 — surface Groq failures as 502
            raise HTTPException(status_code=502, detail=f"Groq request failed: {exc}") from exc

    content = completion.choices[0].message.content if completion.choices else None
    if not content:
        raise HTTPException(status_code=502, detail="Groq returned an empty reply.")

    payload = _parse_agent_payload(content)
    actions = payload.get("actions") if isinstance(payload.get("actions"), list) else []
    clean_actions: list[dict] = []
    for action in actions[:8]:
        if not isinstance(action, dict):
            continue
        kind = str(action.get("type") or "").strip().lower()
        if kind not in {"select", "focus", "hide", "show", "show_all", "rotate", "reset"}:
            continue
        entry: dict = {"type": kind}
        if action.get("part"):
            entry["part"] = str(action["part"])
        if kind == "rotate":
            try:
                entry["yaw"] = max(-1.4, min(1.4, float(action.get("yaw") or 0)))
                entry["pitch"] = max(-0.8, min(0.8, float(action.get("pitch") or 0)))
            except (TypeError, ValueError):
                entry["yaw"] = 0.45
                entry["pitch"] = 0.08
        clean_actions.append(entry)

    reply_text = str(payload.get("text") or "").strip() or "I looked this up on the model. Ask a follow-up if you want more detail."
    return {
        "text": reply_text,
        "actions": clean_actions,
        "sources": papers,
        "images": images,
    }
