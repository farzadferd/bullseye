from pydantic import BaseModel

class StockCreate(BaseModel):
    symbol: str
    name: str
    shares: int

class StockOut(BaseModel):
    id: int
    symbol: str
    name: str
    shares: int
    purchase_price: float

class StockUpdate(BaseModel):
    symbol: str
    shares: int
    price: float

class PortfolioSummary(BaseModel):
    current_total_value: float
    days_change_value: float
    days_change_percent: float

    class Config:
        orm_mode = True
