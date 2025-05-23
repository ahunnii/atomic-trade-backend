import {
  ArchiveIcon,
  FileStackIcon,
  MoreHorizontal,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react";

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
  onMisc?: () => void;
  onReset?: () => void;
  onMiscLabel?: string;
};

export const FormAdditionalOptionsButton = (props: Props) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            type="button"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {props?.onMisc && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={props.onMisc}
                className="cursor-pointer"
              >
                <span>{props.onMiscLabel}</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {props?.onDuplicate && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={props.onDuplicate}
              >
                <FileStackIcon className="mr-2 h-4 w-4" />
                <span>Save and duplicate</span>
              </DropdownMenuItem>
            )}

            {props?.onArchive && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={props.onArchive}
              >
                <ArchiveIcon className="mr-2 h-4 w-4" />
                <span>Archive</span>
              </DropdownMenuItem>
            )}
            {props?.onReset && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={props.onReset}
              >
                <RotateCcwIcon className="mr-2 h-4 w-4" />
                <span>Reset</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          {(props?.onDuplicate ?? props?.onArchive) && (
            <DropdownMenuSeparator />
          )}
          <DeleteDialog onConfirm={props.onDelete}>
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive cursor-pointer"
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
};
