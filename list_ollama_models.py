import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url=os.getenv("OPENAI_BASE_URL", "https://ollama.com/v1"),
    api_key=os.getenv("OPENAI_API_KEY")
)

models = client.models.list()

for m in models.data:
    print(m.id)