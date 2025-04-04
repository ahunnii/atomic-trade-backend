"use client";

import { ChevronDown, Inbox, ShieldCheck, User, Users } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toastService } from "@dreamwalker-studios/toasts";

import type { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";

export const UserNav = ({ sessionData }: { sessionData: Session | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!sessionData) {
    return (
      <>
        <Button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
          variant={"ghost"}
          className="hidden max-md:w-full md:flex"
          size="sm"
        >
          Sign In
        </Button>

        <Button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
          variant={"ghost"}
          className="flex md:hidden"
          size={"icon"}
        >
          <User />
        </Button>
        <Button
          onClick={() => void router.push(`/auth/register`)}
          className="hidden bg-teal-500 hover:bg-teal-600 max-md:w-full md:block dark:bg-teal-400 hover:dark:bg-teal-200"
          size="sm"
        >
          Register
        </Button>
      </>
    );
  } else
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative !flex w-auto justify-between gap-4 rounded py-2"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={sessionData?.user?.image ?? ""}
                alt={`@${sessionData?.user?.name}`}
              />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>

            <span className="flex flex-col justify-start text-left">
              <span className="text-left">{sessionData?.user?.name}</span>
              <span className="text-muted-foreground text-left text-xs capitalize">
                {sessionData?.user?.role as string}
              </span>
            </span>

            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm leading-none font-medium">
                  {sessionData?.user?.name}{" "}
                </p>

                <>
                  {sessionData?.user?.role == "USER" && (
                    <User className="w-[0.875rem] text-sm font-medium" />
                  )}
                </>
                <>
                  {sessionData?.user?.role == "ADMIN" && (
                    <ShieldCheck className="w-[0.875rem] text-sm font-medium" />
                  )}
                </>
              </div>
              <p className="text-muted-foreground text-xs leading-none">
                {sessionData?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/profile" className="w-full">
                Profile
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => void signOut()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
};
