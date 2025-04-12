/* eslint-disable react-hooks/exhaustive-deps */
import { MoreVertical, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { ViewSection } from "~/components/common/sections/view-section.admin";
import { Button } from "~/components/ui/button";

import { Textarea } from "~/components/ui/textarea";
import { useEnterToSubmit } from "~/hooks/use-enter-to-submit";
import { toastService } from "~/lib/toast";
import { api } from "~/utils/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type Props = { note: string | null };

export const ViewOrderNote = ({ note }: Props) => {
  const { orderId }: { orderId: string } = useParams();

  const noteRef = useRef<HTMLTextAreaElement>(null);
  const apiContext = api.useContext();

  const updateOrderNote = api.order.updateNote.useMutation({
    onSuccess: () => toastService.success("Note has been updated"),
    onError: (error) => toastService.error("Failed to update note", error),
    onSettled: () => void apiContext.order.invalidate(),
  });

  const handleNoteUpdate = () =>
    updateOrderNote.mutate({
      orderId,
      note: noteRef.current!.value,
    });

  useEnterToSubmit({
    extraCondition: document.activeElement === noteRef?.current,
    callback: handleNoteUpdate,
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Note
          </CardTitle>
          <CardDescription>
            Pin a note to the order for quick reference
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 text-sm">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Write a note..."
            ref={noteRef}
            defaultValue={note ?? ""}
            className="resize-none"
          />
          <Button
            size={"icon"}
            onClick={handleNoteUpdate}
            className="aspect-square size-5"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
