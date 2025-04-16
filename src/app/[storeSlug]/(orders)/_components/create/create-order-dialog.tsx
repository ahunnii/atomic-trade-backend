"use client";

import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  Link,
  ShoppingCart,
  UserCog,
  Zap,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

type Props = { storeSlug: string };

export const CreateOrderDialog = ({ storeSlug }: Props) => {
  const router = useRouter();

  const orderTypes = [
    {
      title: "Draft order",
      description: "Create a draft order with multiple items and options",
      icon: ShoppingCart,
      href: `/${storeSlug}/draft-orders/new`,
      isDisabled: false,
    },
    {
      title: "Payment link",
      description: "Generate a payment link to share with customers",
      icon: Link,
      href: `/${storeSlug}/orders/create/payment-link`,
      isDisabled: true,
    },
    {
      title: "Invoice",
      description: "Create a professional invoice for your customers",
      icon: FileText,
      href: `/${storeSlug}/orders/create/invoice`,
      isDisabled: true,
    },
    {
      title: "Quick order",
      description: "Quickly create a simple one-item order",
      icon: Zap,
      href: `/${storeSlug}/orders/create/quick`,
      isDisabled: true,
    },
    {
      title: "Customer request",
      description:
        "Create a custom order based on specific customer requirements",
      icon: UserCog,
      href: `/${storeSlug}/orders/create/custom-request`,
      isDisabled: true,
    },
    {
      title: "Service order",
      description: "Create an order for professional services or consultations",
      icon: Briefcase,
      href: `/${storeSlug}/orders/create/service`,
      isDisabled: true,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-auto flex h-8 text-xs" size="sm">
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>What type of order do you want to create?</DialogTitle>
          <DialogDescription>
            Choose the type of order that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          {orderTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.title}
                variant="outline"
                className={`hover:bg-accent group flex h-auto min-h-[100px] flex-col items-start gap-2 p-4 ${
                  type.isDisabled ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={() => !type.isDisabled && router.push(type.href)}
                disabled={type.isDisabled}
              >
                <div className="flex w-full items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{type.title}</span>
                </div>
                <p className="text-muted-foreground line-clamp-2 text-left text-sm font-normal text-pretty">
                  {type.description}
                </p>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
