"use client";

import { useState } from "react";
import { createDemoBank } from "@/lib/actions/demo-bank.actions";

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

const ConnectAccountModal = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);

  const [step, setStep] = useState(1);

  const [accountType, setAccountType] = useState<"bank" | "mfs" | null>(null);

  const [provider, setProvider] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  const [otp, setOtp] = useState("");

  const [generatedBalance, setGeneratedBalance] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");

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
  };

  return (
    <>
      <button
        onClick={() => {
          resetModal();
          setOpen(true);
        }}
        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white">
        + Add Account
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border-gray-700 bg-slate-950">
          <DialogHeader>
            <DialogTitle>Connect Account</DialogTitle>

            <DialogDescription>
              Connect a bank account or mobile wallet.
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setAccountType("bank");
                  setStep(2);
                }}
                className="rounded-xl border border-gray-700 p-6 text-left transition hover:border-blue-500">
                <div className="text-3xl">🏦</div>

                <h3 className="mt-3 text-lg font-bold">Bank Account</h3>

                <p className="mt-1 text-sm text-gray-400">
                  Connect BRAC, DBBL, City Bank and more
                </p>
              </button>

              <button
                onClick={() => {
                  setAccountType("mfs");
                  setStep(2);
                }}
                className="rounded-xl border border-gray-700 p-6 text-left transition hover:border-pink-500">
                <div className="text-3xl">📱</div>

                <h3 className="mt-3 text-lg font-bold">Mobile Wallet</h3>

                <p className="mt-1 text-sm text-gray-400">
                  Connect bKash, Nagad, Rocket or Upay
                </p>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-400">
                ← Back
              </button>

              {(accountType === "bank" ? bankOptions : mfsOptions).map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setErrorMessage("");
                      setProvider(item);
                      setStep(3);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-700 p-4 transition hover:border-blue-500">
                    <div className="flex items-center gap-3">
                      {/* LOGO */}
                      {accountType === "mfs" ? (
                        <div className="flex h-12 w-24 items-center justify-center rounded-md bg-white p-1">
                          <img
                            src={`/icons/${item.toLowerCase()}.jpg`}
                            alt={item}
                            className="max-h-full max-w-full rounded-md object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-2xl">
                          🏦
                        </div>
                      )}

                      <span className="font-medium">{item}</span>
                    </div>

                    <span className="text-gray-400">→</span>
                  </button>
                ),
              )}
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 space-y-4">
              <button
                onClick={() => {
                  setErrorMessage("");
                  setStep(2);
                }}
                className="text-sm text-gray-400">
                ← Back
              </button>

              <div className="rounded-xl border border-gray-700 p-4">
                <h3 className="font-bold">{provider}</h3>

                <p className="mt-1 text-sm text-gray-400">
                  Sign in to continue
                </p>
              </div>

              {accountType === "bank" ? (
                <>
                  <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-transparent p-3"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-transparent p-3"
                  />
                </>
              ) : (
                <>
                  <input
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-transparent p-3"
                  />

                  <input
                    type="password"
                    placeholder="PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-transparent p-3"
                  />
                </>
              )}

              <button
                onClick={() => {
                  if (
                    (accountType === "bank" && (!username || !password)) ||
                    (accountType === "mfs" && (!phoneNumber || !pin))
                  ) {
                    alert("Please fill all fields");
                    return;
                  }

                  setStep(4);
                }}
                className={`w-full rounded-lg p-3 font-semibold text-white ${
                  accountType === "bank" ? "bg-blue-600" : "bg-pink-600"
                }`}>
                Continue
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="mt-6 space-y-4">
              <button
                onClick={() => setStep(3)}
                className="text-sm text-gray-400">
                ← Back
              </button>

              <div className="rounded-xl border border-gray-700 p-4">
                <h3 className="font-bold">OTP Verification</h3>

                <p className="mt-1 text-sm text-gray-400">
                  Enter the 4-digit code sent to your device
                </p>
              </div>

              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                placeholder="••••"
                className="w-full rounded-lg border border-gray-700 bg-transparent p-3 text-center text-xl tracking-[8px]"
              />

              <button
                onClick={() => {
                  if (otp.length !== 4) {
                    alert("Enter 4-digit OTP");
                    return;
                  }

                  setStep(5);
                }}
                className={`w-full rounded-lg p-3 font-semibold text-white ${
                  accountType === "bank" ? "bg-blue-600" : "bg-pink-600"
                }`}>
                Verify OTP
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="mt-10 flex flex-col items-center justify-center space-y-4">
              {(() => {
                if (generatedBalance === 0) {
                  setTimeout(() => {
                    const balance =
                      accountType === "bank"
                        ? Math.floor(Math.random() * (15000 - 5000)) + 5000
                        : Math.floor(Math.random() * (12000 - 3000)) + 3000;

                    setGeneratedBalance(balance);
                    setStep(6);
                  }, 2000);
                }

                return null;
              })()}

              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />

              <h3 className="text-lg font-bold">Connecting to {provider}...</h3>

              <p className="text-sm text-gray-400">
                Please wait while we verify your account
              </p>
            </div>
          )}
          {step === 6 && (
            <div className="mt-6 space-y-5">
              {errorMessage && (
                <div className="rounded-xl border border-red-500 bg-red-500/10 p-4">
                  <h3 className="font-bold text-red-500">
                    ⚠ Provider Already Connected
                  </h3>

                  <p className="mt-1 text-sm text-red-300">{errorMessage}</p>
                </div>
              )}

              <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
                <h3 className="font-bold text-green-500">✓ Account Found</h3>

                <p className="text-sm text-gray-400">
                  {provider} successfully connected
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="text-sm text-gray-400">Available Balance</p>

                <p className="mt-2 text-3xl font-bold text-emerald-500">
                  ৳{generatedBalance.toLocaleString("en-BD")}
                </p>
              </div>

              <button
                onClick={async () => {
                  try {
                    setErrorMessage("");

                    await createDemoBank({
                      userId,
                      bankName: provider,
                      balance: Number(generatedBalance),
                      accountType: accountType!,
                    });

                    window.location.reload();
                  } catch (error) {
                    setErrorMessage(
                      `${provider} is already connected. Please choose another provider.`,
                    );
                  }
                }}
                className={`w-full rounded-lg p-3 font-semibold text-white ${
                  accountType === "bank" ? "bg-blue-600" : "bg-pink-600"
                }`}>
                Link Account
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectAccountModal;
