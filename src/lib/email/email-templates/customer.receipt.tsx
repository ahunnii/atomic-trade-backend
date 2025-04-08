import {
  Body,
  Button,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Tag } from "lucide-react";

import * as React from "react";

export type CustomerReceiptEmailData = {
  name: string;
  email: string;
  orderId: string;
  orderItems: {
    id: string;
    price: number | null;
    quantity: number;
    customOrder: {
      id: string;
      productTitle: string;
    } | null;

    variant: {
      id: string;
      name: string;
      values: string[];
      product: {
        id: string;
        name: string;
        featuredImage: string | null;
      } | null;
    } | null;
    sale: {
      name: string | null;
    } | null;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  purchaseDate: string;
  notes: string;
  storeName: string;
};

// const baseUrl = env.NEXT_PUBLIC_URL ;
const baseUrl = "https://trendanomaly.com";

export const CustomerReceiptEmail = (props: CustomerReceiptEmailData) => (
  <Html>
    <Head />
    <Preview>
      Order Receipt #{props.orderId} from {props.storeName}
    </Preview>

    <Tailwind>
      <Body className="bg-white p-8">
        <CustomerReceiptEmailBody {...props} />
      </Body>
    </Tailwind>
  </Html>
);

export const CustomerReceiptEmailBody = (props: CustomerReceiptEmailData) => (
  <>
    <Section className="mt-8 max-w-5xl border border-solid border-[#eaeaea] p-8">
      <Img
        src={`${baseUrl}/custom/logo.png`}
        width="80"
        height="80"
        alt=" Logo"
        className="ml-8 mt-8"
      />
      <div className="p-8">
        <Row>
          <Column>
            <Heading className="text-left text-2xl font-medium ">
              Thank you for your purchase!!
            </Heading>
          </Column>
          <Column>
            <Text className="float-right">Order #{props.orderId}</Text>
          </Column>
        </Row>

        <Text className="text-left text-base">
          We are currently processing your order. You will receive an email with
          tracking information once your order has shipped.
        </Text>

        <Button
          className="w-full rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
          // href={trackingLink}
        >
          View order details
        </Button>

        <Button
          className="w-full rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
          // href={trackingLink}
        >
          Visit our store
        </Button>
      </div>
    </Section>

    {props.orderItems?.map((item) => (
      <Section
        className="max-w-5xl border border-solid border-[#eaeaea] px-8"
        key={item.id}
      >
        <Row>
          <Column className="h-[45px] w-[45px] rounded-md border border-solid border-[#eaeaea]">
            <Img
              src={`${
                item?.variant?.product?.featuredImage ??
                `${baseUrl}/placeholder-image.webp`
              }`}
              width="40"
              height="40"
              alt={item?.variant?.product?.name}
              className="mx-auto my-auto"
            />
          </Column>
          <Column>
            <Heading className="text-left text-2xl font-medium ">
              {item?.variant?.product?.name}
            </Heading>
            <Text>
              {item?.sale?.name && (
                <>
                  <Tag /> {item?.sale?.name}
                </>
              )}
            </Text>
          </Column>
          <Column>
            <Text className="float-right">{item?.price}</Text>
          </Column>
        </Row>

        <div className="border-t-solid border-t border-[#eaeaea] p-8">
          <Row>
            <Column>
              <Text>Subtotal:</Text>
            </Column>
            <Column>
              <Text className="float-right">
                $ {(props.subtotal / 100).toFixed(2)}
              </Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text>Shipping:</Text>
            </Column>
            <Column>
              <Text className="float-right">
                {" "}
                {props.shipping
                  ? `$ ${(props.shipping / 100).toFixed(2)}`
                  : "Free"}
              </Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text>Taxes:</Text>
            </Column>
            <Column>
              <Text className="float-right">
                {props.tax ? `$ ${(props.tax / 100).toFixed(2)}` : "N/A"}
              </Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text>Total:</Text>
            </Column>
            <Column>
              <Text className="float-right">
                {" "}
                $ {(props.total / 100).toFixed(2)}
              </Text>
            </Column>
          </Row>
        </div>
      </Section>
    ))}
  </>
);
