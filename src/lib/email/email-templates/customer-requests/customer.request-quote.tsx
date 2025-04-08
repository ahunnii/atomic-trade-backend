import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";
import { SingleColumn } from "responsive-react-email";
import { storeTheme } from "~/data/config.custom";
import { env } from "~/env";
import { emailConfig } from "../../email.config";

type CustomOrderNotifyCustomerEmailProps = {
  name: string;
  requestId: string;
  details: string;
  additionalInfo?: string;
  price: string;
};

const baseUrl = env.NEXT_PUBLIC_URL;

const config = storeTheme;
export const CustomerRequestQuoteEmail = (
  props: CustomOrderNotifyCustomerEmailProps,
) => (
  <Html>
    <Head />
    <Preview>
      Hey, I have a quote for your order request #{props.requestId}
    </Preview>

    <Body style={main}>
      <CustomerRequestQuoteEmailBody {...props} />
    </Body>
  </Html>
);

export const CustomerRequestQuoteEmailBody = (
  props: CustomOrderNotifyCustomerEmailProps,
) => (
  <>
    <Container style={container}>
      <SingleColumn pX={25}>
        <Img src={config.brand.hostedLogo} width="64" height="64" alt="Logo" />
        <Text>Hey {props.name.split(" ")[0]},</Text>

        {props?.details && (
          <>
            <Text>So I have your request as:</Text>
            <Text style={{ fontStyle: "italic" }}>
              &quot;{props.details}&quot;
            </Text>
          </>
        )}

        <Text>
          I looked it over and I&#39;ve got a quote for you. I can do it for{" "}
          <span style={{ fontWeight: 800 }}> {props.price}</span>.
        </Text>

        {props?.additionalInfo && <Text>{props.additionalInfo}</Text>}

        <Text>
          If you are fine with this quote, or if you have any questions, please
          let me know at{" "}
          <Link href={`mailto:${emailConfig.requestEmail}`}>
            {emailConfig.requestEmail}
          </Link>
          . Make sure to include your name and order number in the email so I
          know which request to move forward with.
        </Text>
      </SingleColumn>

      <SingleColumn pX={25}>
        <Text style={{ marginBottom: 4 }}>
          Also, make sure to check out the store from time to time for new
          products and styles!
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
        <Text style={{ width: 260, marginBottom: 70 }}>
          Judy Sledge Designs - one of a kind pieces, waiting for you.
        </Text>
      </SingleColumn>
    </Container>
  </>
);

const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  background: "#fff",
};

const container = {
  margin: "0 auto",
  paddingTop: 42,
};
