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

type CustomerTrackOrderEmailProps = {
  trackingLink: string;
  orderLink: string;
  orderId: string;
};

// const baseUrl = env.NEXT_PUBLIC_URL ;
const baseUrl = "https://trendanomaly.com";

export const CustomerTrackOrderEmail = (
  props: CustomerTrackOrderEmailProps
) => (
  <Html>
    <Head />
    <Preview>A shipment from order {props.orderId} is on the way</Preview>

    <Tailwind>
      <Body className="w-full bg-white p-8">
        <CustomerTrackOrderEmailBody {...props} />
      </Body>
    </Tailwind>
  </Html>
);

export const CustomerTrackOrderEmailBody = (
  props: CustomerTrackOrderEmailProps
) => (
  <>
    <Section className="mt-8 border border-solid border-[#eaeaea]">
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
              Your order is on the way!
            </Heading>
          </Column>
        </Row>
        <Text className="text-left text-base">Order #{props.orderId}</Text>

        <Text className="text-left text-base">
          Your order is on the way. Track your shipment to see the delivery
          status.
        </Text>

        <Button
          className="w-full rounded bg-[#000000] !py-3 px-5 text-center text-[12px] font-semibold text-white no-underline"
          href={props.trackingLink}
        >
          Track your order
        </Button>
      </div>
    </Section>

    <Section className=" mt-4 border border-solid border-[#eaeaea] ">
      <div className="p-8">
        <p className="w-full text-[hsl(215.4,16.3%,46.9%)]">
          Questions? Contact us at inquiries@trendanomaly.com
        </p>
      </div>
    </Section>
  </>
);
