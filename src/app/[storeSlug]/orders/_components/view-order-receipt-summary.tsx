import { BadgeDollarSign, Eye, FileText, Shirt, Tag, Tags } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Currency from "~/components/common/currency";

import { Button, buttonVariants } from "~/components/ui/button";

import { Separator } from "~/components/ui/separator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import PriceBadge from "~/components/common/price-badge";
import { getSales } from "~/lib/promotions/util/calculate-sale";
import type { OrderItem } from "~/types/order";
import { type Sale } from "~/types/sale";
import { cn } from "~/utils/styles";

type ViewOrderSummaryProps = {
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  fee: number;
  discount: number;
  receiptLink: string;
  request: {
    id: string;
  } | null;
  coupon: {
    code: string;
  } | null;
  storeId: string;
};

export const ViewOrderReceiptSummary = ({
  orderItems,
  subtotal,
  shipping,
  tax,
  receiptLink,
  discount,
  request,
  coupon,
  storeId,
  total,
}: ViewOrderSummaryProps) => {
  const handleViewReceipt = () => {
    window.open(receiptLink, "_blank");
  };

  const saleDiscount = orderItems.reduce((acc, item) => {
    const bestSale = getSales(
      item?.variant?.price ?? item?.price ?? 0,
      item?.requestItem?.id ? [] : ([item.sale] as unknown as Sale[])
    );
    return acc + (bestSale?.discountAmount ?? 0) * item.quantity;
  }, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Receipt
          </CardTitle>
          <CardDescription>View and manage items in this order</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {receiptLink && (
            <Button
              onClick={handleViewReceipt}
              className=" flex gap-2"
              variant={"outline"}
              size={"sm"}
            >
              <Eye /> View Payment Receipt
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 text-sm">
        <div className="flex flex-col space-y-4">
          {orderItems.map((item) => {
            const bestSale = getSales(
              item?.variant?.price ?? item?.price ?? 0,
              item?.requestItem?.id ? [] : ([item?.sale] as unknown as Sale[])
            );

            if (item.requestItem?.id) {
              return (
                <RequestOrderItem
                  orderItem={item}
                  requestId={request?.id}
                  storeId={storeId}
                  key={item.id}
                />
              );
            }

            return (
              <ProductOrderItemAlt
                orderItem={item}
                storeId={storeId}
                key={item.id}
              />
            );
          })}
        </div>
        <Separator className="my-2" />
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between ">
            Subtotal:{" "}
            <Currency
              value={subtotal ?? 0}
              className="font-medium text-muted-foreground"
            />
          </div>
          <div className="flex items-center justify-between">
            Shipping:
            <Currency
              value={shipping ?? 0}
              className="font-medium text-muted-foreground"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              Coupon Discounts:
              {coupon?.code && (
                <>
                  <Tag className="h-4 w-4" />
                  {coupon?.code}
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">-</span>
              <Currency
                value={saleDiscount + (discount ?? 0)}
                className="font-medium text-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            Tax:
            <Currency
              value={tax ?? 0}
              className="font-medium text-muted-foreground"
            />
          </div>{" "}
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            Total: <Currency value={total ?? 0} className="text-2xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductOrderItem = (props: {
  requestId?: string;
  storeId: string;

  bestSale: {
    originalTotal: number;
    discountAmount: number;
    discountTotal: number;
    sale: Sale;
  } | null;
  orderItem: OrderItem;
}) => (
  <div className="flex  items-center space-x-4 text-sm">
    <div className="relative flex h-20 w-20 rounded-md  shadow">
      <Image
        className="rounded-md object-cover"
        src={
          props?.orderItem?.variant?.product?.featuredImage ??
          "/placeholder-image.webp"
        }
        fill={true}
        alt=""
      />
    </div>
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <p>
          {props?.orderItem?.variant?.product?.name ?? "Unknown Item"}
          {props?.orderItem?.variant?.product?.id ? (
            <Link
              href={`/admin/${props.storeId}/products/${props?.orderItem?.variant.product.id}/edit`}
            >
              (
              <Button variant={"link"} className="mx-0 px-0 text-purple-500">
                View Product
              </Button>
              )
            </Link>
          ) : (
            ""
          )}
          <strong> x {props?.orderItem?.quantity}</strong>
        </p>{" "}
        {(!!props?.orderItem?.variant?.price || !!props?.orderItem?.price) && (
          <>
            :{" "}
            <PriceBadge
              variant="minimal"
              price={
                props?.orderItem?.variant?.price ?? props?.orderItem?.price ?? 0
              }
              salesPrice={props?.bestSale?.discountTotal ?? null}
            />
          </>
        )}
      </div>
      <p className="flex items-center gap-1 text-xs">
        {props?.orderItem?.variant ? (
          <>
            {" "}
            <Shirt className="h-3 w-3" />
            `($
            {props?.orderItem?.variant.values?.length > 0
              ? props?.orderItem?.variant.values.join(", ")
              : "Default"}
            )`
          </>
        ) : (
          ""
        )}
      </p>
      {props?.orderItem?.sale && (
        <Link
          href={`/admin/${props?.orderItem?.sale?.storeId}/sales/${props?.orderItem?.sale?.id}/edit`}
          className="flex items-center text-purple-500 hover:underline"
          target="_blank"
        >
          <BadgeDollarSign className="mr-2 size-3" />
          SALE: {props?.orderItem?.sale?.name}
        </Link>
      )}
    </div>{" "}
  </div>
);

const ProductOrderItemAlt = (props: {
  requestId?: string;
  storeId: string;
  orderItem: OrderItem;
}) => (
  <div className="flex  items-start space-x-4 text-sm">
    <div>
      <div className="relative flex h-20 w-20 rounded-md  shadow">
        <Image
          className="rounded-md object-cover"
          src={
            props?.orderItem?.variant?.product?.featuredImage ??
            "/placeholder-image.webp"
          }
          fill={true}
          alt=""
        />
      </div>
      <div className="flex items-center gap-1">
        {!!props?.orderItem?.variant?.product?.id ? (
          <Link
            href={`/admin/${props.storeId}/products/${props?.orderItem?.variant.product.id}/edit`}
            className={cn(
              buttonVariants({ variant: "link" }),
              "mx-0 px-0 text-xs text-purple-500"
            )}
            target="_blank"
          >
            Product
          </Link>
        ) : (
          "N/A"
        )}{" "}
        |{" "}
        {!!props?.orderItem?.sale ? (
          <Link
            href={`/admin/${props?.orderItem?.sale?.storeId}/sales/${props?.orderItem?.sale?.id}/edit`}
            className={cn(
              buttonVariants({ variant: "link" }),
              "mx-0 px-0 text-xs text-purple-500"
            )}
            target="_blank"
          >
            Sale
          </Link>
        ) : (
          "N/A"
        )}
      </div>
    </div>
    <div className="flex w-full flex-col space-y-2">
      <div className="flex w-full justify-between gap-2">
        <p className="place-self-end justify-self-end">
          {props?.orderItem?.name ?? "Unknown Item"}

          <strong> x {props?.orderItem?.quantity}</strong>
        </p>

        <PriceBadge
          variant="stacked"
          price={props?.orderItem?.totalPrice ?? 0}
          salesPrice={props?.orderItem?.itemTotal ?? null}
        />
      </div>
      <p className="flex items-center gap-2 text-xs">
        <Tags className="h-4 w-4" /> {props?.orderItem?.discountName} Sale (-
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format((props?.orderItem?.discountAmount ?? 0) / 100)}
        )
      </p>

      <p className="flex items-center gap-2 text-xs">
        <>
          <Shirt className="h-3 w-3" />
          {props?.orderItem?.description ?? "No Description"}
        </>
      </p>
    </div>{" "}
  </div>
);

const RequestOrderItem = (props: {
  requestId?: string;
  storeId: string;
  orderItem: OrderItem;
}) => (
  <div className="flex  items-center space-x-4 text-sm">
    <div className="relative flex h-10 w-10 rounded-md  shadow">
      <Image
        className="rounded-md object-cover"
        src={"/placeholder-image.webp"}
        fill={true}
        alt=""
      />
    </div>
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <p>
          {props?.orderItem?.requestItem?.name ?? "Item Request"}
          {props?.requestId ? (
            <Link
              href={`/admin/${props?.storeId}/custom-orders/${props?.requestId}/edit`}
            >
              (
              <Button variant={"link"} className="mx-0 px-0 text-purple-500">
                View Request
              </Button>
              )
            </Link>
          ) : (
            ""
          )}
          <strong> x {props?.orderItem?.quantity}</strong> :{" "}
        </p>{" "}
        <PriceBadge
          variant="minimal"
          price={props?.orderItem?.requestItem?.unitPrice ?? 0}
          salesPrice={null}
        />
      </div>
      <p className="flex items-center gap-1 text-xs">
        <FileText className="h-3 w-3" />

        {props?.orderItem?.requestItem?.description}
      </p>
    </div>
  </div>
);
