/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";

import type EditorJS from "@editorjs/editorjs";

import "~/styles/editor.css";

import type { OutputBlockData, OutputData } from "@editorjs/editorjs";
import { toastService } from "@dreamwalker-studios/toasts";

import { env } from "~/env";
import { useFileUpload } from "~/lib/file-upload/hooks/use-file-upload";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import { Label } from "../ui/label";

export interface LargeMarkdownFormFieldRef {
  clear: () => void;
  render: (data: OutputData) => void;
  save: () => Promise<void>;
}

interface Props<CurrentForm extends FieldValues> {
  form: UseFormReturn<CurrentForm>;
  label?: string;
  contentFieldName: Path<CurrentForm>;
  placeholder?: string;
  className?: string;
  defaultContent?: Record<string, unknown>;
  onSubmit?: (data: CurrentForm) => void;
}

const LargeMarkdownFormFieldComponent = <CurrentForm extends FieldValues>(
  props: Props<CurrentForm>,
  ref: React.ForwardedRef<LargeMarkdownFormFieldRef>,
) => {
  const {
    form,
    label,
    contentFieldName,
    placeholder = "Type here to write your content...",
    className,
  } = props;

  const { uploadFile } = useFileUpload({
    route: "image",
    api: "/api/upload-post",
  });

  const router = useRouter();
  const editorRef = useRef<EditorJS | undefined>(undefined);
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pathname = usePathname();

  useImperativeHandle(ref, () => ({
    clear: async () => {
      if (editorRef.current) {
        editorRef.current.clear();
        // form.setValue(
        //   contentFieldName,
        //   null as PathValue<CurrentForm, Path<CurrentForm>>,
        //   { shouldDirty: true },
        // );
      }
    },
    render: async (data: OutputData) => {
      if (editorRef.current && !!data) {
        await editorRef.current.render(data);
        // form.setValue(
        //   contentFieldName,
        //   data as PathValue<CurrentForm, Path<CurrentForm>>,
        //   { shouldDirty: true },
        // );
      }
    },

    save: async () => {
      if (editorRef.current) {
        const content = await editorRef.current?.save();
        form.setValue(
          contentFieldName,
          content as PathValue<CurrentForm, Path<CurrentForm>>,
          { shouldDirty: true },
        );
      }
    },
  }));

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          editorRef.current = editor;
        },
        placeholder,
        inlineToolbar: true,
        data: form.getValues(contentFieldName) ?? { blocks: [] },

        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const res = await uploadFile(file);

                  return {
                    success: 1,
                    file: {
                      url: `${env.NEXT_PUBLIC_STORAGE_URL}/posts/${res}`,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },

        // onChange: async () => {
        //   const content = await editorRef.current?.save();
        //   form.setValue(
        //     contentFieldName,
        //     content as PathValue<CurrentForm, Path<CurrentForm>>,
        //     { shouldDirty: true },
        //   );
        // },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        _titleRef?.current?.focus();
      }, 0);
    };

    if (isMounted) {
      void init();

      return () => {
        editorRef.current?.destroy();
        editorRef.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn("col-span-full", className)}>
      {label && <Label>{label}</Label>}

      <div className="prose prose-stone dark:prose-invert border-border bg-background col-span-full mt-2 w-full rounded-lg border p-2">
        <div id="editor" className="min-h-[500px] w-full px-14 py-7" />
        {/* <p className="text-sm text-gray-500">
        Use{" "}
        <kbd className="bg-muted rounded-md border px-1 text-xs uppercase">
          Tab
        </kbd>{" "}
        to open the command menu.
      </p> */}
      </div>
    </div>
  );
};

LargeMarkdownFormFieldComponent.displayName = "LargeMarkdownFormField";

export const LargeMarkdownFormField = forwardRef(
  LargeMarkdownFormFieldComponent,
) as <CurrentForm extends FieldValues>(
  props: Props<CurrentForm> & {
    ref?: React.ForwardedRef<LargeMarkdownFormFieldRef>;
  },
) => React.ReactElement;
