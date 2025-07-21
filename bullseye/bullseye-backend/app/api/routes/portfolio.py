from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import StockCreate, StockOut
from app.crud import add_stock, remove_stock, get_user_stocks
from app.services.alpha_vantage_service import get_stock_price
from app.auth import get_current_user  # Assuming auth is implemented
from app.schemas.cashbal import CashUpdate, CashBalanceOut
from app.models import User

router = APIRouter()

@router.post("/portfolio/add", response_model=StockOut)
async def add_to_portfolio(stock: StockCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    try:
        price = await get_stock_price(stock.symbol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await add_stock(db, user.id, stock, price)

@router.delete("/portfolio/remove/{symbol}")
async def remove_from_portfolio(symbol: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    deleted = await remove_stock(db, user.id, symbol)
    if not deleted:
        raise HTTPException(status_code=404, detail="Stock not found")
    return {"detail": f"{symbol} removed from portfolio"}

@router.get("/portfolio", response_model=list[StockOut])
async def get_portfolio(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await get_user_stocks(db, user.id)

@router.get("/portfolio/cash", response_model=CashBalanceOut)
async def get_cash_balance(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(User).where(User.id == user.id)
    result = await db.execute(stmt)
    db_user = result.scalar_one()
    return {"cash_balance": db_user.cash_balance}

# 💸 Add (or subtract) cash
@router.post("/portfolio/cash", response_model=CashBalanceOut)
async def update_cash_balance(cash: CashUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(User).where(User.id == user.id)
    result = await db.execute(stmt)
    db_user = result.scalar_one()

    db_user.cash_balance += cash.amount
    await db.commit()
    await db.refresh(db_user)

    return {"cash_balance": db_user.cash_balance}