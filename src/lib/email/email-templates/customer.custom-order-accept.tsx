import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Tailwind,
  Text,
} from "@react-email/components";

import * as React from "react";

interface CustomOrderAcceptEmailProps {
  name: string;
  customerName: string;
  email: string;
  productLink: string;
  invoiceId: string;
  product: string;
  price: string;
  total: string;
  dueDate: string;
  notes: string;
  lineItems: {
    description: string;
    quantity: number;
    totalPrice: number;
  }[];
}

// const baseUrl = env.NEXT_PUBLIC_URL ;
const baseUrl = "https://trendanomaly.com";

export const CustomOrderAcceptEmail = (props: CustomOrderAcceptEmailProps) => (
  <Html>
    <Head />
    <Preview>New invoice from {props.name}</Preview>

    <Tailwind>
      <Body className="bg-white p-8">
        <CustomOrderAcceptEmailBody {...props} />
      </Body>
    </Tailwind>
  </Html>
);

export const CustomOrderAcceptEmailBody = (
  props: CustomOrderAcceptEmailProps
) => (
  <>
    <Container className="border border-solid border-[#eaeaea] p-8 ">
      <Img
        src={`${baseUrl}/custom/logo.png`}
        width="80"
        height="80"
        alt=" Logo"
        className="ml-8 mt-8"
      />
      <div className="p-8">
        <Heading className="text-left text-lg font-medium text-[#666666]">
          Invoice from {props.name}
        </Heading>
        <Text className="text-left text-4xl font-semibold">{props.total}</Text>
        <Text className="text-left text-lg font-medium text-[#666666]">
          Due {new Date().toDateString()}
        </Text>
        <hr className="my-4 border-slate-200 px-4" />{" "}
        <div className="pb-4">
          <p className="my-2 text-left text-lg font-medium text-[hsl(215.4,16.3%,46.9%)]">
            To: {props.customerName}
          </p>
          <p className="my-2 text-left text-lg font-medium text-[hsl(215.4,16.3%,46.9%)]">
            From: <span>{props.name}</span>
          </p>
          {/* Notes */}

          {props.notes && props.notes !== "" && (
            <p className="my-2 text-left text-lg font-medium text-[hsl(215.4,16.3%,46.9%)]">
              Notes: {props.notes}
            </p>
          )}
        </div>
        <Button
          className="w-full rounded bg-[#000000] !py-3 px-5 text-center text-[12px] font-semibold text-white no-underline"
          href={props.productLink}
        >
          Pay invoice now
        </Button>
      </div>
    </Container>
    <Container className=" mt-4 border border-solid border-[#eaeaea] ">
      <div className="p-8">
        <Text className="text-left font-medium text-[hsl(215.4,16.3%,46.9%)]">
          Invoice #{props.invoiceId}
        </Text>
        <Row className="w-full">
          <Column>
            <p className="text-left font-semibold">{props.product}</p>
            <p className="text-left text-[hsl(215.4,16.3%,46.9%)]">Qty: 1</p>
          </Column>
          <Column>
            <Text className="float-right my-auto text-left text-xl font-bold">
              {props.price}
            </Text>
          </Column>
        </Row>
        {props.lineItems.map((item, index) => (
          <Row className="w-full" key={index}>
            <Column>
              <p className="text-left font-semibold">{item.description}</p>
              <p className="text-left text-[hsl(215.4,16.3%,46.9%)]">
                Qty: {item.quantity}
              </p>
            </Column>
            <Column>
              <Text className="float-right my-auto text-left text-xl font-bold">
                {item.totalPrice}
              </Text>
            </Column>
          </Row>
        ))}
        <hr className="border-[rgb(26 232 240)] my-4 px-4" />
        <Row className="w-full">
          <Column>
            <Text className="text-left font-semibold">Subtotal Due</Text>
          </Column>
          <Column>
            <Text className="float-right text-left text-xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(
                Number(
                  props.lineItems.reduce(
                    (acc, item) => acc + item.totalPrice,
                    0
                  )
                ) / 100
              )}
            </Text>{" "}
          </Column>
        </Row>
        <hr className="border-[rgb(26 232 240)]px-4 my-4" />{" "}
        <p className="w-full text-[hsl(215.4,16.3%,46.9%)]">
          Questions? Contact us at inquiries@trendanomaly.com
        </p>
      </div>
    </Container>
  </>
);
