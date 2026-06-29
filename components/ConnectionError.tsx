"use client";

// Friendly "can't reach the server" screen shown when Appwrite is briefly
// unreachable. Used both by the (root) error boundary and directly by the
// (root) layout (an error.tsx cannot catch an error thrown by the layout of
// its own segment, so the layout has to render this itself).
export default function ConnectionError({ onRetry }: { onRetry?: () => void }) {
  return (
    <section className="flex h-full min-h-screen w-full flex-col items-center justify-center p-8 text-center">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          We&apos;re having trouble connecting
        </h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          We couldn&apos;t reach our servers just now. Your session is still
          active — please try again in a moment.
        </p>
        <button
          onClick={() => (onRetry ? onRetry() : window.location.reload())}
          className="mt-6 rounded-lg bg-bankGradient px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
          Try again
        </button>
      </div>
    </section>
  );
}
