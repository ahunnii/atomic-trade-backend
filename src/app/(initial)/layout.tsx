import { AdminFooter } from "~/components/layout/admin-footer";
import { Navbar } from "~/components/layout/navbar";
import { cn } from "~/lib/utils";

type Props = {
  children: React.ReactNode;
};

export default async function InitialLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-zinc-50 transition-colors duration-300 ease-in-out dark:bg-zinc-900">
        <Navbar title="Atomic Trade" />
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="mt-auto">
        <AdminFooter />
      </footer>
    </div>
  );
}
