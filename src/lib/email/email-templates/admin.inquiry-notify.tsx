import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  userName: string;
  userEmail: string;
  question: string;
};

// const baseUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "";
const baseUrl = "https://trendanomaly.com";

export const AdminInquiryEmail = (props: Props) => {
  const previewText = `You have a new comment / question from ${props.userName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white p-8">
          <AdminInquiryEmailBody {...props} />
        </Body>
      </Tailwind>
    </Html>
  );
};

export const AdminInquiryEmailBody = (props: Props) => {
  return (
    <Container className="mt-8 border border-solid border-[#eaeaea] p-8">
      <Section className="p-8">
        <Img
          src={`${baseUrl}/custom/logo.png`}
          width="80"
          height="80"
          alt=" Logo"
          className="mx-auto mt-8"
        />

        <Row>
          <Text className="mb-0 text-center text-2xl">
            You have a new shop inquiry from:
          </Text>
          <Text className="mt-0 text-center text-lg">{props.userName}</Text>
          <div className="px-8">
            <Section style={review} className="my-5">
              <Text style={paragraph} className="px-8">
                {props.question}
              </Text>
            </Section>
            <Button style={button} href={`mailto:${props.userEmail}`}>
              Respond to {props.userName}
            </Button>
          </div>
        </Row>
      </Section>
    </Container>
  );
};
const paragraph = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#484848",
  textAlign: "left" as const,
};

const review = {
  backgroundColor: "#f2f3f3",
  borderRadius: "4px",
  padding: "20px",
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
  marginBottom: "32px",
};
