from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Form, User, FieldType
from schemas import FormCreate, FormResponse
from dependencies import get_current_active_user

router = APIRouter(prefix="/forms", tags=["forms"])

@router.post("/", response_model=FormResponse)
def create_form(
    form: FormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Validate field types
    for field in form.field_config:
        field_type = db.query(FieldType).filter(FieldType.id == field.field_type_id).first()
        if not field_type:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid field_type_id: {field.field_type_id}"
            )
        
        # Validate options for fields that require them
        if field_type.has_options and not field.options:
            raise HTTPException(
                status_code=400,
                detail=f"Field '{field.label}' requires options for field type '{field_type.name}'"
            )
        elif not field_type.has_options and field.options:
            raise HTTPException(
                status_code=400,
                detail=f"Field '{field.label or 'Unknown'}' does not accept options for field type '{field_type.name or 'Unknown'}'"
            )
    
    # Create form
    db_form = Form(
        title=form.title,
        description=form.description,
        field_config=form.dict()["field_config"],
        creator_id=current_user.id
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@router.get("/", response_model=List[FormResponse])
def list_forms(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    forms = db.query(Form).filter(Form.creator_id == current_user.id).offset(skip).limit(limit).all()
    return forms

@router.get("/{form_id}", response_model=FormResponse)
def get_form(
    form_id: int,
    db: Session = Depends(get_db)
):
    form = db.query(Form).filter(Form.id == form_id).first()
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return form

@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    form = db.query(Form).filter(Form.id == form_id, Form.creator_id == current_user.id).first()
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    
    db.delete(form)
    db.commit()
    return None
