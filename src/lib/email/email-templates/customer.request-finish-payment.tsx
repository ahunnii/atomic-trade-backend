import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import { storeTheme } from "~/data/config.custom";

type CustomOrderNotifyCustomerEmailProps = {
  firstName: string;
  paymentLink: string;
};

const baseUrl = "https://trendanomaly.com";

const config = storeTheme;
export const CustomerRequestFinishPaymentEmail = (
  props: CustomOrderNotifyCustomerEmailProps
) => (
  <Html>
    <Head />
    <Preview>Thanks for your request! </Preview>
    <Tailwind>
      <Body className="p-8">
        <CustomerRequestFinishPaymentEmailBody
          firstName={props.firstName}
          paymentLink={props.paymentLink}
        />
      </Body>
    </Tailwind>
  </Html>
);

export const CustomerRequestFinishPaymentEmailBody = (
  props: CustomOrderNotifyCustomerEmailProps
) => (
  <Container className="border border-solid border-[#eaeaea] p-8">
    <Img
      src={`${baseUrl}${config.logo.default}`}
      width="80"
      height="80"
      alt="logo"
      className="mx-auto mt-8 pt-8"
      style={logo}
    />
    <div className="p-8">
      <Heading className="text-center text-2xl">
        We have received your deposit!
      </Heading>

      <Text style={paragraph}>
        We have received your deposit {props.firstName}. Below is the link to
        pay for the remainder of the order. You have 7 days to complete the
        payment. If you do not complete the payment within 7 days, the order
        will be cancelled.
      </Text>

      <Button style={button} href={props.paymentLink}>
        Pay Now
      </Button>
    </div>
  </Container>
);

const logo = {
  margin: "0 auto",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  paddingLeft: "8px",
  paddingRight: "8px",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  width: "100%",
};
