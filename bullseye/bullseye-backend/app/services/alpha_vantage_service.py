import httpx

API_KEY = "YOUR_ALPHA_VANTAGE_API_KEY"

async def get_stock_price(symbol: str) -> float:
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = await response.json()

    try:
        quote = data["Global Quote"]
        return {
            "price": float(quote["05. price"]),
            "change": float(quote["09. change"]),
            "percent_change": float(quote["10. change percent"].replace("%", "")),
        }
    except KeyError:
        raise Exception(f"Could not fetch stock data for symbol: {symbol}")