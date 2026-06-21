import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";

import MonthlyAnalytics from "@/components/MonthlyAnalytics";

const MonthlyAnalyticsPage = async () => {
  const user = await getLoggedInUser();

  const accounts = await getAccounts({
    userId: user.$id,
  });

  if (!accounts) return null;

  const accountResults = await Promise.all(
    accounts.data.map(async (account: Account) => {
      return await getAccount({
        appwriteItemId: account.appwriteItemId,
      });
    }),
  );

  const allTransactions = accountResults.flatMap(
    (account) => account?.transactions || [],
  );

  return <MonthlyAnalytics transactions={allTransactions} />;
};

export default MonthlyAnalyticsPage;
