"use client";

import { useState } from "react";
import { createDemoBank } from "@/lib/actions/demo-bank.actions";

const bankOptions = [
  "BRAC Bank",
  "Dutch-Bangla Bank",
  "City Bank",
  "Prime Bank",
  "Eastern Bank",
  "Bank Asia",
  "Islami Bank",
  "Sonali Bank",
];

const mfsOptions = ["bKash", "Nagad", "Rocket", "Upay"];

const DemoBankForm = ({ userId }: { userId: string }) => {
  const [accountType, setAccountType] = useState<"bank" | "mfs">("bank");

  const [bankName, setBankName] = useState(bankOptions[0]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  const [isConnected, setIsConnected] = useState(false);
  const [generatedBalance, setGeneratedBalance] = useState(0);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === "bank") {
      if (!username || !password) {
        alert("Please enter username and password");
        return;
      }

      const balance = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;

      setGeneratedBalance(balance);
      setIsConnected(true);
    }

    if (accountType === "mfs") {
      if (!phoneNumber || !pin) {
        alert("Please enter phone number and PIN");
        return;
      }

      const balance = Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000;

      setGeneratedBalance(balance);
      setIsConnected(true);
    }
  };

  const handleLinkAccount = async () => {
    try {
      await createDemoBank({
        userId,
        bankName,
        balance: generatedBalance,
        accountType,
      });

      window.location.reload();
    } catch (error: any) {
      alert(
        `${bankName} is already connected.\n\nPlease choose another provider.`,
      );
    }
  };

  return (
    <div className="rounded-xl border p-6 dark:border-gray-700">
      <h2 className="mb-2 text-xl font-bold dark:text-white">
        Connect Account
      </h2>

      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Connect a bank account or mobile financial service.
      </p>

      {!isConnected ? (
        <>
          <div className="mb-6">
            <label className="mb-2 block font-medium dark:text-white">
              Account Type
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setAccountType("bank");
                  setBankName(bankOptions[0]);
                }}
                className={`rounded-lg border p-3 font-semibold ${
                  accountType === "bank"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : ""
                }`}>
                🏦 Bank Account
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType("mfs");
                  setBankName("bKash");
                }}
                className={`rounded-lg border p-3 font-semibold ${
                  accountType === "mfs"
                    ? "border-pink-500 bg-pink-500 text-white"
                    : ""
                }`}>
                📱 Mobile Financial Service
              </button>
            </div>
          </div>

          <form onSubmit={handleConnect} className="flex flex-col gap-4">
            {accountType === "bank" ? (
              <>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="rounded-lg border bg-transparent p-3">
                  {bankOptions.map((bank) => (
                    <option key={bank} value={bank} className="bg-slate-900">
                      {bank}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-lg border bg-transparent p-3"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border bg-transparent p-3"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 p-3 font-semibold text-white">
                  Connect Bank
                </button>
              </>
            ) : (
              <>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="rounded-lg border bg-transparent p-3">
                  {mfsOptions.map((wallet) => (
                    <option
                      key={wallet}
                      value={wallet}
                      className="bg-slate-900">
                      {wallet}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="rounded-lg border bg-transparent p-3"
                />

                <input
                  type="password"
                  placeholder="PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="rounded-lg border bg-transparent p-3"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-pink-600 p-3 font-semibold text-white">
                  Connect Wallet
                </button>
              </>
            )}
          </form>
        </>
      ) : (
        <div className="space-y-5">
          <div className="rounded-lg border border-green-500 bg-green-500/10 p-4">
            <h3 className="font-bold text-green-500">
              ✓ Connected Successfully
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              {bankName} account verified.
            </p>
          </div>

          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Available Balance
            </p>

            <p className="mt-2 text-4xl font-bold text-emerald-500">
              ৳{generatedBalance.toLocaleString("en-BD")}
            </p>
          </div>

          <button
            onClick={handleLinkAccount}
            className={`w-full rounded-lg p-3 font-semibold text-white ${
              accountType === "bank" ? "bg-blue-600" : "bg-pink-600"
            }`}>
            {accountType === "bank" ? "Link Account" : "Link Wallet"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DemoBankForm;
