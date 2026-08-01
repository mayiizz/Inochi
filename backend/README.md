# Inochi API

In-memory FastAPI backend. No database.

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Set `GROQ_API_KEY` in `.env` to enable `POST /api/tutor/chat`.
