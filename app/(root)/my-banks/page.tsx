import BankCard from "@/components/BankCard";
import DeleteBankButton from "@/components/DeleteBankButton";
import RemittanceCard from "@/components/RemittanceCard";
import RegenerateDemoButton from "@/components/RegenerateDemoButton";
import HeaderBox from "@/components/HeaderBox";
import Money from "@/components/Money";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/auth";
import { formatUsd } from "@/lib/utils";
import { Globe, Landmark, Smartphone, Wallet } from "lucide-react";
import React from "react";

const SectionHeader = ({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) => (
  <div className="flex items-center gap-2">
    <span className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
      {icon}
    </span>
    <h2 className="text-18 font-semibold text-gray-900 dark:text-white">
      {title}
    </h2>
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
      {count}
    </span>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-10 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
    {message}
  </div>
);

const OverviewCard = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900">
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
      {icon}
    </span>
    <div className="flex min-w-0 flex-col">
      <p className="text-12 text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-18 font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser();

  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  const bankAccounts =
    accounts?.data.filter(
      (account: Account) =>
        account.accountType !== "mfs" && account.accountType !== "remittance",
    ) || [];

  const walletAccounts =
    accounts?.data.filter(
      (account: Account) => account.accountType === "mfs",
    ) || [];

  const remittanceAccounts =
    accounts?.data.filter(
      (account: Account) => account.accountType === "remittance",
    ) || [];

  // remittance can only withdraw into demo bank/wallet accounts
  const withdrawTargets =
    accounts?.data.filter(
      (account: Account) =>
        account.accountType === "bank" || account.accountType === "mfs",
    ) || [];

  // each remittance account's own withdrawal history (USD)
  const remittanceTxMap: Record<string, Transaction[]> = {};
  await Promise.all(
    remittanceAccounts.map(async (a: Account) => {
      const detail = await getAccount({ appwriteItemId: a.appwriteItemId });
      remittanceTxMap[a.appwriteItemId] = detail?.transactions || [];
    }),
  );

  // BDT = banks + wallets; remittance is separate in USD
  const bdtBalance = [...bankAccounts, ...walletAccounts].reduce(
    (sum: number, a: Account) => sum + Number(a.currentBalance || 0),
    0,
  );
  const usdBalance = remittanceAccounts.reduce(
    (sum: number, a: Account) => sum + Number(a.currentBalance || 0),
    0,
  );
  const totalAccounts =
    bankAccounts.length + walletAccounts.length + remittanceAccounts.length;

  return (
    <section className="flex">
      <div className="my-banks">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <HeaderBox
            title="My Accounts"
            subtext="Manage your bank accounts, mobile wallets, and remittance."
          />

          <RegenerateDemoButton userId={loggedIn.$id} />
        </div>

        {/* overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            label="Total balance (BDT)"
            value={<Money value={bdtBalance} />}
            accent="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            icon={<Wallet size={20} />}
          />
          <OverviewCard
            label="Bank accounts"
            value={bankAccounts.length}
            accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            icon={<Landmark size={20} />}
          />
          <OverviewCard
            label="Mobile wallets"
            value={walletAccounts.length}
            accent="bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
            icon={<Smartphone size={20} />}
          />
          <OverviewCard
            label="Remittance (USD)"
            value={formatUsd(usdBalance)}
            accent="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            icon={<Globe size={20} />}
          />
        </div>

        {/* banks */}
        <div className="space-y-4">
          <SectionHeader
            icon={<Landmark size={16} />}
            title="Your Banks"
            count={bankAccounts.length}
          />

          <div className="flex flex-wrap gap-6">
            {bankAccounts.length > 0 ? (
              bankAccounts.map((a: Account) => (
                <div key={a.id} className="group relative w-fit">
                  <BankCard account={a} userName={loggedIn?.firstName} />
                  <DeleteBankButton
                    appwriteItemId={a.appwriteItemId}
                    name={a.name}
                  />
                </div>
              ))
            ) : (
              <EmptyState message="No bank accounts connected." />
            )}
          </div>
        </div>

        {/* wallets */}
        <div className="space-y-4">
          <SectionHeader
            icon={<Smartphone size={16} />}
            title="Your Wallets"
            count={walletAccounts.length}
          />

          <div className="flex flex-wrap gap-6">
            {walletAccounts.length > 0 ? (
              walletAccounts.map((a: Account) => (
                <div key={a.id} className="group relative w-fit">
                  <BankCard account={a} userName={loggedIn?.firstName} />
                  <DeleteBankButton
                    appwriteItemId={a.appwriteItemId}
                    name={a.name}
                  />
                </div>
              ))
            ) : (
              <EmptyState message="No mobile wallets connected." />
            )}
          </div>
        </div>

        {/* remittance */}
        <div className="space-y-4">
          <SectionHeader
            icon={<Globe size={16} />}
            title="International Wallets"
            count={remittanceAccounts.length}
          />

          <div className="flex flex-wrap gap-6">
            {remittanceAccounts.length > 0 ? (
              remittanceAccounts.map((a: Account) => (
                <div key={a.id} className="group relative w-fit">
                  <RemittanceCard
                    account={a}
                    userName={loggedIn?.firstName}
                    targets={withdrawTargets}
                    transactions={remittanceTxMap[a.appwriteItemId] || []}
                  />
                  <DeleteBankButton
                    appwriteItemId={a.appwriteItemId}
                    name={a.name}
                  />
                </div>
              ))
            ) : (
              <EmptyState message="No remittance accounts connected." />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyBanks;
