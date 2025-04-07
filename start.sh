cd frontend/ && npm i && npm run dev &
# python -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt && uvicorn backend.main:app 
python -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt && python backend/main.py

