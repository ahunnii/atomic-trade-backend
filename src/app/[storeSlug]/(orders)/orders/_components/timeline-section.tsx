"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  MessageSquare,
  Pencil,
  Send,
  StoreIcon,
  UserIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import type { TimelineEvent } from "~/types/order";
import type { TimelineElement } from "~/types/timeline";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TimelineLayout } from "~/components/ui/custom/timeline-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

type TimelineFormData = {
  description: string;
};

const editTimelineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  timelineEventId: z.string().optional(),
});

type EditTimelineFormData = z.infer<typeof editTimelineSchema>;

export const TimelineSection = ({
  timeline,
}: {
  timeline: TimelineEvent[];
}) => {
  const timelineRef = useRef<HTMLTextAreaElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const orderId = params.orderId as string;
  const [selectedTimelineEvent, setSelectedTimelineEvent] =
    useState<TimelineEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const timelineForm = useForm<TimelineFormData>({
    defaultValues: {
      description: "",
    },
  });

  const editForm = useForm<EditTimelineFormData>({
    resolver: zodResolver(editTimelineSchema),
    defaultValues: {
      title: "",
      description: "",
      timelineEventId: "",
    },
  });

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

  const addTimelineEvent =
    api.order.addOrderTimelineEvent.useMutation(defaultActions);

  const updateTimelineEvent =
    api.order.updateOrderTimelineEvent.useMutation(defaultActions);

  const timelineData = useMemo(() => {
    return timeline?.map((event) => ({
      id: event.id,
      title: event.title,
      date: new Date(event.updatedAt).toLocaleString(),
      description: event.description ?? "",
      status: "completed",
      icon: () =>
        event.isEditable ? (
          <UserIcon className="h-3 w-3" />
        ) : (
          <StoreIcon className="h-3 w-3" />
        ),
      color: event.isEditable ? "secondary" : "primary",
      isEditable: event.isEditable,
      onEdit: () => {
        setSelectedTimelineEvent(event);
        editForm.reset({
          title: event.title,
          description: event.description ?? "",
          timelineEventId: event.id,
        });
        setDialogOpen(true);
      },
    })) as TimelineElement[];
  }, [timeline, editForm]);

  const handleSubmit = () => {
    if (!timelineRef.current?.value) return;

    addTimelineEvent.mutate({
      orderId,
      title: "Note",
      description: timelineRef.current.value,
    });

    timelineRef.current.value = "";
  };

  const handleEditSubmit = (data: EditTimelineFormData) => {
    if (!data.timelineEventId) return;

    updateTimelineEvent.mutate({
      timelineEventId: data.timelineEventId,
      title: data.title,
      description: data.description,
    });

    setDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
              Timeline
            </CardTitle>
            <CardDescription>
              View the entire history of the order
            </CardDescription>
          </div>
        </CardHeader>

        <div className="p-6 pt-4">
          <div className="mb-4 flex items-end gap-2">
            <Textarea
              placeholder="Leave a comment..."
              ref={timelineRef}
              className="min-h-[80px] resize-none"
            />
            <Button size="icon" onClick={handleSubmit} className="h-10 w-10">
              {addTimelineEvent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Separator className="my-4" />

          <ScrollArea className="h-[400px]" type="always">
            <div ref={topRef} />
            {timelineData && timelineData.length > 0 ? (
              <TimelineLayout
                items={timelineData}
                size="sm"
                animate={true}
                className="mx-0 max-w-xl px-0"
                iconColor="primary"
                connectorColor="primary"
              />
            ) : (
              <div className="flex items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No timeline events yet
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timeline Event</DialogTitle>
            <DialogDescription>
              Make changes to the timeline event here. Click save when
              you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTimelineEvent.isPending}>
                  {updateTimelineEvent.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
