import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas.generation import GenerationRequest, GenerationResponse
from app.services.ollama_service import generate_text

app = FastAPI(
    title="AI Text Generator API",
    description="Backend API for the local AI Text Generator",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Text Generator API",
        "status": "running",
    }


@app.get("/test-error")
def test_error():
    raise HTTPException(
        status_code=503,
        detail="AI service is currently unavailable",
    )


@app.post("/generate", response_model=GenerationResponse)
def generate_content(request: GenerationRequest):
    try:
        result = generate_text(
            prompt=request.prompt,
            language=request.language.value,
            content_type=request.content_type.value,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )

        return GenerationResponse(
            message="Text generated successfully",
            prompt=request.prompt,
            generated_text=result,
            status="success",
        )

    except ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Ollama server is unavailable. Please start Ollama.",
        )

    except ollama.ResponseError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama generation error: {error.error}",
        )
