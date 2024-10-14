document.addEventListener('DOMContentLoaded', () => {

    loadTransactions();
    loadBudgets();

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const addTransactionForm = document.getElementById('addTransactionForm');
    const addBudgetForm = document.getElementById('add-budget-form');
    const addRegularExpenseForm = document.getElementById('addRegularExpenseForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', handleAddTransaction);
    }

    if(addBudgetForm) {
        addBudgetForm.addEventListener('submit', handleBudget);
    }

    if(addRegularExpenseForm) {
        addRegularExpenseForm.addEventListener('submit', handleAddRegularExpense);
    }

    const showRegisterLink = document.getElementById('show-register');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden'); 
            registerForm.classList.remove('hidden'); 
        });
    }

    const showLoginLink = document.getElementById('show-login');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden'); 
            loginForm.classList.remove('hidden'); 
        });
    }
});


async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userId', data.userId); 
        window.location.href = 'dashboard.html'; 
    } else {
        console.error('Login failed:', await response.json());
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('email').value; // Include email here

    const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
    });

    if (response.ok) {
        console.log('Registration successful');
        window.location.href = 'index.html'; 
    } else {
        console.error('Registration failed:', await response.json());
    }
}


async function handleAddTransaction(event) {
    event.preventDefault();
    const userId = localStorage.getItem('userId');
    const category = document.getElementById('transactionCategory').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);

    const response = await fetch('http://localhost:5001/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, category, amount }),
    });

    if (response.ok) {
        console.log('Transaction added:', await response.json());
        loadTransactions();
    } else {
        console.error('Error adding transaction:', await response.json());
    }
}

// Load Transactions to display
async function loadTransactions() {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`http://localhost:5001/api/transactions?userId=${userId}`);
    const transactions = await response.json();

    const transactionsDiv = document.getElementById('transactions-container');
    transactionsDiv.innerHTML = ''; 

    transactions.forEach(transaction => {
        const div = document.createElement('div');
        div.textContent = `${transaction.category}: $${transaction.amount}`;
        transactionsDiv.appendChild(div);
    });
}

async function handleBudget(event) {
    event.preventDefault();
    const category = document.getElementById('budget-category').value;
    const limit = document.getElementById('budget-limit').value;
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch('http://localhost:5001/api/budgets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId, 
                category,
                limit,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Budget added successfully!');
            loadBudgets(); 
        } else {
            alert(`Error adding budget: ${data.message}`);
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

async function loadBudgets() {
    const userId = localStorage.getItem('userId');
    try {
        const response = await fetch(`http://localhost:5001/api/budgets?userId=${userId}`);
        const budgets = await response.json();

        const budgetsDiv = document.getElementById('budgets-container');
        budgetsDiv.innerHTML = ''; 

        if (budgets.length > 0) {
            budgets.forEach(budget => {
                const div = document.createElement('div');
                div.textContent = `${budget.category}: $${budget.limit}`;
                budgetsDiv.appendChild(div);
            });
        } else {
            budgetsDiv.textContent = 'No budgets available';
        }
    } catch (error) {
        console.error('Error loading budgets:', error);
    }
}


async function handleAddRegularExpense(event) {
    event.preventDefault();

    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const type = document.getElementById('expense-type').value;
    const category = document.getElementById('expense-category').value;
    const userId = localStorage.getItem('userId'); // Fetch userId from local storage

    console.log('Sending data:', { userId, name, amount, type, category });

    try {
        const response = await fetch('http://localhost:5001/api/regular-expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, name, amount: parseFloat(amount), type, category }), 
        });

        
        console.log('Response status:', response.status);
        console.log('Response body:', await response.json());

        if (response.ok) {
            loadRegularExpense(); 
            document.getElementById('addRegularExpenseForm').reset(); // Reset the form
        } else {
            console.error('Failed to add expense:', await response.json());
        }
    } catch (error) {
        console.error('Error adding regular expense:', error);
    }
}


async function loadRegularExpense() {
    const userId = localStorage.getItem('userId'); 
    console.log('Loading regular expenses');

    try {
        const response = await fetch(`http://localhost:5001/api/regular-expenses?userId=${userId}`); 

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const regularExpenses = await response.json();

        const regularExpensesList = document.getElementById('regular-expenses-list');
        regularExpensesList.innerHTML = '';  

        // Check if regularExpenses is an array
        if (Array.isArray(regularExpenses)) {
            regularExpenses.forEach(expense => {
                const expenseRow = document.createElement('tr');
                expenseRow.innerHTML = `
                    <td>${expense.name}</td>
                    <td>${expense.amount}</td>
                    <td>${expense.type}</td>
                    <td>${expense.category}</td>
                `;
                regularExpensesList.appendChild(expenseRow);
            });
        } else {
            console.error('Expected an array but got:', regularExpenses);
        }
    } catch (error) {
        console.error('Error loading regular expenses:', error);
    }
}


document.getElementById('logoutLink').addEventListener('click', function(event) {
    event.preventDefault(); 
    logout();
});

function logout() {
    localStorage.removeItem('userId'); 
    localStorage.removeItem('authToken'); 

    window.location.href = 'index.html'; 
}
