export const calculateBudgetUsage = (
  category: string,
  monthlyLimit: number,
  transactions: Transaction[],
) => {
  const now = new Date();

  const monthlyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear() &&
      transaction.category === category &&
      transaction.type !== "credit"
    );
  });

  const spent = monthlyTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0,
  );

  const remaining = monthlyLimit - spent;

  const percentage = monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0;

  return {
    spent,
    remaining,
    percentage,
  };
};
