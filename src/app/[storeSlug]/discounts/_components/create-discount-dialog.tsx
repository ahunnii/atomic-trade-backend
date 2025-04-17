"use client";

import { useRouter } from "next/navigation";
import { Percent, Tag, Truck } from "lucide-react";

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

export const CreateDiscountDialog = ({ storeSlug }: Props) => {
  const router = useRouter();

  const discountTypes = [
    {
      title: "Amount off Products",
      description:
        "Create a discount that applies to specific products or collections",
      icon: Tag,
      href: `/${storeSlug}/discounts/new?type=PRODUCT`,
      isDisabled: false,
    },
    {
      title: "Amount off Order",
      description: "Create a discount that applies to the entire order",
      icon: Percent,
      href: `/${storeSlug}/discounts/new?type=ORDER`,
      isDisabled: false,
    },
    {
      title: "Free Shipping",
      description: "Create a discount that removes shipping costs",
      icon: Truck,
      href: `/${storeSlug}/discounts/new?type=SHIPPING`,
      isDisabled: false,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-auto flex h-8 text-xs" size="sm">
          Create Discount
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            What type of discount do you want to create?
          </DialogTitle>
          <DialogDescription>
            Choose the type of discount that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          {discountTypes.map((type) => {
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
