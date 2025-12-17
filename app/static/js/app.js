const api = {
    baseUrl: 'http://127.0.0.1:8000',
    getHeaders: () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }),
    async request(url, method = 'GET', body = null) {
        const options = { method, headers: this.getHeaders() };
        if (body) options.body = JSON.stringify(body);
        
        const res = await fetch(`${this.baseUrl}${url}`, options);
        if (res.status === 401) return app.logout();
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};

const ui = {
    isRegisterMode: false,
    toggleAuthView: () => {
        ui.isRegisterMode = !ui.isRegisterMode;
        const title = document.getElementById('auth-title');
        const btn = document.getElementById('auth-submit-btn');
        const toggleText = document.getElementById('auth-toggle-text');
        const toggleBtn = document.getElementById('toggle-auth-btn');
        const error = document.getElementById('auth-error');

        error.innerText = '';
        if (ui.isRegisterMode) {
            title.innerText = 'Register';
            btn.innerText = 'Sign Up';
            toggleText.innerText = 'Have an account?';
            toggleBtn.innerText = 'Login';
        } else {
            title.innerText = 'Login';
            btn.innerText = 'Login';
            toggleText.innerText = 'No account?';
            toggleBtn.innerText = 'Register';
        }
    },
    toggleAuth: (show) => {
        document.getElementById('auth-container').classList.toggle('hidden', !show);
        document.getElementById('app-container').classList.toggle('hidden', show);
    },
    toggleModal: (show) => {
        document.getElementById('expense-modal').classList.toggle('hidden', !show);
        if (!show) document.getElementById('expense-form').reset();
    },
    renderExpenses: (expenses) => {
        const list = document.getElementById('expense-list');
        list.innerHTML = expenses.length ? '' : '<p style="text-align:center;color:#888;padding:10px">No expenses found</p>';
        expenses.forEach(ex => {
            const date = new Date(ex.date).toLocaleDateString();
            list.innerHTML += `
                <div class="expense-item">
                    <div class="expense-info">
                        <div>${ex.category}</div>
                        <div>${date} - ${ex.description || 'No desc'}</div>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <span style="font-weight:bold; color: #1e293b; margin-right: 15px;">$${ex.amount.toFixed(2)}</span>
                        <span class="delete-btn" onclick="app.deleteExpense(${ex.id})">&times;</span>
                    </div>
                </div>
            `;
        });
    },
    updateBudgetUI: (data) => {
        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('budget-text');
        
        text.innerText = `$${data.current_spending.toFixed(2)} / $${data.monthly_limit.toFixed(2)}`;
        
        let width = Math.min(data.percentage, 100);
        fill.style.width = `${width}%`;
        
        fill.style.backgroundColor = data.alert_status === 'critical' ? '#ef4444' : 
                                     data.alert_status === 'warning' ? '#f59e0b' : '#22c55e';
    }
};

const charts = {
    catInstance: null,
    trendInstance: null,
    render: (expenses) => {
        const cats = {};
        const dates = {};
        
        // Aggregate Data
        expenses.forEach(e => {
            cats[e.category] = (cats[e.category] || 0) + e.amount;
            const d = new Date(e.date).toLocaleDateString();
            dates[d] = (dates[d] || 0) + e.amount;
        });

        // Pie Chart
        const ctxPie = document.getElementById('categoryChart').getContext('2d');
        if (charts.catInstance) charts.catInstance.destroy();
        charts.catInstance = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cats),
                datasets: [{ 
                    data: Object.values(cats), 
                    backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'] 
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Bar Chart
        const ctxBar = document.getElementById('trendChart').getContext('2d');
        if (charts.trendInstance) charts.trendInstance.destroy();
        charts.trendInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: Object.keys(dates),
                datasets: [{ 
                    label: 'Daily Spending', 
                    data: Object.values(dates), 
                    backgroundColor: '#6366f1' 
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
};

const app = {
    init: () => {
        if (localStorage.getItem('token')) {
            ui.toggleAuth(false);
            app.loadData();
        } else {
            ui.toggleAuth(true);
        }
    },
    handleAuth: async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorText = document.getElementById('auth-error');
        errorText.innerText = '';

        try {
            if (ui.isRegisterMode) {
                // Register
                const res = await fetch(`${api.baseUrl}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || 'Registration failed');
                }
                // Auto login after register? Or ask to login. Let's switch to login view.
                alert('Registration successful! Please login.');
                ui.toggleAuthView();
                document.getElementById('auth-form').reset();
            } else {
                // Login
                const formData = new FormData();
                formData.append('username', email);
                formData.append('password', password);

                const res = await fetch(`${api.baseUrl}/auth/login`, { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Invalid Credentials');
                
                const data = await res.json();
                localStorage.setItem('token', data.access_token);
                ui.toggleAuth(false);
                app.loadData();
            }
        } catch (err) {
            errorText.innerText = err.message;
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        ui.toggleAuth(true);
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    },
    loadData: async () => {
        const filter = document.getElementById('time-filter').value;
        try {
            const [expenses, budget] = await Promise.all([
                api.request(`/expenses/?filter_type=${filter}`),
                api.request('/budget/')
            ]);
            ui.renderExpenses(expenses);
            ui.updateBudgetUI(budget);
            charts.render(expenses);
        } catch(e) {
            console.error("Failed to load data", e);
        }
    },
    addExpense: async (e) => {
        e.preventDefault();
        const body = {
            amount: parseFloat(document.getElementById('ex-amount').value),
            category: document.getElementById('ex-category').value,
            description: document.getElementById('ex-desc').value,
            date: document.getElementById('ex-date').value || new Date().toISOString()
        };
        await api.request('/expenses/', 'POST', body);
        ui.toggleModal(false);
        app.loadData();
    },
    deleteExpense: async (id) => {
        if(confirm('Delete this expense?')) {
            await api.request(`/expenses/${id}`, 'DELETE');
            app.loadData();
        }
    },
    setBudget: async () => {
        const val = parseFloat(document.getElementById('new-budget-limit').value);
        if(!val) return;
        const res = await api.request('/budget/', 'POST', { monthly_limit: val });
        ui.updateBudgetUI(res);
        document.getElementById('new-budget-limit').value = '';
    },
    exportCSV: async () => {
        const response = await fetch(`${api.baseUrl}/expenses/export`, { headers: api.getHeaders() });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_expenses.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
};

// Event Listeners
document.getElementById('auth-form').addEventListener('submit', app.handleAuth);
document.getElementById('toggle-auth-btn').addEventListener('click', (e) => {
    e.preventDefault();
    ui.toggleAuthView();
});
document.getElementById('expense-form').addEventListener('submit', app.addExpense);
document.addEventListener('DOMContentLoaded', app.init);