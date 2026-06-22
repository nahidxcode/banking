"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { formatDateTime, formatUsd } from "@/lib/utils";

import Money from "./Money";
import { USD_TO_BDT } from "@/constants";
import { withdrawRemittance } from "@/lib/actions/remittance.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const RemittanceCard = ({
  account,
  userName,
  targets,
  transactions = [],
}: {
  account: Account;
  userName: string;
  targets: Account[];
  transactions?: Transaction[];
}) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState(targets[0]?.appwriteItemId || "");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountNum = Number(amount) || 0;
  const bdt = amountNum * USD_TO_BDT;

  const handleWithdraw = async () => {
    setError("");

    if (!targetId) {
      setError("Select an account to withdraw to.");
      return;
    }

    if (amountNum <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (amountNum > account.currentBalance) {
      setError("Amount exceeds your available balance.");
      return;
    }

    setLoading(true);

    const res = await withdrawRemittance({
      remittanceBankId: account.appwriteItemId,
      targetBankId: targetId,
      amountUsd: amountNum,
    });

    if (res?.success) {
      setOpen(false);
      setAmount("");
      router.refresh();
    } else {
      setError(res?.message || "Withdrawal failed.");
    }

    setLoading(false);
  };

  return (
    <div className="flex w-[320px] max-w-full flex-col gap-3">
      {/* Card */}
      <div className="relative flex h-[190px] w-full flex-col justify-between overflow-hidden rounded-[20px] bg-gradient-to-br from-violet-600 via-violet-700 to-teal-600 p-5 text-white shadow-creditCard transition-all duration-200 hover:shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
            International Wallet
          </span>

          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
            USD
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-bold">{account.name}</h2>

          <p className="mt-1 text-3xl font-black">
            {formatUsd(account.currentBalance)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Account Holder</p>

            <p className="font-semibold">{userName}</p>
          </div>

          <div className="text-right">
            <p className="text-xs opacity-80">USD Wallet</p>

            <p className="font-semibold">****{account.mask || "0000"}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="w-full max-w-[320px] rounded-lg bg-violet-600 p-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
        Withdraw
      </button>

      {transactions.length > 0 && (
        <div className="w-full max-w-[320px] rounded-lg border p-3 dark:border-gray-700">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Recent withdrawals
          </p>

          <ul className="space-y-2">
            {transactions.slice(0, 4).map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-gray-800 dark:text-gray-200">
                    {tx.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(new Date(tx.date)).dateTime}
                  </p>
                </div>

                <span className="shrink-0 font-semibold text-red-500">
                  -{formatUsd(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw from {account.name}</DialogTitle>

            <DialogDescription>
              Available: {formatUsd(account.currentBalance)} · Rate: $1 = ৳
              {USD_TO_BDT}
            </DialogDescription>
          </DialogHeader>

          {targets.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Connect a bank or wallet first to withdraw your funds.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-500 dark:text-gray-400">Withdraw to</label>

                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3">
                  {targets.map((t) => (
                    <option
                      key={t.appwriteItemId}
                      value={t.appwriteItemId}
                      className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">
                      {t.name} ({t.accountType === "mfs" ? "Wallet" : "Bank"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-500 dark:text-gray-400">Amount (USD)</label>

                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3"
                />
              </div>

              <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">They will receive</p>

                <p className="mt-1 text-2xl font-bold text-emerald-500">
                  <Money value={bdt} />
                </p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 p-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </>
                ) : (
                  "Confirm Withdrawal"
                )}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemittanceCard;
