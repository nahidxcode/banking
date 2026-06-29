export const calculateMonthlyAnalytics = (
  transactions: Transaction[],
  selectedMonth: string,
) => {
  const monthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    const transactionMonth = `${transactionDate.getFullYear()}-${String(
      transactionDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    return transactionMonth === selectedMonth;
  });

  // transfers are internal, not real income/spending
  const expenses = monthlyTransactions.filter(
    (t) =>
      Number(t.amount) > 0 && t.type !== "credit" && t.category !== "Transfer",
  );

  // income = anything tagged "INCOME" (salary, remittance, wallet withdrawals)
  const incomeTransactions = monthlyTransactions.filter(
    (t) => t.category === "INCOME",
  );

  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );

  const netCashflow = totalIncome - totalExpenses;

  const categoryMap: Record<string, number> = {};

  expenses.forEach((transaction) => {
    const category = transaction.category || "Other";

    categoryMap[category] =
      (categoryMap[category] || 0) + Number(transaction.amount);
  });

  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name,
      amount,
    }));

  // spending grouped by merchant (transaction name), not category
  const merchantMap: Record<string, number> = {};

  expenses.forEach((transaction) => {
    const name = transaction.name || "Unknown";

    merchantMap[name] = (merchantMap[name] || 0) + Number(transaction.amount);
  });

  const topMerchants = Object.entries(merchantMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  // single largest expense of the month
  const biggestTransaction = expenses.reduce<{
    name: string;
    amount: number;
  } | null>((max, t) => {
    const amount = Number(t.amount);
    return amount > (max?.amount ?? -Infinity) ? { name: t.name, amount } : max;
  }, null);

  return {
    totalIncome,
    totalExpenses,
    netCashflow,
    categoryMap,
    sortedCategories,
    topMerchants,
    biggestTransaction,
    expenseCount: expenses.length,
  };
};
