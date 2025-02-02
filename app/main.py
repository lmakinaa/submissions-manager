from fastapi import FastAPI, UploadFile, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import shutil
import os
from .database import get_db, Application, UPLOAD_DIR

app = FastAPI()


@app.post("/apply/")
def apply(
    full_name: str = Form(...), 
    email: str = Form(...), 
    cv: UploadFile = Form(...),
    db: Session = Depends(get_db)
):
    cv_path = os.path.join(UPLOAD_DIR, cv.filename)
    with open(cv_path, "wb") as buffer:
        shutil.copyfileobj(cv.file, buffer)
    
    application = Application(full_name=full_name, email=email, cv_filename=cv.filename)
    db.add(application)
    db.commit()
    db.refresh(application)
    return {"message": "Application submitted successfully!"}


@app.get("/admin/applications/")
def get_applications(db: Session = Depends(get_db)):
    applications = db.query(Application).all()
    return applications


@app.put("/admin/applications/{application_id}/mark/")
def mark_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = True
    db.commit()
    return {"message": "Application marked as reviewed"}


@app.delete("/admin/applications/{application_id}/")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    cv_path = os.path.join(UPLOAD_DIR, application.cv_filename)
    if os.path.exists(cv_path):
        os.remove(cv_path)
    db.delete(application)
    db.commit()
    return {"message": "Application deleted"}


@app.get("/admin/applications/{application_id}/cv/")
def download_cv(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    cv_path = os.path.join(UPLOAD_DIR, application.cv_filename)
    return FileResponse(cv_path, filename=application.cv_filename)
