"use client";

import { useMemo, useState } from "react";
import { Minus, Package, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import type { FulfillmentWithPackages } from "~/types/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { LoadButton } from "~/components/shared/load-button";

// Match the schema enums
export const FulfillmentType = {
  MANUAL: "MANUAL",
  EASYPOST: "EASYPOST",
  PICKUP: "PICKUP",
} as const;

export const FulfillmentStatus = {
  PENDING: "PENDING",
  AWAITING_SHIPMENT: "AWAITING_SHIPMENT",
  AWAITING_PICKUP: "AWAITING_PICKUP",
  FULFILLED: "FULFILLED",
  CANCELLED: "CANCELLED",
  RESTOCKED: "RESTOCKED",
  PARTIAL: "PARTIAL",
  DRAFT: "DRAFT",
  UNFULFILLED: "UNFULFILLED",
} as const;

export const PackageStatus = {
  PENDING: "PENDING",
  LABEL_PRINTED: "LABEL_PRINTED",
  LABEL_PURCHASED: "LABEL_PURCHASED",
  ATTEMPTED_DELIVERY: "ATTEMPTED_DELIVERY",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  CONFIRMED: "CONFIRMED",
  PRE_TRANSIT: "PRE_TRANSIT",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  FAILURE: "FAILURE",
  UNKNOWN: "UNKNOWN",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
  HELD: "HELD",
  DELAYED: "DELAYED",
  LOST: "LOST",
  ARRIVED_AT_FACILITY: "ARRIVED_AT_FACILITY",
} as const;

const packageSchema = z.object({
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string(),
      quantity: z.number().min(1),
    }),
  ),
});

const fulfillmentSchema = z.object({
  type: z.enum([
    FulfillmentType.MANUAL,
    FulfillmentType.EASYPOST,
    FulfillmentType.PICKUP,
  ]),
  packages: z.array(packageSchema),
  notifyCustomer: z.boolean(),
});

type FulfillmentFormData = z.infer<typeof fulfillmentSchema>;

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  packageId?: string | null;
  isPhysical: boolean;
  quantityFulfilled: number;
  isFulfilled: boolean;
}

interface Props {
  initialFulfillment?: FulfillmentWithPackages;
  orderId: string;
  orderNumber: string;
  orderItems: OrderItem[];
  shippingAddressId?: string;
  storeSlug: string;
  onFulfill: (data: {
    type: keyof typeof FulfillmentType;
    packages: Array<{
      carrier?: string;
      trackingNumber?: string;
      shippingAddressId?: string;
      status: keyof typeof PackageStatus;
      items: Array<{
        itemId: string;
        quantity: number;
      }>;
    }>;
    notifyCustomer: boolean;
  }) => Promise<void>;
}

