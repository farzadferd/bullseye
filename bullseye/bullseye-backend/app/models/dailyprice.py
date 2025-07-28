from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import date

Base = declarative_base()

class StockDailyPrice(Base):
    __tablename__ = "stock_daily_prices"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    date = Column(Date, index=True, nullable=False)
    adjusted_close = Column(Float, nullable=False)

    __table_args__ = (
        # Ensure only one price entry per stock per day
        UniqueConstraint('symbol', 'date', name='_symbol_date_uc'),
    )

    def __repr__(self):
        return f"<StockDailyPrice(symbol='{self.symbol}', date='{self.date}', adjusted_close={self.adjusted_close})>"