import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import { storeTheme } from "~/data/config.custom";
import { emailConfig } from "../../email.config";

type CustomOrderNotifyCustomerEmailProps = {
  name: string;
  depositLink?: string | null;
  normalLink: string;
  depositDueDate?: Date | null;
  normalDueDate?: Date | null;
  additionalInfo?: string;
};

const baseUrl = "https://trendanomaly.com";

const config = storeTheme;
export const CustomerRequestPayNowEmail = (
  props: CustomOrderNotifyCustomerEmailProps
) => (
  <Html>
    <Head />
    <Preview>Your order request was accepted! Next steps...</Preview>
    <Tailwind>
      <Body className="p-8">
        <CustomerRequestPayNowEmailBody {...props} />
      </Body>
    </Tailwind>
  </Html>
);

export const CustomerRequestPayNowEmailBody = (
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
      Your order request was accepted! Next steps...
      </Heading>

      {props?.depositLink && (
        <Text style={paragraph}>
          Hey {props.name}, we have approved your order request. Below are two
          payment links: one for the deposit, and one for the remainder
        </Text>
      )}
      {!props?.depositLink && (
        <Text style={paragraph}>
          Hey {props.name}, we have approved your order request. Below is the
          link to purchase your order.
        </Text>
      )}

      {props.depositDueDate && (
        <Text style={paragraph}>
          You have until {props.depositDueDate.toDateString()} to pay the
          deposit.
        </Text>
      )}

      {props.normalDueDate && (
        <Text style={paragraph}>
          You have until {props.normalDueDate.toDateString()} to complete the
          payment. Failure to do so may result in your order getting canceled.
        </Text>
      )}

      {props?.additionalInfo && (
        <Text style={paragraph}>{props.additionalInfo}</Text>
      )}

      <Text style={paragraph}>
        If you have any questions, please contact us at{" "}
        <Link href={`mailto:${emailConfig.requestEmail}`}>
          {emailConfig.requestEmail}
        </Link>
        .
      </Text>

      {props?.depositLink && (
        <>
          <Button style={button} href={props?.depositLink}>
            Pay Deposit
          </Button>

          <Button style={button} href={props?.normalLink}>
            Pay Remainder
          </Button>
        </>
      )}

      {!props?.depositLink && (
        <Button style={button} href={props?.normalLink}>
          Pay Now
        </Button>
      )}
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
