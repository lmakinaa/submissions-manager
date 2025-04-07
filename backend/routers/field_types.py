from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import FieldType, User
from schemas import FieldTypeCreate, FieldTypeResponse
from dependencies import get_current_active_user

router = APIRouter(prefix="/field-types", tags=["field-types"])

# @router.post("/", response_model=FieldTypeResponse)
# def create_field_type(
#     field_type: FieldTypeCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user)
# ):
#     db_field_type = FieldType(
#         name=field_type.name,
#         description=field_type.description,
#         has_options=field_type.has_options
#     )
#     db.add(db_field_type)
#     db.commit()
#     db.refresh(db_field_type)
#     return db_field_type

@router.get("/", response_model=List[FieldTypeResponse])
def list_field_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    field_types = db.query(FieldType).offset(skip).limit(limit).all()
    return field_types

@router.get("/{field_type_id}", response_model=FieldTypeResponse)
def get_field_type(
    field_type_id: int,
    db: Session = Depends(get_db)
):
    field_type = db.query(FieldType).filter(FieldType.id == field_type_id).first()
    if field_type is None:
        raise HTTPException(status_code=404, detail="Field type not found")
    return field_type

# Initialization function for default field types - initialization.py
def create_default_field_types(db: Session):
    # Check if field types already exist
    if db.query(FieldType).count() > 0:
        return
    
    # Define default field types
    default_types = [
        FieldType(
            name="Text",
            description="Single line text input field",
            has_options=False
        ),
        FieldType(
            name="LargeText",
            description="Multi-line text area for longer content",
            has_options=False
        ),
        FieldType(
            name="Email",
            description="Email input field with validation",
            has_options=False
        ),
        FieldType(
            name="Select",
            description="Dropdown select field with predefined options",
            has_options=True
        ),
        FieldType(
            name="PDF",
            description="File upload field for PDF documents",
            has_options=False
        )
    ]
    
    # Add default field types to the database
    for field_type in default_types:
        db.add(field_type)
    
    db.commit()