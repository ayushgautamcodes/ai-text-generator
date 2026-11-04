from services.ollama_service import generate_text

prompt = "Explain Artificial Intelligence in three simple sentences."

print("Sending prompt to AI model...")

result = generate_text(prompt)

print("\nGenerated Text:")
print(result)
