from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models import PortfolioStock, User
from app.schemas.portfolio import PortfolioSummary, StockCreate, StockOut
from app.schemas.cashbal import CashUpdate, CashBalanceOut
from app.api.routes.auth import get_current_user
from app.services.alpha_vantage_service import AlphaVantageService
from crud import add_stock, get_latest_trading_day_price, remove_stock, update_stock, get_user_stocks
from app.schemas.portfolio import StockUpdate
from requests import Session
from app.api.dependencies import get_alpha_vantage_service

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

@router.put("/portfolio/update", status_code=200)
async def update_portfolio_stock(
    stock_data: StockUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stock = await update_stock(current_user.id, stock_data, db)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found in portfolio.")
    return {"message": "Stock updated successfully"}

@router.get("/portfolio/summary", response_model=PortfolioSummary)
async def get_portfolio_summary_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    av_service: AlphaVantageService = Depends(get_alpha_vantage_service) # Assuming get_alpha_vantage_service is a dependency
):
    holdings = await get_user_stocks(db, user_id=current_user.id)
    cash_balance = await get_cash_balance(db, user_id=current_user.id)

    current_stock_value = 0.0
    yesterday_stock_value = 0.0
    
    # Try to find yesterday's actual trading date
    # This logic should ideally be more robust to handle multiple non-trading days in a row
    # For now, we'll try yesterday, and if not found, iterate backwards.
    target_yesterday = date.today() - timedelta(days=1)
    
    for holding in holdings:
        # Get current live price
        current_data = await av_service.get_stock_quote(holding.symbol)
        if current_data and "Global Quote" in current_data and "05. price" in current_data["Global Quote"]:
            current_price = float(current_data["Global Quote"]["05. price"])
            current_stock_value += holding.shares * current_price
        else:
            # Handle cases where live price fetch fails for a stock
            print(f"Warning: Could not get live price for {holding.symbol}")
            # Optionally, use stored last known price or exclude from calculation
            # For simplicity, we'll just skip this stock for current value if live data fails
            
        # Get yesterday's closing price from your database
        yesterday_price_entry = await get_latest_trading_day_price(db, holding.symbol, target_yesterday)

        if yesterday_price_entry:
            yesterday_stock_value += holding.shares * yesterday_price_entry.adjusted_close
        else:
            # If no historical price for yesterday, this stock won't contribute to day's change calculation
            print(f"Warning: No historical price for {holding.symbol} on or before {target_yesterday}. Skipping for day's change.")

    current_total_portfolio_value = current_stock_value + cash_balance

    # Calculate yesterday's total portfolio value.
    # If yesterday_stock_value is 0 because no historical data was found for any stock,
    # the day's change calculation might be inaccurate.
    # Consider what "yesterday's cash balance" means: usually it's considered the same unless you log cash changes daily too.
    yesterday_total_portfolio_value = yesterday_stock_value + cash_balance

    day_change_value = current_total_portfolio_value - yesterday_total_portfolio_value
    
    # Avoid division by zero
    if yesterday_total_portfolio_value > 0:
        day_change_percent = (day_change_value / yesterday_total_portfolio_value) * 100
    else:
        day_change_percent = 0.0 # Or handle as None/NaN if preferred

    return {
        "current_total_value": round(current_total_portfolio_value, 2),
        "days_change_value": round(day_change_value, 2),
        "days_change_percent": round(day_change_percent,2)
    }