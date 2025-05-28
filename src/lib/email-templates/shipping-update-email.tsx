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
  packages: Array<{
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
    items: Array<{
      name: string;
      quantity: number;
    }>;
  }>;
  isPreview?: boolean;
  logo: string;
};

export const ShippingUpdateEmail = (props: Props) => (
  <EmailBody
    previewText={
      props.previewText ??
      `Your order from ${props.storeName} has been shipped!`
    }
    isPreview={props.isPreview}
  >
    <EmailColumn pX={25}>
      <EmailCustomLogo logoUrl={props.logo} />
      <EmailText>Hi there,</EmailText>

      <EmailText>
        Great news! Your order from {props.storeName} has been shipped and is on
        its way to you.
      </EmailText>

      {props.packages.map((pkg, index) => (
        <div key={index}>
          <EmailText style={{ marginTop: 24 }}>
            Package {index + 1} contains:
          </EmailText>
          <ul style={{ margin: "12px 0" }}>
            {pkg.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {item.quantity}x {item.name}
              </li>
            ))}
          </ul>

          {pkg.trackingNumber && (
            <>
              <EmailImportantText>
                Tracking Number: {pkg.trackingNumber}
              </EmailImportantText>
              {pkg.carrier && <EmailText>Carrier: {pkg.carrier}</EmailText>}
              {pkg.trackingUrl && (
                <EmailCallToActionButton
                  link={props.isPreview ? "#!" : pkg.trackingUrl}
                  label={`Track Package ${index + 1}`}
                  style={{
                    margin: "24px 0 24px",
                  }}
                />
              )}
            </>
          )}
        </div>
      ))}
    </EmailColumn>

    <EmailColumn pX={25}>
      <EmailText style={{ marginBottom: 4 }}>
        If you have any questions about your shipment or need assistance
        tracking your packages, please don&apos;t hesitate to contact us.
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
