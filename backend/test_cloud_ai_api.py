import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# 1. Point to your local Ollama server (usually port 11434)
client = OpenAI(
    base_url=os.getenv("OPENAI_BASE_URL", "https://ollama.com/v1"),
    api_key=os.getenv("OPENAI_API_KEY")
)

# 2. Use chat.completions.create instead of client.responses.create
response = client.chat.completions.create(
    model="deepseek-v3.2", # Make sure this model is pulled in Ollama
    messages=[
        {"role": "user", "content": "Write one short sentence about RAG in AI."}
    ]
)

# 3. Access the content through the standard message object
print(response.choices[0].message.content)