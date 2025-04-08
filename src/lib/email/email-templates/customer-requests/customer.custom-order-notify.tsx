import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";
import { SingleColumn } from "responsive-react-email";
import { storeTheme } from "~/data/config.custom";

type CustomOrderNotifyCustomerEmailProps = {
  firstName: string;
};

const baseUrl = "https://trendanomaly.com";

const config = storeTheme;
export const CustomerRequestAcknowledgeEmail = (
  props: CustomOrderNotifyCustomerEmailProps
) => (
  <Html>
    <Head />
    <Preview>
      Thank you for reaching out! I&apos;ve received your request and will be in
      touch with you as soon as possible.
    </Preview>

    <Body style={main}>
      <CustomerRequestAcknowledgeEmailBody firstName={props.firstName} />
    </Body>
  </Html>
);

export const CustomerRequestAcknowledgeEmailBody = (
  props: CustomOrderNotifyCustomerEmailProps
) => (
  <Container style={container}>
    <SingleColumn pX={25}>
      <Img src={config.brand.hostedLogo} width="64" height="64" alt="Logo" />
      <Text>Hi {props.firstName},</Text>
      <Text>
        I have received your request and I will be in touch with you as soon as
        possible. Typically I respond within 24-48 hours, but I can take longer
        depending on the week.
      </Text>
    </SingleColumn>

    <SingleColumn pX={25}>
      <Text style={{ marginBottom: 4 }}>
        In the meantime, check out all the products available on my store.
      </Text>

      <Button
        href={`${baseUrl}/collections/all-products`}
        style={{
          background: "#4898C9",
          color: "white",
          borderRadius: 4.5,
          margin: "48px 0 8px",
          padding: "13.5px 8px",
        }}
      >
        Visit store &nbsp; &rarr;
      </Button>
      <Text>
        Warm regards, <br />
        Judy
      </Text>
      <Img
        src={config.brand.hostedLogo}
        width="32"
        height="32"
        alt="Logo"
        style={{ marginTop: 48 }}
      />
      <Text style={{ width: 160, marginBottom: 70 }}>
        Judy Sledge Designs - one of a kind pieces, waiting for you.
      </Text>
    </SingleColumn>
  </Container>
);

const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  background: "#fff",
};

const container = {
  margin: "0 auto",
  paddingTop: 42,
};
