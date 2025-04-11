import * as React from "react";

import { cn } from "~/lib/utils";

type InputType = React.HTMLInputTypeAttribute | "numeric";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  allowDecimals?: boolean;
  maxDecimals?: number;
}

const NumericInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      onChange,
      onFocus,
      allowDecimals = false,
      maxDecimals = 2,
      ...props
    },
    ref,
  ) => {
    const isNumeric = type === "numeric";
    const inputType = isNumeric ? "text" : type;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isNumeric) {
        const target = e.currentTarget;
        target.setSelectionRange(target.value.length, target.value.length);
      }
      onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumeric) {
        const target = e.currentTarget;
        const value = target.value;

        // Handle empty input
        if (value === "") {
          onChange?.(e);
          return;
        }

        // Create regex pattern based on whether decimals are allowed
        let regex;
        if (allowDecimals) {
          // Allow numbers and one decimal point
          regex = new RegExp(`^\\d*(\\.\\d{0,${maxDecimals}})?$`);
        } else {
          // Only allow integers
          regex = /^\d*$/;
        }

        // Only update if the value matches our pattern
        if (regex.test(value)) {
          onChange?.(e);
        } else {
          // Prevent the change by restoring the previous valid value
          e.preventDefault();
          target.value = target.defaultValue;
        }
      } else {
        onChange?.(e);
      }
    };

    return (
      <input
        type={inputType}
        className={cn(
          "border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm",
          "file:text-foreground placeholder:text-muted-foreground file:font-medium",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onFocus={handleFocus}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  },
);
NumericInput.displayName = "NumericInput";

export { NumericInput };
