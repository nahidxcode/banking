"use client";

import { useEffect } from "react";
import ConnectionError from "@/components/ConnectionError";

// Catches errors thrown while rendering any (root) PAGE — most importantly the
// SessionUnavailableError raised when Appwrite is briefly unreachable. We keep
// the user's session intact and offer a retry instead of bouncing to sign-in.
// (Errors thrown by the (root) layout itself are handled inside that layout,
// since an error boundary cannot catch its own segment's layout.)
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ConnectionError onRetry={reset} />;
}
