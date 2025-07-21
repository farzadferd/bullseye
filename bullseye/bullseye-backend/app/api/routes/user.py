from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth import get_current_user
from app.models import User
from sqlalchemy import update
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/user/cash")
async def get_cash_balance(user: User = Depends(get_current_user)):
    return {"cash_balance": user.cash_balance}

@router.post("/user/cash")
async def update_cash_balance(
    amount: float,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    stmt = (
        update(User)
        .where(User.id == user.id)
        .values(cash_balance=amount)
        .execution_options(synchronize_session="fetch")
    )
    await session.execute(stmt)
    await session.commit()
    return JSONResponse(content={"message": "Cash balance updated", "cash_balance": amount})
