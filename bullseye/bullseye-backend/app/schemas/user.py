from pydantic import BaseModel, EmailStr, Field

# Shared properties
class UserBase(BaseModel):
    email: EmailStr

# Schema for creating a new user
class UserCreate(UserBase):
    first_name: str
    last_name: str
    password: str
    confirmPassword: str = Field(..., alias="confirmPassword") # Frontend sends confirmPassword

    class Config: # Moved Config inside UserCreate as it's specific to this model, and updated for Pydantic V2
        validate_by_name = True # Renamed from allow_population_by_field_name in Pydantic v2
        extra = "forbid" # Forbids extra fields not defined in the schema


# Schema for login
class UserLogin(UserBase):
    password: str

# Schema for returning user data (e.g., to frontend)
class UserResponse(UserBase):
    id: int
    first_name: str
    last_name: str

    class Config:
        orm_mode = True # For Pydantic v1, in v2 this is via 'from_attributes = True' on the model itself (but orm_mode still works for now)