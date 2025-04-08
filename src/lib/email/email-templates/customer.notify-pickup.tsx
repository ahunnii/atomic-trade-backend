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

import * as React from "react";
import { env } from "~/env";

type CustomerTrackOrderEmailProps = {
  orderLink: string;
  pickupInstructions?: string;
  orderId: string;
  address: {
    name: string;
    additional?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
};

// const baseUrl = env.NEXT_PUBLIC_URL ;
const baseUrl = "https://trendanomaly.com";

export const CustomerNotifyPickupEmail = (
  props: CustomerTrackOrderEmailProps,
) => (
  <Html>
    <Head />
    <Preview>
      An order from {env.NEXT_PUBLIC_STORE_NAME} is ready for pickup
    </Preview>

    <Tailwind>
      <Body className="w-full bg-white p-8">
        <CustomerNotifyPickupEmailBody {...props} />
      </Body>
    </Tailwind>
  </Html>
);

export const CustomerNotifyPickupEmailBody = (
  props: CustomerTrackOrderEmailProps,
) => (
  <>
    <Section className="mt-8 border border-solid border-[#eaeaea]">
      <Img
        src={`${baseUrl}/custom/logo.png`}
        width="80"
        height="80"
        alt=" Logo"
        className="mt-8 ml-8"
      />
      <div className="p-8">
        <Row>
          <Column>
            <Heading className="text-left text-2xl font-medium">
              Your order, #{props.orderId} is ready for pickup!
            </Heading>
          </Column>
        </Row>
        <Text className="text-left text-base">Order #{props.orderId}</Text>

        <Text className="text-left text-base">
          Your order is ready for pickup! {props?.pickupInstructions}
        </Text>

        <Text className="text-left text-base">
          Pickup instructions are as follows:
        </Text>
        <Text className="text-left text-base">
          {props?.pickupInstructions ??
            "Head to the shop. Once there, say you are there for a pickup order. You will be asked for your name and order number. Check our store hours to make sure we are open."}
        </Text>

        {/* Add address */}
        <Text className="py-5 text-left text-base">
          {props?.address?.street}, {props?.address?.city},{" "}
          {props?.address?.state} {props?.address?.zip},{" "}
          {props?.address?.country}
        </Text>
        <Button
          className="w-full rounded bg-[#000000] px-5 !py-3 text-center text-[12px] font-semibold text-white no-underline"
          href={props.orderLink}
        >
          View your receipt
        </Button>
      </div>
    </Section>

    <Section className="mt-4 border border-solid border-[#eaeaea]">
      <div className="p-8">
        <p className="w-full text-[hsl(215.4,16.3%,46.9%)]">
          Questions? Contact us at inquiries@trendanomaly.com
        </p>
      </div>
    </Section>
  </>
);
