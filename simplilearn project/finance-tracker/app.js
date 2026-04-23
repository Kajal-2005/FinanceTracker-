// ============================================================
//  app.js — React Components
//  React breaks the UI into small reusable pieces called
//  "Components". Each component is just a function that
//  returns HTML-like code (called JSX).
// ============================================================

const { useState } = React;

// ── Helper: Category emoji map ───────────────────────────────
const categoryEmoji = {
  "Food":        "🍔",
  "Transport":   "🚗",
  "Shopping":    "🛍️",
  "Bills":       "💡",
  "Health":      "🏥",
  "Education":   "📚",
  "Salary":      "💼",
  "Freelance":   "💻",
  "Gift":        "🎁",
  "Other":       "📦"
};

// ── Component 1: Summary Cards (Balance, Income, Expense) ────
function SummaryCards({ transactions }) {
  const balance = financeService.getBalance();
  const income  = financeService.getTotalIncome();
  const expense = financeService.getTotalExpense();

  return (
    <div className="summary-cards">
      <div className={`card balance-card ${balance < 0 ? "negative" : "positive"}`}>
        <p className="card-label">💰 Current Balance</p>
        <h2>{financeService.formatRupees(balance)}</h2>
      </div>
      <div className="card income-card">
        <p className="card-label">📈 Total Income</p>
        <h2>{financeService.formatRupees(income)}</h2>
      </div>
      <div className="card expense-card">
        <p className="card-label">📉 Total Expenses</p>
        <h2>{financeService.formatRupees(expense)}</h2>
      </div>
    </div>
  );
}

// ── Component 2: Add Transaction Form ────────────────────────
function AddTransactionForm({ onAdd }) {
  // useState is React's way of remembering form values
  const [description, setDescription] = useState("");
  const [amount,      setAmount]      = useState("");
  const [type,        setType]        = useState("expense");
  const [category,    setCategory]    = useState("Food");
  const [error,       setError]       = useState("");

  const incomeCategories  = ["Salary", "Freelance", "Gift", "Other"];
  const expenseCategories = ["Food", "Transport", "Shopping", "Bills", "Health", "Education", "Other"];
  const categories = type === "income" ? incomeCategories : expenseCategories;

  function handleSubmit(e) {
    e.preventDefault(); // stop page from refreshing

    // Simple validation
    if (!description.trim()) { setError("Please enter a description."); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { setError("Please enter a valid amount."); return; }

    setError("");
    onAdd(description, amount, type, category);

    // Clear the form
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Food");
  }

  return (
    <div className="form-card">
      <h3>➕ Add Transaction</h3>
      {error && <p className="error-msg">⚠️ {error}</p>}
      <form onSubmit={handleSubmit}>

        <label>Description</label>
        <input
          type="text"
          placeholder="e.g. Grocery shopping"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <label>Amount (₹)</label>
        <input
          type="number"
          placeholder="e.g. 500"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="1"
        />

        <label>Type</label>
        <div className="type-toggle">
          <button
            type="button"
            className={type === "expense" ? "active expense-btn" : ""}
            onClick={() => { setType("expense"); setCategory("Food"); }}
          >
            📉 Expense
          </button>
          <button
            type="button"
            className={type === "income" ? "active income-btn" : ""}
            onClick={() => { setType("income"); setCategory("Salary"); }}
          >
            📈 Income
          </button>
        </div>

        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{categoryEmoji[cat]} {cat}</option>
          ))}
        </select>

        <button type="submit" className="submit-btn">Add Transaction</button>
      </form>
    </div>
  );
}

// ── Component 3: Single Transaction Item ─────────────────────
function TransactionItem({ transaction, onDelete }) {
  const isIncome = transaction.type === "income";
  return (
    <div className={`transaction-item ${isIncome ? "income-item" : "expense-item"}`}>
      <div className="transaction-left">
        <span className="transaction-emoji">{categoryEmoji[transaction.category] || "📦"}</span>
        <div>
          <p className="transaction-desc">{transaction.description}</p>
          <p className="transaction-meta">{transaction.category} • {transaction.date}</p>
        </div>
      </div>
      <div className="transaction-right">
        <span className={`transaction-amount ${isIncome ? "green" : "red"}`}>
          {isIncome ? "+" : "-"}{financeService.formatRupees(transaction.amount)}
        </span>
        <button className="delete-btn" onClick={() => onDelete(transaction.id)}>🗑️</button>
      </div>
    </div>
  );
}

// ── Component 4: Transaction List ────────────────────────────
function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>🪙 No transactions yet!</p>
        <p>Add your first income or expense above.</p>
      </div>
    );
  }

  // Show newest first
  const sorted = [...transactions].reverse();

  return (
    <div className="transaction-list">
      <h3>📋 Transactions</h3>
      {sorted.map(t => (
        <TransactionItem key={t.id} transaction={t} onDelete={onDelete} />
      ))}
    </div>
  );
}

// ── Component 5: Category Summary ────────────────────────────
function CategorySummary({ transactions }) {
  const summary = financeService.getCategorySummary();
  const entries = Object.entries(summary);

  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, val]) => sum + val, 0);

  return (
    <div className="category-summary">
      <h3>📊 Spending by Category</h3>
      {entries.map(([cat, amount]) => {
        const percent = Math.round((amount / total) * 100);
        return (
          <div key={cat} className="category-row">
            <span>{categoryEmoji[cat]} {cat}</span>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: percent + "%" }}></div>
            </div>
            <span className="category-amount">{financeService.formatRupees(amount)} ({percent}%)</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App Component ────────────────────────────────────────
function App() {
  // This is the main "state" — list of all transactions
  const [transactions, setTransactions] = useState(financeService.getAll());

  // Called when user adds a transaction
  function handleAdd(description, amount, type, category) {
    const updated = financeService.addTransaction(description, amount, type, category);
    setTransactions(updated);
  }

  // Called when user deletes a transaction
  function handleDelete(id) {
    const updated = financeService.deleteTransaction(id);
    setTransactions(updated);
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>💰 Personal Finance Tracker</h1>
        <p>Track your income & expenses in Indian Rupees ₹</p>
      </header>

      {/* Summary Cards */}
      <SummaryCards transactions={transactions} />

      {/* Main Content: Form + List side by side */}
      <div className="main-content">
        <AddTransactionForm onAdd={handleAdd} />
        <div className="right-panel">
          <TransactionList transactions={transactions} onDelete={handleDelete} />
          <CategorySummary transactions={transactions} />
        </div>
      </div>

      <footer className="app-footer">
        <p>Built with React + Angular-inspired Service Pattern 🚀</p>
      </footer>
    </div>
  );
}

// ── Mount the App into the HTML page ─────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
