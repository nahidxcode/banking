"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { createGoal } from "@/lib/actions/goal.actions";

const GoalForm = ({ userId }: { userId: string }) => {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    await createGoal({
      userId,
      title,
      targetAmount: Number(targetAmount),
      deadline,
    });

    window.location.reload();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800 sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
        Create a new goal
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Goal name
          </label>
          <input
            placeholder="e.g. Emergency Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-class w-full p-3"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target amount (৳)
          </label>
          <input
            type="number"
            min="0"
            placeholder="50000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="input-class w-full p-3"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="input-class w-full p-3"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-bank-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-form transition hover:opacity-90 active:scale-[0.99] disabled:opacity-60">
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Plus size={16} />
        )}
        {loading ? "Creating..." : "Create Goal"}
      </button>
    </form>
  );
};

export default GoalForm;
