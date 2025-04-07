from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status, BackgroundTasks
from fastapi import Form as FormField  # Renamed to avoid conflict
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import os
import shutil
import mimetypes
from fastapi.responses import FileResponse

from database import get_db
from models import Application, Form, User, FieldType
from schemas import ApplicationCreate, ApplicationResponse
from dependencies import get_current_active_user
import time

# Create directory for file uploads if it doesn't exist
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("/submit/{form_id}", response_model=ApplicationResponse)
async def submit_application(
    form_id: int,
    form_data: str = FormField(...),  # JSON string of form data
    files: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    print(files)
    # Check if form exists
    db_form = db.query(Form).filter(Form.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Parse form data
    try:
        form_data_dict = json.loads(form_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid form data JSON")
    
    # Process uploaded files
    if files:
        for file in files:
            if file.filename:
                # Extract field ID from the filename (assuming the field ID is part of the filename)
                field_id = file.filename.split("___")[0]  # Adjust this logic if field ID is stored differently
                if not field_id:
                    raise HTTPException(status_code=400, detail="Invalid file naming convention")
                
                # Ensure the field_id exists in form_data_dict
                if field_id not in form_data_dict:
                    raise HTTPException(status_code=400, detail=f"Field ID {field_id} does not exist in form data")
                
                # Create a sanitized filename
                sanitized_name = f"{form_id}_{int(time.time())}_{file.filename}"
                file_location = f"{UPLOAD_DIR}/{sanitized_name}"
                
                # Save the file
                with open(file_location, "wb") as file_object:
                    shutil.copyfileobj(file.file, file_object)
                
                # Append the file path to the existing field ID value
                existing_value = form_data_dict[field_id]
                if isinstance(existing_value, list):
                    existing_value.append(file_location)
                else:
                    form_data_dict[field_id] = [existing_value, file_location] if existing_value else [file_location]

    # Create application
    db_application = Application(
        form_id=form_id,
        form_data=form_data_dict,
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return db_application

@router.get("/form/{form_id}", response_model=List[ApplicationResponse])
def list_form_applications(
    form_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if form belongs to current user
    form = db.query(Form).filter(Form.id == form_id, Form.creator_id == current_user.id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found or access denied")
    
    applications = (
        db.query(Application)
        .filter(Application.form_id == form_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return applications

@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get application with form check for ownership
    application = (
        db.query(Application)
        .join(Form)
        .filter(
            Application.id == application_id,
            Form.creator_id == current_user.id
        )
        .first()
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found or access denied")
    
    return application

@router.get("/{application_id}/download-file/{field_id}")
def download_file(
    application_id: int,
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get application with form check for ownership
    application = (
        db.query(Application)
        .join(Form)
        .filter(
            Application.id == application_id,
            Form.creator_id == current_user.id
        )
        .first()
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found or access denied")
    
    # Get file path from form_data
    file_path = application.form_data.get(field_id)
    if not file_path:
        raise HTTPException(status_code=404, detail=f"No file found for field {field_id}")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Guess content type based on file extension
    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = "application/octet-stream"
    
    return FileResponse(
        path=file_path, 
        filename=os.path.basename(file_path),
        media_type=content_type
    )

