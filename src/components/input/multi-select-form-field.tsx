import React, { useCallback, useEffect, useState } from "react";
import { CheckIcon, ChevronDown, XCircle, XIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";

interface MultiSelectFormFieldProps {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  defaultValue?: string[];
  onValueChange: (value: string[]) => void;
  onRemove?: () => void;
  disabled?: boolean;
  placeholder: string;
  className?: string;
  animationSpeed?: number;
}

const MultiSelectFormField = React.forwardRef<
  HTMLButtonElement,
  MultiSelectFormFieldProps
>(
  (
    {
      options,
      defaultValue,
      onValueChange,
      disabled,

      placeholder,

      onRemove,
      animationSpeed = 2,
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] = useState(
      new Set(defaultValue ?? []),
    );
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isAnimating] = useState(false);
    const [open, setOpen] = useState(false);

    const [alertCallback, setAlertCallback] = useState<() => void>(
      () => () => void 0,
    );
    useEffect(() => {
      setSelectedValues(new Set(defaultValue));
    }, [defaultValue]);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (
        event.key === "Backspace" &&
        !(event.target as HTMLInputElement).value
      ) {
        const values = Array.from(selectedValues);
        values.pop();
        setSelectedValues(new Set(values));
        onValueChange(values);
      }
    };

    const toggleOption = useCallback(
      (value: string) => {
        const newSelectedValues = new Set(selectedValues);
        if (newSelectedValues.has(value)) {
          newSelectedValues.delete(value);
        } else {
          newSelectedValues.add(value);
        }
        setSelectedValues(newSelectedValues);
        onValueChange(Array.from(newSelectedValues));
      },
      [selectedValues, onValueChange],
    );

    return (
      <>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Removing this attribute will also reset your attributes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => alertCallback()}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              {...props}
              disabled={disabled}
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className="hover:bg-card flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit drop-shadow-xl"
            >
              {Array.from(selectedValues).length > 0 ? (
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-wrap items-center">
                    {Array.from(selectedValues).map((value) => {
                      const option = options.find((o) => o.value === value);
                      const IconComponent = option?.icon;
                      return (
                        <Badge
                          key={value}
                          variant="outline"
                          className={cn(
                            "bg-card m-1 drop-shadow-md transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110",
                            isAnimating ? "animate-bounce invert" : "",
                          )}
                          style={{
                            animationDuration: `${animationSpeed}s`,
                          }}
                        >
                          {IconComponent && (
                            <IconComponent className="mr-2 h-4 w-4" />
                          )}
                          {option?.label}
                          <XCircle
                            className="ml-2 h-4 w-4 cursor-pointer"
                            onClick={(event) => {
                              if (disabled) return;
                              const pain = () => {
                                toggleOption(value);
                                if (!!onRemove) onRemove();
                              };

                              setAlertCallback(() => pain);

                              if (!!onRemove) setOpen(true);
                              else toggleOption(value);

                              event.stopPropagation();
                            }}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <XIcon
                      className="text-muted-foreground mx-2 h-4 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        const pain = () => {
                          setSelectedValues(new Set([]));
                          onValueChange(Array.from(new Set([])));
                          if (!!onRemove) onRemove();
                        };

                        setAlertCallback(() => pain);

                        if (!!onRemove) setOpen(true);
                        else pain();
                      }}
                    />
                    <Separator
                      orientation="vertical"
                      className="flex h-full min-h-6"
                    />
                    <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex w-full items-center justify-between">
                  <span className="text-muted-foreground mx-3 text-sm">
                    {placeholder}
                  </span>
                  <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-0 drop-shadow-xl"
            align="start"
            onEscapeKeyDown={() => setIsPopoverOpen(false)}
            onInteractOutside={(event) => {
              if (!event.defaultPrevented) {
                setIsPopoverOpen(false);
              }
            }}
          >
            <Command>
              <CommandInput
                placeholder={placeholder}
                onKeyDown={handleInputKeyDown}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selectedValues.has(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          toggleOption(option.value);
                        }}
                        style={{
                          pointerEvents: "auto",
                          opacity: 1,
                        }}
                      >
                        <div
                          className={cn(
                            "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <CheckIcon className={cn("h-4 w-4")} />
                        </div>
                        {option.icon && (
                          <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                        )}
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedValues.size > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setSelectedValues(new Set([]));
                          onValueChange(Array.from(new Set([])));
                        }}
                        style={{
                          pointerEvents: "auto",
                          opacity: 1,
                        }}
                        className="justify-center text-center"
                      >
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
          {/* {Array.from(selectedValues).length > 0 && (
            <Wand
              className={cn(
                "my-2 h-3 w-3 cursor-pointer bg-background text-foreground",
                isAnimating ? "" : "text-muted-foreground"
              )}
              onClick={() => setIsAnimating(!isAnimating)}
            />
          )} */}
        </Popover>
      </>
    );
  },
);

MultiSelectFormField.displayName = "MultiSelectFormField";

export default MultiSelectFormField;
