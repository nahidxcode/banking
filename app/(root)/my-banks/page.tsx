import BankCard from "@/components/BankCard";
import HeaderBox from "@/components/HeaderBox";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import React from "react";

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser();

  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  const bankAccounts =
    accounts?.data.filter(
      (account: Account) => account.accountType !== "mfs",
    ) || [];

  const walletAccounts =
    accounts?.data.filter(
      (account: Account) => account.accountType === "mfs",
    ) || [];

  return (
    <section className="flex">
      <div className="my-banks">
        <HeaderBox
          title="My Accounts"
          subtext="Manage your bank accounts and mobile wallets."
        />

        {/* BANKS */}
        <div className="space-y-4">
          <h2 className="header-2">Your Banks</h2>

          <div className="flex flex-wrap gap-6">
            {bankAccounts.length > 0 ? (
              bankAccounts.map((a: Account) => (
                <BankCard
                  key={a.id}
                  account={a}
                  userName={loggedIn?.firstName}
                />
              ))
            ) : (
              <p className="text-gray-500">No bank accounts connected.</p>
            )}
          </div>
        </div>

        {/* WALLETS */}
        <div className="space-y-4">
          <h2 className="header-2">Your Wallets</h2>

          <div className="flex flex-wrap gap-6">
            {walletAccounts.length > 0 ? (
              walletAccounts.map((a: Account) => (
                <BankCard
                  key={a.id}
                  account={a}
                  userName={loggedIn?.firstName}
                />
              ))
            ) : (
              <p className="text-gray-500">No mobile wallets connected.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyBanks;
