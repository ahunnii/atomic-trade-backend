import type { CheckoutData, InvoiceData, PaymentLinkData } from "./types";

export interface PaymentProcessor {
  createCheckoutSession(
    props: CheckoutData,
  ): Promise<{ sessionId: string; sessionUrl: string }>;

  createPaymentLink(
    props: PaymentLinkData,
  ): Promise<{ sessionId: string; sessionUrl: string }>;

  createInvoice(
    props: InvoiceData,
  ): Promise<{ invoiceId: string; invoiceUrl: string }>;
}
