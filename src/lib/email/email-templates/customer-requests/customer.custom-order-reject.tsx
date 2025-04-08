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

const baseUrl = "https://trendanomaly.com";

const config = storeTheme;
export const CustomerCustomRejectEmail = () => (
  <Html>
    <Head />
    <Preview>Regarding your order request</Preview>
    <Tailwind>
      <Body className="p-8">
        <CustomerCustomRejectEmailBody />
      </Body>
    </Tailwind>
  </Html>
);

export const CustomerCustomRejectEmailBody = () => (
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
      <Heading className="text-center text-2xl">Regarding your order request</Heading>

      <Text style={paragraph}>
        After reviewing the details of your custom order request, we regret to
        inform you that we are unable to fulfill your request at this time. We
        apologize for any inconvenience this may have caused. Please feel free
        to check out our store for other products that may interest you.
      </Text>

      <Button style={button} href={`${baseUrl}/collections/all-products`}>
        Check out the store
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
