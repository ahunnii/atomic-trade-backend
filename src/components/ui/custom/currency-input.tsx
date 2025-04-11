import * as React from "react";

import { cn } from "~/lib/utils";

type InputType = React.HTMLInputTypeAttribute | "currency";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  currencyFormat?: Intl.NumberFormat;
  type?: InputType;
  value?: number;
  onChange?: (value: number) => void;
}

const defaultCurrencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CurrencyInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      currencyFormat,
      value,
      onChange,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const isCurrency = type === "currency";
    const inputType = isCurrency ? "text" : type;

    const formatCurrency = (value: number) => {
      return (currencyFormat ?? defaultCurrencyFormat).format(value / 100);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const target = e.currentTarget;
        target.setSelectionRange(target.value.length, target.value.length);
      }
      onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const target = e.currentTarget;
        const numericValue = Number(target.value.replace(/\D/g, "")) / 100;
        target.value = formatCurrency(numericValue * 100);
        onChange?.(Math.round(numericValue * 100));
      } else {
        onChange?.(Number(e.currentTarget.value));
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
        maxLength={isCurrency ? 22 : undefined}
        onFocus={handleFocus}
        onChange={handleChange}
        value={
          isCurrency && value !== undefined ? formatCurrency(value) : value
        }
        ref={ref}
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
