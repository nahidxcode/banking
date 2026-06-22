export const calculateBudgetRecommendations = (transactions: Transaction[]) => {
  const categoryMonths: Record<string, Record<string, number>> = {};

  transactions.forEach((transaction) => {
    // only budget real spending, skip income + transfers
    if (transaction.type === "credit" || transaction.category === "Transfer")
      return;

    const date = new Date(transaction.date);

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    const category = transaction.category || "Other";

    if (!categoryMonths[category]) {
      categoryMonths[category] = {};
    }

    categoryMonths[category][monthKey] =
      (categoryMonths[category][monthKey] || 0) + Number(transaction.amount);
  });

  return Object.entries(categoryMonths)
    .map(([category, months]) => {
      const lastThreeMonths = Object.entries(months)
        .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
        .slice(0, 3);

      const values = lastThreeMonths.map(([_, amount]) => amount);

      const average =
        values.length > 0
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : 0;

      return {
        category,
        average,
        suggestedBudget: average * 1.1,
        monthsUsed: values.length,
      };
    })
    .filter((item) => item.average > 0)
    .sort((a, b) => b.average - a.average);
};
