// Validation utilities for budget tracking workflow

export const validateWorkflow = {
  // Check if user has wallets before creating budgets or transactions
  hasWallets: (wallets) => {
    return wallets && wallets.length > 0;
  },

  // Check if user has budgets for expense transactions
  hasBudgets: (budgets) => {
    return budgets && budgets.length > 0;
  },

  // Calculate wallet balance
  getWalletBalance: (walletId, transactions = []) => {
    const walletTransactions = transactions.filter(t => t.walletId === walletId);
    const income = walletTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = walletTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  },

  // Check if wallet has sufficient balance for budget creation
  checkBudgetAffordability: (budget, walletId, transactions = []) => {
    const walletBalance = validateWorkflow.getWalletBalance(walletId, transactions);
    
    // Can't create budget if wallet has no money
    if (walletBalance <= 0) {
      return {
        valid: false,
        message: `Cannot create budget. Wallet has no available funds ($${walletBalance.toFixed(2)}). Add income first.`,
        noFunds: true
      };
    }

    // Warning if budget is more than 50% of available balance
    if (budget.amount > walletBalance * 0.5) {
      return {
        valid: true,
        warning: true,
        message: `Budget amount ($${budget.amount}) is ${Math.round((budget.amount / walletBalance) * 100)}% of your wallet balance ($${walletBalance.toFixed(2)}). Consider a lower amount.`
      };
    }

    // Warning if budget is more than wallet balance
    if (budget.amount > walletBalance) {
      return {
        valid: false,
        message: `Budget amount ($${budget.amount}) exceeds wallet balance ($${walletBalance.toFixed(2)}). You cannot budget more than you have.`,
        exceedsBalance: true
      };
    }

    return { valid: true };
  },

  // Check total budgets vs wallet balance
  checkTotalBudgetLimit: (newBudget, existingBudgets = [], walletId, transactions = []) => {
    const walletBalance = validateWorkflow.getWalletBalance(walletId, transactions);
    const walletBudgets = existingBudgets.filter(b => b.walletId === walletId);
    const totalExistingBudgets = walletBudgets.reduce((sum, b) => sum + b.amount, 0);
    const newTotalBudgets = totalExistingBudgets + newBudget.amount;

    if (newTotalBudgets > walletBalance) {
      return {
        valid: false,
        message: `Total budgets ($${newTotalBudgets.toFixed(2)}) would exceed wallet balance ($${walletBalance.toFixed(2)}). Current budgets: $${totalExistingBudgets.toFixed(2)}`,
        exceedsTotalBalance: true
      };
    }

    // Warning if total budgets > 80% of balance
    if (newTotalBudgets > walletBalance * 0.8) {
      return {
        valid: true,
        warning: true,
        message: `Total budgets will be ${Math.round((newTotalBudgets / walletBalance) * 100)}% of wallet balance. Consider leaving some unbudgeted funds for emergencies.`
      };
    }

    return { valid: true };
  },

  // Check if expense transaction exceeds budget
  checkBudgetLimit: (transaction, budgets, existingTransactions = []) => {
    if (transaction.type !== 'expense') return { valid: true };

    const categoryBudget = budgets.find(b => 
      b.category.toLowerCase() === transaction.category.toLowerCase() &&
      b.walletId === transaction.walletId
    );

    if (!categoryBudget) {
      return {
        valid: false,
        message: `No budget found for category "${transaction.category}". Create a budget first or choose a different category.`,
        noBudget: true
      };
    }

    // Calculate current spending in this category for this wallet
    const categoryTransactions = existingTransactions.filter(t => 
      t.type === 'expense' &&
      t.category.toLowerCase() === transaction.category.toLowerCase() &&
      t.walletId === transaction.walletId
    );

    const currentSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remainingBudget = categoryBudget.amount - currentSpent;
    const newTotal = currentSpent + transaction.amount;

    if (transaction.amount > remainingBudget) {
      return {
        valid: false,
        message: `Transaction ($${transaction.amount}) exceeds remaining budget ($${remainingBudget.toFixed(2)}) for "${transaction.category}". Budget: $${categoryBudget.amount}, Already spent: $${currentSpent.toFixed(2)}`,
        budgetExceeded: true,
        budget: categoryBudget.amount,
        currentSpent,
        remainingBudget
      };
    }

    // Warning if spending > 80% of budget
    if (newTotal > categoryBudget.amount * 0.8) {
      return {
        valid: true,
        warning: true,
        message: `Warning: This transaction will use ${Math.round((newTotal / categoryBudget.amount) * 100)}% of your "${transaction.category}" budget. Remaining: $${(categoryBudget.amount - newTotal).toFixed(2)}`
      };
    }

    return { valid: true };
  },

  // Check wallet balance for transactions
  checkWalletBalance: (transaction, walletTransactions = []) => {
    if (transaction.type === 'income') return { valid: true };

    const currentBalance = validateWorkflow.getWalletBalance(transaction.walletId, walletTransactions);

    if (currentBalance <= 0) {
      return {
        valid: false,
        message: `Cannot make expense transaction. Wallet has no funds ($${currentBalance.toFixed(2)}). Add income first.`,
        noFunds: true
      };
    }

    if (transaction.amount > currentBalance) {
      return {
        valid: false,
        message: `Insufficient funds. Available: $${currentBalance.toFixed(2)}, Required: $${transaction.amount}. Shortfall: $${(transaction.amount - currentBalance).toFixed(2)}`,
        insufficientFunds: true,
        shortfall: transaction.amount - currentBalance
      };
    }

    // Warning if transaction uses > 50% of remaining balance
    if (transaction.amount > currentBalance * 0.5) {
      return {
        valid: true,
        warning: true,
        message: `This transaction will use ${Math.round((transaction.amount / currentBalance) * 100)}% of your wallet balance. Remaining after: $${(currentBalance - transaction.amount).toFixed(2)}`
      };
    }

    return { valid: true };
  },

  // Validate minimum transaction amounts
  checkMinimumAmount: (amount, type) => {
    const minAmount = 0.01;
    if (amount < minAmount) {
      return {
        valid: false,
        message: `${type === 'income' ? 'Income' : 'Expense'} amount must be at least $${minAmount}`
      };
    }
    return { valid: true };
  },

  // Check for duplicate transactions (same amount, category, date)
  checkDuplicateTransaction: (transaction, existingTransactions = []) => {
    const duplicates = existingTransactions.filter(t => 
      t.amount === transaction.amount &&
      t.category === transaction.category &&
      t.type === transaction.type &&
      t.walletId === transaction.walletId &&
      new Date(t.date).toDateString() === new Date(transaction.date).toDateString()
    );

    if (duplicates.length > 0) {
      return {
        valid: true,
        warning: true,
        message: `Similar transaction already exists today. Are you sure this isn't a duplicate?`
      };
    }

    return { valid: true };
  },

  // Check if budget period is realistic
  checkBudgetPeriod: (budget) => {
    const currentDate = new Date();
    const budgetDate = new Date(budget.year, budget.month - 1);
    const monthsDiff = (budgetDate.getFullYear() - currentDate.getFullYear()) * 12 + (budgetDate.getMonth() - currentDate.getMonth());

    if (monthsDiff < -1) {
      return {
        valid: false,
        message: `Cannot create budget for past months. Selected: ${budgetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      };
    }

    if (monthsDiff > 12) {
      return {
        valid: true,
        warning: true,
        message: `Creating budget for ${budgetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${monthsDiff} months ahead). Consider shorter-term planning.`
      };
    }

    return { valid: true };
  }
};

export const getWorkflowMessages = {
  noWallets: {
    title: "Create a Wallet First",
    message: "You need to create at least one wallet before adding budgets or transactions. Wallets help organize your finances."
  },
  
  noFunds: {
    title: "Add Income First",
    message: "Your wallet has no funds. Add some income before creating budgets or making expense transactions."
  },

  noBudgets: {
    title: "Create a Budget First", 
    message: "For expense tracking, create a budget for this category first. This helps you stay within your spending limits."
  },

  budgetExceedsBalance: (budgetAmount, balance) => ({
    title: "Budget Too High",
    message: `Budget amount ($${budgetAmount}) exceeds your wallet balance ($${balance}). You cannot budget more than you have.`
  }),

  totalBudgetExceeds: (totalBudgets, balance) => ({
    title: "Total Budgets Too High",
    message: `Total budgets ($${totalBudgets}) would exceed wallet balance ($${balance}). Reduce some budget amounts.`
  }),

  budgetExceeded: (category, remaining, amount) => ({
    title: "Budget Limit Exceeded",
    message: `This $${amount} expense exceeds your remaining "${category}" budget of $${remaining}.`
  }),

  budgetWarning: (category, percentage, remaining) => ({
    title: "Budget Warning",
    message: `You'll have used ${percentage}% of your "${category}" budget. Remaining: $${remaining}`
  }),

  insufficientFunds: (balance, amount, shortfall) => ({
    title: "Insufficient Funds",
    message: `Need $${amount} but only have $${balance}. Shortfall: $${shortfall}. Add income first.`
  }),

  balanceWarning: (percentage, remaining) => ({
    title: "Large Expense Warning",
    message: `This will use ${percentage}% of your wallet balance. Remaining after: $${remaining}`
  }),

  duplicateWarning: {
    title: "Possible Duplicate",
    message: "Similar transaction already exists today. Double-check to avoid duplicates."
  },

  minimumAmount: (type) => ({
    title: "Amount Too Small",
    message: `${type} amount must be at least $0.01`
  }),

  pastBudget: (period) => ({
    title: "Invalid Budget Period",
    message: `Cannot create budget for ${period}. Choose current or future months only.`
  }),

  workflowSuccess: {
    wallet: { title: "Wallet Created", message: "You can now add income, create budgets, and track expenses!" },
    budget: { title: "Budget Created", message: "Budget set successfully. You can now track expenses for this category." },
    transaction: { title: "Transaction Added", message: "Transaction recorded successfully!" },
    income: { title: "Income Added", message: "Great! You can now create budgets and make expense transactions." }
  },

  workflowTips: {
    firstIncome: {
      title: "Add Your First Income",
      message: "Start by adding your salary, freelance payment, or any money you have. This creates your spending power."
    },
    createBudget: {
      title: "Set Spending Limits",
      message: "Create budgets for categories like Food, Transportation, Entertainment to control your spending."
    },
    trackExpenses: {
      title: "Track Every Expense",
      message: "Record all your spending to see where your money goes and stay within budget limits."
    }
  }
};