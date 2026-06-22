import { getAccount } from "@/lib/actions/bank.actions";
import { getBanks } from "@/lib/actions/user.actions";
import { getLoggedInUser } from "@/lib/auth";
import FinancialInsights from "@/components/FinancialInsights";

const FinancialInsightsPage = async () => {
  const user = await getLoggedInUser();

  const banks = await getBanks({
    userId: user.$id,
  });

  if (!banks) return null;

  const accountResults = await Promise.all(
    banks
      .filter((bank: Bank) => bank.accountType !== "remittance")
      .map(async (bank: Bank) => {
        return await getAccount({
          appwriteItemId: bank.$id,
        });
      }),
  );

  const allTransactions = accountResults.flatMap(
    (account) => account?.transactions || [],
  );

  return <FinancialInsights transactions={allTransactions} />;
};

export default FinancialInsightsPage;
