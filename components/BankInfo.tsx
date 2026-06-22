"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

import { cn, formUrlQuery, getAccountTypeColors } from "@/lib/utils";

import Money from "./Money";

const BankInfo = ({ account, appwriteItemId, type }: BankInfoProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isActive = appwriteItemId === account?.appwriteItemId;

  const handleBankChange = () => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: account?.appwriteItemId,
    });
    router.push(newUrl, { scroll: false });
  };

  const colors = getAccountTypeColors(account?.type as AccountTypes);

  const isMfs = account?.accountType === "mfs";
  const typeLabel = isMfs
    ? "Mobile Wallet"
    : account?.accountType === "remittance"
      ? "USD Wallet"
      : account?.accountType === "bank"
        ? "Bank Account"
        : account?.subtype || "Bank";

  return (
    <div
      onClick={handleBankChange}
      className={cn(`bank-info ${colors.bg}`, {
        "shadow-sm border-blue-700": type === "card" && isActive,
        "rounded-xl": type === "card",
        "hover:shadow-sm cursor-pointer": type === "card",
      })}>
      <figure className="flex-center size-14 shrink-0 overflow-hidden rounded-full bg-white/95">
        {isMfs ? (
          <Image
            src={`/icons/${account.name.toLowerCase()}.jpg`}
            width={56}
            height={56}
            alt={account.name}
            className="size-full object-contain p-1.5"
          />
        ) : (
          <span className={cn("flex-center size-full", colors.lightBg)}>
            <Image
              src="/icons/connect-bank.svg"
              width={20}
              height={20}
              alt={account.name}
              className="size-5"
            />
          </span>
        )}
      </figure>
      <div className="flex w-full flex-1 flex-col justify-center gap-1">
        <div className="bank-info_content">
          <h2
            className={`text-16 line-clamp-1 flex-1 font-bold text-blue-900 dark:text-white ${colors.title}`}>
            {account.name}
          </h2>
          {type === "full" && (
            <p
              className={`text-12 rounded-full px-3 py-1 font-medium capitalize text-blue-700 ${colors.subText} ${colors.lightBg}`}>
              {typeLabel}
            </p>
          )}
        </div>

        <p
          className={`text-16 font-medium
          text-blue-700 dark:text-gray-300
          ${colors.subText}`}>
          <Money value={account.currentBalance} />
        </p>
      </div>
    </div>
  );
};

export default BankInfo;
