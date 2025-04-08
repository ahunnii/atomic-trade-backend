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

type NewCustomOrderEmailProps = {
  firstName: string;
  orderLink: string;
};

const baseUrl = "https://trendanomaly.com";

const config = storeTheme;

export const AdminCustomRequestNotificationEmail = (
  props: NewCustomOrderEmailProps
) => (
  <Html>
    <Head />
    <Preview>
      You have a new custom order request from {props.firstName}
    </Preview>
    <Tailwind>
      <Body className="p-8">
        <AdminCustomRequestNotificationEmailBody
          firstName={props.firstName}
          orderLink={props.orderLink}
        />{" "}
      </Body>
    </Tailwind>
  </Html>
);

export const AdminCustomRequestNotificationEmailBody = (
  props: NewCustomOrderEmailProps
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
        New Custom Order Request
      </Heading>

      <Text style={paragraph}>
        It looks like you got a new custom order request from {props.firstName}.
        Check it out!
      </Text>

      <Button style={button} href={props.orderLink}>
        View Order Request
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
