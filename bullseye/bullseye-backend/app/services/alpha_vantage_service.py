from typing import Any, Dict, Optional
import os
from dotenv import load_dotenv
import httpx

load_dotenv()

API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

class AlphaVantageService:
    base_url = "https://www.alphavantage.co/query"

    async def get_stock_quote(self, symbol: str) -> Optional[Dict[str, float]]:
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": API_KEY,
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(self.base_url, params=params)
            data = await response.json()

        try:
            quote = data["Global Quote"]
            return {
                "price": float(quote["05. price"]),
                "change": float(quote["09. change"]),
                "percent_change": float(quote["10. change percent"].replace("%", "")),
            }
        except KeyError:
            print(f"Could not fetch GLOBAL_QUOTE for {symbol}: {data}")
            return None

    async def get_daily_adjusted_time_series(self, symbol: str, outputsize: str = "compact") -> Optional[Dict[str, Any]]:
        params = {
            "function": "TIME_SERIES_DAILY_ADJUSTED",
            "symbol": symbol,
            "apikey": API_KEY,
            "outputsize": outputsize
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = await response.json()
                if "Time Series (Daily)" in data:
                    return data["Time Series (Daily)"]
                elif "Error Message" in data:
                    print(f"API Error for {symbol}: {data['Error Message']}")
                    return {"error": data["Error Message"]}
            except Exception as e:
                print(f"Error fetching adjusted series for {symbol}: {e}")
            return None

    