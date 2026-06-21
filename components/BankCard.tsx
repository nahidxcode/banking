import { formatAmount } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Copy from "./Copy";

const BankCard = ({
  account,
  userName,
  showBalance = true,
}: CreditCardProps) => {
  const isMFS = account.accountType === "mfs";

  const getMFSConfig = () => {
    switch (account.name) {
      case "bKash":
        return {
          logo: "/icons/bkash.jpg",
          bg: "bg-pink-600",
        };

      case "Nagad":
        return {
          logo: "/icons/nagad.jpg",
          bg: "bg-orange-500",
        };

      case "Rocket":
        return {
          logo: "/icons/rocket.jpg",
          bg: "bg-purple-600",
        };

      case "Upay":
        return {
          logo: "/icons/upay.jpg",
          bg: "bg-green-600",
        };

      default:
        return {
          logo: "/icons/logo.svg",
          bg: "bg-gray-700",
        };
    }
  };

  const mfs = getMFSConfig();

  if (isMFS) {
    return (
      <div className="flex flex-col">
        <Link
          href={`/transaction-history/?id=${account.appwriteItemId}`}
          className={`relative flex h-[190px] w-full max-w-[320px] flex-col justify-between rounded-[20px] p-5 text-white shadow-creditCard ${mfs.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Mobile Wallet
            </span>

            <div className="flex h-14 w-24 items-center justify-center p-1">
              <Image
                src={mfs.logo}
                alt={account.name}
                width={90}
                height={50}
                className="max-h-12 w-auto rounded-lg object-contain"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold">{account.name}</h2>

            <p className="mt-2 text-3xl font-black">
              {formatAmount(account.currentBalance)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Account Holder</p>

              <p className="font-semibold">{userName}</p>
            </div>

            <div className="text-right">
              <p className="text-xs opacity-80">Wallet ID</p>

              <p className="font-semibold">****{account.mask || "0000"}</p>
            </div>
          </div>
        </Link>

        {showBalance && <Copy title={account?.sharableId} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Link
        href={`/transaction-history/?id=${account.appwriteItemId}`}
        className="bank-card">
        <div className="bank-card_content">
          <div>
            <h1 className="text-16 font-semibold text-white">{account.name}</h1>

            <p className="font-ibm-plex-serif font-black text-white">
              {formatAmount(account.currentBalance)}
            </p>
          </div>

          <article className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">{userName}</h1>

              <h2 className="text-12 font-semibold text-white">●● / ●●</h2>
            </div>

            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16">{account?.mask}</span>
            </p>
          </article>
        </div>

        <div className="bank-card_icon">
          <Image src="/icons/Paypass.svg" width={20} height={24} alt="pay" />

          <Image
            src="/icons/mastercard.svg"
            width={45}
            height={32}
            alt="mastercard"
            className="ml-5"
          />
        </div>

        <Image
          src="/icons/lines.png"
          width={316}
          height={190}
          alt="lines"
          className="absolute left-0 top-0"
        />
      </Link>

      {showBalance && <Copy title={account?.sharableId} />}
    </div>
  );
};

export default BankCard;
