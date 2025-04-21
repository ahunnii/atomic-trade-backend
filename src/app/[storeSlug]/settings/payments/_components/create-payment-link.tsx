"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { toastService } from "@dreamwalker-studios/toasts";

import type { Product, Variation } from "~/types/product";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";

type PaymentLinkItem = {
  name?: string;
  amountInCents?: number;
  quantity?: number;
  variantId?: string;
};

type Props = {
  storeId: string;
  storeSlug: string;
};

export function CreatePaymentLink({ storeId, storeSlug }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<PaymentLinkItem[]>([]);
  const [paymentLink, setPaymentLink] = useState<string>("");

  const { data: products } = api.product.getAll.useQuery({ storeId });
  const createPaymentLink = api.payment.createPaymentLink.useMutation({
    onSuccess: ({ data, message }) => {
      setPaymentLink(data.sessionUrl);
      toastService.success(message);
    },
    onError: (error) => {
      toastService.error(error.message);
    },
  });

  const handleAddItem = () => {
    if (items.length >= 20) {
      toastService.error("You can only add up to 20 items to a payment link");
      return;
    }
    setItems([...items, { name: "", amountInCents: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof PaymentLinkItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleVariantSelect = (index: number, variantId: string) => {
    const variant = products
      ?.flatMap((p) => p.variants)
      .find((v) => v.id === variantId);
    if (variant) {
      handleItemChange(index, "name", variant.name);
      handleItemChange(index, "amountInCents", variant.priceInCents);
      handleItemChange(index, "variantId", variant.id);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (items.length === 0) {
      toastService.error(
        "Please add at least one item to create a payment link",
      );
      return;
    }

    // Validate all required fields are set
    const invalidItems = items.filter(
      (item) => !item.name || !item.amountInCents || !item.quantity,
    );
    if (invalidItems.length > 0) {
      toastService.error("Please fill in all required fields for each item");
      return;
    }

    createPaymentLink.mutate({
      items: items.map((item) => ({
        name: item.name!,
        amountInCents: item.amountInCents!,
        quantity: item.quantity!,
        variantId: item.variantId,
      })),
      storeId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Item {index + 1}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`variant-${index}`}>Select Product</Label>
                <Select
                  value={item.variantId}
                  onValueChange={(value) => handleVariantSelect(index, value)}
                >
                  <SelectTrigger id={`variant-${index}`}>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id} disabled>
                        {product.name}
                      </SelectItem>
                    ))}
                    {products?.flatMap((product) =>
                      product.variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {product.name} - {variant.name}
                        </SelectItem>
                      )),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`name-${index}`}>Item Name</Label>
                <Input
                  id={`name-${index}`}
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  placeholder="Enter item name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`amount-${index}`}>Amount (in cents)</Label>
                <Input
                  id={`amount-${index}`}
                  type="number"
                  value={item.amountInCents}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "amountInCents",
                      parseInt(e.target.value),
                    )
                  }
                  placeholder="Enter amount in cents"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      parseInt(e.target.value),
                    )
                  }
                  min={1}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={handleAddItem}
          className="w-full"
          disabled={items.length >= 20}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>

        <Separator />

        <Button
          onClick={handleCreatePaymentLink}
          className="w-full"
          disabled={createPaymentLink.isPending || items.length === 0}
        >
          {createPaymentLink.isPending ? "Creating..." : "Create Payment Link"}
        </Button>
      </div>

      {paymentLink && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-gray-100 p-4">
                <p className="font-mono text-sm break-all">{paymentLink}</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  void navigator.clipboard.writeText(paymentLink);
                  toastService.success("Payment link copied to clipboard");
                }}
              >
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
