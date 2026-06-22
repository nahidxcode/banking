"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { regenerateUserDemoData } from "@/lib/actions/demo-bank.actions";

const RegenerateDemoButton = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = window.confirm(
      "Fresh start: reset balances and regenerate transactions for ALL your demo accounts? This replaces their current balances and transactions.",
    );

    if (!confirmed) return;

    setLoading(true);

    const res = await regenerateUserDemoData(userId);

    setLoading(false);

    if (res?.success) {
      router.refresh();
      window.alert(`Reset ${res.count} demo account(s) with fresh data.`);
    } else {
      window.alert("Failed to regenerate. Please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <RefreshCw size={16} />
      )}
      {loading ? "Regenerating..." : "Fresh start (demo data)"}
    </button>
  );
};

export default RegenerateDemoButton;
