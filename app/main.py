from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base
# UPDATED IMPORTS to match your filenames:
from .routers import auth as auth_router
from .routers import expenses as expense_router
from .routers import budgets as budget_router

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FAANG Expense Tracker")

# Include Routers
app.include_router(auth_router.router)
app.include_router(expense_router.router)
app.include_router(budget_router.router)

# Mount Static Files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def read_root():
    return FileResponse('app/static/index.html')