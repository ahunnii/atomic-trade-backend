"use client";

import type React from "react";
import type { FormEvent } from "react";
import type { ZodError } from "zod";
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { z } from "zod";

import type { Address } from "~/types/store";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FormMessages } from "~/components/shared/form-messages";

interface AddressDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  address: Address;
  setAddress: (address: Address) => void;
  adrAddress: string;
  dialogTitle: string;
  isLoading: boolean;
}

interface AddressFields {
  street?: string;
  additional?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

/**
 * Create a Zod schema for validating address fields.
 * Note that, different address vary from place to place.
 * This Schema makes sure that the required fields are filled.
 */
export function createAddressSchema(address: AddressFields) {
  let schema = {};

  if (address.street !== "") {
    schema = {
      ...schema,
      street: z.string().min(1, {
        message: "Street is required",
      }),
    };
  }

  schema = {
    ...schema,
    additional: z.string().optional(),
  };

  if (address.city !== "") {
    schema = {
      ...schema,
      city: z.string().min(1, {
        message: "City is required",
      }),
    };
  }

  if (address.state !== "") {
    schema = {
      ...schema,
      state: z.string().min(1, {
        message: "State is required",
      }),
    };
  }

  if (address.postalCode !== "") {
    schema = {
      ...schema,
      postalCode: z.string().min(1, {
        message: "Postal code is required",
      }),
    };
  }

  return z.object(schema);
}

export default function AddressDialog(
  props: React.PropsWithChildren<AddressDialogProps>,
) {
  const {
    children,
    dialogTitle,
    open,
    setOpen,
    address,
    setAddress,
    adrAddress,
    isLoading,
  } = props;

  const [street, setStreet] = useState("");
  const [additional, setAdditional] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const addressSchema = createAddressSchema({
    street: address.street,
    additional: address?.additional ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
  });

  // /**
  //  * Update and format the address string with the given components
  //  */
  // function updateAndFormatAddress(
  //   addressString: string,
  //   addressComponents: {
  //     "street-address": string;
  //     address2: string;
  //     locality: string;
  //     region: string;
  //     "postal-code": string;
  //   },
  // ) {
  //   let updatedAddressString = addressString;

  //   // Replace each class content with its corresponding value
  //   Object.entries(addressComponents).forEach(([key, value]) => {
  //     if (key !== "address2") {
  //       const regex = new RegExp(`(<span class="${key}">)[^<]*(</span>)`, "g");
  //       updatedAddressString = updatedAddressString.replace(
  //         regex,
  //         `$1${value}$2`,
  //       );
  //     }
  //   });

  //   // Remove all span tags
  //   updatedAddressString = updatedAddressString.replace(/<\/?span[^>]*>/g, "");

  //   // Add address2 just after address1 if provided
  //   if (addressComponents.address2) {
  //     const address1Regex = new RegExp(
  //       `${addressComponents["street-address"]}`,
  //     );
  //     updatedAddressString = updatedAddressString.replace(
  //       address1Regex,
  //       `${addressComponents["street-address"]}, ${addressComponents.address2}`,
  //     );
  //   }

  //   // Clean up any extra spaces or commas
  //   updatedAddressString = updatedAddressString
  //     .replace(/,\s*,/g, ",")
  //     .trim()
  //     .replace(/\s\s+/g, " ")
  //     .replace(/,\s*$/, "");

  //   return updatedAddressString;
  // }

  /**
   * Handle form submission and save the address
   */
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addressSchema.parse({
        street,
        additional,
        city,
        state,
        postalCode,
      });
    } catch (error) {
      const zodError = error as ZodError;
      const errorMap = zodError.flatten().fieldErrors;

      setErrorMap({
        street: errorMap.street?.[0] ?? "",
        additional: errorMap.additional?.[0] ?? "",
        city: errorMap.city?.[0] ?? "",
        state: errorMap.state?.[0] ?? "",
        postalCode: errorMap.postalCode?.[0] ?? "",
      });

      return;
    }

    // Create a new formatted address from the current components
    const newFormattedAddress = [
      street,
      additional,
      `${city}, ${state} ${postalCode}`,
      address.country ?? "USA",
    ]
      .filter(Boolean)
      .join(", ")
      .replace(/,\s*$/, ""); // Remove any trailing commas

    setAddress({
      ...address,
      street,
      additional,
      city,
      state,
      postalCode,
      formatted: newFormattedAddress,
    });

    setOpen(false);
  };

  useEffect(() => {
    setStreet(address.street);
    setAdditional(address.additional ?? "");
    setPostalCode(address.postalCode);
    setCity(address.city);
    setState(address.state);

    if (!open) {
      setErrorMap({});
    }
  }, [address, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-52 items-center justify-center">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4 py-7">
              <div className="space-y-0.5">
                <Label htmlFor="street">Address line 1</Label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.currentTarget.value)}
                  id="street"
                  name="street"
                  placeholder="Address line 1"
                />
                {errorMap.street && (
                  <FormMessages
                    type="error"
                    className="pt-1 text-sm"
                    messages={[errorMap.street]}
                  />
                )}
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="address2">
                  Address line 2{" "}
                  <span className="text-secondary-foreground text-xs">
                    (Optional)
                  </span>
                </Label>
                <Input
                  value={additional}
                  onChange={(e) => setAdditional(e.currentTarget.value)}
                  id="additional"
                  name="additional"
                  placeholder="Address line 2"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.currentTarget.value)}
                    id="city"
                    name="city"
                    placeholder="City"
                  />
                  {errorMap.city && (
                    <FormMessages
                      type="error"
                      className="pt-1 text-sm"
                      messages={[errorMap.city]}
                    />
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor="region">State / Province / Region</Label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.currentTarget.value)}
                    id="state"
                    name="state"
                    placeholder="Region"
                  />
                  {errorMap.state && (
                    <FormMessages
                      type="error"
                      className="pt-1 text-sm"
                      messages={[errorMap.state]}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.currentTarget.value)}
                    id="postalCode"
                    name="postalCode"
                    placeholder="Postal Code"
                  />
                  {errorMap.postalCode && (
                    <FormMessages
                      type="error"
                      className="pt-1 text-sm"
                      messages={[errorMap.postalCode]}
                    />
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    value={address?.country ?? "USA"}
                    id="country"
                    disabled
                    name="country"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
