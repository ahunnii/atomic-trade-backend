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
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  isPreview?: boolean;
  logo: string;
};

export const OrderFulfilledEmail = (props: Props) => (
  <EmailBody
    previewText={
      props.previewText ??
      `Your order from ${props.storeName} has been fulfilled!`
    }
    isPreview={props.isPreview}
  >
    <EmailColumn pX={25}>
      <EmailCustomLogo logoUrl={props.logo} />
      <EmailText>Hi there,</EmailText>

      <EmailText>
        Great news! Your order from {props.storeName} has been fulfilled and is
        ready for pickup or has been delivered.
      </EmailText>

      {props.trackingNumber && (
        <>
          <EmailImportantText>
            Tracking Number: {props.trackingNumber}
          </EmailImportantText>
          {props.carrier && <EmailText>Carrier: {props.carrier}</EmailText>}
          {props.trackingUrl && (
            <EmailCallToActionButton
              link={props.isPreview ? "#!" : props.trackingUrl}
              label="Track Your Package"
              style={{
                margin: "24px 0 24px",
              }}
            />
          )}
        </>
      )}
    </EmailColumn>

    <EmailColumn pX={25}>
      <EmailText style={{ marginBottom: 4 }}>
        If you have any questions about your order or need assistance, please
        don&apos;t hesitate to contact us.
      </EmailText>

      <EmailCallToActionButton
        link={props.isPreview ? "#!" : `mailto:${props.email}`}
        label="Contact Us"
        style={{
          margin: "24px 0 24px",
        }}
      />
    </EmailColumn>
    <EmailSignature name={props.storeName} />
  </EmailBody>
);
