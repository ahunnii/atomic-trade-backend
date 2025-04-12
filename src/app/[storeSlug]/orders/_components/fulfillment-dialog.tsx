/* eslint-disable react-hooks/exhaustive-deps */
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AdvancedNumericInput } from "~/components/common/inputs/advanced-numeric-input";
import { SearchAndSelectById } from "~/components/common/inputs/search-and-select";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { useParams } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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

import { env } from "~/env.mjs";

import { DateFormField } from "~/components/common/inputs/date-form-field";
import { NumericFormField } from "~/components/common/inputs/numeric-form-field";
import { SelectFormField } from "~/components/common/inputs/select-form-field";
import { Badge } from "~/components/ui/badge";
import { toastService } from "~/lib/toast";
import { type Order } from "~/types/order";
import { LabelSize, Rate, type ShippingLabel } from "~/types/shipping";
import { api } from "~/utils/api";
import { cn } from "~/utils/styles";
import { AddressDialog } from "../shipping/address-dialog";
import { ConfirmRateDialog } from "../shipping/confirm-rate-dialog";
import { DownloadLabelDialog } from "../shipping/download-label-dialog";

export const customerAddressSchema = z.object({
  name: z.string().min(2),
  street: z.string().min(1, "Street is required"),
  additional: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip is required"),
  country: z.string().optional(),
});

const packageFormSchema = customerAddressSchema.extend({
  length: z.coerce.number().min(1),
  width: z.coerce.number().min(1),
  height: z.coerce.number().min(1),
  weight_lbs: z.coerce.number(),
  weight_oz: z.coerce.number(),

  rate_id: z.string().nullish(),
  shipment_id: z.string().nullish(),
  amount: z.number().nullish(),
  provider: z.string().nullish(),
  provider_image: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  attributes: z.array(z.string()).nullish(),
  estimated_days: z.number().nullish(),
  label_size: z.nativeEnum(LabelSize).optional().default(LabelSize["4x6"]),

  orderItems: z.array(
    z.object({
      id: z.string(),
    })
  ),

  shipDate: z.date({
    required_error: "A ship date is required.",
  }),
});

export type FulfillmentFormValues = z.infer<typeof packageFormSchema>;

type Props = {
  initialData: Order | null;
  children: React.ReactNode;
};

