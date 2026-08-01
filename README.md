# Inochi (命)

AI-powered BioScience learning platform.

## Structure

- `frontend/` — React + TypeScript app (TanStack Start, Tailwind CSS)
- `backend/` — FastAPI JSON API (in-memory catalogue, Groq tutor)

## Run

Terminal 1 — API:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then set GROQ_API_KEY for the AI Tutor
uvicorn app.main:app --reload --port 8000
```

Terminal 2 — UI:

```sh
cd frontend
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080). The UI talks to [http://localhost:8000](http://localhost:8000).

The AI Tutor needs a Groq key in `backend/.env`. Without it, catalogue pages still work; chat returns a setup hint.
