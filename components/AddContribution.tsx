"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { addGoalContribution } from "@/lib/actions/goal.actions";

const AddContribution = ({ goalId }: { goalId: string }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);

    await addGoalContribution(goalId, Number(amount));

    window.location.reload();
  };

  return (
    <div className="mt-4 flex gap-2">
      <input
        type="number"
        min="0"
        placeholder="Add amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input-class w-full flex-1 p-2.5"
      />

      <button
        onClick={handleAdd}
        disabled={loading}
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? "Adding" : "Add"}
      </button>
    </div>
  );
};

export default AddContribution;
