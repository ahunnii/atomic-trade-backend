/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Pencil, Send, Trash } from "lucide-react";

import type { Note } from "~/types/order";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { AlertModal } from "~/components/shared/modals/alert-modal";

type Props = {
  notes: Note[];
};

export const ViewOrderTimeline = ({ timeline }: Props) => {
  const timelineRef = useRef<HTMLTextAreaElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTimelineEntry, setSelectedTimelineEntry] =
    useState<Note | null>(null);
  const { orderId } = useParams();

  const handleNewTimelineEntry = () => {
    createTimelineEntry.mutate({
      orderId: orderId as string,

      title: "Note from Owner",
      description: timelineRef.current!.value,
    });
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        (!e.shiftKey || e.ctrlKey || e.metaKey) &&
        document.activeElement === timelineRef?.current
      ) {
        e.preventDefault();
        handleNewTimelineEntry();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const apiContext = api.useContext();

  const createTimelineEntry = api.timeline.create.useMutation({
    onSuccess: ({ message }) => toastService.success(message),
    onError: (error) =>
      toastService.error("Failed to create timeline entry", error),
    onSettled: () => {
      timelineRef.current!.value = "";
      void apiContext.order.invalidate();
    },
  });

  const deleteTimelineEntry = api.timeline.delete.useMutation({
    onSuccess: ({ message }) => toastService.success(message),
    onError: (error) =>
      toastService.error("Failed to delete timeline entry", error),
    onSettled: () => void apiContext.order.invalidate(),
  });

  useEffect(() => {
    if (topRef.current && createTimelineEntry.isSuccess)
      topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [createTimelineEntry.isSuccess]);

  useEffect(() => {
    if (!open) {
      setSelectedTimelineEntry(null);
    }
  }, [open]);

  const handleDelete = () => {
    deleteTimelineEntry.mutate(selectedTimelineEntry!.id);
  };
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 flex flex-row items-start">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Timeline
          </CardTitle>
          <CardDescription>
            View the entire history of the order
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1" />
      </CardHeader>
      <CardContent className="p-6 pt-4 text-sm">
        {selectedTimelineEntry && (
          <>
            <TimelineEntryEditDialog
              data={selectedTimelineEntry}
              open={open}
              setOpen={setOpen}
            />

            <AlertModal
              isOpen={deleteOpen}
              setIsOpen={setDeleteOpen}
              onConfirm={handleDelete}
              loading={deleteTimelineEntry.isLoading}
              asChild={false}
            />
          </>
        )}

        <div className="mb-4 flex items-end gap-2">
          <Textarea
            placeholder="Write a note..."
            ref={timelineRef}
            className="resize-none"
          />
          <Button
            size={"icon"}
            onClick={handleNewTimelineEntry}
            className="aspect-square size-5"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <Separator className="my-4" />
        <ScrollArea className="flex max-h-96 flex-col gap-4">
          <div ref={topRef} />
          {timeline.map((item: TimeLineEntry) => (
            <div key={item.id} className={cn("flex w-full gap-4 p-2")}>
              <div className="group w-full">
                {" "}
                <div className="flex justify-between">
                  <p className="text-sm font-semibold">
                    {item.title}
                    {timeSinceDate(item.createdAt.getTime()) !==
                      timeSinceDate(item.updatedAt.getTime()) && "(updated)"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {timeSinceDate(item.updatedAt.getTime())}
                  </p>{" "}
                </div>
                <div className="flex items-center gap-4">
                  <p
                    className={cn(
                      "my-2 w-full rounded-md p-2 text-sm",
                      item.isEditable
                        ? "border border-slate-200"
                        : "bg-slate-100",
                    )}
                  >
                    {item.description}
                  </p>
                  {item.isEditable && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => {
                          setSelectedTimelineEntry(item);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => {
                          setSelectedTimelineEntry(item);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash className="size-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export function TimelineEntryEditDialog({
  data,
  open,
  setOpen,
}: {
  data: TimeLineEntry;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [title, setTitle] = useState(data?.title ?? "");
  const [description, setDescription] = useState(data?.description ?? "");
  const apiContext = api.useContext();

  const updateTimeLineEntry = api.timeline.update.useMutation({
    onSuccess: ({ message }) => {
      setOpen(false);
      toastService.success(message);
    },
    onError: (error) =>
      toastService.error("Failed to update timeline entry", error),
    onSettled: () => void apiContext.order.invalidate(),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="ignore-default">Edit entry</DialogTitle>
          <DialogDescription>Click save when you are done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Title
            </Label>
            <Input
              id="name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() =>
              updateTimeLineEntry.mutate({
                timelineId: data.id,
                title,
                description,
                orderId: data.orderId! ?? "",
              })
            }
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
