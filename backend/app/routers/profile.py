from fastapi import APIRouter

from app.data import PROFILE
from app.schemas import Profile

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=Profile)
def get_profile() -> Profile:
    return Profile.model_validate(PROFILE)
