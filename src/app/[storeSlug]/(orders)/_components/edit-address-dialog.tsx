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
import { InputFormField } from "~/components/input/input-form-field";

type Props = {
  form: UseFormReturn<DraftOrderFormData>;
  children: React.ReactNode;
  name: Path<DraftOrderFormData>;
  includeCustomerName?: boolean;
};
export const EditAddressDialog = ({
  form,
  children,
  name,
  includeCustomerName,
}: Props) => {
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
          <DialogTitle>
            Edit {name === "shippingAddress" ? "Shipping" : "Billing"} Address
          </DialogTitle>
        </DialogHeader>

        {includeCustomerName && (
          <div className="grid grid-cols-2 gap-4">
            <InputFormField
              form={form}
              label="First Name"
              className="col-span-1"
              name={`${name}.firstName` as Path<DraftOrderFormData>}
              defaultValue={address?.firstName ?? ""}
            />
            <InputFormField
              form={form}
              label="Last Name"
              className="col-span-1"
              name={`${name}.lastName` as Path<DraftOrderFormData>}
              defaultValue={address?.lastName ?? ""}
            />
          </div>
        )}

        <AutoCompleteAddressFormField
          form={form}
          name={`${name}.formatted` as Path<DraftOrderFormData>}
          defaultValue={{
            ...address!,
            id: address!.id ?? "",
          }}
          label={includeCustomerName ? "Address" : undefined}
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
};
