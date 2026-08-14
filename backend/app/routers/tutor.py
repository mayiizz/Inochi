from fastapi import APIRouter

from app.data import CONVERSATIONS, SUGGESTED_QUESTIONS, TUTOR_PROMPTS, TUTOR_SEED
from app.schemas import TutorChatRequest, TutorChatResponse, TutorMeta
from app.services.groq import complete_chat

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


@router.get("", response_model=TutorMeta)
def tutor_meta() -> TutorMeta:
    return TutorMeta.model_validate(
        {
            "conversations": CONVERSATIONS,
            "prompts": TUTOR_PROMPTS,
            "suggested_questions": SUGGESTED_QUESTIONS,
            "seed": TUTOR_SEED,
            "context_module": "Heart",
            "context_lesson": "Orient the heart",
            "context_model": "Heart",
            "context_glb_url": "/heart2.glb",
        }
    )


@router.post("/chat", response_model=TutorChatResponse)
def tutor_chat(body: TutorChatRequest) -> TutorChatResponse:
    history = [item.model_dump() for item in body.history]
    payload = complete_chat(
        body.text,
        history,
        body.module_id,
        body.lesson_id,
        body.selected_part,
        body.part_names,
    )
    return TutorChatResponse.model_validate(payload)
