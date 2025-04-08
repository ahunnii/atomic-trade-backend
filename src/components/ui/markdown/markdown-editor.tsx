import type { FC } from "react";

import Highlight from "@tiptap/extension-highlight";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import MarkdownToolbar from "./markdown-toolbar";
type MarkdownEditorProps = {
  description: string | undefined;
  onChange: (value: string) => void;
  className?: string;
  enableClear?: boolean;
  enableOverride?: string;
  overrideBtnText?: string;
  disabled?: boolean;
};

const MarkdownEditor: FC<MarkdownEditorProps> = ({
  description,
  onChange,
  className,
  enableClear,
  enableOverride,
  overrideBtnText,
  disabled,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      Image,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],

    editable: disabled ? false : true,
    content: description,
    editorProps: {
      attributes: {
        class: cn(
          `prose !max-w-full prose-p:my-0 prose-zinc flex min-h-[250px] w-full p-2   rounded-md  bg-background  py-2   ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-col focus:outline-none`,
          className,
        ),
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <>
      <div className={cn("flex min-h-[250px] w-full flex-col", className)}>
        <MarkdownToolbar editor={editor} />
        <div className="border-input mt-2 max-h-96 overflow-y-auto rounded-md border">
          <EditorContent editor={editor} disabled={disabled} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {enableClear && (
          <Button
            size={"sm"}
            type="button"
            variant={"outline"}
            onClick={() => {
              onChange("");
              editor?.commands.setContent("");
            }}
          >
            Clear
          </Button>
        )}
        {enableOverride && (
          <Button
            size={"sm"}
            type="button"
            variant={"default"}
            onClick={() => {
              onChange(enableOverride);
              editor?.commands.setContent(enableOverride);
            }}
          >
            {overrideBtnText ?? "Override"}
          </Button>
        )}
      </div>
    </>
  );
};

export default MarkdownEditor;
