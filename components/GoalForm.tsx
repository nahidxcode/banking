"use client";

import { useState } from "react";
import { createGoal } from "@/lib/actions/goal.actions";

const GoalForm = ({ userId }: { userId: string }) => {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      className="rounded-xl border p-5 dark:border-gray-700">
      <h2 className="mb-4 text-xl font-bold dark:text-white">
        Create New Goal
      </h2>

      <div className="grid gap-4">
        <input
          placeholder="Goal Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border p-3 bg-transparent dark:border-gray-600"
          required
        />

        <input
          type="number"
          placeholder="Target Amount"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="rounded-lg border p-3 bg-transparent dark:border-gray-600"
          required
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-lg border p-3 bg-transparent dark:border-gray-600"
          required
        />

        <button
          type="submit"
          className="rounded-lg bg-blue-600 py-3 font-semibold text-white">
          Create Goal
        </button>
      </div>
    </form>
  );
};

export default GoalForm;
