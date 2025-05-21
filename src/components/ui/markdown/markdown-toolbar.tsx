/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FC } from "react";
import { useCallback } from "react";
import {
  Bold,
  Heading,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";

import { type Editor } from "@tiptap/react";

import { Button } from "~/components/ui/button";

import { Toggle } from "../../ui/toggle";

type Props = {
  editor: Editor | null;
};
const MarkdownToolbar: FC<Props> = ({ editor }) => {
  const addImage = useCallback(() => {
    if (!editor) return null;
    const url = window.prompt("URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return null;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", (previousUrl as string) ?? "");

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border-input rounded-md border bg-transparent">
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        <Heading className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 4 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 4 }).run()
        }
      >
        <Heading4 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 5 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 5 }).run()
        }
      >
        <Heading5 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 6 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 6 }).run()
        }
      >
        <Heading6 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        {" "}
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        {" "}
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        {" "}
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        {" "}
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Button size="icon" onClick={addImage} type="button" variant={"ghost"}>
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        onClick={setLink}
        variant={"ghost"}
        className={editor.isActive("link") ? "is-active" : ""}
        type="button"
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
};
export default MarkdownToolbar;
