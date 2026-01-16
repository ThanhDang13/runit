import * as React from "react";
import { cn } from "@web/lib/utils";

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  value: number;
  onChange: (value: number) => void;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d]/g, "");
          onChange(next === "" ? 0 : Number(next));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            onChange(value + 1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(0, value - 1));
          }
        }}
        className={cn(
          "border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";
