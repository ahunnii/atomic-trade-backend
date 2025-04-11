import { ArchiveIcon, ChevronDown, FileEditIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { LoadButton } from "./load-button";

type Props = {
  onSave?: () => void;
  onPublish?: () => void;

  isLoading: boolean;
};

export const FormSaveOptionsButton = (props: Props) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <LoadButton
            isLoading={props.isLoading}
            size="sm"
            type="button"
            className="cursor-pointer"
          >
            Save <ChevronDown className="h-5 w-5" />
          </LoadButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {props?.onSave && (
              <DropdownMenuItem
                onClick={props.onSave}
                className="cursor-pointer"
              >
                <FileEditIcon className="mr-2 h-4 w-4" />
                <span>Save Draft</span>
              </DropdownMenuItem>
            )}

            {props?.onPublish && (
              <DropdownMenuItem
                onClick={props.onPublish}
                className="cursor-pointer"
              >
                <ArchiveIcon className="mr-2 h-4 w-4" />
                <span>Save & Publish</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
