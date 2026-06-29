import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import ConnectionError from "@/components/ConnectionError";
import { getLoggedInUser } from "@/lib/auth";
import { SessionUnavailableError } from "@/lib/errors";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import type { Metadata } from "next";

// Add or edit your "generateMetadata" to include the Sentry trace data:
export function generateMetadata(): Metadata {
  return {
    // ... your existing metadata
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let loggedIn;
  try {
    loggedIn = await getLoggedInUser();
  } catch (error) {
    // Appwrite was unreachable — don't log the user out, show a retry instead.
    if (error instanceof SessionUnavailableError) return <ConnectionError />;
    throw error;
  }
  if (!loggedIn) redirect("/sign-in");

  return (
    <main className="flex h-screen w-full">
      <Sidebar user={loggedIn} />
      <div className="flex size-full flex-col">
        <div className="root-layout">
          <img src="/icons/logo.svg" width={30} height={30} alt="menu icon" />
        </div>
        <div>
          <MobileNav user={loggedIn} />
        </div>
        {children}
      </div>
    </main>
  );
}
