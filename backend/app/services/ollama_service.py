import time

import ollama

MODEL_NAME = "qwen3.5:latest"


def generate_text(
    prompt: str,
    language: str,
    content_type: str,
    temperature: float = 0.7,
    max_tokens: int = 1000,
) -> str:
    language_instructions = {
        "english": "Respond entirely in clear, natural English.",
        "hindi": "Respond entirely in natural Hindi using Devanagari script.",
        "hinglish": "Respond in natural Hinglish, mixing Hindi and English using Roman script.",
    }

    content_instructions = {
        "short_explanation": (
            "Explain the topic briefly using simple and easy-to-understand language. "
            "Focus on the most important concepts."
        ),
        "detailed_explanation": (
            "Provide a comprehensive explanation. Include definitions, key concepts, "
            "examples, and relevant details."
        ),
        "summary": (
            "Provide a concise summary of the topic. Include only the most important information."
        ),
        "blog_introduction": (
            "Write an engaging and interesting blog introduction. "
            "Start with an attention-grabbing opening and introduce the topic naturally."
        ),
        "important_points": (
            "Present the important points as a well-organized bullet list. "
            "Keep each point clear and informative."
        ),
        "creative_writing": (
            "Write creatively using imaginative language, engaging storytelling, "
            "and an interesting writing style."
        ),
    }

    language_instruction = language_instructions.get(
        language, language_instructions["english"]
    )
    content_instruction = content_instructions.get(
        content_type, content_instructions["short_explanation"]
    )

    system_prompt = f"""
You are an AI text generation assistant.

1. Language:
{language_instruction}

2. Content style:
{content_instruction}

3. General rules:
- Follow the user's requested topic accurately.
- Do not switch to another language.
- Follow the selected content style.
- Avoid unnecessary information.
- Use Markdown formatting when it improves readability.
"""

    start_time = time.perf_counter()

    response = ollama.generate(
        model=MODEL_NAME,
        system=system_prompt,
        prompt=prompt,
        think=False,
        options={
            "temperature": temperature,
            "num_predict": max_tokens,
        },
    )

    elapsed = time.perf_counter() - start_time
    generated_tokens = response.eval_count or 0

    print("Done reason:", response.done_reason)
    print("Generated tokens:", generated_tokens)
    print(f"Generation time: {elapsed:.2f} seconds")
    if elapsed > 0:
        print(f"Generation speed: {generated_tokens / elapsed:.2f} tokens/second")

    return response.response
