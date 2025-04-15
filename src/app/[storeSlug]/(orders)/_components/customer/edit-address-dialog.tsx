import type { Path, UseFormReturn } from "react-hook-form";

import type { DraftOrderFormData } from "~/lib/validators/order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { AutoCompleteAddressFormField } from "~/components/input/autocomplete-address-form-field";

type Props = {
  form: UseFormReturn<DraftOrderFormData>;
  children: React.ReactNode;
  name: Path<DraftOrderFormData>;
};
export function EditAddressDialog({ form, children, name }: Props) {
  const address = form.getValues(name) as DraftOrderFormData[
    | "shippingAddress"
    | "billingAddress"];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
        </DialogHeader>
        <AutoCompleteAddressFormField
          form={form}
          name={`${name}.formatted` as Path<DraftOrderFormData>}
          defaultValue={{
            ...address!,
            id: address!.id ?? "",
          }}
          onSelectAdditional={(address) => {
            form.setValue(name, {
              id: address.id,
              formatted: address.formatted,
              street: address.street,
              additional: address.additional,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
