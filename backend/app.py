import uvicorn
import joblib
import numpy as np
import traceback
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Setup Chat Client
API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://ollama.com/v1")

# Create the client conditionally to not break if keys are missing initially
openai_client = None
if API_KEY:
    openai_client = OpenAI(base_url=BASE_URL, api_key=API_KEY)

app = FastAPI(title="Topic Classifier API")

# Allow CORS for external testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model directly wrapped in a try/except so the server doesn't blindly fail
try:
    model = joblib.load(BASE_DIR / "topic_classifier.pkl")
    print("✅ Model loaded successfully from topic_classifier.pkl.")
except Exception as e:
    print(f"❌ Critical Error loading model: {e}")
    model = None

class TextInput(BaseModel):
    text: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

# Basic service status endpoint
@app.get("/")
async def read_index():
    return {"status": "ok", "service": "topic-classifier-api"}


# Shared prediction logic
def do_prediction(text: str):
    if not model:
        raise HTTPException(status_code=500, detail="Server Error: The AI model failed to load internally.")
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Bad Request: Text input cannot be empty.")

    try:
        input_text = [text]
        prediction = model.predict(input_text)[0]
        
        try:
            probabilities = model.predict_proba(input_text)
            confidence = float(np.max(probabilities))
        except AttributeError:
            confidence = None 

        return {
            "topic": prediction, 
            "confidence": round(confidence, 2) if (confidence is not None and isinstance(confidence, (int, float))) else "N/A"
        }
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Prediction Error: {error_details}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# POST endpoint for the UI to hit
@app.post("/predict")
async def predict_post(item: TextInput):
    return do_prediction(item.text)

# GET endpoint for easy browser testing (e.g. /predict?text=Hello)
@app.get("/predict")
async def predict_get(text: str = Query(..., description="The text to classify")):
    return do_prediction(text)

# Chat endpoint using Ollama
@app.post("/chat")
async def chat_post(req: ChatRequest):
    if not openai_client:
        raise HTTPException(status_code=500, detail="Server Error: Chat AI model not configured (missing API keys).")
    try:
        response = openai_client.chat.completions.create(
            model="gemma3:4b",
            messages=[{"role": m.role, "content": m.content} for m in req.messages]
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Chat Error: {error_details}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)