import { CalendarIcon } from "lucide-react";
import { cn } from "@web/lib/utils";
import { Button } from "@web/components/ui/button";
import { Calendar } from "@web/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@web/components/ui/popover";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@web/components/ui/form";
import { Control, FieldPathByValue, FieldValues } from "react-hook-form";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPathByValue<T, Date | undefined>;
  label: string;
};

export function DateTimePickerField<T extends FieldValues>({ control, name, label }: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>

          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? formatDateTime(field.value) : "Pick date"}
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
