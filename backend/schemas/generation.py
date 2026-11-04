from enum import Enum

from pydantic import BaseModel, Field, field_validator


class ContentType(str, Enum):
    SHORT_EXPLANATION = "short_explanation"
    DETAILED_EXPLANATION = "detailed_explanation"
    SUMMARY = "summary"
    BLOG_INTRODUCTION = "blog_introduction"
    IMPORTANT_POINTS = "important_points"
    CREATIVE_WRITING = "creative_writing"


class Language(str, Enum):
    ENGLISH = "english"
    HINDI = "hindi"
    HINGLISH = "hinglish"


class GenerationRequest(BaseModel):
    prompt: str = Field(
        min_length=3,
        max_length=2000,
        description="The text prompt provided by the user",
    )
    content_type: ContentType = Field(
        default=ContentType.SHORT_EXPLANATION,
        description="The type of content to generate",
    )
    language: Language = Field(
        default=Language.ENGLISH,
        description="The language in which the response should be generated",
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=1.5,
        description="Controls response randomness",
    )
    max_tokens: int = Field(
        default=1000,
        ge=100,
        le=2000,
        description="Maximum number of generated tokens",
    )

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Prompt cannot contain only whitespace")
        return value.strip()


class GenerationResponse(BaseModel):
    message: str
    prompt: str
    generated_text: str
    status: str
