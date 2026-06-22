"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteGoal } from "@/lib/actions/goal.actions";

const DeleteGoalButton = ({
  goalId,
  title,
}: {
  goalId: string;
  title: string;
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${title}" goal?`)) return;

    setLoading(true);

    await deleteGoal(goalId);

    window.location.reload();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      aria-label="Delete goal"
      className="shrink-0 rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-60">
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
};

export default DeleteGoalButton;
