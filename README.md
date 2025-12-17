
# 💰 Expense Tracker Pro

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-High%20Performance-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-07405e?style=for-the-badge&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow?style=for-the-badge&logo=javascript&logoColor=white)

A high-performance, full-stack **Personal Finance Dashboard** engineered with **FastAPI** and **Vanilla JavaScript**. This application provides a seamless, Single Page Application (SPA) experience for tracking expenses, managing monthly budgets, and visualizing spending habits through dynamic charts—without heavy frontend frameworks.

---

## ✨ Salient Features

### 📊 **Visual Analytics**
*   **Dynamic Category Breakdown:** Interactive **Doughnut Charts** powered by *Chart.js* visualize exactly where your money goes.
*   **Trend Analysis:** Real-time **Bar Charts** display daily spending trends to help identify patterns.

### 💸 **Smart Budgeting System**
*   **Live Progress Tracking:** A real-time budget bar that dynamically updates as you add expenses.
*   **Intelligent Alerts:** Visual feedback changes color based on spending intensity:
    *   🟢 **Safe:** Under 80% utilization.
    *   🟠 **Warning:** 80% - 99% utilization.
    *   🔴 **Critical:** 100%+ over budget.

### 🔐 **Enterprise-Grade Security**
*   **Stateless Authentication:** Secure login system using **JWT (JSON Web Tokens)**.
*   **Data Protection:** User passwords are encrypted using industry-standard **PBKDF2/Bcrypt** hashing algorithms.
*   **Private Data Isolation:** Users can only access and modify their own financial data.

### ⚡ **High-Performance UI**
*   **Zero-Refresh Updates:** Add, delete, and filter expenses instantly using the Fetch API (AJAX) without reloading the page.
*   **Responsive Design:** A professional, mobile-friendly dashboard layout built with modern **CSS Grid** and **Flexbox**.
*   **Time Filtering:** Instantly toggle between Daily, Weekly, and Monthly views.

### 📂 **Data Portability**
*   **CSV Export:** Built-in backend utility to stream and download your entire transaction history as a CSV file for external analysis (Excel/Google Sheets).

---

## 🛠️ Technologies Used

### Backend Ecosystem
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **FastAPI** | High-performance, async Python web framework. |
| **ORM** | **SQLAlchemy** | SQL toolkit for efficient database abstraction. |
| **Database** | **SQLite** | Serverless, self-contained SQL database engine. |
| **Validation** | **Pydantic** | Strict data parsing and validation (incl. EmailStr). |
| **Security** | **Python-Jose** | JWT token generation and validation. |
| **Server** | **Uvicorn** | Lightning-fast ASGI web server implementation. |

### Frontend Ecosystem
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Core** | **Vanilla JS (ES6+)** | Lightweight logic without React/Vue/Angular dependencies. |
| **Styling** | **CSS3** | Custom variables, Flexbox, and Grid layouts. |
| **Charts** | **Chart.js** | Canvas-based responsive charting library. |
| **Icons** | **HTML Entities** | Lightweight UI elements. |

---

## 📂 Project Directory

```text
expense_tracker/
├── app/
│   ├── routers/             # Modular API Routes
│   │   ├── auth.py          # Login & Registration Logic
│   │   ├── budgets.py       # Budget Calculation & Alerts
│   │   └── expenses.py      # Transaction CRUD & Export
│   ├── static/              # Frontend Assets
│   │   ├── css/style.css    # Modern UI Styling
│   │   ├── js/app.js        # API Integration & Chart Logic
│   │   └── index.html       # Single Page Application Entry
│   ├── main.py              # Application Entry Point
│   ├── models.py            # SQLAlchemy Database Models
│   ├── schemas.py           # Pydantic Request/Response Models
│   ├── auth.py              # Security & Hashing Utilities
│   └── database.py          # DB Session Management
├── .env                     # Configuration Secrets
└── requirements.txt         # Project Dependencies
```

---

## 🚀 How to Run

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/expense-tracker.git
    cd expense_tracker
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r app/requirements.txt
    ```

3.  **Start the Server**
    ```bash
    uvicorn app.main:app --reload
    ```

4.  **Access the Application**
    Open your browser and navigate to:
    👉 **http://127.0.0.1:8000**

5.  **API Documentation (Swagger UI)**
    For developers, full API documentation is available at:
    👉 **http://127.0.0.1:8000/docs**
