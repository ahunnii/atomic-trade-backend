import { Badge } from "../ui/badge";

type Props = {
  hasInitialData: boolean;
  title: string;
  status: string;
  createTitle?: string;
  editTitle?: string;
};
export const FormStatusTitle = ({
  title,
  status,
  hasInitialData,
  createTitle,
  editTitle,
}: Props) => {
  if (!hasInitialData)
    return <>{createTitle ? `${createTitle}` : `Create ${title}`}</>;

  return status === "PUBLISHED" ? (
    <div className="flex items-center gap-2">
      <span>{editTitle ? `${editTitle}` : `Edit ${title}`}</span>
      <Badge
        variant="outline"
        className="bg-green-100 text-xs font-bold text-green-800 dark:bg-green-900 dark:text-green-100"
      >
        Published
      </Badge>
    </div>
  ) : (
    <span className="flex items-center gap-2">
      <span>{editTitle ? `${editTitle}` : `Edit ${title}`}</span>
      <Badge variant="outline" className="text-xs">
        Draft
      </Badge>
    </span>
  );
};
