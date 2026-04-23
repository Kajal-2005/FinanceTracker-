// ============================================================
//  FinanceService — Angular-inspired Service Class
//  In Angular, a "Service" handles all your data and logic.
//  Components just call the service — they don't do the math.
//  This is that same idea, written in plain JavaScript!
// ============================================================

class FinanceService {

  constructor() {
    // Load saved data from browser storage (so data stays after refresh)
    const saved = localStorage.getItem("finance_data");
    this.transactions = saved ? JSON.parse(saved) : [];
  }

  // Save to browser storage
  _save() {
    localStorage.setItem("finance_data", JSON.stringify(this.transactions));
  }

  // Add a new transaction
  addTransaction(description, amount, type, category) {
    const newTransaction = {
      id: Date.now(),                          // unique ID using timestamp
      description: description,
      amount: parseFloat(amount),
      type: type,                              // "income" or "expense"
      category: category,
      date: new Date().toLocaleDateString("en-IN")  // Indian date format
    };
    this.transactions.push(newTransaction);
    this._save();
    return [...this.transactions];             // return a copy
  }

  // Delete a transaction by ID
  deleteTransaction(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this._save();
    return [...this.transactions];
  }

  // Get all transactions
  getAll() {
    return [...this.transactions];
  }

  // Calculate total income
  getTotalIncome() {
    return this.transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Calculate total expenses
  getTotalExpense() {
    return this.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Calculate balance
  getBalance() {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  // Format number as Indian Rupees ₹
  formatRupees(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Get spending by category (for summary)
  getCategorySummary() {
    const summary = {};
    this.transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        summary[t.category] = (summary[t.category] || 0) + t.amount;
      });
    return summary;
  }
}

// Create ONE shared instance (like Angular's singleton service)
const financeService = new FinanceService();
