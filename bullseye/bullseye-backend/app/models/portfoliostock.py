from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class PortfolioStock(Base):
    __tablename__ = "portfolio_stocks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # assumes User model exists
    symbol = Column(String, index=True)
    name = Column(String)
    shares = Column(Integer)
    purchase_price = Column(Float)
    user = relationship("User", back_populates="portfolio")
