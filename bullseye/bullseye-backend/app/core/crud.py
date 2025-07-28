# app/core/crud.py

from datetime import date
from requests import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import User
from app.schemas.user import UserCreate
from passlib.context import CryptContext
import logging # Added for logging
from app.models.portfoliostock import PortfolioStock
from app.schemas.portfolio import StockUpdate
from app.schemas.portfolio import StockCreate, StockOut
from sqlalchemy.exc import IntegrityError
from app.models.dailyprice import StockDailyPrice

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Set up a basic logger for CRUD operations
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
# If you want to see logs in console during uvicorn run, uncomment these lines:
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


async def get_user_by_email(db: AsyncSession, email: str):
    print(f"DEBUG: Attempting to get user by email: {email}")
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if user:
        print(f"DEBUG: Found existing user: {user.email}")
    else:
        print(f"DEBUG: No user found for email: {email}")
    return user

async def create_user(db: AsyncSession, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    
    print(f"DEBUG: Added user {db_user.email} to session. Pending: {db.new}")
    logger.info(f"Attempting to commit user {db_user.email} to database.") 
    
    try:
        await db.commit() # This is the crucial step to save to the database
        print(f"DEBUG: Successfully committed user {db_user.email} to database.")
        logger.info(f"User {db_user.email} successfully committed.")
    except Exception as e:
        await db.rollback() # Rollback the transaction on error
        print(f"ERROR: Failed to commit user {db_user.email}: {e}")
        logger.error(f"Failed to commit user {db_user.email}: {e}", exc_info=True) # Logs traceback
        raise # Re-raise the exception to propagate it up to the FastAPI endpoint
        
    await db.refresh(db_user) # Refresh to get the generated ID and other DB-side defaults
    print(f"DEBUG: Refreshed user, ID: {db_user.id}")
    logger.info(f"User {db_user.email} refreshed with ID: {db_user.id}.")
    return db_user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def add_stock(db: AsyncSession, user_id: int, stock: StockCreate, price: float):
    new_stock = PortfolioStock(
        user_id=user_id,
        symbol=stock.symbol.upper(),
        name=stock.name,
        shares=stock.shares,
        purchase_price=price
    )
    db.add(new_stock)
    await db.commit()
    await db.refresh(new_stock)
    return new_stock

async def remove_stock(db: AsyncSession, user_id: int, symbol: str):
    result = await db.execute(select(PortfolioStock).where(
        PortfolioStock.user_id == user_id,
        PortfolioStock.symbol == symbol.upper()
    ))
    stock = result.scalar_one_or_none()
    if stock:
        await db.delete(stock)
        await db.commit()
    return stock

async def get_user_stocks(db: AsyncSession, user_id: int):
    result = await db.execute(select(PortfolioStock).where(PortfolioStock.user_id == user_id))
    return result.scalars().all()

async def update_stock(user_id: int, stock_data: StockUpdate, db: AsyncSession):
    result = await db.execute(
        select(PortfolioStock).where(
            PortfolioStock.user_id == user_id,
            PortfolioStock.symbol == stock_data.symbol
        )
    )
    stock = result.scalar_one_or_none()
    if not stock:
        return None

    stock.shares = stock_data.shares
    stock.purchase_price = stock_data.price
    stock.total_value = stock_data.shares * stock_data.price

    await db.commit()
    await db.refresh(stock)
    return stock


def create_stock_daily_price(db: Session, symbol: str, date: date, adjusted_close: float):
    db_price = StockDailyPrice(symbol=symbol, date=date, adjusted_close=adjusted_close)
    db.add(db_price)
    try:
        db.commit()
        db.refresh(db_price)
        return db_price
    except IntegrityError:
        db.rollback()
        # Price for this symbol and date already exists, which is fine for upsert logic
        return None # Or fetch existing to return it if needed

def get_stock_price_on_date(db: Session, symbol: str, target_date: date):
    return db.query(StockDailyPrice).filter(
        StockDailyPrice.symbol == symbol,
        StockDailyPrice.date == target_date
    ).first()

def get_latest_trading_day_price(db: Session, symbol: str, before_date: date):
    """
    Gets the most recent available adjusted close price for a symbol on or before a given date.
    This helps handle weekends/holidays if the cron job is daily.
    """
    return db.query(StockDailyPrice).filter(
        StockDailyPrice.symbol == symbol,
        StockDailyPrice.date <= before_date
    ).order_by(StockDailyPrice.date.desc()).first()