from pydantic import BaseModel, EmailStr, Field
from typing import Dict, List, Optional, Any
import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime.datetime
    
    class Config:
        orm_mode = True


# FieldType Schemas
class FieldTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    has_options: bool = False

class FieldTypeCreate(FieldTypeBase):
    pass

class FieldTypeResponse(FieldTypeBase):
    id: int
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True  # Using the new Pydantic v2 attribute instead of orm_mode


# Update FormField class in schemas.py
class FormField(BaseModel):
    field_id: str
    field_type_id: int  # Now uses field_type_id instead of field_type string
    label: str
    required: bool = False
    options: Optional[List[str]] = None  # For select fields

class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    field_config: List[FormField]

class FormCreate(FormBase):
    pass

class FormResponse(FormBase):
    id: int
    creator_id: int
    created_at: datetime.datetime
    
    class Config:
        orm_mode = True

# Application schemas
class ApplicationCreate(BaseModel):
    form_data: Dict[str, Any]
    # applicant_name: str
    # applicant_email: EmailStr

class ApplicationResponse(BaseModel):
    id: int
    form_id: int
    # applicant_name: str
    # applicant_email: str
    form_data: Dict[str, Any]
    created_at: datetime.datetime
    
    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
