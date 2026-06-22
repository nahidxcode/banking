"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createTransfer } from "@/lib/actions/dwolla.actions";
import { createTransaction } from "@/lib/actions/transaction.actions";
import {
  getBank,
  getBankByAccountId,
  updateBankBalance,
} from "@/lib/actions/user.actions";
import { decryptId, formatAmount } from "@/lib/utils";

import Money from "./Money";

import { BankDropdown } from "./BankDropdown";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  // optional, but must be valid if filled in
  email: z.union([z.literal(""), z.string().email("Invalid email address")]),
  name: z.string().optional(),
  amount: z.string().min(1, "Please enter an amount"),
  senderBank: z.string().min(4, "Please select a source account"),
  sharableId: z.string().min(8, "Select a receiver or enter a FinLink ID"),
});

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const PaymentTransferForm = ({
  accounts,
  userEmail,
}: PaymentTransferFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      amount: "",
      senderBank: "",
      sharableId: "",
    },
  });

  // receiver options = connected accounts minus the chosen source
  const watchedSenderBank = form.watch("senderBank");
  const watchedSharableId = form.watch("sharableId");
  const watchedAmount = form.watch("amount");

  const receiverOptions = accounts.filter(
    (a) => a.appwriteItemId !== watchedSenderBank,
  );

  const selectedReceiverValue = receiverOptions.some(
    (a) => a.sharableId === watchedSharableId,
  )
    ? watchedSharableId
    : "";

  // live preview from current form state
  const sourceAccount = accounts.find(
    (a) => a.appwriteItemId === watchedSenderBank,
  );
  const receiverAccount = receiverOptions.find(
    (a) => a.sharableId === watchedSharableId,
  );
  const amountValue = Number(watchedAmount) || 0;
  const sourceBalance = Number(sourceAccount?.currentBalance || 0);
  const insufficient =
    !!sourceAccount && amountValue > 0 && amountValue > sourceBalance;

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const amount = Number(data.amount);

      if (!amount || amount <= 0) {
        setError("Please enter a valid amount.");
        setIsLoading(false);
        return;
      }

      const receiverAccountId = decryptId(data.sharableId);

      const receiverBank = await getBankByAccountId({
        accountId: receiverAccountId,
      });

      const senderBank = await getBank({
        documentId: data.senderBank,
      });

      if (!senderBank || !receiverBank) {
        throw new Error("Bank account not found");
      }

      if (senderBank.$id === receiverBank.$id) {
        setError("You can't transfer to the same account.");
        setIsLoading(false);
        return;
      }

      // only demo/manual accounts have a balance we can move
      const canAdjust = (bank: any) =>
        bank?.isManual || bank?.accessToken === "manual";

      const isManualTransfer = canAdjust(senderBank) || canAdjust(receiverBank);

      if (isManualTransfer) {
        // don't credit the receiver without deducting the sender, or the total inflates
        if (canAdjust(senderBank)) {
          const senderBalance = Number(senderBank.currentBalance || 0);

          if (amount > senderBalance) {
            setError("Insufficient balance in the selected account.");
            setIsLoading(false);
            return;
          }

          // deduct from demo sender
          await updateBankBalance({
            bankId: senderBank.$id,
            currentBalance: senderBalance - amount,
          });
        }

        // add to demo receiver
        if (canAdjust(receiverBank)) {
          await updateBankBalance({
            bankId: receiverBank.$id,
            currentBalance: Number(receiverBank.currentBalance || 0) + amount,
          });
        }

        const transaction = {
          name: data.name?.trim() || "Transfer",
          amount: data.amount,

          senderId: senderBank.userId,
          receiverId: receiverBank.userId,

          senderBankId: senderBank.$id,
          receiverBankId: receiverBank.$id,

          email: data.email?.trim() || userEmail || "no-reply@finlink.app",
        };

        const newTransaction = await createTransaction(transaction);

        if (newTransaction) {
          form.reset();
          router.push("/");
          router.refresh();
        }
      } else {
        const transferParams = {
          sourceFundingSourceUrl: senderBank.fundingSourceUrl,
          destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
          amount: data.amount,
        };

        const transfer = await createTransfer(transferParams);

        if (transfer) {
          const transaction = {
            name: data.name?.trim() || "Transfer",
            amount: data.amount,

            senderId: senderBank.userId,
            receiverId: receiverBank.userId,

            senderBankId: senderBank.$id,
            receiverBankId: receiverBank.$id,

            email: data.email?.trim() || userEmail || "no-reply@finlink.app",
          };

          const newTransaction = await createTransaction(transaction);

          if (newTransaction) {
            form.reset();
            router.push("/");
            router.refresh();
          }
        }
      }
    } catch (err) {
      console.error("Submitting create transfer request failed:", err);
      setError("Something went wrong while processing the transfer. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="mt-2 w-full max-w-2xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800 sm:p-8">
        {/* error banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* source */}
        <FormField
          control={form.control}
          name="senderBank"
          render={() => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                From account
              </FormLabel>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                The account you want to send funds from.
              </FormDescription>
              <FormControl>
                <BankDropdown
                  accounts={accounts}
                  setValue={form.setValue}
                  otherStyles="!w-full"
                />
              </FormControl>
              {sourceAccount && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Wallet size={14} />
                  Available balance:{" "}
                  <Money
                    value={sourceBalance}
                    className="font-semibold text-gray-900 dark:text-white"
                  />
                </div>
              )}
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        {/* receiver */}
        <div className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-white">
              Send to a connected account
            </label>
            <select
              value={selectedReceiverValue}
              onChange={(e) => {
                const value = e.target.value;

                form.setValue("sharableId", value, { shouldValidate: true });

                // it's your own account, prefill your email
                if (value && userEmail) {
                  form.setValue("email", userEmail, { shouldValidate: true });
                }
              }}
              className="input-class w-full p-3">
              <option value="" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">
                Select an account…
              </option>
              {receiverOptions.map((a) => (
                <option
                  key={a.id}
                  value={a.sharableId}
                  className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">
                  {a.name} — {formatAmount(a.currentBalance)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs font-medium text-gray-400">or</span>
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          <FormField
            control={form.control}
            name="sharableId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                  Enter a FinLink ID
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Paste the recipient's FinLink ID"
                    className="input-class w-full p-3"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>

        {/* amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                Amount (৳)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="ex: 500"
                  className="input-class w-full p-3"
                  {...field}
                />
              </FormControl>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      form.setValue("amount", String(value), {
                        shouldValidate: true,
                      })
                    }
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400">
                    ৳{value.toLocaleString()}
                  </button>
                ))}
              </div>
              {insufficient && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                  <AlertCircle size={14} />
                  Amount exceeds the available balance of{" "}
                  {formatAmount(sourceBalance)}.
                </p>
              )}
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        {/* note */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                Transfer note{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's this transfer for?"
                  className="input-class w-full p-3"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        {/* email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                Recipient&apos;s email{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: johndoe@gmail.com"
                  className="input-class w-full p-3"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        {/* review summary */}
        {sourceAccount && amountValue > 0 && (
          <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Review transfer
            </p>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="line-clamp-1 font-medium text-gray-900 dark:text-white">
                {sourceAccount.name}
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-gray-400"
              />
              <span className="line-clamp-1 text-right font-medium text-gray-900 dark:text-white">
                {receiverAccount?.name ||
                  (watchedSharableId ? "FinLink ID" : "Select a receiver")}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Amount
              </span>
              <Money
                value={amountValue}
                className="text-18 font-bold text-gray-900 dark:text-white"
              />
            </div>
            {!insufficient && (
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Balance after transfer</span>
                <Money
                  value={sourceBalance - amountValue}
                  className="font-semibold text-gray-700 dark:text-gray-200"
                />
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || insufficient}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-bank-gradient py-3 text-base font-semibold text-white shadow-form transition hover:opacity-90 active:scale-[0.99] disabled:opacity-60">
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Sending...
            </>
          ) : (
            "Transfer Funds"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default PaymentTransferForm;
