from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base
import random

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    forms = relationship("Form", back_populates="creator")

class FieldType(Base):
    __tablename__ = "field_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    has_options = Column(Boolean, default=False)  # Whether this field type supports options (like select fields)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True, default=lambda: random.randint(100000, 999999))
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    field_config = Column(JSON)  # JSON field to store form configuration
    creator_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    creator = relationship("User", back_populates="forms")
    applications = relationship("Application", back_populates="form")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"))
    # applicant_name = Column(String)
    # applicant_email = Column(String)
    form_data = Column(JSON)  # JSON field to store form responses
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    form = relationship("Form", back_populates="applications")
    