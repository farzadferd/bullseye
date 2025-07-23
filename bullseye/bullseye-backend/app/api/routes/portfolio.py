from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models import PortfolioStock, User
from app.schemas import StockCreate, StockOut, CashUpdate, CashBalanceOut
from app.api.routes.auth import get_current_user
from app.services.alpha_vantage_service import AlphaVantageService
from crud import add_stock, remove_stock

router = APIRouter()
alpha_service = AlphaVantageService()

@router.post("/portfolio/add", response_model=StockOut)
async def add_to_portfolio(stock: StockCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # Validate stock symbol and get live price
    try:
        price_data = await alpha_service.get_stock_price(stock.symbol.upper())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Add stock to DB (shares + price at purchase)
    # Assuming you have a CRUD function add_stock(db, user_id, stock, price)
    added_stock = await add_stock(db, user.id, stock, price_data["price"])
    
    # Return enriched StockOut response (you might want to adjust StockOut schema accordingly)
    return added_stock

@router.delete("/portfolio/remove/{symbol}")
async def remove_from_portfolio(symbol: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    deleted = await remove_stock(db, user.id, symbol.upper())
    if not deleted:
        raise HTTPException(status_code=404, detail="Stock not found in portfolio")
    return {"detail": f"{symbol.upper()} removed from portfolio"}

@router.get("/portfolio", response_model=list[dict])
async def get_portfolio(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(PortfolioStock).where(PortfolioStock.user_id == user.id)
    result = await db.execute(stmt)
    holdings = result.scalars().all()

    portfolio_data = []

    for stock in holdings:
        symbol = stock.symbol.upper()
        shares = stock.shares

        try:
            price_data = await alpha_service.get_stock_price(symbol)
            company_info = await alpha_service.get_company_overview(symbol)
            company_name = company_info.get("Name", symbol) if company_info else symbol
            value = shares * price_data["price"]

            portfolio_data.append({
                "symbol": symbol,
                "name": company_name,
                "shares": shares,
                "price": price_data["price"],
                "change": price_data["change"],
                "percent_change": price_data["percent_change"],
                "value": value,
            })
        except Exception as e:
            portfolio_data.append({
                "symbol": symbol,
                "name": symbol,
                "shares": shares,
                "price": None,
                "change": None,
                "percent_change": None,
                "value": None,
                "error": str(e),
            })

    return portfolio_data

@router.get("/portfolio/cash", response_model=CashBalanceOut)
async def get_cash_balance(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(User).where(User.id == user.id)
    result = await db.execute(stmt)
    db_user = result.scalar_one()
    return {"cash_balance": db_user.cash_balance}

@router.post("/portfolio/cash", response_model=CashBalanceOut)
async def update_cash_balance(cash: CashUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(User).where(User.id == user.id)
    result = await db.execute(stmt)
    db_user = result.scalar_one()

    db_user.cash_balance += cash.amount
    await db.commit()
    await db.refresh(db_user)

    return {"cash_balance": db_user.cash_balance}