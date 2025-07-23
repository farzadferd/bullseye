from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    shares = Column(Float)  # optional: if tracking how many shares
    purchase_price = Column(Float)  # optional: if tracking entry price
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="stocks")
