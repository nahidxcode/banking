export const calculateFinancialInsights = (transactions: Transaction[]) => {
  const totalTransactions = transactions.length;

  // transfers are internal, not real income/spending
  const spending = transactions.filter(
    (t) =>
      Number(t.amount) > 0 && t.type !== "credit" && t.category !== "Transfer",
  );

  // income = anything tagged "INCOME" (salary, remittance, wallet withdrawals)
  const income = transactions.filter((t) => t.category === "INCOME");

  const totalSpent = spending.reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);

  const spendingTransactions = transactions.filter((t) => Number(t.amount) > 0);

  const averageTransaction =
    spendingTransactions.length > 0
      ? spendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0) /
        spendingTransactions.length
      : 0;

  const categoryMap: Record<string, number> = {};
  const categoryCountMap: Record<string, number> = {};

  spending.forEach((transaction) => {
    const category = transaction.category || "Other";

    categoryMap[category] =
      (categoryMap[category] || 0) + Number(transaction.amount);

    categoryCountMap[category] = (categoryCountMap[category] || 0) + 1;
  });

  const topCategory =
    Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const mostActiveCategory =
    Object.entries(categoryCountMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "N/A";

  const transferCount = transactions.filter(
    (t) => t.category === "Transfer",
  ).length;

  return {
    totalTransactions,
    totalSpent,
    totalIncome,
    averageTransaction,
    topCategory,
    mostActiveCategory,
    transferCount,
    categoryMap,
    categoryCountMap,
  };
};
