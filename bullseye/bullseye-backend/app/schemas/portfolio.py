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

    class Config:
        orm_mode = True
