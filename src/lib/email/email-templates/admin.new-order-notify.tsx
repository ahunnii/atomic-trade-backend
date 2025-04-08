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

type Props = {
  link: string;
};

// const baseUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "";
const baseUrl = "https://trendanomaly.com";

export const AdminNewOrderEmail = (props: Props) => {
  const previewText = `You made a new sale!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#ffffff] p-8">
          <AdminNewOrderEmailBody {...props} />
        </Body>
      </Tailwind>
    </Html>
  );
};
export const AdminNewOrderEmailBody = (props: Props) => {
  return (
    <Container className="mt-8 border border-solid border-[#eaeaea] p-8">
      <Img
        src={`${baseUrl}/custom/logo.png`}
        width="80"
        height="80"
        alt=" Logo"
        className="mx-auto mt-8"
      />
      <div className="p-8">
        <Heading className="text-center text-2xl">New Order</Heading>

        <Text style={paragraph}>
          It looks like you made a sale! Check out the new order!
        </Text>

        <Button style={button} href={props.link}>
          View Order
        </Button>
      </div>
    </Container>
  );
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  paddingLeft: "8px",
  paddingRight: "8px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "18px",
  paddingTop: "19px",
  paddingBottom: "19px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
};
