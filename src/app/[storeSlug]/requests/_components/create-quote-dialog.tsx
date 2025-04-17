"use client";

import type { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ProductRequestFormData } from "~/lib/validators/product-request";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { DateFormField } from "~/components/input/date-form-field";

type QuoteFormData = {
  price: number;
  notes: string;
  expiresAt: Date | null;
};

type Props = {
  form: UseFormReturn<ProductRequestFormData>;
  loading: boolean;
  children: React.ReactNode;
  initialData?: QuoteFormData;
  onSubmit: (data: QuoteFormData) => void;
};

export const CreateQuoteDialog = ({
  loading,
  children,
  initialData,
  onSubmit,
}: Props) => {
  const [open, setOpen] = useState(false);

  const initialValues = useMemo(() => {
    return {
      price: initialData?.price ?? 0,
      notes: initialData?.notes ?? "",
      expiresAt: initialData?.expiresAt ?? null,
    };
  }, [initialData]);

  const quoteForm = useForm<QuoteFormData>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialData) {
      quoteForm.reset(initialData);
    }
  }, [initialData, quoteForm]);

  const handleSubmit = (data: QuoteFormData) => {
    onSubmit(data);

    setOpen(false);
    quoteForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" withoutClose>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {initialData?.price ? "Edit" : "Create"} Quote
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              type="button"
              onClick={() => setOpen(false)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(quoteForm.getValues());
          }}
          className="space-y-6 py-4"
        >
          <div className="space-y-4">
            <CurrencyFormField
              form={quoteForm}
              name="price"
              label="Price"
              className="w-full"
            />

            <DateFormField
              form={quoteForm}
              name="expiresAt"
              label="Expiration Date"
            />

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Enter any additional information about this quote"
                value={quoteForm.watch("notes")}
                onChange={(e) => quoteForm.setValue("notes", e.target.value)}
                className="resize-none"
              />
              <p className="text-muted-foreground text-xs">
                These notes will be visible to the customer
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(quoteForm.getValues())}
            >
              {initialData?.price ? "Update" : "Create"} Quote
            </Button>
          </div>
          <p className="text-muted-foreground text-center text-xs">
            This quote will be automatically sent to the customer&apos;s email
            on this product request.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
