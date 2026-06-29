"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { createDemoBank } from "@/lib/actions/demo-bank.actions";
import { createRemittanceAccount } from "@/lib/actions/remittance.actions";
import { remittanceOptions } from "@/constants";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

type AccountType = "bank" | "mfs" | "remittance";

const randomInRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

const ConnectAccountModal = ({
  userId,
  onLinked,
}: {
  userId: string;
  onLinked?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const [step, setStep] = useState(1);

  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const [provider, setProvider] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  const [otp, setOtp] = useState("");

  const [generatedBalance, setGeneratedBalance] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [linking, setLinking] = useState(false);

  const isRemittance = accountType === "remittance";

  // step 5 = connecting animation; run the timer in an effect so it doesn't stack
  useEffect(() => {
    if (step !== 5) return;

    const timer = setTimeout(() => {
      const balance =
        accountType === "bank"
          ? randomInRange(5000, 15000)
          : accountType === "mfs"
            ? randomInRange(3000, 12000)
            : randomInRange(200, 2000); // remittance: USD

      setGeneratedBalance(balance);
      setStep(6);
    }, 1800);

    return () => clearTimeout(timer);
  }, [step, accountType]);

  const resetModal = () => {
    setStep(1);
    setAccountType(null);
    setProvider("");
    setUsername("");
    setPassword("");
    setPhoneNumber("");
    setPin("");
    setOtp("");
    setGeneratedBalance(0);
    setErrorMessage("");
    setLinking(false);
  };

  const accentBtn =
    accountType === "bank"
      ? "bg-blue-600 hover:bg-blue-700"
      : accountType === "mfs"
        ? "bg-pink-600 hover:bg-pink-700"
        : "bg-violet-600 hover:bg-violet-700";

  const providerList =
    accountType === "bank"
      ? bankOptions
      : accountType === "mfs"
        ? mfsOptions
        : remittanceOptions;

  const handleLink = async () => {
    setLinking(true);
    setErrorMessage("");

    try {
      if (isRemittance) {
        await createRemittanceAccount({
          userId,
          provider,
          balanceUsd: Number(generatedBalance),
        });
      } else {
        await createDemoBank({
          userId,
          bankName: provider,
          balance: Number(generatedBalance),
          accountType: accountType as "bank" | "mfs",
        });
      }

      // let the caller decide what happens next (e.g. route to dashboard after
      // signup); default to a reload so existing usages refresh in place
      if (onLinked) {
        onLinked();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Couldn't connect this account. Please try again.",
      );
      setLinking(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          resetModal();
          setOpen(true);
        }}
        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]">
        + Add Account
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect Account</DialogTitle>

            <DialogDescription>
              Connect a bank account, mobile wallet, or remittance service.
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <button
                onClick={() => {
                  setAccountType("bank");
                  setStep(2);
                }}
                className="rounded-xl border border-gray-200 p-8 text-left transition hover:border-blue-500 hover:shadow-md dark:border-gray-700">
                <div className="mb-1 text-4xl">🏦</div>

                <h3 className="mt-4 text-xl font-bold">Bank Account</h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Connect BRAC, DBBL, City Bank and more
                </p>
              </button>

              <button
                onClick={() => {
                  setAccountType("mfs");
                  setStep(2);
                }}
                className="rounded-xl border border-gray-200 p-8 text-left transition hover:border-pink-500 hover:shadow-md dark:border-gray-700">
                <div className="mb-1 text-4xl">📱</div>

                <h3 className="mt-4 text-xl font-bold">Mobile Wallet</h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Connect bKash, Nagad, Rocket or Upay
                </p>
              </button>

              <button
                onClick={() => {
                  setAccountType("remittance");
                  setStep(2);
                }}
                className="rounded-xl border border-gray-200 p-8 text-left transition hover:border-violet-500 hover:shadow-md dark:border-gray-700">
                <div className="mb-1 text-4xl">💸</div>

                <h3 className="mt-4 text-xl font-bold">International Wallet</h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Connect Payoneer, Wise or ElevatePay
                </p>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 dark:text-gray-400">
                ← Back
              </button>

              {providerList.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setErrorMessage("");
                    setProvider(item);
                    setStep(3);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:border-blue-500 hover:shadow-sm dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {/* logo */}
                    {accountType === "mfs" ? (
                      <div className="flex h-12 w-24 items-center justify-center rounded-md bg-white/95 p-1">
                        <img
                          src={`/icons/${item.toLowerCase()}.jpg`}
                          alt={item}
                          className="max-h-full max-w-full rounded-md object-contain"
                        />
                      </div>
                    ) : isRemittance ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-2xl">
                        💸
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-2xl">
                        🏦
                      </div>
                    )}

                    <span className="font-medium">{item}</span>
                  </div>

                  <span className="text-gray-500 dark:text-gray-400">→</span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 space-y-4">
              <button
                onClick={() => {
                  setErrorMessage("");
                  setStep(2);
                }}
                className="text-sm text-gray-500 dark:text-gray-400">
                ← Back
              </button>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="font-bold">{provider}</h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Sign in to continue
                </p>
              </div>

              {accountType === "mfs" ? (
                <>
                  <input
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input-class w-full p-3"
                  />

                  <input
                    type="password"
                    placeholder="PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="input-class w-full p-3"
                  />
                </>
              ) : (
                <>
                  <input
                    placeholder={isRemittance ? "Email" : "Username"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-class w-full p-3"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-class w-full p-3"
                  />
                </>
              )}

              <button
                onClick={() => {
                  if (
                    (accountType === "mfs" && (!phoneNumber || !pin)) ||
                    (accountType !== "mfs" && (!username || !password))
                  ) {
                    alert("Please fill all fields");
                    return;
                  }

                  setStep(4);
                }}
                className={`w-full rounded-lg p-3 font-semibold text-white transition ${accentBtn}`}>
                Continue
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="mt-6 space-y-4">
              <button
                onClick={() => setStep(3)}
                className="text-sm text-gray-500 dark:text-gray-400">
                ← Back
              </button>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="font-bold">OTP Verification</h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the 4-digit code sent to your device
                </p>
              </div>

              <input
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                className="input-class w-full p-3 text-center text-xl tracking-[8px]"
              />

              <button
                onClick={() => {
                  if (otp.length !== 4) {
                    alert("Enter 4-digit OTP");
                    return;
                  }

                  setStep(5);
                }}
                className={`w-full rounded-lg p-3 font-semibold text-white transition ${accentBtn}`}>
                Verify OTP
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="mt-10 flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 dark:border-gray-700" />

              <h3 className="text-lg font-bold">Connecting to {provider}...</h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we verify your account
              </p>
            </div>
          )}

          {step === 6 && (
            <div className="mt-6 space-y-5">
              {errorMessage && (
                <div className="rounded-xl border border-red-500 bg-red-500/10 p-4">
                  <h3 className="font-bold text-red-500">
                    {errorMessage.includes("already connected")
                      ? "⚠ Provider Already Connected"
                      : "⚠ Connection Failed"}
                  </h3>

                  <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
              )}

              {!errorMessage && (
                <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
                  <h3 className="font-bold text-green-500">✓ Account Found</h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {provider} successfully connected
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Available Balance
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-500">
                  {isRemittance
                    ? `$${generatedBalance.toLocaleString("en-US")}`
                    : `৳${generatedBalance.toLocaleString("en-BD")}`}
                </p>
              </div>

              <button
                onClick={handleLink}
                disabled={linking}
                className={`flex w-full items-center justify-center gap-2 rounded-lg p-3 font-semibold text-white transition disabled:opacity-60 ${accentBtn}`}>
                {linking && <Loader2 size={18} className="animate-spin" />}
                {linking ? "Linking..." : "Link Account"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectAccountModal;
