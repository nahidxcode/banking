"use client";

import { Wallet } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { cn, formUrlQuery, formatAmount } from "@/lib/utils";

export const BankDropdown = ({
  accounts = [],
  setValue,
  otherStyles,
}: BankDropdownProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedAccount =
    accounts.find(
      (account) => account.appwriteItemId === searchParams.get("id"),
    ) || accounts[0];

  const [selected, setSeclected] = useState(selectedAccount);

  const handleBankChange = (id: string) => {
    const account = accounts.find((account) => account.appwriteItemId === id)!;

    setSeclected(account);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: id,
    });
    router.push(newUrl, { scroll: false });

    if (setValue) {
      setValue("senderBank", id);
    }
  };

  return (
    <Select
      defaultValue={selected.id}
      onValueChange={(value) => handleBankChange(value)}>
      <SelectTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white md:w-[300px]",
          otherStyles,
        )}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
          <Wallet size={16} />
        </span>
        <p className="line-clamp-1 w-full text-left text-sm font-medium">
          {selected.name}
        </p>
      </SelectTrigger>
      <SelectContent
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:w-[300px]",
          otherStyles,
        )}
        align="end">
        <SelectGroup>
          <SelectLabel className="px-2 py-2 text-xs font-normal text-gray-500 dark:text-gray-400">
            Select an account
          </SelectLabel>
          {accounts.map((account: Account) => (
            <SelectItem
              key={account.id}
              value={account.appwriteItemId}
              className="cursor-pointer rounded-md focus:bg-gray-100 dark:focus:bg-gray-800">
              <div className="flex flex-col py-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {account.name}
                </p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {formatAmount(account.currentBalance)}
                </p>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
