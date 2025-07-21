import httpx

API_KEY = "YOUR_ALPHA_VANTAGE_API_KEY"

async def get_stock_price(symbol: str) -> float:
    url = f"https://www.alphavantage.co/query"
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()
        price_str = data.get("Global Quote", {}).get("05. price")
        if not price_str:
            raise ValueError("Invalid symbol or API error")
        return float(price_str)