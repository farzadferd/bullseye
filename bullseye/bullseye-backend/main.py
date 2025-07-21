from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db, Base, engine # Ensure Base and engine are imported
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.core import crud
from app.api.routes.auth import router as auth_router
from app.api.routes.portfolio import router as portfolio_router

# No explicit need for sqlalchemy.schema.CreateTable unless you're explicitly using it in a startup script

app = FastAPI()

app.include_router(auth_router)
app.include_router(portfolio_router)

# Define allowed origins for CORS
origins = [
    "http://localhost:8080",  # Your frontend application when run locally on loopback
    "http://10.0.0.180:8080",  # Your frontend application when accessed via its network IP
    "http://localhost:8081",  # Your backend itself (if making requests to self, less common for frontend)
    "http://10.0.0.180:8081",  # Your backend application when accessed via its network IP
    # Add other allowed origins if needed, e.g., your actual deployed frontend URL
]

# Add CORS middleware to your FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    # Use "*" to allow all methods. This is generally the safest for debugging CORS preflights.
    allow_methods=["*"], 
    # Use "*" to allow all headers. This is also the safest for debugging CORS preflights.
    allow_headers=["*"], 
    # Set max_age for preflight cache, usually 600 or 3600 seconds
    max_age=600,
)

# --- Removed explicit @app.options routes ---
# The CORSMiddleware should handle OPTIONS requests.
# Removing explicit routes to see if they were causing conflict.

@app.on_event("startup")
async def startup():
    print("INFO: Starting up, DB engine ready.")
    # Optional: If you are NOT using Alembic for migrations, you can uncomment the following lines
    # to create tables when the app starts. If you ARE using Alembic, keep this commented out
    # to avoid conflicts.
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
    print("INFO: Database startup tasks completed.")


@app.on_event("shutdown")
async def shutdown():
    print("INFO: Shutting down.")

@app.get("/")
async def root():
    return {"message": "Bullseye backend running"}

@app.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    print(f"DEBUG: Received signup request for email: {user.email}")
    existing_user = await crud.get_user_by_email(db, user.email)
    if existing_user:
        print(f"DEBUG: Email {user.email} already registered.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # FIX: Corrected to user.confirmPassword (camelCase) as defined in schema
    if user.password != user.confirmPassword: 
        print("DEBUG: Passwords do not match.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    print(f"DEBUG: Creating new user for email: {user.email}")
    try:
        new_user = await crud.create_user(db, user)
        print(f"DEBUG: User creation successful for ID: {new_user.id}")
        return new_user
    except HTTPException as e: # Catch HTTPException from crud.create_user (e.g., if re-raised commit error)
        print(f"ERROR: Caught HTTPException during user creation: {e.detail}")
        raise e
    except Exception as e: # Catch any other unexpected errors during user creation
        print(f"ERROR: Unexpected error during user creation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during user creation: {e}"
        )


@app.post("/login", response_model=UserResponse)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    print(f"DEBUG: Received login request for email: {user.email}")
    db_user = await crud.get_user_by_email(db, user.email)
    if not db_user:
        print(f"DEBUG: User not found for email: {user.email}")
        raise HTTPException(status_code=404, detail="User not found")
    
    if not crud.verify_password(user.password, db_user.hashed_password):
        print(f"DEBUG: Incorrect password for email: {user.email}")
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    print(f"DEBUG: Login successful for user: {db_user.email}")
    return db_user

