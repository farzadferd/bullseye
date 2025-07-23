from fastapi import APIRouter, HTTPException
from app.services.alpha_vantage_service import get_stock_price

router = APIRouter()

@router.get("/stock/{symbol}")
async def get_stock_data(symbol: str):
    try:
        price = await get_stock_price(symbol)
        return {
            "symbol": symbol.upper(),
            "price": price["price"],
            "change": price["change"],
            "percent_change": price["percent_change"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
