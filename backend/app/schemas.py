from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
    )


Difficulty = Literal["Beginner", "Intermediate", "Advanced"]
LessonStatus = Literal["completed", "active", "locked"]
ChatRole = Literal["user", "assistant"]


class Lesson(ApiModel):
    id: str
    index: str
    title: str
    duration: str
    difficulty: Difficulty
    status: LessonStatus
    summary: str
    concepts: list[str] = Field(default_factory=list)
    body: str = ""


class ModuleSummary(ApiModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: Difficulty
    lesson_count: int
    concepts: int
    estimate: str
    icon: str
    accent: str
    glb_url: str
    isolate_nodes: list[str] = Field(default_factory=list)


class Module(ModuleSummary):
    lessons: list[Lesson]


class LessonDetail(ApiModel):
    module: ModuleSummary
    lesson: Lesson


class Profile(ApiModel):
    display_name: str
    programme: str
    initials: str


class TutorAction(ApiModel):
    type: str
    part: str | None = None
    yaw: float | None = None
    pitch: float | None = None


class TutorSource(ApiModel):
    title: str
    authors: str = ""
    year: str = ""
    venue: str = ""
    url: str
    source: str = "PubMed"
    lead: str = ""


class TutorImage(ApiModel):
    url: str
    thumb_url: str = ""
    caption: str = ""
    alt: str = ""
    source: str = "Wikipedia"
    source_url: str = ""
    license: str = ""


class ChatMessage(ApiModel):
    role: ChatRole
    text: str
    sources: list[TutorSource] = Field(default_factory=list)
    images: list[TutorImage] = Field(default_factory=list)


class TutorChatRequest(ApiModel):
    text: str
    history: list[ChatMessage] = Field(default_factory=list)
    module_id: str | None = None
    lesson_id: str | None = None
    selected_part: str | None = None
    part_names: list[str] = Field(default_factory=list)


class TutorChatResponse(ApiModel):
    text: str
    actions: list[TutorAction] = Field(default_factory=list)
    sources: list[TutorSource] = Field(default_factory=list)
    images: list[TutorImage] = Field(default_factory=list)


class Conversation(ApiModel):
    id: str
    title: str
    time: str


class TutorMeta(ApiModel):
    conversations: list[Conversation]
    prompts: list[str]
    suggested_questions: list[str]
    seed: list[ChatMessage]
    context_module: str
    context_lesson: str
    context_model: str
    context_glb_url: str
