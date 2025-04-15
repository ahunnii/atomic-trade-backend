"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, MapPin } from "lucide-react";

import type { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";

import type { Address } from "~/lib/validators/geocoding";
import { autocomplete, getLatLng } from "~/lib/google";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";

import { Button } from "../ui/button";

type Props = {
  onSelect: (address: Address) => void;
  initialAddress?: Address;
  onUnverifiedAddress?: (isUnverified: boolean) => void;
  isUnverified?: boolean;
};
type ParsedAddress = {
  street: string;
  additionalInfo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const AddressAutoComplete = ({
  onSelect,
  initialAddress,
  onUnverifiedAddress,
  isUnverified,
}: Props) => {
  const [predictions, setPredictions] = useState<PlaceAutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>(
    initialAddress?.formatted ?? "",
  );
  const [input, setInput] = useState("");
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!isOpen || !input) return;

      const predictions = await autocomplete(input);
      setPredictions(predictions ?? []);
    };
    void fetchPredictions();
  }, [input, isOpen]);

  useEffect(() => {
    if (initialAddress) {
      setSelected(initialAddress.formatted);
      setInput(initialAddress.formatted);
    }
  }, [initialAddress]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchend", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [isOpen]);

  function parseUSAddress(address: string): ParsedAddress | null {
    const parts = address.split(",").map((p) => p.trim());

    // Check country
    const country = parts.at(-1);
    if (!country || country.toLowerCase() !== "usa") {
      return null;
    }

    if (parts.length < 3) return null;

    const [streetAndAdditional, city, stateZip] = parts;

    // Extract state and postal code
    const stateZipMatch = stateZip?.match(/^([A-Z]{2})\s+(\d{5})(?:-\d{4})?$/);
    if (!stateZipMatch) return null;

    const [, state, postalCode] = stateZipMatch;

    // Extract street and optional additional info
    const suiteMatch = streetAndAdditional?.match(
      /^(.*?)(?:\s+(suite|apt|unit)\s+(.+))?$/i,
    );
    if (!suiteMatch) return null;

    const street = suiteMatch[1]?.trim() ?? "";
    const additionalInfo =
      suiteMatch[2] && suiteMatch[3]
        ? `${suiteMatch[2]} ${suiteMatch[3]}`
        : undefined;

    return {
      street,
      additionalInfo,
      city: city ?? "",
      state: state ?? "",
      postalCode: postalCode ?? "",
      country,
    };
  }

  const handleSelect = async (prediction: PlaceAutocompleteResult) => {
    const latLng = await getLatLng(prediction.place_id);

    if (latLng.length > 0 && latLng[0]) {
      const parsedAddress = parseUSAddress(latLng[0].formatted_address);
      const isUnverified = !parsedAddress;
      onUnverifiedAddress?.(isUnverified);

      const address = {
        formatted: latLng[0].formatted_address,
        street: parsedAddress?.street ?? "",
        additional: parsedAddress?.additionalInfo ?? "",
        city: parsedAddress?.city ?? "",
        state: parsedAddress?.state ?? "",
        postalCode: parsedAddress?.postalCode ?? "",
        country: parsedAddress?.country ?? "",
      };
      setSelected(latLng[0].formatted_address);
      onSelect({
        ...address,
        id: "",
      });
      setIsOpen(false);
    } else {
      console.warn("Geocoding given address returned nothing...");
    }
  };

  const handleManualAddress = () => {
    const parsedAddress = parseUSAddress(input);
    const isUnverified = !parsedAddress;
    console.log("Manual address entered:", {
      input,
      parsedAddress,
      isUnverified,
    });
    onUnverifiedAddress?.(isUnverified);

    const address = parsedAddress
      ? {
          formatted: input,
          street: parsedAddress.street,
          additional: parsedAddress.additionalInfo,
          city: parsedAddress.city,
          state: parsedAddress.state,
          postalCode: parsedAddress.postalCode,
          country: parsedAddress.country,
        }
      : {
          formatted: input,
          street: input,
          additional: "",
          city: "",
          state: "",
          postalCode: "",
          country: "USA",
        };

    setSelected(input);
    onSelect({
      ...address,
      id: "",
    });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full justify-start text-left"
      >
        <MapPin className="mr-2 h-4 w-4" />
        {selected ? selected : "Select an address..."}
      </Button>

      {/* <div key={String(isUnverified)}>
        {isUnverified === true && (
          <div className="mt-2 rounded-md bg-yellow-50 p-4">
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
                    This address could not be verified. Please ensure all fields
                    are correct.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div> */}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full" ref={commandRef}>
          <Command>
            <CommandInput
              placeholder="Search for an address..."
              value={input}
              onValueChange={setInput}
              autoFocus
            />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 p-4">
                  <p>No results found</p>
                  {input && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleManualAddress}
                      className="w-full"
                    >
                      Use &quot;{input}&quot; as address
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup heading="Suggestions">
                {predictions.map((prediction) => (
                  <CommandItem
                    key={prediction.place_id}
                    onSelect={(e) => {
                      void handleSelect(prediction);
                    }}
                  >
                    {prediction.description}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
