# Title Generator Monorepo

This repository is now split into:

- `backend`: FastAPI classifier/chat API (Python)
- `mobile`: React Native Expo app

## Backend API Contract (unchanged)

- `POST /predict` with body `{"text": "..."}` returns `{"topic": string, "confidence": number | "N/A"}`
- `POST /chat` with body `{"messages": [{"role": "system|user|assistant", "content": "..."}]}` returns `{"response": string}`

## Repository Structure

- `backend/app.py`: FastAPI entrypoint
- `backend/topic_classifier.pkl`: Trained classifier model
- `backend/requirements.txt`: Python dependencies
- `mobile/`: Expo mobile client
- `render.yaml`: Render deployment (configured with `rootDir: backend`)

## Local Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Mobile

```bash
cd mobile
npm install
npm run start
```

## Mobile Feature Status

Implemented in Expo app:

- Chatbot mode (`/chat`) and classifier mode (`/predict`)
- Session persistence using AsyncStorage
- Abort/cancel in-flight request
- Markdown chatbot rendering
- Copy and export-to-PDF actions
- PDF attach with text extraction using hidden WebView + PDF.js
- Jackie mode toggle with persistent preference

## Deployment

- Backend is configured for Render via `render.yaml` and `rootDir: backend`.
- Mobile deployment is done through Expo/EAS workflows.
