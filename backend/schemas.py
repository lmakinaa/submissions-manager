from pydantic import BaseModel, EmailStr

class ApplicationCreate(BaseModel):
    full_name: str
    email: EmailStr