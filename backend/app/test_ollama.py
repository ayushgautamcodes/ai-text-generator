import ollama
import time

print("Connecting to Ollama...")

start_time = time.time()

response = ollama.generate(
model="qwen3.5",
prompt="What is Python?",
think=False,
options={
"num_predict": 200
}
)

end_time = time.time()

print("\nGenerated Response:")
print(response.response)

print("\nDone Reason:", response.done_reason)

print("\nTime Taken:", round(end_time - start_time, 2), "seconds")