import type { KeyboardEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "~/lib/utils";
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";

import { Skeleton } from "../skeleton";

export type Option<Tmp> = Record<"value" | "label" | "sublabel", string> &
  Record<"data", Tmp> &
  Record<string, string>;

type AutoCompleteProps<Tmp> = {
  options: Option<Tmp>[];
  emptyMessage: string;
  value?: Option<Tmp>;
  onValueChange?: (value: Option<Tmp>) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  createIfNotFound?: () => void;
  createButtonLabel?: string;
};

export const AutoComplete = <Tmp,>({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
  createIfNotFound,
  createButtonLabel,
}: AutoCompleteProps<Tmp>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option<Tmp> | null>(value ?? null);
  const [inputValue, setInputValue] = useState<string>(value?.label ?? "");

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        const optionToSelect = options.find(
          (option) => option.label === input.value,
        );
        if (optionToSelect) {
          setSelected(optionToSelect);
          onValueChange?.(optionToSelect);
        }
      }

      if (event.key === "Escape") {
        input.blur();
      }

      // Check if the create button was clicked
      if (
        event.key === "Enter" &&
        buttonRef.current === document.activeElement
      ) {
        createIfNotFound?.();
      }
    },
    [isOpen, options, onValueChange, createIfNotFound],
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
    setInputValue(selected?.label ?? "");
  }, [selected]);

  const handleSelectOption = useCallback(
    (selectedOption: Option<Tmp>) => {
      console.log(selectedOption);
      setInputValue(selectedOption.label);

      setSelected(selectedOption);
      onValueChange?.(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [onValueChange],
  );

  const handleCreateOption = useCallback(() => {
    setSelected(null);
    setInputValue("");

    createIfNotFound?.();

    // This is a hack to prevent the input from being focused after the user selects an option
    // We can call this hack: "The next tick"
    setTimeout(() => {
      inputRef?.current?.blur();
    }, 0);
  }, [createIfNotFound]);

  return (
    <CommandPrimitive onKeyDown={handleKeyDown} className="w-full">
      <div className="">
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full text-base"
        />
      </div>

      <div className="relative mt-1">
        <div
          className={cn(
            "animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-white outline-none",
            isOpen ? "block" : "hidden",
          )}
        >
          {" "}
          <CommandList className="rounded-lg ring-1 ring-slate-200">
            {/* Create button is now always visible regardless of createIfNotFound value */}

            <CommandGroup forceMount>
              {createIfNotFound && (
                <CommandItem
                  forceMount
                  className="my-2 w-full cursor-pointer"
                  value={"create new"}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onSelect={() => {
                    handleCreateOption();
                  }}
                  disabled={!createIfNotFound}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {createButtonLabel ?? "Create new"}
                </CommandItem>
              )}
            </CommandGroup>
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {options.length > 0 && !isLoading ? (
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected?.value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(option)}
                      className={cn(
                        "flex w-full items-center gap-2",
                        !isSelected ? "pl-8" : null,
                      )}
                    >
                      {isSelected ? <Check className="w-4" /> : null}
                      <span className="flex flex-col gap-1">
                        {option.label}
                        {option.sublabel ? (
                          <span className="text-sm text-gray-500">
                            {option.sublabel}
                          </span>
                        ) : null}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : null}
            {!isLoading ? (
              <>
                <CommandPrimitive.Empty className="rounded-sm px-2 py-3 text-center text-sm select-none">
                  {emptyMessage}
                </CommandPrimitive.Empty>
              </>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  );
};
