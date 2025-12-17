from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
# Import from parent app
from .. import database, models, schemas
from .. import auth as auth_logic

router = APIRouter(prefix="/budget", tags=["Budget"])

@router.post("/", response_model=schemas.BudgetResponse)
def set_budget(
    budget: schemas.BudgetCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth_logic.get_current_user)
):
    db_budget = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).first()
    if db_budget:
        db_budget.monthly_limit = budget.monthly_limit
    else:
        db_budget = models.Budget(monthly_limit=budget.monthly_limit, user_id=current_user.id)
        db.add(db_budget)
    
    db.commit()
    return get_budget_status(db, current_user)

@router.get("/", response_model=schemas.BudgetResponse)
def get_budget_status(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth_logic.get_current_user)
):
    budget = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).first()
    limit = budget.monthly_limit if budget else 0.0
    
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    spending = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= start_of_month
    ).scalar() or 0.0
    
    percentage = (spending / limit * 100) if limit > 0 else 0.0
    
    status_alert = "safe"
    if limit > 0:
        if percentage >= 100:
            status_alert = "critical"
        elif percentage >= 80:
            status_alert = "warning"
            
    return {
        "monthly_limit": limit,
        "current_spending": spending,
        "percentage": round(percentage, 2),
        "alert_status": status_alert
    }