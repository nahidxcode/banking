import Money from "./Money";
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
          gradient: "bg-gradient-to-br from-[#e2136e] to-[#9b0e4e]",
        };

      case "Nagad":
        return {
          logo: "/icons/nagad.jpg",
          gradient: "bg-gradient-to-br from-[#f7941d] to-[#ed1c24]",
        };

      case "Rocket":
        return {
          logo: "/icons/rocket.jpg",
          gradient: "bg-gradient-to-br from-[#8c3494] to-[#5e2364]",
        };

      case "Upay":
        return {
          logo: "/icons/upay.jpg",
          gradient: "bg-gradient-to-br from-[#0ea5a4] to-[#0e7490]",
        };

      default:
        return {
          logo: "/icons/logo.svg",
          gradient: "bg-gradient-to-br from-gray-700 to-gray-900",
        };
    }
  };

  const mfs = getMFSConfig();

  if (isMFS) {
    return (
      <div className="flex flex-col">
        <Link
          href={`/transaction-history/?id=${account.appwriteItemId}`}
          className={`relative flex h-[190px] w-full max-w-[320px] flex-col justify-between overflow-hidden rounded-[20px] p-5 text-white shadow-creditCard transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${mfs.gradient}`}>
          {/* header */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
              Mobile Wallet
            </span>

            <div className="flex h-9 items-center justify-center rounded-md bg-white/95 px-2 shadow-sm">
              <Image
                src={mfs.logo}
                alt={account.name}
                width={70}
                height={28}
                className="h-6 w-auto object-contain"
              />
            </div>
          </div>

          {/* provider + balance */}
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold">{account.name}</h2>

            <p className="mt-0.5 truncate text-2xl font-black">
              <Money value={account.currentBalance} />
            </p>
          </div>

          {/* footer */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide opacity-80">
                Account Holder
              </p>
              <p className="truncate text-sm font-semibold">{userName}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase tracking-wide opacity-80">
                Wallet ID
              </p>
              <p className="text-sm font-semibold">
                ****{account.mask || "0000"}
              </p>
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
              <Money value={account.currentBalance} />
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
