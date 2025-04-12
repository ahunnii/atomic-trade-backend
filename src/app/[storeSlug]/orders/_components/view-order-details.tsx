import type { OrderAddress } from "~/types/order";
import { phoneFormatStringToNumber } from "~/utils/format-utils.wip";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Info, Loader2, MoreVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { toastService } from "~/lib/toast";
import { api } from "~/utils/api";
import { SearchForCustomer } from "./search-for-customer";

type Props = {
  shippingAddress: OrderAddress | null;
  user?: {
    id: string;
    name?: string | null | undefined;
  } | null;
  customer?: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  email?: string;
  phone?: string | null | undefined;
  id: string;
};
export const ViewOrderCustomerDetails = ({
  phone,
  user,
  email,
  id,
  customer,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
              Customer Details
            </CardTitle>
            <CardDescription>Basic info of the customer</CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4 text-sm">
          <div className="divide-y-solid  w-full  gap-4 divide-y text-sm">
            <div className="w-full py-2 text-left">
              <p className="text-muted-foreground">Name:</p>
              <p>{`${customer?.firstName ?? "Guest"} ${customer?.lastName}`}</p>
            </div>
            <div className="w-full py-2 text-left">
              <p className="text-muted-foreground">Phone:</p>
              <p>{phone ? phoneFormatStringToNumber(phone ?? "") : "N/A"}</p>
            </div>
            <div className="w-full py-2 text-left">
              <p className="text-muted-foreground">Email:</p>
              <p>{email}</p>
            </div>
            {customer?.id && (
              <div className="w-full py-2 text-left">
                <p className="text-muted-foreground">Customer ID:</p>
                <p>{customer?.id}</p>
              </div>
            )}
            {!customer?.id && (
              <div className="w-full pb-4 pt-8 text-left">
                <p className="flex gap-1 text-zinc-600">
                  <Info /> Order not attached to a customer
                </p>
              </div>
            )}

            {customer?.userId && (
              <div className="w-full py-2 text-left">
                <p className="text-muted-foreground">User ID:</p>
                <p>{customer?.userId}</p>
              </div>
            )}
            {!customer?.userId && (
              <div className="w-full pb-4 pt-8 text-left">
                <p className="flex gap-1 text-zinc-600">
                  <Info /> Order not attached to a user
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CustomerUpdateDialog
        email={email ?? null}
        open={open}
        setOpen={setOpen}
        id={id}
      />
    </>
  );
};

export function CustomerUpdateDialog({
  email,
  id,
  open,
  setOpen,
}: {
  email?: string | null;
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const apiContext = api.useContext();
  const [customer, setCustomer] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const getUserByEmail = api.users.getByEmail.useQuery(
    { email: email ?? "" },
    { enabled: !!email && open }
  );

  const associateUserToOrder = api.order.assignToUser.useMutation({
    onSuccess: () => {
      setOpen(false);
      toastService.success("User attached to order");
    },
    onError: (error) =>
      toastService.error("Failed to attach user to order", error),
    onSettled: () => void apiContext.order.invalidate(),
  });

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="ignore-default">Users</DialogTitle>
          <DialogDescription>
            Select a user to attach this order to
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col py-4">
          <Label htmlFor="name" className="text-left">
            User
          </Label>
          <SearchForCustomer
            setCustomer={(selected) => setCustomer(selected)}
            initialCustomer={getUserByEmail?.data?.id ?? null}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!customer || associateUserToOrder.isLoading}
            onClick={() => {
              if (customer) {
                associateUserToOrder.mutate({
                  orderId: id,
                  userId: customer.id,
                });
              }
            }}
          >
            {associateUserToOrder.isLoading && (
              <Loader2 className="mr-2 animate-spin" />
            )}{" "}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
