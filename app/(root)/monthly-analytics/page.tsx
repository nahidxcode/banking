import { getAccount } from "@/lib/actions/bank.actions";
import { getBanks } from "@/lib/actions/user.actions";
import { getLoggedInUser } from "@/lib/auth";
import { redirect } from "next/navigation";

import MonthlyAnalytics from "@/components/MonthlyAnalytics";

const MonthlyAnalyticsPage = async () => {
  const user = await getLoggedInUser();
  if (!user) redirect("/sign-in");

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

  // per-account bundles so the page can scope analytics to a single account
  const accounts = accountResults
    .filter((r: any) => r?.data)
    .map((r: any) => ({
      appwriteItemId: r.data.appwriteItemId,
      name: r.data.name,
      transactions: r.transactions || [],
    }));

  return <MonthlyAnalytics accounts={accounts} />;
};

export default MonthlyAnalyticsPage;
