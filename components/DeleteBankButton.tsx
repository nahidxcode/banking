"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteBank } from "@/lib/actions/user.actions";

const DeleteBankButton = ({
  appwriteItemId,
  name,
}: {
  appwriteItemId: string;
  name: string;
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Remove "${name}"? This will delete it from your accounts.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);

    const res = await deleteBank({ documentId: appwriteItemId });

    if (res?.success) {
      router.refresh();
    } else {
      window.alert("Failed to delete. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete ${name}`}
      className="absolute right-2 top-2 z-20 rounded-full bg-black/40 p-2 text-white backdrop-blur transition-opacity hover:bg-red-500 disabled:cursor-not-allowed opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100">
      {isDeleting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
};

export default DeleteBankButton;
