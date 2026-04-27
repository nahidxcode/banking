import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = { firstName: "Nahid", lastName: "Mia" };

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
