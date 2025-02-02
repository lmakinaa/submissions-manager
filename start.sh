cd frontend/ && npm i && npm run dev &
python -m venv .venv && source .venv/bin/activate && pip install -r app/requirements.txt && uvicorn app.main:app 
