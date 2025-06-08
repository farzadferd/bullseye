from pydantic import BaseModel, EmailStr, Field

# Shared properties
class UserBase(BaseModel):
    email: EmailStr

# Schema for creating a new user
class UserCreate(UserBase):
    first_name: str
    last_name: str
    password: str
    confirm_password: str = Field(..., alias="confirmPassword")

# Schema for login
class UserLogin(UserBase):
    password: str

# Schema for returning user data (e.g., to frontend)
class UserResponse(UserBase):
    id: int
    first_name: str
    last_name: str

    class Config:
        orm_mode = True