import uvicorn
import joblib
import numpy as np
import traceback
from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

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
    model = joblib.load("topic_classifier.pkl")
    print("✅ Model loaded successfully from topic_classifier.pkl.")
except Exception as e:
    print(f"❌ Critical Error loading model: {e}")
    model = None

class TextInput(BaseModel):
    text: str

# Serve the HTML frontend
@app.get("/", response_class=HTMLResponse)
async def read_index():
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"<h1>Error loading index.html:</h1> <p>{str(e)}</p>"


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

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)