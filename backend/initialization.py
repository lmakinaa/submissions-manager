from sqlalchemy.orm import Session
from models import FieldType

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