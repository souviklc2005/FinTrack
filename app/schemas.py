from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[datetime] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

# --- Budget Schemas ---
class BudgetCreate(BaseModel):
    monthly_limit: float

class BudgetResponse(BaseModel):
    monthly_limit: float
    current_spending: float
    percentage: float
    alert_status: str # "safe", "warning", "critical"