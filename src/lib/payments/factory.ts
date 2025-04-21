import { type PaymentProcessor } from "./payment-processor";
import { StripePaymentProcessor } from "./processors/stripe";

export class PaymentProcessorFactory {
  static createPaymentService(processorType: string): PaymentProcessor {
    switch (processorType) {
      case "stripe":
        return new StripePaymentProcessor();

      default:
        throw new Error("Unsupported email processor type");
    }
  }
}
