import type { Control, FieldValues, UseFormReturn } from "react-hook-form";
import { Plus, Trash } from "lucide-react";
import { useFieldArray } from "react-hook-form";

import type { AttributeFormData } from "~/lib/validators/attribute";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

type Props = {
  control: Control<AttributeFormData>;
  form: UseFormReturn<AttributeFormData>;
};
export const AttributesNestedValueInput = ({ control, form }: Props) => {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `values` as const,
  });

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: FieldValues,
  ) => {
    field.onChange(e);

    if (
      e.target.value !== "" &&
      form.watch(`values`).filter((val) => val.content === "").length === 0
    ) {
      append({ content: "" }, { shouldFocus: false });
    }
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && fields.length > 1) {
      document?.getElementById?.(`values.${fields.length}.content`)?.focus();
    }
  };

  return (
    <>
      <FormLabel className="flex w-full items-center justify-between">
        Attribute Values
      </FormLabel>
      <div className="flex w-full flex-col gap-1 space-y-1">
        {fields.map((item, k) => {
          return (
            <FormField
              key={item.id}
              control={control}
              name={`values.${k}.content`}
              render={({ field }) => (
                <FormItem className="flex w-full items-center gap-2">
                  <div className="flex w-4/6 flex-col max-lg:w-full">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Attribute Value"
                        id={`values.${k}.content`}
                        onChange={(e) => handleOnChange(e, field)}
                        onKeyDown={handleOnKeyDown}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  {((k !== 0 && fields.length > 1) || fields.length > 1) && (
                    <Button
                      type="button"
                      variant={"destructive"}
                      className="m-0 h-5 w-5 rounded-full bg-transparent p-0 text-red-500 hover:bg-transparent hover:text-red-700"
                      onClick={() => remove(k)}
                    >
                      <Trash className="size-5" />
                    </Button>
                  )}
                </FormItem>
              )}
            />
          );
        })}

        <Button onClick={() => append({ content: "" })} type="button">
          <Plus className="mr-2 h-4 w-4" /> Add Value
        </Button>
        <FormDescription>
          Example: If you did an attribute like <em>Size</em>, some attribute
          values could be <strong>S, M, L, XL</strong>
        </FormDescription>
      </div>
    </>
  );
};
