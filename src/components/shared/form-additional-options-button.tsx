import { useState } from "react";
import {
  ArchiveIcon,
  FileStackIcon,
  MoreHorizontal,
  TrashIcon,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { DeleteDialog } from "./delete-dialog";

type Props = {
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete: () => void;
};

export function FormAdditionalOptionsButton(props: Props) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="" type="button">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {props?.onDuplicate && (
              <DropdownMenuItem onClick={props.onDuplicate}>
                <FileStackIcon className="mr-2 h-4 w-4" />
                <span>Save and duplicate</span>
              </DropdownMenuItem>
            )}

            {props?.onArchive && (
              <DropdownMenuItem>
                <ArchiveIcon className="mr-2 h-4 w-4" />
                <span>Archive</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          {(props?.onDuplicate ?? props?.onArchive) && (
            <DropdownMenuSeparator />
          )}
          <DeleteDialog onConfirm={props.onDelete}>
            <DropdownMenuItem
              className={cn(
                "text-destructive focus:bg-destructive/90 focus:text-destructive-foreground",
              )}
              onSelect={(e) => e.preventDefault()}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DeleteDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
