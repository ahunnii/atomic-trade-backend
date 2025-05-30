import {
  EmailBody,
  EmailCallToActionButton,
  EmailColumn,
  EmailCustomLogo,
  EmailImportantText,
  EmailSignature,
  EmailText,
} from "@atomic-trade/email";

type Props = {
  email: string;
  storeName: string;
  previewText?: string;
  checkoutUrl: string;
  isPreview?: boolean;
  logo: string;
};

export const CheckoutSessionEmail = (props: Props) => (
  <EmailBody
    previewText={
      props.previewText ?? `Complete your payment for ${props.storeName}`
    }
    isPreview={props.isPreview}
  >
    <EmailColumn pX={25}>
      <EmailCustomLogo logoUrl={props.logo} />
      <EmailText>Hello,</EmailText>

      <EmailText>
        {props.storeName} has created an order for you. To complete your
        purchase, please click the button below to proceed to checkout.
      </EmailText>

      <EmailImportantText>
        Your payment link will expire in 24 hours. Please click the button below
        to view your order total and complete payment.
      </EmailImportantText>
    </EmailColumn>

    <EmailColumn pX={25}>
      <EmailCallToActionButton
        link={props.isPreview ? "#!" : props.checkoutUrl}
        label="Complete Payment"
        style={{
          margin: "24px 0 24px",
        }}
      />

      <EmailText style={{ marginBottom: 4 }}>
        If you have any questions about your order, please reply to this email
        or contact {props.storeName} directly.
      </EmailText>
    </EmailColumn>
    <EmailSignature name={props.storeName} />
  </EmailBody>
);
