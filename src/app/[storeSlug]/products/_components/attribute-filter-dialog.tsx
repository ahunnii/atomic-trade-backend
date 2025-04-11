import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

type Props = {
  onContinue: () => void;
  onCancel: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const AttributeFilterDialog = ({
  onContinue,
  onCancel,
  isOpen,
  setIsOpen,
}: Props) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Invalid attributes found</AlertDialogTitle>
          <AlertDialogDescription>
            There are attributes added that either have no values or don&apos;t
            have enough values to generate variants. Either cancel and fix the
            issues, or continue and we will filter out the invalid entries.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel, I&apos;ll fix them
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>
            Continue, filter out invalid entries
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
