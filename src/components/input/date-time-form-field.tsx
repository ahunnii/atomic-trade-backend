"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/custom/date-time-calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputId?: string;
  inputClassName?: string;
  name: Path<CurrentForm>;
  defaultValue?: string;
};

export const DateTimeFormField = <CurrentForm extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
  placeholder,
  onChange,
  onKeyDown,
  inputId,
  inputClassName,
  defaultValue,
}: Props<CurrentForm>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState<string>("05:00");
  const [date, setDate] = useState<Date | null>(null);
  //   const form = useForm<z.infer<typeof FormSchema>>({
  //     resolver: zodResolver(FormSchema),
  //   });

  //   async function onSubmit(data: z.infer<typeof FormSchema>) {
  //     toast.success(`Meeting at: ${format(data.datetime, "PPP, p")}`);
  //   }

  return (
    <>
      <div className="flex w-full gap-4">
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel>Date</FormLabel>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        `${format(field.value, "PPP")}, ${time}`
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={date ?? field.value}
                    onSelect={(selectedDate) => {
                      const [hours, minutes] = time.split(":");
                      selectedDate?.setHours(
                        parseInt(hours!),
                        parseInt(minutes!),
                      );
                      setDate(selectedDate!);
                      field.onChange(selectedDate);
                    }}
                    onDayClick={() => setIsOpen(false)}
                    fromYear={2000}
                    toYear={new Date().getFullYear()}
                    // disabled={(date) =>
                    //   Number(date) < Date.now() - 1000 * 60 * 60 * 24 ||
                    //   Number(date) > Date.now() + 1000 * 60 * 60 * 24 * 30
                    // }
                    defaultMonth={field.value}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Set your date and time.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Select
                  defaultValue={time}
                  onValueChange={(e) => {
                    setTime(e);
                    if (date) {
                      const [hours, minutes] = e.split(":");
                      const newDate = new Date(date.getTime());
                      newDate.setHours(parseInt(hours!), parseInt(minutes!));
                      setDate(newDate);
                      field.onChange(newDate);
                    }
                  }}
                >
                  <SelectTrigger className="w-[120px] font-normal focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[15rem]">
                      {Array.from({ length: 96 }).map((_, i) => {
                        const hour = Math.floor(i / 4)
                          .toString()
                          .padStart(2, "0");
                        const minute = ((i % 4) * 15)
                          .toString()
                          .padStart(2, "0");
                        return (
                          <SelectItem key={i} value={`${hour}:${minute}`}>
                            {hour}:{minute}
                          </SelectItem>
                        );
                      })}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
