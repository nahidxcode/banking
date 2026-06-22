import HeaderBox from "@/components/HeaderBox";
import TransactionHistoryView from "@/components/TransactionHistoryView";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/auth";
import Money from "@/components/Money";
import React from "react";
import { BankDropdown } from "@/components/BankDropdown";

const TransactionHistory = async ({ searchParams: { id } }: SearchParamProps) => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  if (!accounts) return;

  // remittance is USD, handled on my-banks
  const accountsData =
    accounts?.data?.filter(
      (account: Account) => account.accountType !== "remittance",
    ) || [];
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

  const account = await getAccount({ appwriteItemId });

  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox
          title="Transaction History"
          subtext="See your bank details and transactions."
        />
      </div>

      <div className="space-y-6">
        <div className="mb-6">
          <BankDropdown accounts={accountsData} />
        </div>
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-gray-900 dark:text-white">
              {account?.data.name}
            </h2>

            <p className="text-14 text-gray-600 dark:text-gray-400">
              {account?.data.officialName}
            </p>

            <p className="text-14 font-semibold tracking-[1.1px] text-gray-900 dark:text-white">
              ●●●● ●●●● ●●●● {account?.data.mask}
            </p>
          </div>

          <div className="transactions-account-balance">
            <p className="text-14 text-gray-600 dark:text-gray-400">
              Current balance
            </p>

            <p className="text-24 text-center font-bold text-gray-900 dark:text-white">
              <Money value={account?.data.currentBalance || 0} />
            </p>
          </div>
        </div>

        <TransactionHistoryView transactions={account?.transactions || []} />
      </div>
    </div>
  );
};

export default TransactionHistory;
