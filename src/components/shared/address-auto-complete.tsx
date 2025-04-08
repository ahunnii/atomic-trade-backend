"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

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
};
type ParsedAddress = {
  street: string;
  additionalInfo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const AddressAutoComplete = ({ onSelect, initialAddress }: Props) => {
  console.log("initialAddress", initialAddress);
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
    console.log("prediction", prediction);

    const latLng = await getLatLng(prediction.place_id);
    console.log("latLng", latLng);

    if (latLng.length > 0 && latLng[0]) {
      const parsedAddress = parseUSAddress(latLng[0].formatted_address);
      const address = {
        formatted: latLng[0].formatted_address,
        street: parsedAddress?.street ?? "",
        city: parsedAddress?.city ?? "",
        state: parsedAddress?.state ?? "",
        postalCode: parsedAddress?.postalCode ?? "",
        country: parsedAddress?.country ?? "",
      };
      setSelected(latLng[0].formatted_address);
      onSelect(address);
      setIsOpen(false);
    } else {
      console.warn("Geocoding given address returned nothing...");
    }
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
              <CommandEmpty>No results found</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {predictions.map((prediction) => (
                  <CommandItem
                    key={prediction.place_id}
                    onSelect={() => {
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