export const FulfillmentSection = ({
  orderId,
  orderItems,
  storeSlug,

  initialFulfillment,
  orderNumber,
}: Props) => {
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number>(0);

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
    redirectPath: `/${storeSlug}/orders/${orderId}/`,
  });

  const form = useForm<FulfillmentFormData>({
    resolver: zodResolver(fulfillmentSchema),
    defaultValues: {
      type: FulfillmentType.EASYPOST,
      packages: [
        {
          carrier: "",
          trackingNumber: "",
          items: [],
        },
      ],
      notifyCustomer: false,
    },
  });

  const createPackages = api.order.createPackages.useMutation(defaultActions);

  const handleSubmit = async (data: FulfillmentFormData) => {
    // Determine the appropriate status based on fulfillment type
    const getPackageStatus = (type: keyof typeof FulfillmentType) => {
      switch (type) {
        case FulfillmentType.EASYPOST:
          return PackageStatus.PENDING;
        case FulfillmentType.PICKUP:
          return PackageStatus.READY_FOR_PICKUP;
        case FulfillmentType.MANUAL:
          return PackageStatus.DELIVERED;
        default:
          return PackageStatus.PENDING;
      }
    };

    createPackages.mutate({
      orderId,
      type: data.type,
      notifyCustomer: data.notifyCustomer,
      packages: data.packages.map((pkg) => ({
        carrier: pkg.carrier,
        trackingNumber: pkg.trackingNumber,
        status: getPackageStatus(data.type),
        items: pkg.items,
      })),
    });
    // try {
    //   await onFulfill({
    //     type: data.type,
    //     packages: data.packages.map((pkg) => ({
    //       carrier: pkg.carrier,
    //       trackingNumber: pkg.trackingNumber,
    //       shippingAddressId,
    //       status: PackageStatus.PENDING,
    //       items: pkg.items,
    //     })),
    //     notifyCustomer: data.notifyCustomer,
    //   });
    // } catch (error) {
    //   console.error("Error fulfilling order:", error);
    // } finally {
    // }
  };

  const allItems = useMemo(() => {
    // Calculate total quantity already packaged for each order item
    const packagedQuantities = new Map<string, number>();

    // Sum up quantities from all existing packages
    initialFulfillment?.packages.forEach((pkg) => {
      pkg.items.forEach((item) => {
        const currentQuantity = packagedQuantities.get(item.orderItemId) ?? 0;
        packagedQuantities.set(
          item.orderItemId,
          currentQuantity + item.quantity,
        );
      });
    });

    // Map all order items with their remaining quantities
    return orderItems
      .filter((item) => item.isPhysical)
      .map((item) => {
        const packagedQuantity = packagedQuantities.get(item.id) ?? 0;
        const quantityFulfilled = item.quantity - packagedQuantity;

        return {
          ...item,
          quantityFulfilled,
          isFulfilled: quantityFulfilled <= 0,
        };
      });
  }, [orderItems, initialFulfillment?.packages]);

  const allItemsFulfilled = allItems.every((item) => item.isFulfilled);

  // Calculate the next package number based on existing packages
  const nextPackageNumber = (initialFulfillment?.packages.length ?? 0) + 1;

  const packages = form.watch("packages");
  const currentPackage = packages[selectedPackageIndex];

  const addPackage = () => {
    const currentPackages = form.getValues("packages");
    form.setValue("packages", [
      ...currentPackages,
      { carrier: "", trackingNumber: "", items: [] },
    ]);
  };

  const removePackage = (index: number) => {
    const currentPackages = form.getValues("packages");
    if (currentPackages.length > 1) {
      form.setValue(
        "packages",
        currentPackages.filter((_, i) => i !== index),
      );
      if (selectedPackageIndex >= index) {
        setSelectedPackageIndex(Math.max(0, selectedPackageIndex - 1));
      }
    }
  };

  // const getQuantityFulfilled = (itemId: string) => {
  //   const item = orderItems.find((i) => i.id === itemId);
  //   if (!item) return 0;

  //   const allocatedQuantity = packages.reduce((total, pkg) => {
  //     const pkgItem = pkg.items.find((i) => i.itemId === itemId);
  //     return total + (pkgItem?.quantity ?? 0);
  //   }, 0);

  //   return item.quantity - allocatedQuantity;
  // };

  const addItemToPackage = (itemId: string) => {
    const currentItems = currentPackage?.items ?? [];
    const existingItem = currentItems.find((item) => item.itemId === itemId);
    const orderItem = allItems.find((item) => item.id === itemId);

    if (!orderItem) return;

    // Calculate how many are already in this package
    // const currentPackageQuantity = existingItem?.quantity ?? 0;

    // Calculate how many are in other packages being created
    // const otherPackagesQuantity = packages.reduce((total, pkg, index) => {
    //   if (index === selectedPackageIndex) return total;
    //   const pkgItem = pkg.items.find((i) => i.itemId === itemId);
    //   return total + (pkgItem?.quantity ?? 0);
    // }, 0);

    // Calculate how many are in existing packages
    // const existingPackagesQuantity =
    //   initialFulfillment?.packages.reduce((total, pkg) => {
    //     const pkgItem = pkg.items.find((i) => i.orderItemId === itemId);
    //     return total + (pkgItem?.quantity ?? 0);
    //   }, 0) ?? 0;

    // Total quantity that would be in packages after adding one more
    // const totalQuantityInPackages =
    //   currentPackageQuantity +
    //   otherPackagesQuantity +
    //   existingPackagesQuantity +
    //   1;

    // Allow adding items even if they exceed original quantity (for replacements, free items, etc.)
    // But show a warning when this happens
    if (existingItem) {
      form.setValue(
        `packages.${selectedPackageIndex}.items`,
        currentItems.map((item) =>
          item.itemId === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      form.setValue(`packages.${selectedPackageIndex}.items`, [
        ...currentItems,
        { itemId, quantity: 1 },
      ]);
    }
  };

  const removeItemFromPackage = (itemId: string) => {
    const currentItems = currentPackage?.items ?? [];
    const existingItem = currentItems.find((item) => item.itemId === itemId);

    if (existingItem) {
      if (existingItem.quantity > 1) {
        form.setValue(
          `packages.${selectedPackageIndex}.items`,
          currentItems.map((item) =>
            item.itemId === itemId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        );
      } else {
        form.setValue(
          `packages.${selectedPackageIndex}.items`,
          currentItems.filter((item) => item.itemId !== itemId),
        );
      }
    }
  };

  const loading = createPackages.isPending;

  return (
    <div className="space-y-6">
      <Card className="space-y-6 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Create New Package</h2>
          </div>
          <div className="text-sm text-gray-500">Order #{orderNumber}</div>
        </div>

        <div
          className={`rounded-lg border p-4 text-center ${
            allItemsFulfilled
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-yellow-200 bg-yellow-50 text-yellow-700"
          }`}
        >
          {allItemsFulfilled
            ? "All items in this order have been fulfilled"
            : "Some items in this order still need to be fulfilled"}
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {allItemsFulfilled && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-2 text-sm text-blue-700">
                <strong>Additional Fulfillment:</strong> All original order
                items have been fulfilled. You can still create additional
                packages for scenarios like:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                <li>Sending free items or gifts</li>
                <li>Shipping forgotten or missing items</li>
                <li>Replacement items</li>
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium">Fulfillment Type</h3>
            <Select
              value={form.watch("type")}
              onValueChange={(value: keyof typeof FulfillmentType) => {
                form.setValue("type", value);
                // Reset to single package for pickup/manual fulfillment
                if (
                  value === FulfillmentType.PICKUP ||
                  value === FulfillmentType.MANUAL
                ) {
                  form.setValue("packages", [
                    {
                      carrier: "",
                      trackingNumber: "",
                      items: [],
                    },
                  ]);
                  setSelectedPackageIndex(0);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select fulfillment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FulfillmentType.EASYPOST}>
                  Ship to Customer
                </SelectItem>
                <SelectItem value={FulfillmentType.PICKUP}>
                  Mark for Pickup
                </SelectItem>
                <SelectItem value={FulfillmentType.MANUAL}>
                  Hand to Customer Now
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.watch("type") === FulfillmentType.EASYPOST && (
            <div className="flex items-center gap-4">
              <Select
                value={selectedPackageIndex.toString()}
                onValueChange={(value) =>
                  setSelectedPackageIndex(parseInt(value))
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((_, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Package {nextPackageNumber + index}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={addPackage}>
                <Plus className="mr-2 h-4 w-4" />
                Add Package
              </Button>
              {packages.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removePackage(selectedPackageIndex)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove Package
                </Button>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium">
              {form.watch("type") === FulfillmentType.EASYPOST
                ? `Package ${nextPackageNumber + selectedPackageIndex} Details`
                : "Fulfillment Details"}
            </h3>

            {form.watch("type") === FulfillmentType.EASYPOST && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Carrier</label>
                  <Input
                    {...form.register(
                      `packages.${selectedPackageIndex}.carrier`,
                    )}
                    placeholder="Enter shipping carrier"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">
                    Tracking number
                  </label>
                  <Input
                    {...form.register(
                      `packages.${selectedPackageIndex}.trackingNumber`,
                    )}
                    placeholder="Enter tracking number"
                  />
                </div>
              </div>
            )}

            {form.watch("type") === FulfillmentType.PICKUP && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                  This package will be marked as ready for customer pickup. The
                  customer will be notified if you choose to send notifications.
                </p>
              </div>
            )}

            {form.watch("type") === FulfillmentType.MANUAL && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-700">
                  This package will be marked as fulfilled immediately,
                  indicating it has been handed directly to the customer.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border">
            <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 p-4">
              <div className="col-span-6">Item</div>
              <div className="col-span-3 text-center">Available</div>
              <div className="col-span-3 text-right">In Package</div>
            </div>

            <div className="divide-y">
              {allItems.map((item) => {
                const packageItem = currentPackage?.items?.find(
                  (i) => i.itemId === item.id,
                );
                const isFulfilled = item.isFulfilled;

                // Calculate total quantity being sent (including current packages)
                const totalBeingSent = packages.reduce((total, pkg) => {
                  const pkgItem = pkg.items.find((i) => i.itemId === item.id);
                  return total + (pkgItem?.quantity ?? 0);
                }, 0);

                const isExceedingOriginal =
                  totalBeingSent > item.quantityFulfilled;

                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 items-center gap-4 p-4 ${
                      isFulfilled && !isExceedingOriginal ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="col-span-6">
                      <span className="font-medium">{item.name}</span>
                      {isExceedingOriginal && (
                        <div className="mt-1 text-xs text-orange-600">
                          Sending {totalBeingSent - item.quantityFulfilled}{" "}
                          extra
                        </div>
                      )}
                    </div>
                    <div className="col-span-3 text-center text-gray-600">
                      {item.quantityFulfilled} of {item.quantity}
                      {isFulfilled && (
                        <div className="text-xs text-green-600">Fulfilled</div>
                      )}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItemToPackage(item.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">
                        {packageItem?.quantity ?? 0}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!packageItem?.quantity}
                        onClick={() => removeItemFromPackage(item.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Notify customer</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifyCustomer"
                checked={form.watch("notifyCustomer")}
                onCheckedChange={(checked: boolean) => {
                  form.setValue("notifyCustomer", checked);
                }}
              />
              <label
                htmlFor="notifyCustomer"
                className="text-sm leading-none text-gray-600"
              >
                {form.watch("type") === FulfillmentType.EASYPOST &&
                  "Send shipment details to your customer now"}
                {form.watch("type") === FulfillmentType.PICKUP &&
                  "Notify customer that their order is ready for pickup"}
                {form.watch("type") === FulfillmentType.MANUAL &&
                  "Send fulfillment confirmation to your customer"}
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <LoadButton
              type="submit"
              isLoading={loading}
              disabled={loading || packages.every((pkg) => !pkg.items?.length)}
            >
              {loading
                ? "Processing..."
                : form.watch("type") === FulfillmentType.EASYPOST
                  ? allItemsFulfilled
                    ? "Create Additional Shipment"
                    : "Create Shipment"
                  : form.watch("type") === FulfillmentType.PICKUP
                    ? allItemsFulfilled
                      ? "Mark Additional Items for Pickup"
                      : "Mark for Pickup"
                    : allItemsFulfilled
                      ? "Mark Additional Items as Fulfilled"
                      : "Mark as Fulfilled"}
            </LoadButton>
          </div>
        </form>
      </Card>

      {initialFulfillment?.packages &&
        initialFulfillment.packages.length > 0 && (
          <Card className="space-y-6 px-6 py-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Existing Packages</h2>
            </div>

            <div className="space-y-4">
              {initialFulfillment.packages.map((pkg, index) => (
                <div key={pkg.id} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-medium">Package {index + 1}</h3>
                    <div className="text-sm text-gray-500">
                      Status: {pkg.status}
                    </div>
                  </div>

                  {pkg.carrier && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Carrier:</span>{" "}
                      {pkg.carrier}
                    </div>
                  )}

                  {pkg.trackingNumber && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Tracking:</span>{" "}
                      {pkg.trackingNumber}
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium">Items:</h4>
                    <div className="space-y-2">
                      {pkg.items.map((item) => {
                        const orderItem = orderItems.find(
                          (oi) => oi.id === item.orderItemId,
                        );
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{orderItem?.name}</span>
                            <span className="text-gray-600">
                              {item.quantity} of {orderItem?.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
    </div>
  );
};
