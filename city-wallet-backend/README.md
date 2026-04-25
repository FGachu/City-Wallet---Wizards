# City Wallet Backend

This folder contains:

1. **FastAPI service** (files in this directory: `main.py`, `requirements.txt`) — wallet context and offer APIs.
2. **`agent-testing-console/`** — Next.js agent testing console (copy `agent-testing-console/.env.example` to `.env.local` there, then `npm install && npm run dev`).

---

## FastAPI backend

Minimal async backend for a city wallet app with:
- `GET /context`
- `POST /generate-offer`
- `POST /redeem`

## Run

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set your API key:

```bash
set OPENAI_API_KEY=your_openai_api_key_here
```

4. Start server:

```bash
uvicorn main:app --reload
```

## Endpoint examples

### Context

```bash
curl "http://127.0.0.1:8000/context?city=Tashkent"
```

### Generate offer

```bash
curl -X POST "http://127.0.0.1:8000/generate-offer" ^
  -H "Content-Type: application/json" ^
  -d "{\"city\":\"Tashkent\",\"user_segment\":\"daily-commuter\",\"wallet_balance\":75,\"preferred_categories\":[\"coffee\",\"transport\"]}"
```

### Redeem

```bash
curl -X POST "http://127.0.0.1:8000/redeem" ^
  -H "Content-Type: application/json" ^
  -d "{\"offer_id\":\"offer_123\",\"user_id\":\"user_42\"}"
```
