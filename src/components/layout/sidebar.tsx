import Image from "next/image";
import Link from "next/link";

import { useSidebarToggle } from "~/hooks/use-sidebar-toggle";
import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";
import { useStore } from "~/hooks/use-store";
import { Menu } from "./menu";
import { SidebarToggle } from "./sidebar-toggle";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full transition-[width] duration-300 ease-in-out lg:translate-x-0",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72",
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative flex h-full flex-col overflow-y-auto px-3 py-4 shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "mb-1 transition-transform duration-300 ease-in-out",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0",
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-ui.png"
              alt="Ubuntu AI Logo"
              width={76}
              height={76}
              className={cn(
                sidebar?.isOpen === false ? "mr-1 h-6 w-6" : "hidden",
              )}
            />

            <Image
              src="/logo-long.png"
              alt="Ubuntu AI Logo"
              width={375}
              height={76}
              className={cn(
                "text-lg font-bold whitespace-nowrap transition-[transform,opacity,display] duration-300 ease-in-out",
                sidebar?.isOpen === false
                  ? "hidden -translate-x-96 opacity-0"
                  : "translate-x-0 opacity-100",
              )}
            />
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
