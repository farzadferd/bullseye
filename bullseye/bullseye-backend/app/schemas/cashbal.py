from pydantic import BaseModel

class CashUpdate(BaseModel):
    amount: float  # The amount of cash to add (can be positive or negative)

class CashBalanceOut(BaseModel):
    cash_balance: float
