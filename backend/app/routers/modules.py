from fastapi import APIRouter, HTTPException

from app.data import MODULES, get_lesson, get_module, module_summary
from app.schemas import LessonDetail, Module

router = APIRouter(prefix="/api/modules", tags=["modules"])


@router.get("", response_model=list[Module])
def list_modules() -> list[Module]:
    return [Module.model_validate(item) for item in MODULES]


@router.get("/{module_id}", response_model=Module)
def read_module(module_id: str) -> Module:
    module = get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return Module.model_validate(module)


@router.get("/{module_id}/lessons/{lesson_id}", response_model=LessonDetail)
def read_lesson(module_id: str, lesson_id: str) -> LessonDetail:
    found = get_lesson(module_id, lesson_id)
    if not found:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module, lesson = found
    return LessonDetail.model_validate({"module": module_summary(module), "lesson": lesson})
