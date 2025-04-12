/* eslint-disable react-hooks/exhaustive-deps */
import { CheckIcon, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import {
  ComboBox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
} from "~/components/ui/downshift-combobox";
import { api } from "~/utils/api";

type Customer = {
  id: string;
  name: string;
  email: string;
  image?: string | undefined | null;
};

export const SearchForCustomer = (props: {
  setCustomer: (customer: Customer) => void;
  initialCustomer: string | null;
}) => {
  const [value, setValue] = useState<string | null>(null);

  const getAllUsers = api.users.getAll.useQuery();

  const users = useMemo(
    () =>
      getAllUsers?.data?.map(
        (user) =>
          ({
            id: user.id,
            name: user.name ?? `User ${user.id}`,
            email: user.email ?? "",
            image: user?.image,
          } satisfies Customer)
      ) ?? [],
    [getAllUsers?.data]
  );

  const bookByValue = useMemo(
    () => (value && users.find((book) => book.id === value)) ?? null,
    [value, users, props?.initialCustomer]
  );

  useEffect(() => {
    if (bookByValue) props.setCustomer(bookByValue);
  }, [bookByValue]);

  useEffect(() => {
    if (props.initialCustomer) setValue(props.initialCustomer);
  }, [props.initialCustomer]);

  return (
    <div className="py-4">
      <ComboBox
        value={value}
        onValueChange={setValue}
        filterItems={(inputValue, items) =>
          items.filter(({ value }) => {
            const book = users.find((book) => book.id === value);
            return (
              !inputValue ||
              (book &&
                (book?.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                  book?.email.toLowerCase().includes(inputValue.toLowerCase())))
            );
          })
        }
      >
        <ComboboxInput placeholder="Select an existing customer..." />
        <ComboboxContent>
          {users?.map(({ id, name, email }) => (
            <ComboboxItem
              key={id}
              value={id}
              label={name}
              disabled={id === "book-5"}
              className="ps-8"
            >
              <span className="text-sm text-foreground">{name}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
              {value === id && (
                <span className="absolute start-2 top-0 flex h-full items-center justify-center">
                  <CheckIcon className="size-4" />
                </span>
              )}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No results.</ComboboxEmpty>
        </ComboboxContent>
      </ComboBox>

      <div className="flex flex-col items-start pt-4">
        {bookByValue ? (
          <>
            <span className="text-sm text-muted-foreground">
              Selected user:
            </span>

            <div className="flex gap-2">
              <Avatar>
                <AvatarImage src={bookByValue?.image ?? ""} alt="@shadcn" />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{bookByValue.name}</span>
                <span className="mb-4">{bookByValue.email}</span>
              </div>
            </div>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            No user selected.
          </span>
        )}
        {/* {value && (
          <>
            <span className="text-sm text-muted-foreground">Value:</span>
            <span className="rounded-sm bg-muted px-2 py-1.5 font-mono text-muted-foreground">
              {value}
            </span>
          </> */}
        {/* )} */}
      </div>
    </div>
  );
};
