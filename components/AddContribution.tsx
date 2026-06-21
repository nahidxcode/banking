"use client";

import { useState } from "react";
import { addGoalContribution } from "@/lib/actions/goal.actions";

const AddContribution = ({ goalId }: { goalId: string }) => {
  const [amount, setAmount] = useState("");

  const handleAdd = async () => {
    if (!amount) return;

    await addGoalContribution(goalId, Number(amount));

    window.location.reload();
  };

  return (
    <div className="mt-4 flex gap-2">
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="flex-1 rounded-lg border p-2 bg-transparent dark:border-gray-600"
      />

      <button
        onClick={handleAdd}
        className="rounded-lg bg-green-600 px-4 py-2 text-white">
        Add
      </button>
    </div>
  );
};

export default AddContribution;