interface Address {
  street: string;
  additional?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface CustomerAddressState {
  name: string;
  address: Address;
}

export function FulfillmentDialog({ initialData, children }: Props) {
  const params = useParams();
  const apiContext = api.useContext();
  const storeId = params?.storeId as string;

  const [open, setOpen] = useState<boolean>(false);

  const [openLabelDialog, setOpenLabelDialog] = useState<boolean>(false);

  const [isAddressValid, setIsAddressValid] = useState<boolean>(false);

  const validateAddress = api.shipping.verifyAddress.useMutation({
    onSuccess: (data) => {
      console.log(data);
      setIsAddressValid(true);
    },
  });

  const [editOrderItems, setEditOrderItems] = useState<boolean>(false);

  const [label, setLabel] = useState<ShippingLabel | null>(null);
  const [fulfillment, setFulfillment] = useState<string | null>(null);
  const [availableRates, setAvailableRates] = useState<Rate[]>([]);

  const getUnfulfilledOrderItems = api.order.getUnfulfilledItems.useQuery(
    {
      orderId: initialData!.id,
    },
    {
      enabled: !!initialData?.id,
    }
  );

  const filteredProducts = useMemo(
    () =>
      getUnfulfilledOrderItems?.data?.map((product) => ({
        id: product.id,
        name: `${product.variant?.product?.name ?? product.requestItem?.name} ${
          product.description ?? product?.requestItem?.description ?? ""
        } ${
          product.variant?.values && product.variant?.values?.length > 0
            ? ` - ${product.variant?.values?.join(", ")}`
            : ` - ${"Default"}`
        } x ${product.quantity ?? 1}`,
        image: product.variant?.product?.featuredImage,
      })),
    [getUnfulfilledOrderItems?.data]
  );

  const initialFilteredProducts = useMemo(
    () =>
      initialData?.orderItems?.map((product) => ({
        id: product.id,
        name: `${product.variant?.product?.name} ${product.description ?? ""} ${
          product.variant?.values && product.variant?.values?.length > 0
            ? ` - ${product.variant?.values?.join(", ")}`
            : ` - ${"Default"}`
        } x ${product.quantity ?? 1}`,
        image: product.variant?.product?.featuredImage,
      })),
    [initialData?.orderItems]
  );

  const form = useForm<FulfillmentFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      length: 0,
      width: 0,
      height: 0,
      weight_lbs: 0,
      weight_oz: 0,

      name: initialData?.shippingAddress?.name ?? undefined,
      street: initialData?.shippingAddress?.street ?? undefined,
      additional: initialData?.shippingAddress?.additional ?? undefined,
      city: initialData?.shippingAddress?.city ?? undefined,
      state: initialData?.shippingAddress?.state ?? undefined,
      zip: initialData?.shippingAddress?.postal_code ?? undefined,
      country: initialData?.shippingAddress?.country ?? "US",

      orderItems: initialFilteredProducts ?? [],

      rate_id: undefined,
      shipment_id: undefined,
      amount: undefined,
      provider: undefined,
      provider_image: undefined,
      title: undefined,
      description: undefined,
      attributes: undefined,
      estimated_days: undefined,
      label_size: LabelSize["4x6"],
    },
  });

  const onSubmit = (data: FulfillmentFormValues) => {
    console.log(data);
  };

  const getStoreInfo = api.store.get.useQuery({ storeId }, { enabled: open });

  const getAvailableRates = api.shipping.getAvailableRates.useQuery(
    {
      customerAddress: {
        name: form.watch("name"),
        street: form.watch("street"),
        additional: form.watch("additional"),
        city: form.watch("city"),
        state: form.watch("state"),
        zip: form.watch("zip"),
        country: form.watch("country") ?? "US",
      },
      businessAddress: {
        name: getStoreInfo?.data?.name ?? env.NEXT_PUBLIC_STORE_NAME,
        street: getStoreInfo?.data?.address?.street ?? "",
        city: getStoreInfo?.data?.address?.city ?? "",
        state: getStoreInfo?.data?.address?.state ?? "",
        zip: getStoreInfo?.data?.address?.postal_code ?? "",
        country: getStoreInfo?.data?.address?.country ?? "",
        additional: getStoreInfo?.data?.address?.additional ?? undefined,
      },
      parcel: {
        package_length: form.watch("length"),
        package_width: form.watch("width"),
        package_height: form.watch("height"),
        package_weight_lbs: form.watch("weight_lbs"),
        package_weight_oz: form.watch("weight_oz"),

        distance_unit: "in",
        mass_unit: "lb",
      },
      shipmentId: form.watch("shipment_id") ?? "",
      orderId: initialData!.id,
    },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (initialData) {
      void getUnfulfilledOrderItems.refetch();
    }
  }, [initialData]);

  const createLabel = api.shipping.createLabel.useMutation({
    onSuccess: (data) => {
      setLabel(data?.shippingLabel);
      setFulfillment(data?.dbEntry?.id);
      setOpenLabelDialog(true);
      setOpen(false);
      toastService.success("Label created successfully");
    },
    onError: (err) => toastService.error("Failed to create label", err),
    onSettled: () => void apiContext.order.invalidate(),
  });

  const purchaseAndGenerateLabel = () => {
    createLabel.mutate({
      shipmentId: form.watch("shipment_id") ?? "",
      rateId: form.watch("rate_id") ?? "",
      labelSize: form.watch("label_size"),
      orderId: initialData!.id,
      cost: `${form.watch("amount")}`,
      carrier: form.watch("provider") ?? "",
      timeEstimate: form.watch("description") ?? "",
      items: form.watch("orderItems") ?? [],
      shipDate: form.watch("shipDate") ?? new Date(),
    });
  };

  const handleOnRateSelect = (e: string) => {
    const rate = availableRates.find((rate) => rate.id === e);

    if (rate) {
      form.setValue("rate_id", rate.id);
      form.setValue("shipment_id", rate.shipment_id);
      form.setValue("amount", rate.amount);
      form.setValue("provider", rate.provider);
      form.setValue("provider_image", rate.provider_image);
      form.setValue("title", rate.title);
      form.setValue("description", rate.description);
      form.setValue("attributes", rate.attributes);
      form.setValue("estimated_days", rate.estimated_days);
    }
  };

  const {
    length,
    width,
    height,
    weight_lbs,
    weight_oz,
    name,
    street,
    additional,
    city,
    state,
    zip,
    country,
  } = form.watch();

  useEffect(() => {
    void getAvailableRates.remove();
    setAvailableRates([]);

    form.setValue("rate_id", undefined);
    form.setValue("shipment_id", undefined);
    form.setValue("amount", undefined);
    form.setValue("provider", undefined);
    form.setValue("provider_image", undefined);
    form.setValue("title", undefined);
    form.setValue("description", undefined);
    form.setValue("attributes", undefined);
    form.setValue("estimated_days", undefined);
  }, [
    length,
    width,
    height,
    weight_lbs,
    weight_oz,
    name,
    street,
    additional,
    city,
    state,
    zip,
    country,
  ]);

  useEffect(() => {
    if (initialData && initialData.shippingAddress) {
      validateAddress.mutate({
        name: initialData.shippingAddress.name ?? "",
        street: initialData.shippingAddress.street ?? "",
        city: initialData.shippingAddress.city ?? "",
        state: initialData.shippingAddress.state ?? "",
        zip: initialData.shippingAddress.postal_code ?? "",
        country: initialData.shippingAddress.country ?? "US",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (getAvailableRates.data) {
      setAvailableRates(getAvailableRates.data);
    }
  }, [getAvailableRates.data]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div>{children}</div>
        </DialogTrigger>
        <DialogContent className="ignore-default sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Shipping Label</DialogTitle>
            <DialogDescription>
              Fill out the form to generate a shipping label for your package.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
              <div className="flex w-full gap-4">
                <div className="flex w-4/6 flex-col space-y-5 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DateFormField
                      form={form}
                      name="shipDate"
                      label="Ship Date"
                      description="When are you handing this package off to the
                      shipping carrier?"
                    />

                    <FormItem>
                      <FormLabel>Estimated Delivery Date</FormLabel>

                      <p>
                        {new Date(
                          (form.watch("shipDate") ?? new Date()).getTime() +
                            (form.watch("estimated_days") ?? 1) *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toDateString()}
                      </p>
                    </FormItem>
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    <div className="col-span-3 grid grid-cols-2  items-end gap-1">
                      <NumericFormField
                        form={form}
                        name="weight_lbs"
                        label="Weight"
                        min={0}
                        appendSpan="lb"
                        className="col-span-1"
                      />
                      <NumericFormField
                        form={form}
                        name="weight_oz"
                        min={0}
                        appendSpan="oz"
                        className="col-span-1"
                      />
                    </div>
                    <div className="col-span-4 grid grid-cols-3 gap-1">
                      <NumericFormField
                        form={form}
                        name="length"
                        min={0}
                        appendSpan="in"
                        label="Length"
                        className="col-span-1"
                      />

                      <NumericFormField
                        form={form}
                        name="width"
                        min={0}
                        appendSpan="in"
                        label="Width"
                        className="col-span-1"
                      />

                      <NumericFormField
                        form={form}
                        name="height"
                        min={0}
                        appendSpan="in"
                        label="Height"
                        className="col-span-1"
                      />
                    </div>
                  </div>

                  <div>
                    <FormItem className="flex w-full flex-col space-y-4">
                      <FormLabel>Rate Selection</FormLabel>
                      <Button
                        onClick={() => void getAvailableRates.refetch()}
                        type="button"
                        size="sm"
                        disabled={
                          getAvailableRates.isFetching ||
                          !length ||
                          !width ||
                          !height ||
                          !weight_oz ||
                          !name ||
                          !street ||
                          !city ||
                          !state ||
                          !zip ||
                          !country
                        }
                      >
                        {getAvailableRates.isFetching && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}{" "}
                        Fetch Shipping Rates
                      </Button>
                    </FormItem>

                    <SelectFormField
                      form={form}
                      disabled={getAvailableRates?.isLoading}
                      name="rate_id"
                      label="Rate Selection"
                      values={availableRates?.map((rate) => ({
                        value: rate.id,
                        label: (
                          <div className="flex items-center gap-4">
                            <Image
                              src={rate?.provider_image}
                              className={cn(
                                rate.provider === "USPS" ? "h-3" : "h-6"
                              )}
                              alt={rate.provider}
                              height={rate?.provider === "USPS" ? 56 : 24}
                              width={rate?.provider === "USPS" ? 24 : 24}
                            />
                            <div className="flex flex-col justify-start">
                              <span className="flex gap-2">
                                {rate.title} ${rate.amount}
                                {rate?.attributes?.map((attr, idx) => (
                                  <Badge key={idx} className="text-xs">
                                    {attr}
                                  </Badge>
                                ))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {rate.description}
                              </span>
                            </div>
                          </div>
                        ),
                      }))}
                      onValueChange={handleOnRateSelect}
                    />

                    {availableRates?.length > 0 && (
                      <>
                        <FormField
                          control={form.control}
                          name="rate_id"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Rate Selection</FormLabel>

                              <FormControl>
                                <>
                                  <Select
                                    value={field.value ?? undefined}
                                    disabled={getAvailableRates?.isLoading}
                                    onValueChange={handleOnRateSelect}
                                  >
                                    <SelectTrigger className="flex h-20 w-full text-left">
                                      <SelectValue placeholder="Select a shipping rate..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-96 ">
                                      <SelectGroup>
                                        {availableRates?.map((rate, idx) => (
                                          <SelectItem
                                            className="flex"
                                            value={rate?.id}
                                            key={idx}
                                          >
                                            <div className="flex items-center gap-4">
                                              <Image
                                                src={rate?.provider_image}
                                                className={cn(
                                                  rate.provider === "USPS"
                                                    ? "h-3"
                                                    : "h-6"
                                                )}
                                                alt={rate.provider}
                                                height={
                                                  rate?.provider === "USPS"
                                                    ? 56
                                                    : 24
                                                }
                                                width={
                                                  rate?.provider === "USPS"
                                                    ? 24
                                                    : 24
                                                }
                                              />
                                              <div className="flex flex-col justify-start">
                                                <span className="flex gap-2">
                                                  {rate.title} ${rate.amount}
                                                  {rate?.attributes?.map(
                                                    (attr, idx) => (
                                                      <Badge
                                                        key={idx}
                                                        className="text-xs"
                                                      >
                                                        {attr}
                                                      </Badge>
                                                    )
                                                  )}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                  {rate.description}
                                                </span>
                                              </div>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>

                                  <FormDescription>
                                    {form.watch("estimated_days")
                                      ? `Estimated to take ${form.watch(
                                          "estimated_days"
                                        )} day(s). Cost to be charged to shipping provider account: $${form.watch(
                                          "amount"
                                        )}`
                                      : "Select a rate to continue"}
                                  </FormDescription>
                                </>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />{" "}
                        <FormField
                          control={form.control}
                          name="label_size"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Label Size</FormLabel>

                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={(e) => {
                                    form.setValue("label_size", e as LabelSize);
                                  }}
                                >
                                  <SelectTrigger className="flex w-full text-left">
                                    <SelectValue placeholder="Select a label size..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {Object.keys(LabelSize).map(
                                        (size, idx) => (
                                          <SelectItem
                                            className="flex"
                                            value={
                                              LabelSize[
                                                size as keyof typeof LabelSize
                                              ]
                                            }
                                            key={idx}
                                          >
                                            {size}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>{" "}
                <div className=" flex w-2/6 flex-col items-end py-4">
                  <div className=" flex w-full items-center  justify-end gap-1">
                    <h4 className="text-sm">
                      Ship to:{" "}
                      <AddressDialog form={form} initialData={initialData} />
                    </h4>
                  </div>{" "}
                  <p>{form.watch("name")}</p>
                  <p>{form.watch("street")}</p>
                  <p>{form.watch("additional")}</p>
                  <p>
                    {form.watch("city")}, {form.watch("state")}{" "}
                    {form.watch("zip")}
                  </p>
                  <p className="text-green-500">
                    {isAddressValid && "Address is valid!"}
                  </p>
                  <p className="text-red-500">
                    {!isAddressValid && "Address is invalid!"}
                  </p>
                  <div className="flex flex-col pt-4">
                    <div className=" flex w-full items-center justify-end gap-1">
                      <h4 className="text-sm">Items in this order: </h4>
                      <Button
                        variant={"secondary"}
                        size={"sm"}
                        type="button"
                        onClick={() => setEditOrderItems(true)}
                      >
                        Edit
                      </Button>
                    </div>
                    {editOrderItems ? (
                      <FormField
                        control={form.control}
                        name="orderItems"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <SearchAndSelectById
                                data={filteredProducts ?? []}
                                field={field}
                                searchTerm="products"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : (
                      <>
                        {getUnfulfilledOrderItems?.data?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-1"
                          >
                            <Image
                              src={
                                item.variant?.product?.featuredImage ??
                                "/placeholder-image.webp"
                              }
                              alt={
                                item.variant?.product?.name ?? "Product Image"
                              }
                              width={35}
                              height={35}
                            />
                            <p className="text-xs">
                              {item.variant?.product?.name}
                              {item.requestItem?.name ?? ""}
                              {item.variant?.values &&
                              item.variant?.values?.length > 0
                                ? ` - ${item.variant?.values?.join(", ")}`
                                : ` - ${"Default"}`}{" "}
                              x {item.quantity ?? 1}
                            </p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center justify-end space-x-2 pt-6">
                <Button
                  variant={"outline"}
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>

                <ConfirmRateDialog
                  initialData={form.watch()}
                  storeAddress={{
                    name:
                      getStoreInfo?.data?.name ?? env.NEXT_PUBLIC_STORE_NAME,
                    street: getStoreInfo?.data?.address?.street ?? "",
                    city: getStoreInfo?.data?.address?.city ?? "",
                    state: getStoreInfo?.data?.address?.state ?? "",
                    zip: getStoreInfo?.data?.address?.postal_code ?? "",
                    country: getStoreInfo?.data?.address?.country ?? "",
                    additional:
                      getStoreInfo?.data?.address?.additional ?? undefined,
                  }}
                  orderId={initialData?.id ?? ""}
                  setLabel={setLabel}
                  setFulfillment={setFulfillment}
                  filteredItems={filteredProducts ?? []}
                >
                  <Button
                    onClick={purchaseAndGenerateLabel}
                    disabled={createLabel.isLoading}
                    type="button"
                    variant={"default"}
                  >
                    {createLabel.isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Purchase
                  </Button>
                </ConfirmRateDialog>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <>
        {label && fulfillment && (
          <DownloadLabelDialog
            open={openLabelDialog}
            setOpen={setOpenLabelDialog}
            initialData={label}
            fulfillmentId={fulfillment}
          />
        )}
      </>
    </>
  );
}
