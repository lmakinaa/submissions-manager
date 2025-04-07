import os
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
import models
from routers import auth, forms, applications, field_types
from initialization import create_default_field_types

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize default data
db = SessionLocal()
create_default_field_types(db)
db.close()

app = FastAPI(title="Application Form System API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(forms.router)
app.include_router(applications.router)
app.include_router(field_types.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Application Form System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)