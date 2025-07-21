from sqlalchemy import Column, Float, Integer, String, UniqueConstraint
from app.core.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint('email', name='uq_user_email'),)

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    stocks = relationship("PortfolioStock", back_populates="user", cascade="all, delete")
    cash_balance = Column(Float, default=0.0) 