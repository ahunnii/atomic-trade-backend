import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { useState } from "react";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";

import type { Address as GeocodingAddress } from "~/lib/validators/geocoding";
import type { Address as StoreAddress } from "~/types/store";
import { cn } from "~/lib/utils";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import { AddressAutoComplete } from "../shared/address-auto-complete";
import AddressDialog from "../shared/address-dialog";
import { Button } from "../ui/button";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  name: Path<CurrentForm>;
  label?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputId?: string;
  type?: string;
  defaultValue?: GeocodingAddress;
  children?: React.ReactNode;
  onSelectAdditional?: (address: GeocodingAddress) => void;
};

const convertToStoreAddress = (address: GeocodingAddress): StoreAddress => ({
  id: "temp", // This is a temporary ID since we're not saving to the database
  formatted: address.formatted,
  street: address.street,
  additional: address.additional ?? null,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
});

const convertToGeocodingAddress = (
  address: StoreAddress,
): GeocodingAddress => ({
  id: "temp",
  formatted: address.formatted,
  street: address.street,
  additional: address.additional ?? undefined,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
});

export const AutoCompleteAddressFormField = <CurrentForm extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
  labelClassName,
  descriptionClassName,
  defaultValue,
  children,
  onSelectAdditional,
}: Props<CurrentForm>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<
    GeocodingAddress | undefined
  >(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);

  const onAddressSelect = (address: GeocodingAddress) => {
    setSelectedAddress(address);
    form.setValue(
      name.replace(".formatted", "") as Path<CurrentForm>,
      address as PathValue<CurrentForm, Path<CurrentForm>>,
    );
    onSelectAdditional?.(address);
  };

  const handleUnverifiedAddress = (isUnverified: boolean) => {
    console.log("handleUnverifiedAddress called:", { isUnverified });
    setIsUnverified(isUnverified);
  };

  const handleAddressUpdate = (address: StoreAddress) => {
    onAddressSelect(convertToGeocodingAddress(address));
  };

  console.log("AutoCompleteAddressFormField render:", { isUnverified });

  return (
    <FormField
      control={form.control}
      name={name}
      render={({}) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && (
            <FormLabel className={cn(labelClassName)}>{label}</FormLabel>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <AddressAutoComplete
                key={selectedAddress?.formatted}
                onSelect={onAddressSelect}
                initialAddress={selectedAddress}
                onUnverifiedAddress={handleUnverifiedAddress}
                isUnverified={isUnverified === true}
              />

              <AddressDialog
                isLoading={isLoading}
                dialogTitle="Edit Address"
                adrAddress={selectedAddress?.formatted ?? ""}
                address={
                  selectedAddress
                    ? convertToStoreAddress(selectedAddress)
                    : {
                        id: "temp",
                        formatted: "",
                        street: "",
                        additional: null,
                        city: "",
                        state: "",
                        postalCode: "",
                        country: "",
                      }
                }
                setAddress={handleAddressUpdate}
                open={isOpen}
                setOpen={setIsOpen}
              >
                <Button
                  disabled={isLoading || !selectedAddress}
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                >
                  <Pencil className="size-4" />
                </Button>
              </AddressDialog>

              <Button
                type="reset"
                onClick={() => {
                  setSelectedAddress(undefined);
                  setIsUnverified(false);
                  onAddressSelect({
                    id: "temp",
                    formatted: "",
                    street: "",
                    additional: undefined,
                    city: "",
                    state: "",
                    postalCode: "",
                    country: "",
                  });
                }}
                size="icon"
                variant="outline"
                className="shrink-0"
              >
                <Trash2 className="size-4" />
              </Button>

              {children}
            </div>

            {isUnverified && (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Unverified Address
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This address could not be verified. Please ensure all
                        fields are correct.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {description && (
            <FormDescription className={cn(descriptionClassName)}>
              {description}
            </FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
