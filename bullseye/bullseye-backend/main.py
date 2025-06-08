from fastapi import FastAPI
from app.core.database import async_session  # Import async_session for DB usage
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

@app.on_event("startup")
async def startup():
    # Could initialize DB connection here if needed
    print("Starting up, DB engine ready.")

@app.on_event("shutdown")
async def shutdown():
    # Cleanup if needed
    print("Shutting down.")

@app.get("/")
async def root():
    return {"message": "Bullseye backend running"}
