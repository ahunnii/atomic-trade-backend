import { PencilIcon } from "lucide-react";

type Props = { variantCount: number };

export const ManageVariationsButton = (props: Props) => {
  return (
    <div className="hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-md border border-dashed p-3 transition-all hover:border-solid">
      <div className="space-y-1">
        <h3 className="flex items-center text-base font-semibold">
          {props.variantCount > 1 ? "Manage Variants" : "Variants (Optional)"}
          {props.variantCount > 1 && (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
              Added
            </span>
          )}
        </h3>
        <p className="text-muted-foreground text-sm">
          {props.variantCount > 1
            ? "Click to edit your product variants (size, color, etc.)"
            : "No variants added yet. Add options like size, color, or style to create multiple product variants."}
        </p>
      </div>
      <div className="bg-primary/10 ml-auto rounded-full p-2">
        <PencilIcon className="text-primary h-4 w-4" />
      </div>
    </div>
  );
};
