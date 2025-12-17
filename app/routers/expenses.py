from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from datetime import datetime, timedelta
# Import from parent app
from .. import database, models, schemas
from .. import auth as auth_logic

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("/", response_model=schemas.ExpenseResponse)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth_logic.get_current_user)
):
    new_expense = models.Expense(**expense.model_dump(), user_id=current_user.id)
    if not new_expense.date:
        new_expense.date = datetime.utcnow()
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    filter_type: str = Query("all", enum=["all", "day", "week", "month"]),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth_logic.get_current_user)
):
    query = db.query(models.Expense).filter(models.Expense.user_id == current_user.id)
    
    now = datetime.utcnow()
    if filter_type == "day":
        query = query.filter(models.Expense.date >= now - timedelta(days=1))
    elif filter_type == "week":
        query = query.filter(models.Expense.date >= now - timedelta(weeks=1))
    elif filter_type == "month":
        query = query.filter(models.Expense.date >= now - timedelta(days=30))
        
    return query.order_by(models.Expense.date.desc()).all()

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth_logic.get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id, 
        models.Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}

@router.get("/export")
def export_expenses(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth_logic.get_current_user)
):
    expenses = db.query(models.Expense).filter(models.Expense.user_id == current_user.id).all()
    
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(["ID", "Amount", "Category", "Description", "Date"])
    
    for exp in expenses:
        writer.writerow([exp.id, exp.amount, exp.category, exp.description, exp.date])
        
    stream.seek(0)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=expenses.csv"
    return response