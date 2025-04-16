import type { Path, UseFormReturn } from "react-hook-form";

import type { DraftOrderFormData } from "~/lib/validators/order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { InputFormField } from "~/components/input/input-form-field";
import { PhoneFormField } from "~/components/input/phone-form-field";

type Props = {
  form: UseFormReturn<DraftOrderFormData>;
  children: React.ReactNode;
};

export const EditContactDialog = ({ form, children }: Props) => {
  const email = form.getValues("email");
  const phone = form.getValues("phone");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact Information</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <InputFormField form={form} label="Email" name="email" />
          <PhoneFormField form={form} label="Phone" name="phone" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
