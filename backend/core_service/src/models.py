from sqlalchemy import Column, Integer, String, Boolean
from .database import Base, engine

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    cv_filename = Column(String)
    status = Column(Boolean, default=False)  # False = Pending, True = Reviewed

Base.metadata.create_all(bind=engine)