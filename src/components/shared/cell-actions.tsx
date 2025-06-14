"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Check,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Trash,
  X,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { DeleteDialog } from "./delete-dialog";

type Props = {
  handleOnDelete?: (id: string) => void;
  hasUpdate?: boolean;

  handleOnDuplicate?: (id: string) => void;
  handleOnArchive?: (id: string) => void;
  handleOnActive?: (id: string, isActive: boolean) => void;
  isLoading: boolean;
  isActive?: boolean;
  id: string;
  slug?: string;

  storeLink?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const CellActions = forwardRef<HTMLDivElement, Props>(
  (
    {
      handleOnDelete,
      isLoading,
      id,
      slug,
      isActive,
      children,
      handleOnDuplicate,
      handleOnArchive,
      handleOnActive,
      storeLink,
      hasUpdate = true,
    },
    ref,
  ) => {
    const currentPath = usePathname();

    const baseUrl = `${currentPath}/${slug ?? id}`;

    const onDuplicate = () => {
      handleOnDuplicate?.(slug ?? id);
    };
    const onArchive = () => {
      handleOnArchive?.(slug ?? id);
    };
    const onActive = () => {
      handleOnActive?.(slug ?? id, !isActive);
    };

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" ref={ref}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {storeLink && (
              <Link href={`${storeLink}`} target="_blank">
                <DropdownMenuItem className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" /> View
                </DropdownMenuItem>
              </Link>
            )}

            {handleOnActive && (
              <DropdownMenuItem className="cursor-pointer" onClick={onActive}>
                {!isActive ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                {isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            )}

            {children}

            {hasUpdate && (
              <Link href={`${baseUrl}/edit`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" /> Update
                </DropdownMenuItem>
              </Link>
            )}

            {handleOnDuplicate && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={onDuplicate}
              >
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
            )}

            {handleOnArchive && (
              <DropdownMenuItem className="cursor-pointer" onClick={onArchive}>
                <Archive className="mr-2 h-4 w-4" /> Archive
              </DropdownMenuItem>
            )}

            {handleOnDelete && (
              <DeleteDialog
                onConfirm={() => {
                  handleOnDelete(slug ?? id);
                }}
              >
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DeleteDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  },
);

CellActions.displayName = "CellActions";
