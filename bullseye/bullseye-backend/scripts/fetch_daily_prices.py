import os
import sys
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv() # <--- Add this at the very beginning of your script

# Add the parent directory to the Python path to allow importing app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, StockHolding # Import your existing models
from app.services.alpha_vantage_service import AlphaVantageService
from app.crud import create_stock_daily_price, get_stock_price_on_date # Import the new CRUD functions

# Database URL from environment or hardcode for script (match your main app)
DATABASE_URL = os.getenv("DATABASE_URL") # Adjust as needed

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def fetch_and_store_daily_prices():
    db = SessionLocal()
    av_service = AlphaVantageService()
    
    try:
        # Get all unique stock symbols from all current holdings in your database
        # This prevents fetching data for stocks no one holds
        all_symbols = db.query(StockHolding.symbol).distinct().all()
        unique_symbols = [s[0] for s in all_symbols]

        today = date.today()
        print(f"Starting daily price fetch for {today}...")

        for symbol in unique_symbols:
            print(f"Fetching daily adjusted data for {symbol}...")
            # Fetch 'compact' data for recent 100 days to minimize API calls
            daily_data = await av_service.get_daily_adjusted_time_series(symbol, outputsize="compact")

            if daily_data and not daily_data.get("error"):
                for date_str, data_point in daily_data.items():
                    price_date = date.fromisoformat(date_str)
                    adjusted_close = float(data_point['5. adjusted close'])

                    # Only store if not already present for this date
                    if not get_stock_price_on_date(db, symbol, price_date):
                        create_stock_daily_price(db, symbol, price_date, adjusted_close)
                        # print(f"  Stored {symbol} on {price_date}: {adjusted_close}")
                    # else:
                        # print(f"  Price for {symbol} on {price_date} already exists. Skipping.")
            elif daily_data and daily_data.get("error"):
                print(f"Error fetching daily data for {symbol}: {daily_data['error']}")
            else:
                print(f"No daily data returned for {symbol}.")
        
        print("Daily price fetch completed.")

    except Exception as e:
        print(f"An error occurred during daily price fetch: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import asyncio
    # To ensure database tables are created before running script
    # This should ideally be handled by alembic migrations in production
    Base.metadata.create_all(bind=engine) 
    asyncio.run(fetch_and_store_daily_prices())