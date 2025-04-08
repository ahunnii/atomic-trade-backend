import React from "react";
import { Tag, type TagProps } from "~/components/ui/tags/tag";
import { type Tag as TagType } from "~/components/ui/tags/tag-input";
import { cn } from "~/lib/utils";

export type TagListProps = {
  tags: TagType[];
  disabled?: boolean;
  customTagRenderer?: (tag: TagType) => React.ReactNode;
  direction?: TagProps["direction"];
} & Omit<TagProps, "tagObj">;

export const TagList: React.FC<TagListProps> = ({
  tags,
  customTagRenderer,
  direction,
  disabled,
  ...tagProps
}) => {
  return (
    <div
      className={cn("max-w-[450px] rounded-md", {
        "flex flex-wrap gap-2": direction === "row",
        "flex flex-col gap-2": direction === "column",
      })}
    >
      {disabled && (
        <div>
          <p>{tags.map((tag) => tag.name).join(", ")}</p>
        </div>
      )}

      {!disabled &&
        tags.map((tagObj) =>
          customTagRenderer ? (
            customTagRenderer(tagObj)
          ) : (
            <Tag key={tagObj.id} tagObj={tagObj} {...tagProps} />
          ),
        )}
    </div>
  );
};
