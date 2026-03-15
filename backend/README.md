# Backend (FastAPI)

## Run

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Routes

- `GET /`
- `GET /predict?text=...`
- `POST /predict`
- `POST /chat`

## Notes

- Model file is loaded from `backend/topic_classifier.pkl`.
- CORS is currently permissive (`*`) for mobile development.
